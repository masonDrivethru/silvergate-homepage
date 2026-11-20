/**
 * createCompare: 이미 그려진 두 화면(왼쪽=이전, 오른쪽=새 버전)을 비교해 원본 위에 표시한다.
 * JSP·Vue·React·일반 HTML 어떤 것이 그렸든 상관없다 (브라우저 DOM 만 본다).
 */
import { snapshot, snapshotAsync, resolveRoot, locate, normText, yieldToBrowser, unflatten, DEFAULT_ATTRS } from './snapshot.js';
import { diffTrees } from './engine.js';
import { spawnWorker } from './spawn.js';
import { SideMarks, ensureMarkStyle, sideSpans, blockOf, hasHighlightApi } from './marks.js';
import { makeScroller, scrollIntoScroller, linkScroll } from './scroll.js';

let seq = 0;
let sharedWorker = null, workerBroken = false, jobSeq = 0;
const waiting = new Map();

function getWorker() {
  if (workerBroken) return null;
  if (sharedWorker) return sharedWorker;
  try {
    sharedWorker = spawnWorker();
    sharedWorker.onmessage = (e) => {
      const w = waiting.get(e.data.id);
      if (!w) return;
      waiting.delete(e.data.id);
      e.data.ok ? w.resolve(e.data.out) : w.reject(new Error(e.data.error));
    };
    sharedWorker.onerror = (e) => {
      workerBroken = true; sharedWorker = null;
      for (const w of waiting.values()) w.fallback();
      waiting.clear();
      e.preventDefault?.();
    };
    return sharedWorker;
  } catch {
    workerBroken = true;
    return null;
  }
}

/**
 * 비교 맡기기. Worker 로 보낼 때는 평평한 목록을 조금씩 나눠 보낸다:
 * 한 번에 수십만 개를 보내면 복사하는 동안(0.2초 이상) 화면이 멈추기 때문
 */
async function runJob(sl, sr, extra, useWorker) {
  const w = useWorker ? getWorker() : null;
  const local = () => diffTrees({ left: sl.tree, right: sr.tree, leftAnchors: sl.anchorHashes, rightAnchors: sr.anchorHashes, options: extra });
  if (!w) return local();
  const id = ++jobSeq;
  const done = new Promise((resolve, reject) => waiting.set(id, { resolve, reject, fallback: () => resolve(local()) }));
  const CHUNK = 15000;
  for (const [side, s] of [['left', sl], ['right', sr]]) {
    for (let k = 0; k < s.flat.length; k += CHUNK) {
      w.postMessage({ id, part: side, at: k, recs: s.flat.slice(k, k + CHUNK) });
      await yieldToBrowser();
    }
  }
  w.postMessage({ id, go: true, leftAnchors: sl.anchorHashes, rightAnchors: sr.anchorHashes, options: extra });
  return done;
}

/**
 * @param {import('./index.d.ts').CompareOptions} options
 * @returns {import('./index.d.ts').CompareController}
 */
