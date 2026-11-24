/**
 * 바로 쓰는 화면 부품 (프레임워크 없이). Vue·React 어댑터도 이것을 그대로 쓴다.
 *  - mountToolbar: 집계·필터·이전/다음·스크롤 맞춤
 *  - mountChangeList: 변경 목록 (누르면 양쪽 그 위치로)
 *  - mountViewer: 주소(URL)나 HTML 두 개만 주면 좌우 비교 화면 전체 (JSP 등 서버 화면용)
 */
import { createCompare } from './controller.js';
import { getMessages, attrLabel } from './messages.js';
import { styleConfig, applyNonce } from './marks.js';

const TYPES = ['added', 'modified', 'deleted', 'moved'];

export function ensureUiStyle(doc = document, nonce) {
  if (nonce) styleConfig.nonce = nonce;
  if (doc.getElementById('sgc-ui-style')) return;
  const st = doc.createElement('style');
  st.id = 'sgc-ui-style';
  applyNonce(st);
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
  ensureUiStyle(doc, o.nonce);
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
        mode === 'side' && !ctrl.sharedScroll ? h(doc, 'label', { class: 'sgc-switch' },
          h(doc, 'input', { type: 'checkbox', checked: ctrl.syncScroll, onchange: (e) => { ctrl.syncScroll = e.target.checked; } }),
          h(doc, 'span', {}, m.sync)) : null,
        t ? h(doc, 'span', { class: 'sgc-time', title: timingTitle(t, m) }, m.took((t.total / 1000).toFixed(2))) : null),
    );
  }
  const offs = ['update', 'filter', 'focus', 'start', 'sync'].map((ev) => ctrl.on(ev, render));
  // F7 / Shift+F7. 한 화면에 비교 창이 여러 개면: 초점이 든 창만, 초점이 어느 창에도 없으면 첫 번째 창만
  const key = (e) => {
    if (e.key !== 'F7') return;
    const bars = Array.from(doc.querySelectorAll('.sgc-toolbar'));
    if (bars.length > 1) {
      const scope = (b) => b.closest('.sgc-viewer') ?? b.parentElement ?? b;
      const act = doc.activeElement;
      const owner = bars.find((b) => act && act !== doc.body && scope(b).contains(act)) ?? bars[0];
      if (owner !== el) return;
    }
    e.preventDefault(); e.shiftKey ? ctrl.prev() : ctrl.next();
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
  ensureUiStyle(doc, o.nonce);
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
        const an = attrLabel(m, c.text.span.attr, c.right ?? c.left);
        body.push(h(doc, 'span', { class: 'sgc-li-attr' }, `${an}: `, h(doc, 'del', {}, String(c.text.span.before ?? '')), ' → ', h(doc, 'ins', {}, String(c.text.span.after ?? ''))));
      }
    } else if (c.what === 'attr') {
      const an = attrLabel(m, c.text.attr, c.right ?? c.left);
      body.push(h(doc, 'span', { class: 'sgc-li-ctx' }, c.text.context || ''));
      body.push(h(doc, 'span', { class: 'sgc-li-attr' }, `${an}: `, h(doc, 'del', {}, String(c.text.before ?? '')), ' → ', h(doc, 'ins', {}, String(c.text.after ?? ''))));
    } else if (c.what === 'column') {
      body.push(h(doc, 'span', { class: 'sgc-li-ctx' }, `${m.column(c.text.column)} · ${c.text.context || ''}`));
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
/**
 * 비교할 화면 주소 검사: 같은 도메인의 http(s) 주소만 (javascript: 같은 주소는 스크립트가 실행되므로 거부).
 * 다른 도메인은 브라우저가 안쪽을 읽지 못하게 막으므로 미리 알려 준다.
 */
export function safeUrl(doc, url) {
  let u;
  try { u = new URL(String(url), doc.baseURI); } catch { throw new Error(`[sg-compare] 주소가 올바르지 않습니다: ${url}`); }
  const here = doc.defaultView?.location;
  if (!['http:', 'https:', 'file:', 'blob:'].includes(u.protocol)) throw new Error(`[sg-compare] 이 주소는 열 수 없습니다 (http/https 만 가능): ${u.protocol}`);
  if ((u.protocol === 'http:' || u.protocol === 'https:') && here && /^https?:$/.test(here.protocol) && u.origin !== here.origin) {
    throw new Error(`[sg-compare] 다른 도메인 화면은 비교할 수 없습니다 (${u.origin}). 같은 도메인 주소로 열리게 해 주세요 (리버스 프록시 등)`);
  }
  return u.href;
}

/**
 * 비교 화면 뼈대만 만든다 (도구 막대 · 두 문서가 나란히 든 한 스크롤 영역 · 변경 목록).
 * 문서는 left / right 안에 직접 그리고, createCompare 에 left·right·desk 를 넘긴다.
 *
 *   const L = SgCompare.mountLayout(host, { leftLabel: 'v1.0', rightLabel: 'v1.1' });
 *   L.left.append(이전문서); L.right.append(새문서);
 *   const ctrl = SgCompare.createCompare({ left: L.left, right: L.right, leftScroller: L.desk, rightScroller: L.desk });
 *   L.attach(ctrl);   // 도구 막대·변경 목록 연결
 */
export function mountLayout(host, o = {}) {
  const doc = host.ownerDocument;
  ensureUiStyle(doc, o.nonce);
  const m = getMessages(o.locale, o.labels);
  const left = h(doc, 'div', { class: 'sgc-doc' }), right = h(doc, 'div', { class: 'sgc-doc' }), redline = h(doc, 'div', { class: 'sgc-doc' });
  const bar = h(doc, 'div'), list = h(doc, 'aside');
  const pick = (side) => {
    desk.dataset.phone = side;
    for (const b of heads.querySelectorAll('button')) b.setAttribute('aria-pressed', b.dataset.side === side ? 'true' : 'false');
  };
  const head = (side, badge, cls, label) => h(doc, 'button', { type: 'button', class: 'sgc-pane-head', 'data-side': side, 'aria-pressed': side === 'right' ? 'true' : 'false', onclick: () => pick(side) },
    h(doc, 'span', { class: `sgc-badge ${cls}` }, badge), label ?? '');
  const heads = h(doc, 'div', { class: 'sgc-heads', role: 'group' }, head('left', m.before, 'sgc-badge-old', o.leftLabel), head('right', m.after, 'sgc-badge-new', o.rightLabel));
  const desk = h(doc, 'div', { class: 'sgc-shared', 'data-phone': 'right', tabindex: '0' },
    h(doc, 'div', { class: 'sgc-col sgc-col--left' }, left), h(doc, 'div', { class: 'sgc-col sgc-col--right' }, right));
  const both = h(doc, 'section', { class: 'sgc-pane sgc-both' }, heads, desk);
  const paneX = h(doc, 'section', { class: 'sgc-pane', hidden: true },
    h(doc, 'header', { class: 'sgc-pane-head' }, `${o.leftLabel ?? ''} → ${o.rightLabel ?? ''}`), h(doc, 'div', { style: 'flex:1;min-height:0;overflow:auto' }, redline));
  const body = h(doc, 'div', { class: 'sgc-body' }, h(doc, 'div', { class: 'sgc-panes sgc-panes--one' }, both, paneX), o.list === false ? null : list);
  if (o.list === false) body.style.gridTemplateColumns = '1fr';
  const root = h(doc, 'div', { class: 'sgc-viewer' }, o.toolbar === false ? null : bar, body);
  if (o.height) root.style.setProperty('--sgc-height', o.height);
  host.replaceChildren(root);
  let tb = null, cl = null, ctrl = null, dirty = true, off = null;
  const setMode = (md) => {
    const red = md === 'redline';
    both.hidden = red; paneX.hidden = !red; root.dataset.mode = md;
    if (red && dirty && ctrl?.changes) { ctrl.renderRedline(redline); dirty = false; }
  };
  return {
    root, left, right, desk, bar, list, redline, setMode,
    /** 도구 막대·변경 목록을 컨트롤러에 연결 */
    attach(c) {
      ctrl = c;
      if (o.toolbar !== false) tb = mountToolbar(bar, c, { locale: o.locale, labels: o.labels, modes: o.modes !== false, onMode: setMode, nonce: o.nonce });
      if (o.list !== false) cl = mountChangeList(list, c, { locale: o.locale, labels: o.labels, nonce: o.nonce });
      off = c.on('update', () => { dirty = true; if (!paneX.hidden) { c.renderRedline(redline); dirty = false; } });
      return c;
    },
    destroy() { off?.(); tb?.destroy(); cl?.destroy(); host.replaceChildren(); },
  };
}

export function mountViewer(host, o) {
  const doc = host.ownerDocument;
  ensureUiStyle(doc, o.nonce);
  const m = getMessages(o.locale, o.labels);
  const frame = (src) => {
    const f = h(doc, 'iframe', { class: 'sgc-frame', title: src.label ?? '' });
    // scripts: false → 화면 안의 스크립트를 실행하지 않음 (저장해 둔 화면·받은 파일을 열 때 안전하게). 읽기는 그대로 됨
    if (o.scripts === false) f.setAttribute('sandbox', 'allow-same-origin');
    if (src.url) f.src = safeUrl(doc, src.url);
    else f.srcdoc = src.html ?? '';
    return f;
  };
  const fl = frame(o.left), fr = frame(o.right);
  const fx = h(doc, 'iframe', { class: 'sgc-frame', title: m.redline });
  const bar = h(doc, 'div');
  const list = h(doc, 'aside');
  // shared(기본): 두 iframe 을 문서 높이만큼 늘려 한 스크롤 영역에 나란히 → 좌우가 한 장처럼 함께 움직임
  // split: iframe 마다 따로 스크롤 + 스크롤 맞춤 (수천 쪽짜리 서버 화면은 이쪽이 가벼움)
  const shared = o.layout !== 'split';
  const paneX = h(doc, 'section', { class: 'sgc-pane sgc-pane-redline', hidden: true }, h(doc, 'header', { class: 'sgc-pane-head' }, m.redline, ` · ${o.left.label ?? ''} → ${o.right.label ?? ''}`), fx);
  let paneL, paneR, both = null, desk = null;
  if (shared) {
    for (const f of [fl, fr]) { f.setAttribute('scrolling', 'no'); f.classList.add('sgc-frame--fit'); }
    const head = (side, badge, cls, label) => h(doc, 'button', { type: 'button', class: 'sgc-pane-head', 'data-side': side, 'aria-pressed': side === 'right' ? 'true' : 'false', onclick: () => pick(side) },
      h(doc, 'span', { class: `sgc-badge ${cls}` }, badge), label ?? '');
    desk = h(doc, 'div', { class: 'sgc-shared', 'data-phone': 'right', tabindex: '0' },
      h(doc, 'div', { class: 'sgc-col sgc-col--left' }, fl), h(doc, 'div', { class: 'sgc-col sgc-col--right' }, fr));
    both = h(doc, 'section', { class: 'sgc-pane sgc-both' },
      h(doc, 'div', { class: 'sgc-heads', role: 'group' }, head('left', m.before, 'sgc-badge-old', o.left.label), head('right', m.after, 'sgc-badge-new', o.right.label)), desk);
    paneL = paneR = both;
  } else {
    paneL = h(doc, 'section', { class: 'sgc-pane' }, h(doc, 'header', { class: 'sgc-pane-head' }, h(doc, 'span', { class: 'sgc-badge sgc-badge-old' }, m.before), o.left.label ?? ''), fl);
    paneR = h(doc, 'section', { class: 'sgc-pane' }, h(doc, 'header', { class: 'sgc-pane-head' }, h(doc, 'span', { class: 'sgc-badge sgc-badge-new' }, m.after), o.right.label ?? ''), fr);
  }
  const panes = h(doc, 'div', { class: 'sgc-panes' + (shared ? ' sgc-panes--one' : '') }, ...(shared ? [both] : [paneL, paneR]), paneX);
  const root = h(doc, 'div', { class: 'sgc-viewer' }, bar, h(doc, 'div', { class: 'sgc-body' }, panes, list));
  if (o.height) root.style.setProperty('--sgc-height', o.height);
  host.replaceChildren(root);
  /** 휴대폰(좁은 화면): 이전/새 버전 중 한쪽만 */
  function pick(side) {
    if (!desk) return;
    desk.dataset.phone = side;
    for (const b of both.querySelectorAll('.sgc-heads button')) b.setAttribute('aria-pressed', b.dataset.side === side ? 'true' : 'false');
  }
  /** iframe 높이를 안쪽 문서 높이에 맞춤 (내용·빈 칸이 바뀌면 다시) */
  const fits = [];
  function fitFrame(f) {
    const d = f.contentDocument, w = f.contentWindow;
    if (!d || !w) return;
    const fit = () => { f.style.height = Math.ceil(d.documentElement.scrollHeight) + 'px'; };
    fit();
    if (w.ResizeObserver) { const ro = new w.ResizeObserver(fit); ro.observe(d.documentElement); if (d.body) ro.observe(d.body); fits.push(() => ro.disconnect()); }
    w.addEventListener('load', fit);
  }

  const loaded = (f) => new Promise((res) => {
    const ok = () => f.contentDocument && f.contentDocument.readyState === 'complete' && f.contentDocument.body;
    if (ok() && (f.src || f.srcdoc) && f.contentDocument.URL !== 'about:blank') return res();
    f.addEventListener('load', () => res(), { once: true });
  });

  let ctrl = null, tb = null, cl = null, redlineDirty = true;
  const ready = Promise.all([loaded(fl), loaded(fr)]).then(() => {
    if (shared) { fitFrame(fl); fitFrame(fr); }
    ctrl = createCompare({ ...o, left: fl, right: fr, auto: false, watch: o.watch ?? false,
      ...(shared ? { leftScroller: desk, rightScroller: desk } : {}) });
    // 휴대폰(한쪽만 보임): 누른 변경의 내용이 안 보이는 쪽에만 있으면(삭제 등) 그쪽으로 바꿔 보여 준다
    if (shared) ctrl.on('focus', (c) => {
      const s = ctrl.contentSide(c), now = desk.dataset.phone;
      if (s !== now && !c[now] && doc.defaultView.getComputedStyle(desk.querySelector(`.sgc-col--${s}`)).display === 'none') pick(s);
    });
    tb = mountToolbar(bar, ctrl, { locale: o.locale, labels: o.labels, modes: true, onMode: setMode });
    cl = mountChangeList(list, ctrl, { locale: o.locale, labels: o.labels });
    ctrl.on('update', () => { redlineDirty = true; if (!paneX.hidden) drawRedline(); });
    return ctrl.run().then(() => ctrl);
  });

  function drawRedline() {
    const src = fr.contentDocument;
    const d = fx.contentDocument;
    if (!d) return;
    // 원본과 같은 모드로 다시 쓴다 (옛 화면은 doctype 이 없는 호환 모드인 경우가 많다. srcdoc 는 늘 표준 모드라 쓰지 않음)
    d.open();
    d.write(`${src.compatMode === 'BackCompat' ? '' : '<!doctype html>'}<html><head></head><body></body></html>`);
    d.close();
    // 글자를 이어 붙이지 않고 요소로 옮긴다. 모양(CSS)만 가져오고 스크립트는 가져오지 않는다 (한 번 더 실행되지 않게)
    if (src.documentElement.lang) d.documentElement.lang = src.documentElement.lang;
    const base = d.createElement('base'); base.href = src.baseURI; d.head.appendChild(base);
    for (const n of src.head?.children ?? []) {
      if (n.localName === 'style' || (n.localName === 'link' && /stylesheet/i.test(n.rel)) || (n.localName === 'meta' && n.hasAttribute('charset'))) d.head.appendChild(d.importNode(n, true));
    }
    d.body.className = src.body.className;
    for (const a of ['style', 'bgcolor', 'text', 'link', 'dir']) { const v = src.body.getAttribute(a); if (v !== null) d.body.setAttribute(a, v); }
    ctrl.renderRedline(d.body); redlineDirty = false;
  }
  function setMode(md) {
    const red = md === 'redline';
    paneL.hidden = red; paneR.hidden = red; paneX.hidden = !red;
    if (!red && shared) { fitFrame(fl); fitFrame(fr); }
    root.dataset.mode = md;
    if (red && redlineDirty && ctrl) drawRedline();
  }

  return {
    ready,
    get controller() { return ctrl; },
    setMode(md) { tb?.setMode(md); setMode(md); },
    destroy() { for (const f of fits) f(); tb?.destroy(); cl?.destroy(); ctrl?.destroy(); host.replaceChildren(); },
  };
}

const UI_CSS = `
.sgc-viewer,.sgc-toolbar,.sgc-list{
  --sgc-bg:#ffffff;--sgc-bg2:#f6f7f9;--sgc-bd:#e3e6eb;--sgc-fg:#14171c;--sgc-mut:#667085;--sgc-acc:#2563eb;
  --sgc-c-added:#15803d;--sgc-c-modified:#1d4ed8;--sgc-c-deleted:#b91c1c;--sgc-c-moved:#6d28d9;
  font:13px/1.5 Pretendard,"Pretendard Variable",-apple-system,BlinkMacSystemFont,"Segoe UI","Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif;
  color:var(--sgc-fg);box-sizing:border-box}
.sgc-viewer *,.sgc-toolbar *,.sgc-list *{box-sizing:border-box}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) :is(.sgc-viewer,.sgc-toolbar,.sgc-list){
  --sgc-bg:#15181d;--sgc-bg2:#1c2027;--sgc-bd:#2b313b;--sgc-fg:#e8ebf0;--sgc-mut:#9aa3b2;--sgc-acc:#60a5fa;
  --sgc-c-added:#4ade80;--sgc-c-modified:#60a5fa;--sgc-c-deleted:#f87171;--sgc-c-moved:#c4b5fd}}
:root[data-theme="dark"] :is(.sgc-viewer,.sgc-toolbar,.sgc-list),:is(.sgc-viewer,.sgc-toolbar,.sgc-list).sgc-dark{
  --sgc-bg:#15181d;--sgc-bg2:#1c2027;--sgc-bd:#2b313b;--sgc-fg:#e8ebf0;--sgc-mut:#9aa3b2;--sgc-acc:#60a5fa;
  --sgc-c-added:#4ade80;--sgc-c-modified:#60a5fa;--sgc-c-deleted:#f87171;--sgc-c-moved:#c4b5fd}
.sgc-viewer{display:flex;flex-direction:column;height:var(--sgc-height,80vh);min-height:420px;background:var(--sgc-bg2);border:1px solid var(--sgc-bd);border-radius:12px;overflow:hidden}
.sgc-body{flex:1;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 300px}
.sgc-panes{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--sgc-bd);min-height:0}
.sgc-viewer[data-mode="redline"] .sgc-panes{grid-template-columns:1fr}
.sgc-panes--one{grid-template-columns:1fr}
.sgc-both{display:flex;flex-direction:column;min-height:0}
.sgc-heads{display:grid;grid-template-columns:1fr 1fr;gap:1px;background:var(--sgc-bd)}
.sgc-heads .sgc-pane-head{width:100%;border:0;font:inherit;font-weight:600;color:var(--sgc-fg);text-align:left;cursor:default}
.sgc-shared{flex:1;min-height:0;overflow:auto;display:grid;grid-template-columns:1fr 1fr;align-items:start;background:var(--sgc-bg2)}
.sgc-col{min-width:0}
.sgc-col+.sgc-col{box-shadow:inset 1px 0 0 var(--sgc-bd)}
.sgc-frame--fit{display:block;flex:none;height:600px;overflow:hidden}
@media (max-width:640px){
  .sgc-heads .sgc-pane-head{cursor:pointer;justify-content:center;opacity:.55}
  .sgc-heads .sgc-pane-head[aria-pressed="true"]{opacity:1;box-shadow:inset 0 -2px 0 var(--sgc-acc)}
  .sgc-shared{grid-template-columns:1fr}
  .sgc-shared[data-phone="right"] .sgc-col--left,.sgc-shared[data-phone="left"] .sgc-col--right{display:none}
  .sgc-col+.sgc-col{box-shadow:none}
}
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
.sgc-seg button{white-space:nowrap;height:26px;padding:0 12px;border:0;border-radius:7px;background:transparent;color:var(--sgc-mut);font:inherit;font-weight:600;cursor:pointer}
.sgc-seg button[aria-pressed="true"]{background:var(--sgc-bg);color:var(--sgc-fg);box-shadow:0 1px 2px rgba(0,0,0,.12)}
.sgc-switch{white-space:nowrap;display:inline-flex;align-items:center;gap:6px;color:var(--sgc-mut);cursor:pointer;user-select:none}
.sgc-switch input{accent-color:var(--sgc-acc);width:15px;height:15px;margin:0}
.sgc-time{color:var(--sgc-mut);font-variant-numeric:tabular-nums;font-size:12px}
.sgc-list{display:flex;flex-direction:column;min-height:0;background:var(--sgc-bg)}
.sgc-list-head{display:flex;justify-content:space-between;align-items:baseline;padding:12px 14px 8px;border-bottom:1px solid var(--sgc-bd)}
.sgc-muted{color:var(--sgc-mut);font-size:12px}
.sgc-list-items{list-style:none;margin:0;padding:6px;overflow:auto;flex:1;min-height:0}
.sgc-li{display:block;width:100%;text-align:left;padding:8px 10px;margin:0 0 1px;border:1px solid transparent;border-radius:8px;background:transparent;color:inherit;font:inherit;cursor:pointer}
.sgc-li:hover{background:var(--sgc-bg2)}
.sgc-li[aria-current="true"]{background:color-mix(in srgb,var(--sgc-acc) 10%,var(--sgc-bg))}
.sgc-li:focus-visible{outline:2px solid var(--sgc-acc);outline-offset:-2px}
.sgc-li-top{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.sgc-li-where{color:var(--sgc-mut);font-size:12px}
.sgc-li-no{display:none}
.sgc-tag{font-size:11px;font-weight:700;padding:1px 7px;border-radius:5px;color:var(--c);background:color-mix(in srgb,var(--c) 13%,transparent)}
.sgc-tag-added{--c:var(--sgc-c-added)}.sgc-tag-modified{--c:var(--sgc-c-modified)}.sgc-tag-deleted{--c:var(--sgc-c-deleted)}.sgc-tag-moved{--c:var(--sgc-c-moved)}
.sgc-li-body{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:12.5px;line-height:1.5;overflow-wrap:anywhere;color:var(--sgc-fg)}
.sgc-li-body del{color:var(--sgc-c-deleted);background:none;text-decoration-thickness:1px}
.sgc-li-body ins{color:var(--sgc-c-modified);background:none;text-decoration:underline;text-decoration-thickness:1px}
.sgc-li-ctx{color:var(--sgc-mut)}
.sgc-li-attr{margin-left:6px;font-size:12px;color:var(--sgc-mut)}
.sgc-empty{padding:24px 12px;text-align:center;color:var(--sgc-mut)}
.sgc-more{padding:6px 4px}
@media (max-width:900px){
  .sgc-body{grid-template-columns:1fr;grid-template-rows:minmax(0,1fr) 34%}
  .sgc-viewer .sgc-list{border-left:0;border-top:1px solid var(--sgc-bd)}
  .sgc-tb-right{margin-left:0}
}
@media (max-width:640px){.sgc-panes{grid-template-columns:1fr;grid-template-rows:1fr 1fr}.sgc-viewer[data-mode="redline"] .sgc-panes{grid-template-rows:1fr}}
@media (max-width:560px){.sgc-chip{height:28px;padding:0 9px}.sgc-pane-head{padding:6px 10px}}
`;
