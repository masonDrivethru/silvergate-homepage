/**
 * createCompare: 이미 그려진 두 화면(왼쪽=이전, 오른쪽=새 버전)을 비교해 원본 위에 표시한다.
 * JSP·Vue·React·일반 HTML 어떤 것이 그렸든 상관없다 (브라우저 DOM 만 본다).
 */
import { snapshot, snapshotAsync, resolveRoot, locate, normText, yieldToBrowser, unflatten, DEFAULT_ATTRS } from './snapshot.js';
import { diffTrees } from './engine.js';
import { spawnWorker } from './spawn.js';
import { SideMarks, ensureMarkStyle, sideSpans, blockOf, hasHighlightApi } from './marks.js';
import { makeScroller, scrollIntoScroller, linkScroll } from './scroll.js';
import { getMessages } from './messages.js';

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
    attrs: DEFAULT_ATTRS, worker: 'auto', watch: false, debounce: 300, syncScroll: true, page: null, align: true, locale: 'ko',
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

  /**
   * 스크롤 맞춤 중에는 오른쪽 스크롤바 하나만 보이게: 왼쪽은 투명하게만 (자리는 그대로 둬서 양쪽 폭이 같음 → 쪽 높이도 같음).
   * 휠·터치는 그대로. 맞춤을 끄면 다시 보임
   */
  function updateScrollbar() {
    const sc = scrollers.left;
    if (!sc) return;
    if (sc.target === scrollers.right?.target) return;   // 한 스크롤 영역에 두 문서: 스크롤바 하나뿐이라 숨기지 않음
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
      const sopt = { attrs: opt.attrs, ignore: opt.ignore, anchors: opt.anchors, keyAttrs: opt.keyAttrs, flatten: opt.flatten ?? opt.page };
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
    // 0) 같은 칸이 가상 칸(rowspan) 때문에 여러 번 나온 것은 하나로
    const ids = new WeakMap(); let idn = 0;
    const idOf = (n) => { if (!n) return 0; let v = ids.get(n); if (!v) ids.set(n, (v = ++idn)); return v; };
    const seen = new Set();
    list = list.filter((ch) => {
      const key = [ch.type, ch.what, ch.attr ?? '', idOf(ch.left), idOf(ch.right), ch.diffs ? JSON.stringify(ch.diffs) : ''].join('|');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
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
    // 합쳐진 칸: 오른쪽 같은 칸에 같은 변경이 왼쪽 여러 칸에서 오면 한 건으로 (왼쪽 칸은 모두 표시)
    const byRight = new Map();
    list = list.filter((ch) => {
      if (ch.type !== 'modified' || !ch.right || ch.what === 'moved') return true;
      const key = [ch.what, ch.attr ?? '', idOf(ch.right), ch.diffs ? JSON.stringify(ch.diffs) : ''].join('|');
      const first = byRight.get(key);
      if (!first) { byRight.set(key, ch); return true; }
      if (ch.left && ch.left !== first.left) (first.alsoLeft ??= []).push(ch.left);
      return false;
    });
    // 같은 칸의 글자 수정과 병합(rowspan·colspan) 바뀜은 한 건으로 (병합 정보를 붙임)
    const textOf = new Map();
    for (const ch of list) if (ch.what === 'text' && ch.right) { const cell = ch.right.parentElement?.closest('td,th'); if (cell) textOf.set(cell, ch); }
    list = list.filter((ch) => {
      if (ch.what !== 'attr' || !ch.right || !/span/.test(ch.attr ?? '') && ch.attr !== 'a') return true;
      const t = textOf.get(ch.right);
      if (!t) return true;
      t.span = ch;
      if (ch.left && ch.left !== t.left) (t.alsoLeft ??= []).push(ch.left);
      return false;
    });
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
      const key = ch.type + '|' + visualCol(n);
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
    out = rowMoves(out, (c) => [c, ...(c.extra ?? []).map((x) => ({ ...c, [c.type === 'added' ? 'right' : 'left']: x.node }))]);
    out.forEach((ch, i) => { ch.index = i; delete ch.h; });
    return out;
  }

  /**
   * 표 줄 자리 바꿈 찾기: 칸 수정이 줄끼리 짝지어 생겼는데, 새로 생긴/없어진 칸(열)을 빼고 보면
   * 왼쪽 줄이 오른쪽의 "다른" 줄과 내용이 똑같다 → 칸 수정들을 지우고 "이동" 으로
   */
  function rowMoves(list, expand) {
    const addedCells = new Set(), deletedCells = new Set();
    for (const c of list) for (const x of expand(c)) {
      if (x.type === 'added' && x.right?.nodeType === 1) addedCells.add(x.right);
      if (x.type === 'deleted' && x.left?.nodeType === 1) deletedCells.add(x.left);
    }
    // 줄 내용: 위에서 rowspan 으로 내려온 칸까지 포함한 "눈에 보이는 줄"
    const rowText = (tr, skip) => visualRow(tr).filter((td) => !skip.has(td)).map((td) => normText(td.textContent ?? '')).join('\u0001');
    // 칸 수정이 있는 줄 짝
    const pairs = new Map();   // 왼쪽 줄 → 오른쪽 줄
    for (const c of list) {
      if (c.type !== 'modified' || c.what !== 'text') continue;
      const lt = c.left?.parentElement?.closest('tr'), rt = c.right?.parentElement?.closest('tr');
      if (lt && rt && lt.parentElement && rt.parentElement) pairs.set(lt, rt);
    }
    if (pairs.size < 2) return list;
    const rights = new Map();
    for (const rt of pairs.values()) rights.set(rowText(rt, addedCells), rt);
    const moved = new Map();   // 왼쪽 줄 → 진짜 짝 오른쪽 줄
    for (const [lt, rt] of pairs) {
      const t = rowText(lt, deletedCells);
      if (rowText(rt, addedCells) === t) continue;
      const real = rights.get(t);
      if (real && real !== rt) moved.set(lt, real);
    }
    if (!moved.size) return list;
    const movedRights = new Set(moved.values());
    const out = list.filter((c) => {
      if (c.type !== 'modified' || c.what !== 'text') return true;
      const lt = c.left?.parentElement?.closest('tr'), rt = c.right?.parentElement?.closest('tr');
      return !(moved.has(lt) || movedRights.has(rt));
    });
    for (const [lt, rt] of moved) {
      out.push({ index: 0, type: 'moved', what: 'moved', path: '', diffs: null, left: lt, right: rt, gap: null, before: null, after: null,
        page: { left: null, right: null } });
    }
    // 문서 순서대로
    const pos = (c) => c.right ?? c.left ?? c.gap?.node;
    out.sort((a, b) => { const x = pos(a), y = pos(b); if (!x || !y || x === y) return 0; return x.compareDocumentPosition(y) & 4 ? -1 : 1; });
    return out;
  }

  /** 표 한 줄에 보이는 칸들 (위에서 rowspan 으로 내려온 칸 포함, 열 순서) */
  const rowCache = new WeakMap();
  function visualRow(tr) {
    let r = rowCache.get(tr);
    if (r) return r;
    const group = tr.parentElement;
    const grid = [];
    Array.from(group.rows).forEach((row, y) => {
      grid[y] ??= [];
      let c = 0;
      for (const td of row.cells) {
        while (grid[y][c]) c++;
        const cs = Math.max(1, td.colSpan || 1), rs = Math.max(1, td.rowSpan || 1);
        for (let yy = y; yy < y + rs; yy++) { grid[yy] ??= []; for (let x = c; x < c + cs; x++) grid[yy][x] = td; }
        c += cs;
      }
    });
    Array.from(group.rows).forEach((row, y) => rowCache.set(row, [...new Set((grid[y] ?? []).filter(Boolean))]));
    return rowCache.get(tr) ?? [];
  }

  /** 표 칸의 눈에 보이는 열 번호 (rowspan·colspan 반영) */
  const colCache = new WeakMap();
  function visualCol(cell) {
    let m = colCache.get(cell);
    if (m !== undefined) return m;
    const table = cell.closest('table');
    for (const group of [table.tHead, ...table.tBodies, table.tFoot].filter(Boolean)) {
      const taken = [];
      Array.from(group.rows).forEach((tr, r) => {
        taken[r] ??= [];
        let c = 0;
        for (const td of tr.cells) {
          while (taken[r][c]) c++;
          colCache.set(td, c);
          const cs = Math.max(1, td.colSpan || 1), rs = Math.max(1, td.rowSpan || 1);
          for (let y = r; y < r + rs; y++) { taken[y] ??= []; for (let x = c; x < c + cs; x++) taken[y][x] = 1; }
          c += cs;
        }
      });
    }
    return colCache.get(cell) ?? cell.cellIndex;
  }

  // ---------- 좌우 높이 맞추기 ----------
  // 바뀌지 않은 덩어리는 내용이 같으니 높이도 같다. 그래서 바뀐 곳만 맞추면 전체가 늘 나란히 간다.
  //  - 한쪽에만 있는 덩어리(추가·삭제): 반대쪽 같은 자리에 같은 높이의 빈 칸(빗금)
  //  - 양쪽 다 있는데 높이가 다른 덩어리(수정): 짧은 쪽 아래 여백을 늘림
  // 원본 구조는 그대로: 빈 칸은 data-sgc-ignore 로 비교에서 빠지고, 다시 비교할 때 지웠다가 새로 넣는다
  let spacers = [], padded = [];
  function unalign() {
    for (const io of lazyIO ?? []) io.disconnect();
    for (const sp of spacers) sp.remove();
    for (const [el, prop, old] of padded) el.style[prop] = old;
    spacers = []; padded = [];
  }
  const zoomOf = (el) => {
    if (typeof el.currentCSSZoom === 'number') return el.currentCSSZoom;
    const h = el.offsetHeight; return h ? el.getBoundingClientRect().height / h : 1;
  };
  /** 쪽 번호 (opt.page 가 있을 때) */
  let pageIdx = null;   // { left: Map(쪽 요소 → 번호), right: ... } 높이 맞추기 한 번에 한 번만 만든다
  const pageNo = (n, side) => {
    if (!opt.page || !n) return -1;
    const el = n.nodeType === 1 ? n : n.parentElement;
    const pg = el?.closest(opt.page);
    if (!pg) return -1;
    if (!pageIdx) pageIdx = {};
    if (!pageIdx[side]) pageIdx[side] = new Map(Array.from(root(side).querySelectorAll(opt.page), (p, i) => [p, i]));
    return pageIdx[side].get(pg) ?? -1;
  };
  const px = (v) => parseFloat(v) || 0;
  /** 덩어리가 차지하는 세로 공간 (자기 높이 + 위아래 여백 + flex/grid 간격), 줌 없는 px */
  /** 배율(zoom)과 상관없는 실제 높이: 계산된 높이 + (content-box 면) 안쪽 여백·테두리 */
  function layoutHeight(el) {
    const cs = el.ownerDocument.defaultView.getComputedStyle(el);
    const ch = parseFloat(cs.height);
    if (!Number.isFinite(ch)) { const z = zoomOf(el) || 1; return el.getBoundingClientRect().height / z; }
    return cs.boxSizing === 'border-box' ? ch : ch + px(cs.paddingTop) + px(cs.paddingBottom) + px(cs.borderTopWidth) + px(cs.borderBottomWidth);
  }
  function spaceOf(el) {
    const z = zoomOf(el) || 1;
    const r = el.getBoundingClientRect();
    const win = el.ownerDocument.defaultView;
    const cs = win.getComputedStyle(el);
    const ps = el.parentElement ? win.getComputedStyle(el.parentElement) : null;
    const h = layoutHeight(el);
    if (ps && /flex|grid/.test(ps.display)) return h + px(cs.marginTop) + px(cs.marginBottom) + px(ps.rowGap);
    // 일반 흐름: 여백이 겹치므로 다음 형제까지 거리 (다음 형제가 없으면 자기 높이 + 여백)
    let next = el.nextElementSibling;
    while (next && (next.classList.contains('sgc-spacer') || next.hasAttribute('data-sgc-ignore'))) next = next.nextElementSibling;
    if (next) { const nr = next.getBoundingClientRect(); if (nr.top >= r.bottom - 1 && nr.top - r.top < r.height * 3 + 200) return (nr.top - r.top) / z; }
    return h + px(cs.marginTop) + px(cs.marginBottom);
  }
  function parentGap(el) {
    const p = el.parentElement;
    if (!p) return 0;
    const cs = p.ownerDocument.defaultView.getComputedStyle(p);
    return /flex|grid/.test(cs.display) ? px(cs.rowGap) : 0;
  }
  function makeSpacer(ref, end, height, label, afterNode = null, gapPx = null) {
    const doc = ref.ownerDocument;
    const parent = end ? ref : ref.parentNode;
    const ctx = end ? ref : ref.parentElement;
    const tag = ctx?.localName;
    let sp;
    if (ref.localName === 'tr' || /^(tbody|thead|tfoot|table)$/.test(tag ?? '')) {
      sp = doc.createElement('tr');
      const td = doc.createElement('td');
      td.colSpan = 1000;
      td.setAttribute('data-label', label);
      sp.appendChild(td);
      sp.style.height = height + 'px';
    } else {
      sp = doc.createElement(tag === 'ul' || tag === 'ol' ? 'li' : 'div');
      sp.setAttribute('data-label', label);
      sp.style.height = Math.max(0, height - (gapPx ?? parentGap(end ? ref.lastElementChild ?? ref : ref))) + 'px';
    }
    sp.className = 'sgc-spacer';
    sp.setAttribute('data-sgc-ignore', '');
    sp.setAttribute('aria-hidden', 'true');
    if (afterNode) afterNode.parentNode.insertBefore(sp, afterNode.nextSibling);
    else if (end) parent.appendChild(sp); else parent.insertBefore(sp, ref);
    spacers.push(sp);
    return sp;
  }
  /** 줄 단위 덩어리: 표 칸이면 그 줄, 아니면 가까운 문단류 */
  const unitOf = (n) => {
    const el = n?.nodeType === 1 ? n : n?.parentElement;
    if (!el) return null;
    const tr = el.closest('tr');
    return tr ?? blockOf(el);
  };
  /** 바뀐 곳을 감싼 가장 큰 덩어리 (문서 맨 위 바로 아래 또는 쪽 바로 아래) */
  function topUnit(n, side) {
    const r = root(side);
    let el = n?.nodeType === 1 ? n : n?.parentElement;
    while (el && el.parentElement && el.parentElement !== r && !(opt.page && el.parentElement.matches(opt.page))) el = el.parentElement;
    return el && el !== r ? el : null;
  }
  /**
   * 읽기와 쓰기를 섞지 않는다: "전부 재기 → 한꺼번에 넣기" × 3번.
   * (재고-넣고를 번갈아 하면 넣을 때마다 문서 전체 배치를 다시 계산해 수천 쪽에서 수십 초가 걸림)
   */
  let lazyIO = [];
  /** 이동하기 전에 그 쪽들의 높이 맞추기를 먼저 끝낸다 (쪽 문서). 키: 'left:3' */
  let ensureAligned = async () => {};
  /**
   * 쪽 문서(opt.page): 화면에 보이는 쪽과 그 앞뒤 몇 장만 맞춘다. 스크롤해서 새 쪽이 다가오면 그 쪽만.
   * 화면 밖 쪽은 브라우저가 그리지 않으므로(content-visibility) 높이를 잴 필요도 없고, 재면 억지로 그리느라 느려진다.
   * 쪽이 없는 문서는 한 번에 전부 맞춘다.
   */
  async function alignHeights(list, tick) {
    unalign();
    pageIdx = null;
    for (const io of lazyIO) io.disconnect();
    lazyIO = [];
    ensureAligned = async () => {};
    if (!opt.page) return alignBatch(list, tick);
    const groups = new Map();   // 'left:3' → 그 쪽에 걸친 변경들
    const add = (side, n, ch) => {
      const k = pageNo(n, side);
      if (k < 0) return;
      const key = side + ':' + k;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(ch);
    };
    for (const ch of list) {
      add('left', ch.left, ch); add('right', ch.right, ch);
      if (ch.gap) { add(ch.gap.side, ch.gap.node, ch); add(ch.gap.side, ch.gap.prev, ch); }
      for (const x of ch.extra ?? []) add(ch.type === 'added' ? 'right' : 'left', x.node, ch);
      for (const n of ch.alsoLeft ?? []) add('left', n, ch);
    }
    const done = new Set(), queue = new Set();
    let draining = false;
    const drain = async () => {
      if (draining) return;
      draining = true;
      try {
        while (queue.size) {
          const batch = [];
          for (const key of queue) for (const ch of groups.get(key) ?? []) if (!done.has(ch)) { done.add(ch); batch.push(ch); }
          queue.clear();
          if (batch.length) await alignBatch(batch, async () => !destroyed);
        }
      } finally { draining = false; }
    };
    ensureAligned = async (keys) => {
      for (const k of keys) if (groups.has(k)) queue.add(k);
      while (draining) await yieldToBrowser();
      await drain();
    };
    for (const side of ['left', 'right']) {
      const r = root(side);
      const win = r.ownerDocument.defaultView;
      if (!win.IntersectionObserver) return alignBatch(list, tick);
      const sc = side === 'left' ? opt.leftScroller : opt.rightScroller;
      const scEl = sc ?? makeScroller(r).target;
      const pages = Array.from(r.querySelectorAll(opt.page));
      const idx = new Map(pages.map((p, i) => [p, i]));
      const io = new win.IntersectionObserver((entries) => {
        for (const e of entries) if (e.isIntersecting) queue.add(side + ':' + idx.get(e.target));
        drain();
      }, { root: scEl && scEl.nodeType === 1 ? scEl : null, rootMargin: '150% 0px 150% 0px' });
      for (const p of pages) if (groups.has(side + ':' + idx.get(p))) io.observe(p);
      lazyIO.push(io);
    }
  }

  async function alignBatch(list, tick) {
    const msg = getMessages(opt.locale);
    const el = (x) => (x ? (x.nodeType === 1 ? x : x.parentElement) : null);
    // 1) 재기: 한쪽에만 있는 덩어리의 높이와 넣을 자리
    const plans = [];
    for (const ch of list) {
      const exp = ch.extra ? [ch, ...ch.extra.map((x) => ({ ...ch, [ch.type === 'added' ? 'right' : 'left']: x.node, gap: x.gap }))] : [ch];
      for (const c of exp) {
        if (c.type !== 'added' && c.type !== 'deleted') continue;
        const n = c.type === 'added' ? c.right : c.left;
        if (n?.nodeType !== 1 || /^(td|th)$/.test(n.localName) || !c.gap?.node) continue;
        if (!(await tick())) return;
        const gside = c.gap.side, oside = gside === 'left' ? 'right' : 'left';
        let ref = el(c.gap.node), end = c.gap.end, after = null;
        // 쪽 문서: 원본이 있는 쪽 번호와 같은 쪽에 빈 칸을 넣는다 (다음 항목이 다음 쪽이면 앞 항목 뒤에)
        const want = pageNo(n, oside);
        const prev = el(c.gap.prev);
        if (want >= 0) {
          if (prev && pageNo(prev, gside) === want && (end || pageNo(ref, gside) !== want)) after = prev;
          else if (end && prev) after = prev;
        } else if (end && prev) after = prev;
        if (!ref && !after) continue;
        const h = spaceOf(n);
        if (h < 1) continue;
        plans.push({ c, ref, end, after, h, label: c.type === 'added' ? msg.gapAdded : msg.gapDeleted, gap: parentGap(after ?? (end ? ref.lastElementChild ?? ref : ref)) });
      }
    }
    // 2) 넣기 (한꺼번에)
    for (const pl of plans) {
      const { c, ref, end, after, h, label } = pl;
      if (after) {
        const nxt = after.nextSibling;
        c.spacer = nxt ? makeSpacer(nxt.nodeType === 1 ? nxt : after.parentElement, !nxt || nxt.nodeType !== 1, h, label, after, pl.gap) : makeSpacer(after.parentElement, true, h, label, null, pl.gap);
      } else c.spacer = makeSpacer(ref, end, h, label, null, pl.gap);
    }
    // 3) 재기 → 쓰기: 양쪽 다 있는 변경을 줄 단위로 같은 높이
    const pairs = [];
    for (const ch of list) {
      if (ch.type === 'added' || ch.type === 'deleted' || !ch.left || !ch.right) continue;
      pairs.push([unitOf(ch.left), unitOf(ch.right)]);
      for (const n of ch.alsoLeft ?? []) pairs.push([unitOf(n), unitOf(ch.right)]);
    }
    const fixes = [];
    for (const [a, b] of pairs) { if (!(await tick())) return; const f = measurePair(a, b); if (f) fixes.push(f); }
    applyFixes(fixes);
    // 4) 재기 → 쓰기: 감싼 큰 덩어리끼리 한 번 더 (안쪽에서 맞추지 못한 차이까지)
    const seen = new Set(), tops = [];
    for (const ch of list) {
      if (!ch.left || !ch.right) continue;
      const a = topUnit(ch.left, 'left'), b = topUnit(ch.right, 'right');
      if (!a || !b || seen.has(a)) continue;
      seen.add(a);
      tops.push([a, b]);
    }
    const fixes2 = [];
    for (const [a, b] of tops) { if (!(await tick())) return; const f = measurePair(a, b); if (f) fixes2.push(f); }
    applyFixes(fixes2);
  }
  /** 같은 높이로 만들 값 계산 (읽기만) */
  function measurePair(a, b) {
    if (!a || !b || a === b || !a.isConnected || !b.isConnected) return null;
    const ha = layoutHeight(a), hb = layoutHeight(b);
    if (Math.abs(ha - hb) < 0.5) return null;
    const lo = ha < hb ? a : b, diff = Math.abs(ha - hb);
    if (lo.localName === 'tr') return { el: lo, prop: 'height', value: Math.max(ha, hb) + 'px' };
    const cs = lo.ownerDocument.defaultView.getComputedStyle(lo);
    return { el: lo, prop: 'paddingBottom', value: (px(cs.paddingBottom) + diff) + 'px' };
  }
  function applyFixes(fixes) {
    for (const { el, prop, value } of fixes) { padded.push([el, prop, el.style[prop]]); el.style[prop] = value; }
  }

  /** 글꼴이 늦게 내려오거나 칸 폭이 바뀌면 줄 높이가 달라지므로 높이만 다시 맞춘다 (다시 비교하지 않음) */
  let realignTimer = 0, realignSetup = false;
  function scheduleRealign() {
    clearTimeout(realignTimer);
    realignTimer = setTimeout(() => {
      if (destroyed || state.running || opt.align === false || !state.changes.length) return;
      alignHeights(state.changes, async () => true);
    }, 120);
  }
  function setupRealign() {
    if (realignSetup) return;
    realignSetup = true;
    const docs = new Set([root('left').ownerDocument, root('right').ownerDocument]);
    for (const d of docs) {
      d.fonts?.addEventListener?.('loadingdone', scheduleRealign);
      d.fonts?.ready?.then(scheduleRealign);
    }
    const RO = root('left').ownerDocument.defaultView.ResizeObserver;
    if (RO) {
      let widths = new Map();
      const ro = new RO((entries) => {
        let changed = false;
        for (const e of entries) { const w = Math.round(e.contentRect.width); if (widths.get(e.target) !== w) { widths.set(e.target, w); changed = true; } }
        if (changed) scheduleRealign();
      });
      ro.observe(root('left')); ro.observe(root('right'));
      observers.push(() => ro.disconnect());
    }
    observers.push(() => { for (const d of docs) d.fonts?.removeEventListener?.('loadingdone', scheduleRealign); clearTimeout(realignTimer); });
  }

  async function apply(out, id) {
    const tick = slicer(id);
    const list = [];
    // 1) 변경마다 양쪽 실제 위치 찾기 (아직 화면은 그대로)
    const pgL = pageIndex('left'), pgR = pageIndex('right');
    for (const c of out.changes) {
      if (!(await tick())) return;
      const L = nodeOf('left', c.at?.left), R = nodeOf('right', c.at?.right);
      // rowspan 으로 내려온 가상 칸이 통째로 생기거나 없어진 것은 원래 칸의 rowspan 바뀜으로 이미 나타남
      if ((c.type === 'added' || c.type === 'deleted') && ((L.obj?.virt && !L.rest.length) || (R.obj?.virt && !R.rest.length))) continue;
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
          const prev = kids[c.at.gap.index - 1];
          const refNode = ref ? snaps[gside].nodes[ref.i] : p.node;
          ch.gap = { side: gside, node: refNode, end: !ref, prev: prev ? snaps[gside].nodes[prev.i] : null };
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
    if (opt.align !== false) { await alignHeights(final, tick); setupRealign(); }
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
      for (const n of ch.alsoLeft ?? []) {
        if (n.nodeType === 3) for (const [s0, e0] of sideSpans(ch.diffs, 'left')) marks.left.textRange(n, s0, e0, 'del');
        if (n.nodeType === 1) marks.left.attr(n, 'data-sgc', 'modified');
      }
      if (ch.span) for (const side of ['left', 'right']) { const n = ch.span[side]; if (n?.nodeType === 1) marks[side].attr(n, 'data-sgc', 'modified'); }
      for (const side of ['left', 'right']) {
        const tn = ch[side];
        if (!tn) continue;
        for (const [s, e] of sideSpans(ch.diffs, side)) marks[side].textRange(tn, s, e, side === 'left' ? 'del' : 'ins');
        if (!hasHighlightApi(tn.ownerDocument.defaultView)) marks[side].attr(blockOf(tn), 'data-sgc', 'modified');
      }
      return;
    }
    if (ch.what !== 'attr' && (t === 'added' || t === 'deleted')) {
      const side = t === 'added' ? 'right' : 'left';
      const n = ch[side];
      if (n) {
        if (n.nodeType === 3) {
          marks[side].wholeText(n, t === 'added' ? 'add' : 'del');
          if (!hasHighlightApi(n.ownerDocument.defaultView)) marks[side].attr(n.parentElement, 'data-sgc', t);
        } else {
          marks[side].attr(n, 'data-sgc', t);
        }
      }
      // 표 칸 하나가 생기거나 없어진 것은 반대쪽 빈자리 줄을 긋지 않는다 (열 추가 때 줄마다 선이 생겨 어지러움)
      const isCell = n?.nodeType === 1 && (n.localName === 'td' || n.localName === 'th');
      // 높이 맞추기가 켜져 있으면 빈 칸(빗금)이 자리를 보여 주므로 빈자리 줄은 긋지 않는다
      if (ch.gap?.node && !isCell && opt.align === false) {
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
    if (ch.what === 'text' && ch.diffs) return { diffs: trimDiffs(ch.diffs), ...(ch.span ? { span: { attr: ch.span.attr, before: ch.span.before, after: ch.span.after } } : {}) };
    if (ch.what === 'attr') return { attr: ch.attr, before: ch.before, after: ch.after, context: snippet(ch.right ?? ch.left, 60) };
    if (ch.what === 'moved') return { context: snippet(ch.right ?? ch.left) };
    if (ch.what === 'column') {
      const n = ch.type === 'added' ? ch.right : ch.left;
      // 열은 머리글(첫 칸) 이름만
      return { column: ch.count, context: snippet(n, 40) };
    }
    return { context: snippet(ch.type === 'deleted' ? ch.left : ch.right) };
  }

  function elOf(n) { return n ? (n.nodeType === 1 ? n : n.parentElement) : null; }

  let focusTimer = 0;
  const focused = [];
  /** i 번째 변경으로 이동 (양쪽 모두) */
  let goToken = 0;
  /**
   * i 번째 변경으로 이동 (양쪽 모두).
   * 큰 문서는 화면 밖 쪽이 아직 그려지지 않았고(어림 높이) 높이 맞추기도 아직이라, 한 번에 계산하면 빗나간다.
   * → ① 그 쪽(과 앞쪽)의 높이 맞추기를 먼저 끝내고 ② 바로 이동한 뒤 ③ 자리가 잡히면 다시 재서 바로잡는다
   */
  async function goTo(i, { smooth = true } = {}) {
    if (!state.changes.length) return;
    i = ((i % state.changes.length) + state.changes.length) % state.changes.length;
    state.current = i;
    const ch = state.changes[i];
    const token = ++goToken;
    if (!scrollers.left) setupScroll();
    link?.pause(2000);
    for (const el of focused) el.removeAttribute('data-sgc-focus');
    focused.length = 0;
    emit('focus', ch);
    const targetOf = (side) => {
      let el = elOf(ch[side]);
      if (!el && ch.gap?.side === side) el = ch.spacer ?? elOf(ch.gap.node);
      if (!el) return null;
      return ch.what === 'text' ? blockOf(ch[side]) ?? el : el;
    };
    // ① 높이 맞추기 먼저
    const keys = [];
    for (const side of ['left', 'right']) {
      const t = targetOf(side);
      const k = pageNo(t, side);
      if (k >= 0) keys.push(`${side}:${k}`, `${side}:${k - 1}`);
    }
    if (keys.length) await ensureAligned(keys);
    if (token !== goToken) return;
    // ② 이동: 가까우면 부드럽게, 멀면 바로
    let sides = ['left', 'right'].map((side) => ({ side, block: targetOf(side) })).filter((x) => x.block);
    // 두 문서가 한 스크롤 영역에 있으면(좌우가 늘 함께 움직임) 한쪽 기준으로만 맞춘다 (새 버전 쪽 우선)
    if (sides.length > 1 && scrollers.left.target === scrollers.right.target) sides = [sides.find((x) => x.side === 'right') ?? sides[0]];
    let anySmooth = false;
    for (const { side, block } of sides) {
      const sc = scrollers[side];
      const dist = Math.abs(block.getBoundingClientRect().top - sc.viewTop());
      const soft = smooth && dist < sc.height() * 1.5 && !matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      anySmooth ||= soft;
      scrollIntoScroller(sc, block, 0.3, soft);
      block.setAttribute('data-sgc-focus', '');
      focused.push(block);
      const fr = [];
      if (ch[side]?.nodeType === 3) { const r = ch[side].ownerDocument.createRange(); r.selectNodeContents(ch[side]); fr.push(r); }
      marks[side].setFocus(fr);
    }
    // ③ 자리가 잡힐 때까지(새로 그려진 쪽의 높이 변화, 늦게 들어간 빈 칸) 최대 1초 동안 지켜보며 바로잡는다.
    //    사용자가 직접 스크롤(휠·터치·키)하면 바로 멈춘다
    if (anySmooth) await new Promise((r) => setTimeout(r, 450));
    let userMoved = false;
    const stopper = () => { userMoved = true; };
    const docsSet = new Set(sides.map(({ side }) => root(side).ownerDocument));
    for (const d of docsSet) for (const ev of ['wheel', 'touchstart', 'keydown', 'mousedown']) d.addEventListener(ev, stopper, { passive: true, capture: true });
    try {
      const until = performance.now() + 1000;
      let stable = 0;
      while (performance.now() < until && stable < 8 && !userMoved) {
        await new Promise((r) => requestAnimationFrame(r));
        if (token !== goToken) return;
        if (keys.length) await ensureAligned(keys);
        let moved = false;
        for (const { side, block } of sides) {
          if (!block.isConnected) continue;
          const sc = scrollers[side];
          const want = sc.top + (block.getBoundingClientRect().top - sc.viewTop()) - sc.height() * 0.3;
          const v = Math.max(0, Math.min(want, sc.max()));
          if (Math.abs(v - sc.top) > 2) { scrollIntoScroller(sc, block, 0.3, false); moved = true; }
        }
        stable = moved ? 0 : stable + 1;
        link?.pause(300);
      }
    } finally {
      for (const d of docsSet) for (const ev of ['wheel', 'touchstart', 'keydown', 'mousedown']) d.removeEventListener(ev, stopper, { capture: true });
    }
    link?.pause(250);
    clearTimeout(focusTimer);
    focusTimer = setTimeout(() => {
      for (const el of focused) el.removeAttribute('data-sgc-focus');
      focused.length = 0;
      marks.left.setFocus([]); marks.right.setFocus([]);
    }, 1800);
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
      const isOurs = (n) => n.nodeType === 1 && n.classList?.contains('sgc-spacer');
      const mo = new (r.ownerDocument.defaultView.MutationObserver)((recs) => {
        // 모듈이 넣고 뺀 빈 칸 때문에 생긴 변화는 무시 (다시 비교가 끝없이 반복되지 않게)
        const real = recs.some((m) => m.type !== 'childList'
          ? !(m.target.nodeType === 1 ? m.target : m.target.parentElement)?.closest?.('.sgc-spacer')
          : [...m.addedNodes, ...m.removedNodes].some((n) => !isOurs(n)));
        if (real) kick();
      });
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
    for (const sp of clone.querySelectorAll('.sgc-spacer')) sp.remove();
    for (const el of clone.querySelectorAll('[style]')) { if (padded.some(([p]) => p === el)) el.removeAttribute('style'); }
    const cs = snapshot(clone, { attrs: opt.attrs, ignore: opt.ignore, anchors: '', keyAttrs: opt.keyAttrs, flatten: opt.flatten ?? opt.page });
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
        if (n.nodeType === 3) { const e = doc.createElement('ins'); e.className = 'sgc-add'; n.replaceWith(e); e.append(n); }
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
    /** 두 문서가 한 스크롤 영역 안에 있음 (늘 함께 움직임 → 스크롤 맞춤 버튼 필요 없음) */
    get sharedScroll() { if (!scrollers.left) setupScroll(); return scrollers.left.target === scrollers.right.target; },
    set syncScroll(v) { if (link) link.enabled = v; updateScrollbar(); emit('sync', !!v); },
    setFilter(type) { state.filter = type && state.filter !== type ? type : null; emit('filter', state.filter); },
    run, goTo, next: () => step(1), prev: () => step(-1), renderRedline,
    on(ev, f) { if (!listeners.has(ev)) listeners.set(ev, []); listeners.get(ev).push(f); return () => api.off(ev, f); },
    off(ev, f) { const l = listeners.get(ev); if (l) l.splice(l.indexOf(f) >>> 0, 1); },
    clear() { unalign(); marks.left.clear(); marks.right.clear(); state.changes = []; emit('update', api); },
    destroy() {
      destroyed = true; runId++;
      clearTimeout(debounceTimer); clearTimeout(focusTimer);
      unwatch(); link?.destroy(); unalign();
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
