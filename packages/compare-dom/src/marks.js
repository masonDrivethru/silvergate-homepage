/**
 * 화면에 표시하기. 원본 DOM 은 구조를 바꾸지 않는다:
 *  - 글자 단위: CSS Custom Highlight API (Range 로 색만 입힘. React·Vue 가 다시 그려도 충돌 없음)
 *  - 덩어리 단위: data-sgc 속성 하나 (추가·삭제·수정·이동), data-sgc-line (줄 옆 표시), data-sgc-gap (반대쪽 빈자리)
 */

/** 원래 글자에서 공백 정리된 글자의 각 글자 위치 → 원래 위치 */
export function normIndexMap(s) {
  const map = [];
  let i = 0;
  while (i < s.length && /\s/.test(s[i])) i++;
  let ws = false;
  for (; i < s.length; i++) {
    if (/\s/.test(s[i])) { if (!ws) { map.push(i); ws = true; } }
    else { map.push(i); ws = false; }
  }
  if (ws) map.pop();
  return map;
}

/** diffs 에서 한쪽 글자의 표시 구간 [시작, 끝) (공백 정리된 기준) */
export function sideSpans(diffs, side) {
  const want = side === 'left' ? -1 : 1;
  const out = [];
  let pos = 0;
  for (const [op, t] of diffs) {
    if (op === 0) pos += t.length;
    else if (op === want) { out.push([pos, pos + t.length]); pos += t.length; }
  }
  return out;
}

const BLOCK = 'p,li,td,th,dt,dd,h1,h2,h3,h4,h5,h6,pre,blockquote,figcaption,caption,label,button,summary';

export function blockOf(node) {
  const el = node.nodeType === 1 ? node : node.parentElement;
  return el?.closest(BLOCK) ?? el;
}

export const hasHighlightApi = (win) => !!(win && win.CSS && win.CSS.highlights && win.Highlight);

/** 한 쪽(왼쪽/오른쪽) 표시 모음. clear() 로 깨끗이 지운다 */
export class SideMarks {
  constructor(name) {
    this.name = name;              // 하이라이트 이름 앞부분 (컨트롤러마다 다름)
    this.attrs = [];               // [el, 속성 이름]
    this.ranges = { ins: [], del: [], focus: [] };
    this.wins = new Set();
  }
  attr(el, name, value) {
    if (!el || el.nodeType !== 1) return;
    const cur = el.getAttribute(name);
    // 더 중요한 표시가 이미 있으면 유지 (추가·삭제 > 수정 > 이동)
    if (cur && rank(cur) >= rank(value)) return;
    el.setAttribute(name, value);
    this.attrs.push([el, name]);
  }
  textRange(textNode, start, end, kind) {
    const doc = textNode.ownerDocument;
    const r = doc.createRange();
    const map = normIndexMap(textNode.data);
    if (!map.length) return null;
    const s = map[Math.min(start, map.length - 1)];
    const e = end > start ? map[Math.min(end, map.length) - 1] + 1 : s;
    r.setStart(textNode, s);
    r.setEnd(textNode, Math.min(e, textNode.data.length));
    this.ranges[kind].push(r);
    this.wins.add(doc.defaultView);
    return r;
  }
  wholeText(textNode, kind) {
    const r = textNode.ownerDocument.createRange();
    r.selectNodeContents(textNode);
    this.ranges[kind].push(r);
    this.wins.add(textNode.ownerDocument.defaultView);
  }
  flush() {
    for (const win of this.wins) {
      if (!hasHighlightApi(win)) continue;
      for (const kind of ['ins', 'del', 'focus']) {
        const key = `${this.name}-${kind}`;
        const list = this.ranges[kind].filter((r) => r.startContainer.ownerDocument.defaultView === win);
        if (list.length) win.CSS.highlights.set(key, new win.Highlight(...list));
        else win.CSS.highlights.delete(key);
      }
    }
  }
  setFocus(ranges) {
    this.ranges.focus = ranges;
    for (const r of ranges) this.wins.add(r.startContainer.ownerDocument.defaultView);
    this.flush();
  }
  clear() {
    for (const [el, name] of this.attrs) el.removeAttribute(name);
    this.attrs = [];
    this.ranges = { ins: [], del: [], focus: [] };
    for (const win of this.wins) {
      if (!hasHighlightApi(win)) continue;
      for (const kind of ['ins', 'del', 'focus']) win.CSS.highlights.delete(`${this.name}-${kind}`);
    }
  }
}

