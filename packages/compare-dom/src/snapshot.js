/**
 * 그려진 화면(DOM)을 비교용 JSON 트리로 읽는다. 원본은 건드리지 않는다.
 *
 *   요소: { n: 태그, a: 비교할 속성, c: 자식[], k?: 키, h: 지문, i: 번호 }
 *   글자: { v: 글자(공백 정리), h: 지문, i: 번호 }
 *
 * i 는 nodes[i] = 실제 DOM 노드. h 는 안쪽까지 포함한 지문이라 같으면 비교를 건너뛴다(큰 문서용).
 */

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'LINK', 'META', 'HEAD', 'OBJECT']);
/** 기본으로 비교하는 속성 (class·style 같은 꾸밈은 기본 제외: 화면 프레임워크마다 달라지는 잡음) */
export const DEFAULT_ATTRS = ['src', 'href', 'alt', 'colspan', 'rowspan', 'type'];
/** 스크롤 맞춤 기준점으로 쓸 덩어리 */
export const DEFAULT_ANCHORS = 'p,li,tr,h1,h2,h3,h4,h5,h6,dt,dd,pre,blockquote,figcaption,caption,img,[data-sgc-key]';
const KEY_ATTRS = ['data-sgc-key', 'data-key'];

/**
 * 글자 → 지문 (96비트, 6글자 문자열). 32비트 셋을 따로 섞는다.
 * "지문이 같으면 내용이 같다"로 보고 안쪽 비교를 건너뛰므로, 다른 내용이 우연히 같은 지문이 될 확률을 사실상 0 으로 (수천 쪽 문서에서 10^-18 수준).
 * 숫자를 글자로 바꾸는(진법 변환) 비용 없이 16비트씩 그대로 글자로 만든다.
 */
export function hashStr(str, seed = 0) {
  let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed, h3 = 0x9e3779b9 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 0x85ebca6b) ^ (h3 >>> 15);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  h3 = Math.imul(h3 ^ (h3 >>> 16), 0xc2b2ae35) ^ str.length;
  return String.fromCharCode(h1 & 0xffff, h1 >>> 16, h2 & 0xffff, h2 >>> 16, h3 & 0xffff, h3 >>> 16);
}

/** 문서 안에 들어 있는 iframe 의 안쪽 문서 (같은 도메인이고 다 열렸을 때만). 다른 도메인이면 null → 주소(src)만 비교 */
export function frameBody(el) {
  try {
    const d = el.contentDocument;
    return d && d.body && d.readyState !== 'loading' ? d.body : null;
  } catch { return null; }
}

export const normText = (s) => s.replace(/\s+/g, ' ').trim();

/**
 * @param {Element} root
 * @param {{ attrs?: string[], ignore?: string, anchors?: string, keyAttrs?: string[] }} [opt]
 * @returns {{ tree: any, nodes: Node[], anchors: number[], anchorHashes: string[] }}
 *   anchors = 기준점 요소의 nodes 번호 (문서 순서)
 */
export function snapshot(root, opt = {}) {
  const it = walk(root, opt);
  let r = it.next();
  while (!r.done) r = it.next();
  return r.value;
}

/**
 * snapshot 과 같지만 조금씩 나눠 읽으며 중간중간 브라우저에 차례를 넘긴다 (수천 쪽에서도 화면이 멈추지 않게)
 * @param {Element} root @param {any} [opt] @param {number} [sliceMs=8] 한 번에 쓰는 시간
 */
export async function snapshotAsync(root, opt = {}, sliceMs = 8) {
  const it = walk(root, opt);
  let t = performance.now();
  for (let r = it.next(); ; r = it.next()) {
    if (r.done) return r.value;
    if (performance.now() - t > sliceMs) { await yieldToBrowser(); t = performance.now(); }
  }
}

/** 브라우저에 차례 넘기기. setTimeout(0) 은 한 번에 4ms 씩 버려지므로 MessageChannel (0.02ms) */
let chan = null;
const waiters = [];
export function yieldToBrowser() {
  const s = globalThis.scheduler;
  if (s && typeof s.yield === 'function') return s.yield();
  if (typeof MessageChannel === 'undefined') return new Promise((res) => setTimeout(res, 0));
  if (!chan) { chan = new MessageChannel(); chan.port1.onmessage = () => waiters.shift()?.(); }
  return new Promise((res) => { waiters.push(res); chan.port2.postMessage(0); });
}

