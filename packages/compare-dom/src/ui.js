/**
 * 바로 쓰는 화면 부품 (프레임워크 없이). Vue·React 어댑터도 이것을 그대로 쓴다.
 *  - mountToolbar: 집계·필터·이전/다음·스크롤 맞춤
 *  - mountChangeList: 변경 목록 (누르면 양쪽 그 위치로)
 *  - mountViewer: 주소(URL)나 HTML 두 개만 주면 좌우 비교 화면 전체 (JSP 등 서버 화면용)
 */
import { createCompare } from './controller.js';
import { getMessages } from './messages.js';

const TYPES = ['added', 'modified', 'deleted', 'moved'];

export function ensureUiStyle(doc = document) {
  if (doc.getElementById('sgc-ui-style')) return;
  const st = doc.createElement('style');
  st.id = 'sgc-ui-style';
  st.textContent = UI_CSS;
  (doc.head ?? doc.documentElement).appendChild(st);
}

const h = (doc, tag, attrs = {}, ...kids) => {
  const e = doc.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === null || v === false) continue;
    if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (k === 'class') e.className = v;
    else e.setAttribute(k, v === true ? '' : v);
  }
  for (const k of kids.flat()) if (k !== null && k !== undefined && k !== false) e.append(k);
  return e;
};

const fmt = (n, locale) => n.toLocaleString(locale === 'ko' ? 'ko-KR' : 'en-US');

/**
 * @param {HTMLElement} el @param {any} ctrl
 * @param {{ locale?: string, labels?: object, modes?: boolean, mode?: 'side'|'redline', onMode?: (m: string) => void }} [o]
 */
export function mountToolbar(el, ctrl, o = {}) {
  const doc = el.ownerDocument;
  ensureUiStyle(doc);
  const m = getMessages(o.locale, o.labels);
  let mode = o.mode ?? 'side';
  el.classList.add('sgc-toolbar');

  function render() {
    const s = ctrl.stats, t = ctrl.timing, vis = ctrl.visibleChanges;
    const pos = vis.findIndex((c) => c.index === ctrl.current);
    el.replaceChildren(
      h(doc, 'div', { class: 'sgc-tb-stats', role: 'group', 'aria-label': m.changes },
        TYPES.map((tp) => h(doc, 'button', {
          type: 'button', class: `sgc-chip sgc-chip-${tp}`, 'aria-pressed': ctrl.filter === tp ? 'true' : 'false',
          title: m.filterHint, disabled: !s[tp] && ctrl.filter !== tp,
          onclick: () => ctrl.setFilter(tp),
        }, h(doc, 'span', { class: 'sgc-dot', 'aria-hidden': 'true' }), m[tp], h(doc, 'b', {}, fmt(s[tp], o.locale))))),
      h(doc, 'div', { class: 'sgc-tb-nav' },
        h(doc, 'button', { type: 'button', class: 'sgc-btn', onclick: () => ctrl.prev(), disabled: !vis.length, 'aria-label': m.prev, title: `${m.prev} (Shift+F7)` }, '↑'),
        h(doc, 'span', { class: 'sgc-pos', 'aria-live': 'polite' },
          vis.length ? `${pos >= 0 ? fmt(pos + 1, o.locale) : '–'} / ${fmt(vis.length, o.locale)}` : ctrl.running ? m.running : m.noChanges),
        h(doc, 'button', { type: 'button', class: 'sgc-btn', onclick: () => ctrl.next(), disabled: !vis.length, 'aria-label': m.next, title: `${m.next} (F7)` }, '↓')),
      h(doc, 'div', { class: 'sgc-tb-right' },
        o.modes ? h(doc, 'div', { class: 'sgc-seg', role: 'group' },
          ['side', 'redline'].map((md) => h(doc, 'button', {
            type: 'button', 'aria-pressed': mode === md ? 'true' : 'false',
            onclick: () => { mode = md; o.onMode?.(md); render(); },
          }, m[md]))) : null,
        mode === 'side' ? h(doc, 'label', { class: 'sgc-switch' },
          h(doc, 'input', { type: 'checkbox', checked: ctrl.syncScroll, onchange: (e) => { ctrl.syncScroll = e.target.checked; } }),
          h(doc, 'span', {}, m.sync)) : null,
        t ? h(doc, 'span', { class: 'sgc-time', title: timingTitle(t, m) }, m.took((t.total / 1000).toFixed(2))) : null),
    );
  }
  const offs = ['update', 'filter', 'focus', 'start', 'sync'].map((ev) => ctrl.on(ev, render));
  const key = (e) => {
    if (e.key === 'F7') { e.preventDefault(); e.shiftKey ? ctrl.prev() : ctrl.next(); }
  };
  doc.addEventListener('keydown', key);
  render();
  return {
    setMode(md) { mode = md; render(); },
    destroy() { offs.forEach((f) => f()); doc.removeEventListener('keydown', key); el.replaceChildren(); el.classList.remove('sgc-toolbar'); },
  };
}