const RANKS = { added: 4, deleted: 4, modified: 3, moved: 2, before: 1, end: 1 };
const rank = (v) => RANKS[v] ?? 0;

/** 화면 문서에 표시용 CSS 넣기 (문서마다 한 번, 컨트롤러 이름마다 하이라이트 규칙) */
export function ensureMarkStyle(doc, name) {
  if (!doc) return;
  let st = doc.getElementById('sgc-mark-style');
  if (!st) {
    st = doc.createElement('style');
    st.id = 'sgc-mark-style';
    st.textContent = MARK_CSS;
    (doc.head ?? doc.documentElement).appendChild(st);
  }
  if (!st.dataset[name]) {
    st.dataset[name] = '1';
    st.textContent += highlightCss(name);
  }
}

const highlightCss = (n) => `
::highlight(${n}-ins){background-color:var(--sgc-ins-bg,rgba(34,197,94,.34));color:inherit;text-decoration:underline;text-decoration-color:var(--sgc-ins-line,#16a34a);text-decoration-thickness:2px}
::highlight(${n}-del){background-color:var(--sgc-del-bg,rgba(239,68,68,.28));color:inherit;text-decoration:line-through;text-decoration-color:var(--sgc-del-line,#dc2626);text-decoration-thickness:2px}
::highlight(${n}-focus){background-color:var(--sgc-focus-bg,rgba(37,99,235,.32))}
`;

const MARK_CSS = `
[data-sgc-line]{box-shadow:-7px 0 0 -4px var(--sgc-line-color,#ca8a04)}
[data-sgc-line="added"]{--sgc-line-color:var(--sgc-ins-line,#16a34a)}
[data-sgc-line="deleted"]{--sgc-line-color:var(--sgc-del-line,#dc2626)}
[data-sgc-line="modified"]{--sgc-line-color:var(--sgc-mod-line,#ca8a04)}
[data-sgc]{border-radius:2px}
[data-sgc="added"]{background-color:var(--sgc-add-block,rgba(34,197,94,.13))!important;box-shadow:inset 0 0 0 1.5px var(--sgc-ins-line,#16a34a)!important}
[data-sgc="deleted"]{background-color:var(--sgc-del-block,rgba(239,68,68,.11))!important;box-shadow:inset 0 0 0 1.5px var(--sgc-del-line,#dc2626)!important;text-decoration:line-through;text-decoration-color:rgba(220,38,38,.75)}
[data-sgc="modified"]{background-color:var(--sgc-mod-block,rgba(250,204,21,.16))!important;box-shadow:inset 0 0 0 1.5px var(--sgc-mod-line,#ca8a04)!important}
[data-sgc="moved"]{background-color:var(--sgc-mov-block,rgba(99,102,241,.09))!important;box-shadow:inset 0 0 0 1.5px var(--sgc-mov-line,#6366f1)!important}
[data-sgc-gap="before"]{box-shadow:0 -3px 0 0 var(--sgc-gap-line,rgba(220,38,38,.85))}
[data-sgc-gap="end"]{box-shadow:0 3px 0 0 var(--sgc-gap-line,rgba(220,38,38,.85))}
[data-sgc-gap][data-sgc-side="left"]{--sgc-gap-line:rgba(22,163,74,.9)}
[data-sgc-focus]{outline:2.5px solid var(--sgc-focus,#2563eb)!important;outline-offset:3px;animation:sgc-pulse 1.4s ease-out 1}
@keyframes sgc-pulse{0%{outline-color:rgba(37,99,235,1);outline-offset:8px}100%{outline-offset:3px}}
ins.sgc-ins{background:rgba(34,197,94,.3);text-decoration:underline;text-decoration-color:#16a34a;text-decoration-thickness:2px;color:inherit}
del.sgc-del{background:rgba(239,68,68,.24);text-decoration:line-through;text-decoration-color:#dc2626;text-decoration-thickness:2px;color:inherit}
[data-sgc-noscrollbar]{scrollbar-color:transparent transparent}
[data-sgc-noscrollbar]::-webkit-scrollbar-thumb,[data-sgc-noscrollbar]::-webkit-scrollbar-track{background:transparent}
@media print{[data-sgc-focus]{outline:none!important}}
`;