export function createCompare(options) {
  const opt = {
    attrs: DEFAULT_ATTRS, worker: 'auto', watch: false, debounce: 300, syncScroll: true, page: null,
    ...options,
  };
  const name = `sgc${++seq}`;
  const marks = { left: new SideMarks(name + 'l'), right: new SideMarks(name + 'r') };
  const listeners = new Map();
  const emit = (ev, data) => { for (const f of listeners.get(ev) ?? []) f(data); };

  const state = {
    changes: [], stats: { added: 0, modified: 0, deleted: 0, moved: 0 }, timing: null,
    current: -1, filter: null, running: false, error: null, pages: { left: 0, right: 0 },
  };
  let snaps = null, anchors = { left: { els: [] }, right: { els: [] }, pairL: new Int32Array(0), pairR: new Int32Array(0) };
  let runId = 0, link = null, observers = [], debounceTimer = 0, destroyed = false;
  const scrollers = {};

  const root = (side) => resolveRoot(side === 'left' ? opt.left : opt.right);

  function setupScroll() {
    scrollers.left = makeScroller(root('left'), opt.leftScroller);
    scrollers.right = makeScroller(root('right'), opt.rightScroller);
    link?.destroy();
    link = opt.syncScroll === false ? null : linkScroll(scrollers.left, scrollers.right, () => anchors);
    updateScrollbar();
  }

  /** 스크롤 맞춤 중에는 오른쪽 스크롤바 하나만 (왼쪽은 숨김, 휠·터치는 그대로). 맞춤을 끄면 다시 보임 */
  function updateScrollbar() {
    const sc = scrollers.left;
    if (!sc) return;
    const el = sc.target.nodeType === 1 ? sc.target : sc.doc.documentElement;
    ensureMarkStyle(el.ownerDocument, name + 'l');
    if (opt.scrollbars !== 'both' && link?.enabled) el.setAttribute('data-sgc-noscrollbar', '');
    else el.removeAttribute('data-sgc-noscrollbar');
  }

  async function run() {
    if (destroyed) return;
    const id = ++runId;
    state.running = true; state.error = null;
    emit('start');
    try {
      const L = root('left'), R = root('right');
      ensureMarkStyle(L.ownerDocument, name + 'l');
      ensureMarkStyle(R.ownerDocument, name + 'r');
      const t0 = performance.now();
      const sopt = { attrs: opt.attrs, ignore: opt.ignore, anchors: opt.anchors, keyAttrs: opt.keyAttrs };
      // 작은 문서는 한 번에, 큰 문서는 나눠 읽으며 화면에 차례를 넘김 (스크롤·입력이 멈추지 않게)
      const big = (L.getElementsByTagName('*').length + R.getElementsByTagName('*').length) > 6000;
      const sl = big ? await snapshotAsync(L, sopt) : snapshot(L, sopt);
      if (id !== runId || destroyed) return;
      const sr = big ? await snapshotAsync(R, sopt) : snapshot(R, sopt);
      if (id !== runId || destroyed) return;
      const t1 = performance.now();
      const size = sl.nodes.length + sr.nodes.length;
      const useWorker = opt.worker === true || (opt.worker === 'auto' && size > 4000);
      const out = await runJob(sl, sr, opt.rules, useWorker);
      if (id !== runId || destroyed) return;
      const t2 = performance.now();
      snaps = { left: sl, right: sr };
      await apply(out, id);
      if (id !== runId || destroyed) return;
      // 다 썼으면 읽은 문서 사본은 버린다 (수십만 개 객체를 들고 있으면 스크롤 중 메모리 정리가 길어짐).
      // 한 장 보기에 필요한 오른쪽 노드 목록만 남김
      snaps = { right: { nodes: sr.nodes } };
      sl.tree = sr.tree = sl.flat = sr.flat = null;
      const t3 = performance.now();
      state.timing = { snapshot: t1 - t0, compare: t2 - t1, paint: t3 - t2, total: t3 - t0, nodes: size, worker: useWorker && !workerBroken, engine: out.ms };
      if (!scrollers.left) setupScroll();
      state.running = false;
      emit('update', api);
    } catch (err) {
      if (id !== runId) return;
      state.running = false; state.error = err;
      emit('error', err);
      if (!listeners.get('error')?.length) console.error(err);
    }
  }

  function nodeOf(side, raw) {
    if (!raw) return { node: null, rest: [] };
    const s = snaps[side];
    const { node, rest } = locate(s.tree, raw);
    return { obj: node, node: s.nodes[node.i], rest };
  }

  function pageIndex(side) {
    if (!opt.page) return null;
    const list = Array.from(root(side).querySelectorAll(opt.page));
    state.pages[side] = list.length;
    const m = new Map(list.map((el, i) => [el, i + 1]));
    return (node) => {
      const el = node?.nodeType === 1 ? node : node?.parentElement;
      const p = el?.closest(opt.page);
      return p ? m.get(p) ?? null : null;
    };
  }

  /** 조금씩 나눠 처리하며 브라우저에 차례를 넘긴다 (수천 건이어도 스크롤이 멈추지 않게) */
  function slicer(id) {
    let t = performance.now();
    return async () => {
      if (performance.now() - t < 8) return true;
      await yieldToBrowser();
      t = performance.now();
      return id === runId && !destroyed;
    };
  }

  /**
   * 사람이 보기 좋게 정리:
   *  1) 속성이 생기거나 없어진 것(예: colspan 이 새로 붙음 = 칸 병합)은 요소 "수정"
   *  2) 똑같은 덩어리가 한쪽에서 없어지고 다른 곳에 생겼으면 "이동" (표 줄 순서 바뀜 등)
   *  3) 같은 표의 같은 열 칸들이 한꺼번에 추가/삭제됐으면 "열 추가/삭제" 한 건으로
   */
  function refine(list) {
    for (const ch of list) {
      if (ch.what !== 'attr') continue;
      const l = ch.left?.nodeType === 1 ? ch.left : null, r = ch.right?.nodeType === 1 ? ch.right : null;
      if (ch.type === 'added' || ch.type === 'deleted' || ch.attr === 'a' || ch.attr === '') {
        ch.type = 'modified';
        const names = [...opt.attrs, 'value'].filter((n) => (l?.getAttribute(n) ?? null) !== (r?.getAttribute(n) ?? null));
        ch.attr = names.join(', ') || ch.attr;
        ch.before = names.map((n) => l?.getAttribute(n) ?? '–').join(', ');
        ch.after = names.map((n) => r?.getAttribute(n) ?? '–').join(', ');
      }
    }
    // 2) 이동
    const byHash = new Map();
    for (const ch of list) if (ch.type === 'deleted' && ch.what === 'node' && ch.h) {
      if (!byHash.has(ch.h)) byHash.set(ch.h, []);
      byHash.get(ch.h).push(ch);
    }
    const drop = new Set();
    for (const ch of list) {
      if (ch.type !== 'added' || ch.what !== 'node' || !ch.h) continue;
      const cand = byHash.get(ch.h);
      const del = cand?.shift();
      if (!del) continue;
      del.type = 'moved'; del.what = 'moved'; del.right = ch.right; del.gap = null;
      del.page = { left: del.page.left, right: ch.page.right };
      drop.add(ch);
    }
    let out = list.filter((ch) => !drop.has(ch));
    // 3) 열 묶기
    const groups = new Map();
    for (const ch of out) {
      if ((ch.type !== 'added' && ch.type !== 'deleted') || ch.what !== 'node') continue;
      const n = ch.type === 'added' ? ch.right : ch.left;
      if (n?.nodeType !== 1 || (n.localName !== 'td' && n.localName !== 'th')) continue;
      const table = n.closest('table');
      if (!table) continue;
      const key = ch.type + '|' + n.cellIndex;
      let byTable = groups.get(table);
      if (!byTable) groups.set(table, (byTable = new Map()));
      if (!byTable.has(key)) byTable.set(key, []);
      byTable.get(key).push(ch);
    }
    const merged = new Set();
    for (const byTable of groups.values()) for (const cells of byTable.values()) {
      if (cells.length < 2) continue;
      const head = cells[0];
      head.what = 'column';
      head.extra = cells.slice(1).map((c) => ({ node: c.type === 'added' ? c.right : c.left, gap: c.gap }));
      head.count = cells.length;
      for (const c of cells.slice(1)) merged.add(c);
    }
    out = out.filter((ch) => !merged.has(ch));
    out.forEach((ch, i) => { ch.index = i; delete ch.h; });
    return out;
  }

  async function apply(out, id) {
    const tick = slicer(id);
    const list = [];
    // 1) 변경마다 양쪽 실제 위치 찾기 (아직 화면은 그대로)
    const pgL = pageIndex('left'), pgR = pageIndex('right');
    for (const c of out.changes) {
      if (!(await tick())) return;
      const L = nodeOf('left', c.at?.left), R = nodeOf('right', c.at?.right);
      const ch = {
        index: list.length, type: c.type, path: c.path, diffs: c.diffs,
        left: L.node, right: R.node, what: 'node', gap: null,
        before: c.left, after: c.right,
      };
      const field = (L.node ? L.rest : R.rest)[0];
      if (c.type === 'moved') ch.what = 'moved';
      else if (field === 'v') ch.what = 'text';
      else if (field === 'a' || field === 'n' || field === 'k') { ch.what = 'attr'; ch.attr = (L.node ? L.rest : R.rest).slice(1).join('.') || field; }
      else ch.what = 'node';
      // 덩어리가 통째로 추가·삭제됐으면 반대쪽 빈자리
      if (c.at?.gap && (c.type === 'added' || c.type === 'deleted')) {
        const gside = c.at.gap.side;
        const p = nodeOf(gside, c.at.gap.parent);
        const kids = p.obj?.c;
        if (kids) {
          const ref = kids[c.at.gap.index];
          const refNode = ref ? snaps[gside].nodes[ref.i] : p.node;
          ch.gap = { side: gside, node: refNode, end: !ref };
        }
      }
      // 같은 부모 안의 이름 바뀜(태그)·속성 바뀜: 요소 자체가 대상
      if (ch.what === 'attr' || ch.what === 'moved') {
        ch.left = L.node; ch.right = R.node;
      }
      if (ch.what === 'node') ch.h = (L.node ? L.obj : R.obj)?.h;
      ch.page = { left: pgL && ch.left ? pgL(ch.left) : pgL && ch.gap?.side === 'left' ? pgL(ch.gap.node) : null,
                  right: pgR && ch.right ? pgR(ch.right) : pgR && ch.gap?.side === 'right' ? pgR(ch.gap.node) : null };
      list.push(ch);
    }
    const final = refine(list);
    for (const ch of final) ch.text = describe(ch);
    // 2) 한 번에 옛 표시를 지우고 새 표시 (깜빡임 없이)
    marks.left.clear(); marks.right.clear();
    for (const ch of final) paint(ch);
    marks.left.flush(); marks.right.flush();
    state.changes = final;
    state.stats = { added: 0, modified: 0, deleted: 0, moved: 0 };
    for (const ch of final) state.stats[ch.type]++;
    state.current = final.length ? Math.min(Math.max(state.current, -1), final.length - 1) : -1;

    // 스크롤 맞춤 기준점 (쪽 정보가 있으면 쪽별로 묶어 둔다)
    const side = (sd) => {
      const els = snaps[sd].anchors.map((i) => snaps[sd].nodes[i]);
      if (!opt.page) return { els };
      const pages = Array.from(root(sd).querySelectorAll(opt.page));
      const idx = new Map(pages.map((p, i) => [p, i]));
      const pageOf = new Int32Array(els.length).fill(-1);
      const start = new Int32Array(pages.length + 1);
      let cur = -1;
      els.forEach((el, k) => {
        const pg = el.closest(opt.page);
        const p = pg ? idx.get(pg) ?? cur : cur;
        pageOf[k] = p;
        if (p > cur) { for (let q = cur + 1; q <= p; q++) start[q] = k; cur = p; }
      });
      for (let q = cur + 1; q <= pages.length; q++) start[q] = els.length;
      return { els, pages, start, pageOf };
    };
    const pairL = new Int32Array(snaps.left.anchors.length).fill(-1), pairR = new Int32Array(snaps.right.anchors.length).fill(-1);
    const ap = out.anchorPairs;   // Int32Array [l0, r0, l1, r1, ...]
    for (let k = 0; k < ap.length; k += 2) { pairL[ap[k]] = ap[k + 1]; pairR[ap[k + 1]] = ap[k]; }
    const A = side('left'), B = side('right');
    // 쪽끼리 짝: 그 쪽의 첫 번째 짝 있는 기준점이 반대쪽 몇 쪽에 있나
    const pagePair = (X, Y, pair) => {
      if (!X.pages || !Y.pages) return null;
      const pp = new Int32Array(X.pages.length).fill(-1);
      for (let p = 0; p < X.pages.length; p++) {
        for (let k = X.start[p]; k < X.start[p + 1]; k++) { if (pair[k] >= 0) { pp[p] = Y.pageOf[pair[k]]; break; } }
      }
      // 짝 있는 기준점이 없는 쪽(통째로 새로 생긴 쪽 등)은 같은 순번
      for (let p = 0; p < pp.length; p++) if (pp[p] < 0) pp[p] = Math.min(p, Y.pages.length - 1);
      return pp;
    };
    A.pagePair = pagePair(A, B, pairL); B.pagePair = pagePair(B, A, pairR);
    anchors = { left: A, right: B, pairL, pairR };
  }

  function paint(ch) {
    const t = ch.type;
    if (ch.extra) {
      const side = t === 'added' ? 'right' : 'left';
      for (const x of ch.extra) {
        paint({ ...ch, extra: null, what: 'node', [side]: x.node, gap: x.gap });
      }
      return paint({ ...ch, extra: null, what: 'node' });
    }
    if (ch.what === 'text' && t === 'modified' && ch.diffs) {
      for (const side of ['left', 'right']) {
        const tn = ch[side];
        if (!tn) continue;
        for (const [s, e] of sideSpans(ch.diffs, side)) marks[side].textRange(tn, s, e, side === 'left' ? 'del' : 'ins');
        marks[side].attr(blockOf(tn), 'data-sgc-line', 'modified');
        if (!hasHighlightApi(tn.ownerDocument.defaultView)) marks[side].attr(blockOf(tn), 'data-sgc', 'modified');
      }
      return;
    }
    if (ch.what !== 'attr' && (t === 'added' || t === 'deleted')) {
      const side = t === 'added' ? 'right' : 'left';
      const n = ch[side];
      if (n) {
        if (n.nodeType === 3) {
          marks[side].wholeText(n, t === 'added' ? 'ins' : 'del');
          marks[side].attr(blockOf(n), 'data-sgc-line', t);
          if (!hasHighlightApi(n.ownerDocument.defaultView)) marks[side].attr(n.parentElement, 'data-sgc', t);
        } else {
          marks[side].attr(n, 'data-sgc', t);
        }
      }
      if (ch.gap?.node) {
        const g = ch.gap.node.nodeType === 1 ? ch.gap.node : ch.gap.node.parentElement;
        marks[ch.gap.side].attr(g, 'data-sgc-gap', ch.gap.end ? 'end' : 'before');
        marks[ch.gap.side].attr(g, 'data-sgc-side', ch.gap.side);
      }
      return;
    }
    // 속성·태그 수정, 이동, 모양 바뀜
    const status = t === 'moved' ? 'moved' : 'modified';
    for (const side of ['left', 'right']) {
      const n = ch[side];
      if (!n) continue;
      marks[side].attr(n.nodeType === 1 ? n : n.parentElement, 'data-sgc', status);
    }
  }

  function snippet(node, max = 90) {
    if (!node) return '';
    if (node.nodeType === 3) return clip(normText(node.data), max);
    if (node.localName === 'img') return `[${node.getAttribute('alt') || node.getAttribute('src') || 'img'}]`;
    return clip(textOfNode(node, max * 2), max) || `<${node.localName}>`;
  }
  function describe(ch) {
    if (ch.what === 'text' && ch.diffs) return { diffs: trimDiffs(ch.diffs) };
    if (ch.what === 'attr') return { attr: ch.attr, before: ch.before, after: ch.after, context: snippet(ch.right ?? ch.left, 60) };
    if (ch.what === 'moved') return { context: snippet(ch.right ?? ch.left) };
    if (ch.what === 'column') {
      const n = ch.type === 'added' ? ch.right : ch.left;
      return { column: ch.count, context: [n, ...ch.extra.map((x) => x.node)].map((x) => snippet(x, 20)).join(' · ') };
    }
    return { context: snippet(ch.type === 'deleted' ? ch.left : ch.right) };
  }

  function elOf(n) { return n ? (n.nodeType === 1 ? n : n.parentElement) : null; }

  let focusTimer = 0;
  const focused = [];
  /** i 번째 변경으로 이동 (양쪽 모두) */
  function goTo(i, { smooth = true } = {}) {
    if (!state.changes.length) return;
    i = ((i % state.changes.length) + state.changes.length) % state.changes.length;
    state.current = i;
    const ch = state.changes[i];
    if (!scrollers.left) setupScroll();
    link?.pause(smooth ? 900 : 200);
    for (const el of focused) el.removeAttribute('data-sgc-focus');
    focused.length = 0;
    for (const side of ['left', 'right']) {
      let el = elOf(ch[side]);
      if (!el && ch.gap?.side === side) el = elOf(ch.gap.node);
      if (!el) continue;
      const block = ch.what === 'text' ? blockOf(ch[side]) ?? el : el;
      scrollIntoScroller(scrollers[side], block, 0.3, smooth);
      block.setAttribute('data-sgc-focus', '');
      focused.push(block);
      const fr = [];
      if (ch[side]?.nodeType === 3) { const r = ch[side].ownerDocument.createRange(); r.selectNodeContents(ch[side]); fr.push(r); }
      marks[side].setFocus(fr);
    }
    clearTimeout(focusTimer);
    focusTimer = setTimeout(() => {
      for (const el of focused) el.removeAttribute('data-sgc-focus');
      focused.length = 0;
      marks.left.setFocus([]); marks.right.setFocus([]);
    }, 1800);
    emit('focus', ch);
  }
  function step(d) {
    const vis = visible();
    if (!vis.length) return;
    const pos = vis.findIndex((c) => c.index === state.current);
    const next = pos < 0 ? (d > 0 ? vis[0] : vis[vis.length - 1]) : vis[(pos + d + vis.length) % vis.length];
    goTo(next.index);
  }
  const visible = () => (state.filter ? state.changes.filter((c) => c.type === state.filter) : state.changes);

  function watch() {
    unwatch();
    const kick = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(run, opt.debounce); };
    for (const side of ['left', 'right']) {
      const r = root(side);
      const mo = new (r.ownerDocument.defaultView.MutationObserver)(kick);
      mo.observe(r, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: [...opt.attrs, 'data-sgc-key', 'data-key', 'hidden', 'data-sgc-ignore'] });
      r.addEventListener('input', kick, true);
      r.addEventListener('change', kick, true);
      observers.push(() => { mo.disconnect(); r.removeEventListener('input', kick, true); r.removeEventListener('change', kick, true); });
    }
  }
  function unwatch() { for (const f of observers) f(); observers = []; }

  /** 한 장 보기: 새 버전을 복사해서 삭제된 것을 제자리에 끼워 넣고 바뀐 글자를 지운 글자/넣은 글자로 (원본은 그대로) */
  function renderRedline(target) {
    if (!snaps) throw new Error('[sg-compare] run() 이 끝난 뒤에 부르세요');
    const R = root('right');
    const doc = target.ownerDocument;
    ensureMarkStyle(doc, name + 'x');
    const clone = doc.importNode(R, true);
    const cs = snapshot(clone, { attrs: opt.attrs, ignore: opt.ignore, anchors: '', keyAttrs: opt.keyAttrs });
    if (cs.nodes.length !== snaps.right.nodes.length) console.warn('[sg-compare] 한 장 보기: 복사본 구조가 달라 일부 표시가 어긋날 수 있습니다');
    const inserts = [];
    const idx = new Map(snaps.right.nodes.map((n, i) => [n, i]));
    // 묶인 열(column)은 칸마다 하나씩 펼쳐서
    const flatList = state.changes.flatMap((c) => !c.extra ? [c] : [
      { ...c, what: 'node' },
      ...c.extra.map((x) => ({ ...c, what: 'node', [c.type === 'added' ? 'right' : 'left']: x.node, gap: x.gap })),
    ]);
    for (const ch of flatList) {
      if (ch.what === 'text' && ch.type === 'modified' && ch.diffs && ch.right) {
        const i = idx.get(ch.right);
        const tn = cs.nodes[i];
        if (!tn?.parentNode) continue;
        const frag = doc.createDocumentFragment();
        for (const [op, t] of ch.diffs) {
          if (op === 0) frag.append(t);
          else { const e = doc.createElement(op < 0 ? 'del' : 'ins'); e.className = op < 0 ? 'sgc-del' : 'sgc-ins'; e.textContent = t; frag.append(e); }
        }
        const lead = /^\s/.test(tn.data) ? ' ' : '', trail = /\s$/.test(tn.data) ? ' ' : '';
        if (lead) frag.prepend(lead);
        if (trail) frag.append(trail);
        tn.replaceWith(frag);
      } else if (ch.what === 'attr' || ch.type === 'moved') {
        const n = ch.right ? cs.nodes[idx.get(ch.right)] : null;
        const el = n?.nodeType === 1 ? n : n?.parentElement;
        el?.setAttribute('data-sgc', ch.type === 'moved' ? 'moved' : 'modified');
      } else if (ch.type === 'added' && ch.right) {
        const n = cs.nodes[idx.get(ch.right)];
        if (!n) continue;
        if (n.nodeType === 3) { const e = doc.createElement('ins'); e.className = 'sgc-ins'; n.replaceWith(e); e.append(n); }
        else n.setAttribute('data-sgc', 'added');
      } else if (ch.type === 'deleted' && ch.left && ch.gap) {
        let n = doc.importNode(ch.left, true);
        if (n.nodeType === 3) { const e = doc.createElement('del'); e.className = 'sgc-del'; e.append(n); n = e; }
        else n.setAttribute('data-sgc', 'deleted');
        const gi = idx.get(ch.gap.node);
        inserts.push({ ref: cs.nodes[gi], end: ch.gap.end, n });
      }
    }
    for (const { ref, end, n } of inserts) {
      if (!ref) continue;
      if (end) ref.appendChild(n); else ref.parentNode?.insertBefore(n, ref);
    }
    let out = clone;
    if (clone.localName === 'body') {
      out = doc.createElement('div');
      out.className = clone.className;
      out.append(...clone.childNodes);
    }
    out.setAttribute('data-sgc-redline', '');
    target.replaceChildren(out);
    return out;
  }

  const api = {
    get changes() { return state.changes; },
    get visibleChanges() { return visible(); },
    get stats() { return state.stats; },
    get timing() { return state.timing; },
    get current() { return state.current; },
    get running() { return state.running; },
    get error() { return state.error; },
    get filter() { return state.filter; },
    get pages() { return state.pages; },
    get syncScroll() { return link ? link.enabled : false; },
    set syncScroll(v) { if (link) link.enabled = v; updateScrollbar(); emit('sync', !!v); },
    setFilter(type) { state.filter = type && state.filter !== type ? type : null; emit('filter', state.filter); },
    run, goTo, next: () => step(1), prev: () => step(-1), renderRedline,
    on(ev, f) { if (!listeners.has(ev)) listeners.set(ev, []); listeners.get(ev).push(f); return () => api.off(ev, f); },
    off(ev, f) { const l = listeners.get(ev); if (l) l.splice(l.indexOf(f) >>> 0, 1); },
    clear() { marks.left.clear(); marks.right.clear(); state.changes = []; emit('update', api); },
    destroy() {
      destroyed = true; runId++;
      clearTimeout(debounceTimer); clearTimeout(focusTimer);
      unwatch(); link?.destroy();
      try { const sc = scrollers.left; (sc?.target.nodeType === 1 ? sc.target : sc?.doc.documentElement)?.removeAttribute('data-sgc-noscrollbar'); } catch {}
      marks.left.clear(); marks.right.clear();
      listeners.clear();
    },
  };
  if (opt.watch) watch();
  if (opt.auto !== false) queueMicrotask(run);
  return api;
}

/** 글자 노드를 띄어쓰기로 이어 붙임 (textContent 는 칸 사이 글자가 붙어 버림) */
function textOfNode(node, max) {
  const w = node.ownerDocument.createTreeWalker(node, 4);
  let out = '';
  for (let t = w.nextNode(); t && out.length < max; t = w.nextNode()) {
    const p = t.parentElement;
    if (p && (p.closest('script,style,[data-sgc-ignore]'))) continue;
    const v = normText(t.data);
    if (v) out += (out ? ' ' : '') + v;
  }
  return out;
}

const clip = (s, n) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** 변경 목록용: 바뀐 곳 앞뒤만 남기고 줄임 */
function trimDiffs(diffs, ctx = 28) {
  return diffs.map(([op, t], k) => {
    if (op !== 0) return [op, clip(t, 120)];
    if (k === 0) return [0, t.length > ctx ? '…' + t.slice(-ctx) : t];
    if (k === diffs.length - 1) return [0, t.length > ctx ? t.slice(0, ctx) + '…' : t];
    return [0, t.length > ctx * 2 ? t.slice(0, ctx) + ' … ' + t.slice(-ctx) : t];
  });
}