function timingTitle(t, m) {
  return `${m.nodes}: ${t.nodes.toLocaleString()} · snapshot ${t.snapshot.toFixed(0)}ms · compare ${t.compare.toFixed(0)}ms${t.worker ? ' (worker)' : ''} · paint ${t.paint.toFixed(0)}ms`;
}

/**
 * @param {HTMLElement} el @param {any} ctrl @param {{ locale?: string, labels?: object, max?: number }} [o]
 */
export function mountChangeList(el, ctrl, o = {}) {
  const doc = el.ownerDocument;
  ensureUiStyle(doc);
  const m = getMessages(o.locale, o.labels);
  el.classList.add('sgc-list');
  const PAGE = o.max ?? 300;   // 한 번에 그리는 개수 (수천 건이면 "더 보기")
  let shown = PAGE;

  const head = h(doc, 'div', { class: 'sgc-list-head' });
  const ul = h(doc, 'ol', { class: 'sgc-list-items' });
  el.replaceChildren(head, ul);

  function item(c) {
    const where = [];
    if (c.page.left || c.page.right) {
      const p = c.page.right ?? c.page.left;
      where.push(m.page(p));
    }
    const body = [];
    if (c.text.diffs) {
      body.push(h(doc, 'span', { class: 'sgc-li-diff' }, c.text.diffs.map(([op, t]) =>
        op === 0 ? t : h(doc, op < 0 ? 'del' : 'ins', {}, t))));
      if (c.text.span) {
        const an = String(c.text.span.attr ?? '').split(', ').map((a) => m.attrNames?.[a] ?? a).join(', ');
        body.push(h(doc, 'span', { class: 'sgc-li-attr' }, `${an}: `, h(doc, 'del', {}, String(c.text.span.before ?? '')), ' → ', h(doc, 'ins', {}, String(c.text.span.after ?? ''))));
      }
    } else if (c.what === 'attr') {
      const an = String(c.text.attr ?? '').split(', ').map((a) => m.attrNames?.[a] ?? a).join(', ');
      body.push(h(doc, 'span', { class: 'sgc-li-ctx' }, c.text.context || ''));
      body.push(h(doc, 'span', { class: 'sgc-li-attr' }, `${an}: `, h(doc, 'del', {}, String(c.text.before ?? '')), ' → ', h(doc, 'ins', {}, String(c.text.after ?? ''))));
    } else if (c.what === 'column') {
      body.push(h(doc, 'span', { class: 'sgc-li-attr' }, m.column(c.text.column)));
      body.push(h(doc, 'span', { class: 'sgc-li-ctx' }, c.text.context || ''));
    } else {
      body.push(h(doc, 'span', { class: 'sgc-li-ctx' }, c.text.context || m.empty));
    }
    return h(doc, 'li', {},
      h(doc, 'button', {
        type: 'button', class: 'sgc-li', 'data-type': c.type, 'aria-current': c.index === ctrl.current ? 'true' : null,
        onclick: () => ctrl.goTo(c.index),
      },
      h(doc, 'span', { class: 'sgc-li-top' },
        h(doc, 'span', { class: `sgc-tag sgc-tag-${c.type}` }, m[c.type]),
        where.length ? h(doc, 'span', { class: 'sgc-li-where' }, where.join(' · ')) : null,
        h(doc, 'span', { class: 'sgc-li-no' }, `#${c.index + 1}`)),
      h(doc, 'span', { class: 'sgc-li-body' }, body)));
  }

  function render() {
    const vis = ctrl.visibleChanges;
    head.replaceChildren(
      h(doc, 'strong', {}, m.changes),
      h(doc, 'span', { class: 'sgc-muted' }, ctrl.running ? m.running : `${fmt(vis.length, o.locale)}${ctrl.filter ? ` · ${m[ctrl.filter]}` : ''}`));
    if (!vis.length) {
      ul.replaceChildren(h(doc, 'li', { class: 'sgc-empty' }, ctrl.running ? m.running : ctrl.error ? String(ctrl.error.message ?? ctrl.error) : m.noChanges));
      return;
    }
    const items = vis.slice(0, shown).map(item);
    if (vis.length > shown) {
      items.push(h(doc, 'li', { class: 'sgc-more' }, h(doc, 'button', { type: 'button', class: 'sgc-btn sgc-btn-wide', onclick: () => { shown += PAGE * 3; render(); } }, m.more(vis.length - shown))));
    }
    ul.replaceChildren(...items);
  }
  function onFocus(c) {
    for (const b of ul.querySelectorAll('[aria-current]')) b.removeAttribute('aria-current');
    const vis = ctrl.visibleChanges;
    const pos = vis.findIndex((x) => x.index === c.index);
    if (pos >= shown) { shown = pos + PAGE; render(); }
    const btn = ul.children[pos]?.querySelector('button');
    if (btn) { btn.setAttribute('aria-current', 'true'); btn.scrollIntoView({ block: 'nearest' }); }
  }
  const offs = [ctrl.on('update', () => { shown = PAGE; render(); }), ctrl.on('filter', () => { shown = PAGE; render(); }), ctrl.on('start', render), ctrl.on('focus', onFocus)];
  render();
  return { destroy() { offs.forEach((f) => f()); el.replaceChildren(); el.classList.remove('sgc-list'); } };
}