/** 반복문으로 트리를 읽는다 (재귀 대신: 아주 깊은 문서도 안전, 중간에 멈출 수 있음). 512개마다 한 번 yield */
function* walk(root, opt) {
  const attrs = opt.attrs ?? DEFAULT_ATTRS;
  const ignoreSel = ['[data-sgc-ignore]', '[hidden]', opt.ignore].filter(Boolean).join(',');
  const anchorSel = opt.anchors ?? DEFAULT_ANCHORS;
  const keyAttrs = opt.keyAttrs ?? KEY_ATTRS;
  /** 이 요소(예: 쪽)는 없는 것처럼 안쪽을 부모에 바로 붙인다: 쪽 경계가 달라도 내용끼리 비교 */
  const flattenSel = opt.flatten || '';
  /** 눈에 안 보이는(display:none) 요소는 빼기 (접힌 탭·숨긴 영역). 기본은 포함 */
  const visibleOnly = !!opt.visibleOnly;
  /** 안쪽 문서까지 읽은 iframe 들 (바뀜 감시·표시용) */
  const frames = [];
  let frameDepth = 0;
  /** @type {Node[]} */
  const nodes = [];
  const anchors = [], anchorHashes = [];
  /** 백그라운드로 나눠 보낼 평평한 목록 (노드 번호 순 = 문서 순서). 요소는 닫힐 때 h 가 채워짐 */
  const flat = [];
  let count = 0;
  /** 표: 칸 요소 → 읽은 결과, 줄 묶음(tbody 등) → 위에서 내려오는(rowspan) 칸 */
  const cellOut = new Map();
  const spans = new Map();

  /**
   * 표 한 줄을 "눈에 보이는 격자"대로: 위 줄에서 rowspan 으로 내려온 칸을 그 자리에 가상 칸으로 끼워 넣는다.
   * → 줄끼리 비교할 때 줄마다 칸 수가 같아져 열 추가·줄 순서 바뀜을 제대로 찾음
   */
  function layoutRow(tr, kids) {
    const group = tr.parentElement;
    let pend = spans.get(group);
    if (!pend) spans.set(group, (pend = []));
    const old = new Set(pend.filter((b) => b && b.left > 0));
    const out = [];
    let col = 0;
    const emitPending = () => {
      for (;;) {
        const b = pend[col];
        if (!b || !old.has(b) || b.left <= 0) return;
        if (b.start === col) out.push({ virt: b.cell });
        col += b.cs;
      }
    };
    for (const k of kids) {
      if (k.nodeType === 1 && (k.tagName === 'TD' || k.tagName === 'TH')) {
        emitPending();
        const cs = Math.max(1, k.colSpan || 1), rs = k.rowSpan === 0 ? 1e6 : Math.max(1, k.rowSpan || 1);
        if (rs > 1) { const b = { cell: k, left: rs - 1, cs, start: col }; for (let c = col; c < col + cs; c++) pend[c] = b; }
        else for (let c = col; c < col + cs; c++) if (pend[c] && !old.has(pend[c])) pend[c] = undefined; else if (pend[c] && old.has(pend[c]) && pend[c].left <= 0) pend[c] = undefined;
        out.push(k);
        col += cs;
      } else out.push(k);
    }
    // 줄 끝에 남은 내려온 칸
    for (; col < pend.length; ) { const before = col; emitPending(); if (col === before) col++; }
    for (const b of old) b.left--;
    return out;
  }

  function open(e, parent) {
    const i = nodes.length;
    nodes.push(e);
    const n = e.localName;
    const out = { n, c: [], h: '', i };
    let sig = n;
    const a = {};
    let hasA = false;
    for (const name of attrs) {
      const v = e.getAttribute(name);
      if (v !== null) { a[name] = v; hasA = true; sig += `\u0001${name}=${v}`; }
    }
    // 입력칸은 지금 들어 있는 값 (속성이 아니라 화면의 값)
    const tag = e.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') {
      const t = e.type;
      const v = t === 'checkbox' || t === 'radio' ? (e.checked ? 'on' : 'off')
        : tag === 'SELECT' ? Array.from(e.selectedOptions ?? [], (o) => o.text).join(', ')
        : e.value ?? '';
      a.value = v; hasA = true; sig += `\u0001value=${v}`;
    }
    if (hasA) out.a = a;
    for (const ka of keyAttrs) { const k = e.getAttribute(ka); if (k) { out.k = k; sig += `\u0002${k}`; break; } }
    const rec = { n, p: parent, h: '' };
    if (hasA) rec.a = a;
    if (out.k) rec.k = out.k;
    flat[i] = rec;
    // 스크롤 맞춤 기준점은 바깥 문서의 요소만 (iframe 안쪽은 좌표계가 다름)
    const ai = anchorSel && !frameDepth && e.matches(anchorSel) ? anchors.push(i) - 1 : -1;
    let kids = tag === 'TEXTAREA' || tag === 'SELECT' ? [] : Array.from(e.childNodes);
    let isFrame = false;
    // 문서 안의 iframe (같은 도메인): 안쪽 문서 내용을 이 요소의 자식으로 읽는다
    if (tag === 'IFRAME' || tag === 'FRAME') {
      const body = opt.frames === false ? null : frameBody(e);
      kids = body ? Array.from(body.childNodes) : [];
      if (body) { frames.push(e); isFrame = true; frameDepth++; }
    } else if (e.hasAttribute('data-sgc-frame')) { isFrame = true; frameDepth++; }   // 한 장 보기용 복사본에서 iframe 자리
    // 열린 shadow DOM (웹 컴포넌트) 안쪽도 읽는다
    if (e.shadowRoot && e.shadowRoot.mode === 'open') kids = kids.concat(Array.from(e.shadowRoot.children));
    if (tag === 'TD' || tag === 'TH') cellOut.set(e, out);
    else if (tag === 'TR') kids = layoutRow(e, kids);
    return { out, sig, kids, x: 0, ai, rec, isFrame };
  }

  const rootEl = resolveRoot(root);
  const top = open(rootEl, -1);
  const stack = [top];
  while (stack.length) {
    const fr = stack[stack.length - 1];
    // 건너뛰는 감싸개(쪽) 안쪽은 바깥 요소(f)에 바로 붙인다
    const f = fr.into ?? fr;
    if (fr.x < fr.kids.length) {
      const ch = fr.kids[fr.x++];
      if (++count % 512 === 0) yield;
      if (ch.virt) {
        // rowspan 으로 내려온 칸: 원래 칸과 같은 내용(자식 공유), 같은 DOM 요소를 가리킴
        const o = cellOut.get(ch.virt);
        if (!o) continue;
        const vi = nodes.length;
        nodes.push(ch.virt);
        const vo = { n: o.n, c: o.c, h: o.h, i: vi, virt: 1 };
        if (o.a) vo.a = o.a;
        f.out.c.push(vo);
        flat[vi] = { ref: o.i, n: o.n, h: o.h, p: f.out.i, virt: 1, ...(o.a ? { a: o.a } : {}) };
        f.sig += '\u0003' + o.h;
        continue;
      }
      const t = ch.nodeType;
      if (t === 3) {
        const v = normText(ch.data);
        if (!v) continue;
        const ti = nodes.length;
        nodes.push(ch);
        const h = hashStr(v);
        f.out.c.push({ v, h, i: ti });
        flat[ti] = { v, h, p: f.out.i };
        f.sig += '\u0003' + h;
      } else if (t === 1) {
        if (SKIP_TAGS.has(ch.tagName) || (ignoreSel && ch.matches(ignoreSel))) continue;
        if (visibleOnly && ch.ownerDocument.defaultView.getComputedStyle(ch).display === 'none') continue;
        // (예전엔 부모 목록에 끼워 넣었는데(splice) 수천 쪽이면 목록 전체를 매번 밀어 느렸다)
        if (flattenSel && ch.matches(flattenSel)) { stack.push({ into: f, kids: Array.from(ch.childNodes), x: 0 }); continue; }
        const sub = open(ch, f.out.i);
        f.out.c.push(sub.out);
        stack.push(sub);
      }
      continue;
    }
    if (fr.into) { stack.pop(); continue; }
    if (f.isFrame) frameDepth--;
    // 이 요소 끝: 지문 계산 후 부모에 반영
    f.out.h = f.rec.h = hashStr(f.sig);
    if (f.ai >= 0) anchorHashes[f.ai] = f.out.h;
    stack.pop();
    if (stack.length) { const pf = stack[stack.length - 1]; (pf.into ?? pf).sig += '\u0003' + f.out.h; }
  }
  return { tree: top.out, nodes, anchors, anchorHashes, flat, frames };
}