/**
 * 주소나 HTML 두 개로 비교 화면 전체를 만든다. JSP·ASP·PHP 등 서버가 그리는 화면에 바로 사용.
 * 주소는 같은 도메인이어야 한다 (브라우저 보안상 다른 도메인 iframe 안은 읽을 수 없음).
 *
 *   SgCompare.mountViewer(document.getElementById('cmp'), {
 *     left:  { url: '/mbr/view.jsp?id=1&ver=1.0', label: 'v1.0' },
 *     right: { url: '/mbr/view.jsp?id=1&ver=1.1', label: 'v1.1' },
 *     page: '.page', locale: 'ko',
 *   })
 */
export function mountViewer(host, o) {
  const doc = host.ownerDocument;
  ensureUiStyle(doc);
  const m = getMessages(o.locale, o.labels);
  const frame = (src) => {
    const f = h(doc, 'iframe', { class: 'sgc-frame', title: src.label ?? '' });
    if (src.url) f.src = src.url;
    else f.srcdoc = src.html ?? '';
    return f;
  };
  const fl = frame(o.left), fr = frame(o.right);
  const fx = h(doc, 'iframe', { class: 'sgc-frame', title: m.redline });
  const bar = h(doc, 'div');
  const list = h(doc, 'aside');
  const paneL = h(doc, 'section', { class: 'sgc-pane' }, h(doc, 'header', { class: 'sgc-pane-head' }, h(doc, 'span', { class: 'sgc-badge sgc-badge-old' }, m.before), o.left.label ?? ''), fl);
  const paneR = h(doc, 'section', { class: 'sgc-pane' }, h(doc, 'header', { class: 'sgc-pane-head' }, h(doc, 'span', { class: 'sgc-badge sgc-badge-new' }, m.after), o.right.label ?? ''), fr);
  const paneX = h(doc, 'section', { class: 'sgc-pane sgc-pane-redline', hidden: true }, h(doc, 'header', { class: 'sgc-pane-head' }, m.redline, ` · ${o.left.label ?? ''} → ${o.right.label ?? ''}`), fx);
  const panes = h(doc, 'div', { class: 'sgc-panes' }, paneL, paneR, paneX);
  const root = h(doc, 'div', { class: 'sgc-viewer' }, bar, h(doc, 'div', { class: 'sgc-body' }, panes, list));
  if (o.height) root.style.setProperty('--sgc-height', o.height);
  host.replaceChildren(root);

  const loaded = (f) => new Promise((res) => {
    const ok = () => f.contentDocument && f.contentDocument.readyState === 'complete' && f.contentDocument.body;
    if (ok() && (f.src || f.srcdoc) && f.contentDocument.URL !== 'about:blank') return res();
    f.addEventListener('load', () => res(), { once: true });
  });

  let ctrl = null, tb = null, cl = null, redlineDirty = true;
  const ready = Promise.all([loaded(fl), loaded(fr)]).then(() => {
    ctrl = createCompare({ ...o, left: fl, right: fr, auto: false, watch: o.watch ?? false });
    tb = mountToolbar(bar, ctrl, { locale: o.locale, labels: o.labels, modes: true, onMode: setMode });
    cl = mountChangeList(list, ctrl, { locale: o.locale, labels: o.labels });
    ctrl.on('update', () => { redlineDirty = true; if (!paneX.hidden) drawRedline(); });
    return ctrl.run().then(() => ctrl);
  });

  function drawRedline() {
    const src = fr.contentDocument;
    const head = src.head ? src.head.innerHTML : '';
    const base = src.baseURI ? `<base href="${src.baseURI.replace(/"/g, '&quot;')}">` : '';
    fx.srcdoc = `<!doctype html><html lang="${src.documentElement.lang || ''}"><head>${base}${head}</head><body class="${src.body.className}"></body></html>`;
    fx.addEventListener('load', () => { ctrl.renderRedline(fx.contentDocument.body); redlineDirty = false; }, { once: true });
  }
  function setMode(md) {
    const red = md === 'redline';
    paneL.hidden = red; paneR.hidden = red; paneX.hidden = !red;
    root.dataset.mode = md;
    if (red && redlineDirty && ctrl) drawRedline();
  }

  return {
    ready,
    get controller() { return ctrl; },
    setMode(md) { tb?.setMode(md); setMode(md); },
    destroy() { tb?.destroy(); cl?.destroy(); ctrl?.destroy(); host.replaceChildren(); },
  };
}

const UI_CSS = `
.sgc-viewer,.sgc-toolbar,.sgc-list{
  --sgc-bg:#ffffff;--sgc-bg2:#f6f7f9;--sgc-bd:#e3e6eb;--sgc-fg:#14171c;--sgc-mut:#667085;--sgc-acc:#2563eb;
  --sgc-c-added:#16a34a;--sgc-c-modified:#ca8a04;--sgc-c-deleted:#dc2626;--sgc-c-moved:#6366f1;
  font:13px/1.5 Pretendard,"Pretendard Variable",-apple-system,BlinkMacSystemFont,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;
  color:var(--sgc-fg);box-sizing:border-box}
.sgc-viewer *,.sgc-toolbar *,.sgc-list *{box-sizing:border-box}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) :is(.sgc-viewer,.sgc-toolbar,.sgc-list){
  --sgc-bg:#15181d;--sgc-bg2:#1c2027;--sgc-bd:#2b313b;--sgc-fg:#e8ebf0;--sgc-mut:#9aa3b2;--sgc-acc:#60a5fa;
  --sgc-c-added:#4ade80;--sgc-c-modified:#facc15;--sgc-c-deleted:#f87171;--sgc-c-moved:#a5b4fc}}
:root[data-theme="dark"] :is(.sgc-viewer,.sgc-toolbar,.sgc-list),:is(.sgc-viewer,.sgc-toolbar,.sgc-list).sgc-dark{
  --sgc-bg:#15181d;--sgc-bg2:#1c2027;--sgc-bd:#2b313b;--sgc-fg:#e8ebf0;--sgc-mut:#9aa3b2;--sgc-acc:#60a5fa;
  --sgc-c-added:#4ade80;--sgc-c-modified:#facc15;--sgc-c-deleted:#f87171;--sgc-c-moved:#a5b4fc}
.sgc-viewer{display:flex;flex-direction:column;height:var(--sgc-height,80vh);min-height:420px;background:var(--sgc-bg2);border:1px solid var(--sgc-bd);border-radius:12px;overflow:hidden}
.sgc-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 300px}
.sgc-panes{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--sgc-bd);min-height:0}
.sgc-viewer[data-mode="redline"] .sgc-panes{grid-template-columns:1fr}
.sgc-pane{display:flex;flex-direction:column;min-width:0;min-height:0;background:var(--sgc-bg2)}
.sgc-pane[hidden]{display:none}
.sgc-pane-head{display:flex;align-items:center;gap:8px;padding:8px 14px;font-weight:600;background:var(--sgc-bg);border-bottom:1px solid var(--sgc-bd);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sgc-frame{flex:1;width:100%;border:0;background:#fff;min-height:0}
.sgc-badge{font-size:11px;font-weight:700;letter-spacing:.02em;padding:2px 8px;border-radius:999px}
.sgc-badge-old{background:color-mix(in srgb,var(--sgc-c-deleted) 14%,transparent);color:var(--sgc-c-deleted)}
.sgc-badge-new{background:color-mix(in srgb,var(--sgc-c-added) 16%,transparent);color:var(--sgc-c-added)}
.sgc-viewer>.sgc-toolbar{border-bottom:1px solid var(--sgc-bd)}
.sgc-viewer .sgc-list{border-left:1px solid var(--sgc-bd)}
.sgc-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px 16px;padding:10px 14px;background:var(--sgc-bg)}
.sgc-tb-stats{display:flex;flex-wrap:wrap;gap:6px}
.sgc-chip{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 11px;border:1px solid var(--sgc-bd);border-radius:999px;background:var(--sgc-bg);color:var(--sgc-fg);font:inherit;cursor:pointer;transition:background .15s,border-color .15s}
.sgc-chip b{font-variant-numeric:tabular-nums;font-weight:700}
.sgc-chip:hover:not(:disabled){background:var(--sgc-bg2)}
.sgc-chip:disabled{opacity:.45;cursor:default}
.sgc-chip[aria-pressed="true"]{border-color:var(--c);background:color-mix(in srgb,var(--c) 12%,var(--sgc-bg))}
.sgc-chip-added{--c:var(--sgc-c-added)}.sgc-chip-modified{--c:var(--sgc-c-modified)}.sgc-chip-deleted{--c:var(--sgc-c-deleted)}.sgc-chip-moved{--c:var(--sgc-c-moved)}
.sgc-dot{width:8px;height:8px;border-radius:50%;background:var(--c)}
.sgc-tb-nav{display:flex;align-items:center;gap:6px}
.sgc-pos{min-width:76px;text-align:center;font-variant-numeric:tabular-nums;color:var(--sgc-mut)}
.sgc-btn{height:30px;min-width:30px;padding:0 10px;border:1px solid var(--sgc-bd);border-radius:8px;background:var(--sgc-bg);color:var(--sgc-fg);font:inherit;cursor:pointer}
.sgc-btn:hover:not(:disabled){background:var(--sgc-bg2)}
.sgc-btn:disabled{opacity:.4;cursor:default}
.sgc-btn-wide{width:100%}
.sgc-tb-right{display:flex;align-items:center;gap:14px;margin-left:auto}
.sgc-seg{display:inline-flex;padding:2px;border:1px solid var(--sgc-bd);border-radius:9px;background:var(--sgc-bg2)}
.sgc-seg button{height:26px;padding:0 12px;border:0;border-radius:7px;background:transparent;color:var(--sgc-mut);font:inherit;font-weight:600;cursor:pointer}
.sgc-seg button[aria-pressed="true"]{background:var(--sgc-bg);color:var(--sgc-fg);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.sgc-switch{display:inline-flex;align-items:center;gap:6px;color:var(--sgc-mut);cursor:pointer;user-select:none}
.sgc-switch input{accent-color:var(--sgc-acc);width:15px;height:15px;margin:0}
.sgc-time{color:var(--sgc-mut);font-variant-numeric:tabular-nums;font-size:12px}
.sgc-list{display:flex;flex-direction:column;min-height:0;background:var(--sgc-bg)}
.sgc-list-head{display:flex;justify-content:space-between;align-items:baseline;padding:12px 14px 8px;border-bottom:1px solid var(--sgc-bd)}
.sgc-muted{color:var(--sgc-mut);font-size:12px}
.sgc-list-items{list-style:none;margin:0;padding:6px;overflow:auto;flex:1;min-height:0}
.sgc-li{display:block;width:100%;text-align:left;padding:9px 10px;margin:0 0 2px;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer}
.sgc-li:hover{background:var(--sgc-bg2)}
.sgc-li[aria-current="true"]{border-color:var(--sgc-acc);background:color-mix(in srgb,var(--sgc-acc) 8%,var(--sgc-bg))}
.sgc-li-top{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.sgc-li-where{color:var(--sgc-mut);font-size:12px}
.sgc-li-no{margin-left:auto;color:var(--sgc-mut);font-size:11px;font-variant-numeric:tabular-nums}
.sgc-tag{font-size:11px;font-weight:700;padding:1px 7px;border-radius:5px;color:var(--c);background:color-mix(in srgb,var(--c) 13%,transparent)}
.sgc-tag-added{--c:var(--sgc-c-added)}.sgc-tag-modified{--c:var(--sgc-c-modified)}.sgc-tag-deleted{--c:var(--sgc-c-deleted)}.sgc-tag-moved{--c:var(--sgc-c-moved)}
.sgc-li-body{display:block;font-size:12.5px;line-height:1.55;overflow-wrap:anywhere;color:var(--sgc-fg)}
.sgc-li-body del{background:color-mix(in srgb,var(--sgc-c-deleted) 18%,transparent);text-decoration-color:var(--sgc-c-deleted)}
.sgc-li-body ins{background:color-mix(in srgb,var(--sgc-c-added) 20%,transparent);text-decoration:none}
.sgc-li-ctx{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:var(--sgc-mut)}
.sgc-li-attr{display:block;margin-top:2px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px}
.sgc-empty{padding:24px 12px;text-align:center;color:var(--sgc-mut)}
.sgc-more{padding:6px 4px}
@media (max-width:900px){
  .sgc-body{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) 34%}
  .sgc-viewer .sgc-list{border-left:0;border-top:1px solid var(--sgc-bd)}
  .sgc-tb-right{margin-left:0}
}
@media (max-width:560px){.sgc-chip{height:28px;padding:0 9px}.sgc-pane-head{padding:6px 10px}}
`;