/** 평평한 목록 → 트리 (Worker 쪽에서). 번호 i 와 자식 c 를 다시 만든다 */
export function unflatten(flat) {
  const objs = new Array(flat.length);
  for (let i = 0; i < flat.length; i++) {
    const r = flat[i];
    const o = r.ref !== undefined ? { n: r.n, c: objs[r.ref].c, h: r.h, i, virt: 1 }
      : r.v !== undefined ? { v: r.v, h: r.h, i } : { n: r.n, c: [], h: r.h, i };
    if (r.a) o.a = r.a;
    if (r.k) o.k = r.k;
    objs[i] = o;
    if (r.p >= 0) objs[r.p].c.push(o);
  }
  return objs[0];
}

/** Element | Document | iframe → 비교할 요소 */
export function resolveRoot(src) {
  if (!src) throw new Error('[sg-compare] 비교할 화면이 없습니다');
  if (src.tagName === 'IFRAME') {
    const d = src.contentDocument;
    if (!d) throw new Error('[sg-compare] iframe 안을 읽을 수 없습니다 (다른 도메인이면 같은 도메인 주소로 열어야 합니다)');
    return d.body;
  }
  if (src.nodeType === 9) return src.body;
  return src;
}

/** raw 위치(['c', 3, 'c', 0, 'v'])를 따라가 가장 깊은 노드 객체와 남은 필드를 찾는다 */
export function locate(tree, raw) {
  let cur = tree, node = tree;
  let rest = [];
  for (let k = 0; k < raw.length; k++) {
    const seg = raw[k];
    const next = cur?.[seg];
    if (next === undefined) { rest = raw.slice(k); break; }
    cur = next;
    if (cur && typeof cur === 'object' && !Array.isArray(cur) && typeof cur.i === 'number') { node = cur; rest = []; }
    else rest.push(seg);
  }
  return { node, rest };
}
