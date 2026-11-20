/**
 * 배열 짝 맞추기.
 *  - 키가 있으면: 키로 짝을 맞추고, 순서가 바뀐 항목(moved)을 찾는다
 *  - 키가 없으면: 똑같은 항목을 기준점으로 잡고(LCS), 그 사이에 남은 항목은 자리끼리 짝지어 "수정"으로 본다
 * 결과는 문서 순서(새 버전 순서 + 삭제된 항목은 원래 자리 근처)를 따른다.
 */

/**
 * @typedef {Object} Pair
 * @property {string} id         경로에 쓸 항목 id
 * @property {boolean} hasL
 * @property {boolean} hasR
 * @property {*} l
 * @property {*} r
 * @property {number} li         왼쪽 순번 (없으면 -1)
 * @property {number} ri         오른쪽 순번 (없으면 -1)
 * @property {boolean} moved
 */

/** 같은 키가 두 번 나오면 "키#2" 처럼 구분 */
function uniqueIds(arr, keyOf) {
  const seen = new Map();
  return arr.map((item, idx) => {
    const base = String(keyOf(item, idx) ?? '');
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return n === 1 ? base : `${base}#${n}`;
  });
}

/**
 * 키로 짝 맞추기
 * @param {any[]} L @param {any[]} R @param {(item:any, idx:number)=>string} keyOf
 * @returns {Pair[]}
 */
export function matchKeyed(L, R, keyOf, detectMoves = true) {
  const lid = uniqueIds(L, keyOf);
  const rid = uniqueIds(R, keyOf);
  const lpos = new Map(lid.map((id, i) => [id, i]));
  const rset = new Set(rid);

  // 순서 바뀜: 양쪽에 다 있는 항목을 새 순서로 놓고 옛 순번의 최장 증가 수열(LIS)에 없는 것이 움직인 것
  const moved = new Set();
  if (detectMoves) {
    const common = rid.filter((id) => lpos.has(id));
    const keep = lis(common.map((id) => lpos.get(id)));
    common.forEach((id, i) => { if (!keep.has(i)) moved.add(id); });
  }

  /** @type {Pair[]} */
  const out = [];
  let li = 0;
  const flushLeftOnly = (until) => {
    while (li < L.length && lid[li] !== until) {
      if (!rset.has(lid[li])) out.push({ id: lid[li], hasL: true, hasR: false, l: L[li], r: undefined, li, ri: -1, moved: false });
      li++;
    }
    if (li < L.length && lid[li] === until) li++;
  };
  rid.forEach((id, ri) => {
    if (lpos.has(id)) {
      // 움직이지 않은 항목만 왼쪽 위치의 기준점으로 쓴다
      if (!moved.has(id)) flushLeftOnly(id);
      const i = lpos.get(id);
      out.push({ id, hasL: true, hasR: true, l: L[i], r: R[ri], li: i, ri, moved: moved.has(id) });
    } else {
      out.push({ id, hasL: false, hasR: true, l: undefined, r: R[ri], li: -1, ri, moved: false });
    }
  });
  flushLeftOnly(undefined);
  return out;
}

/** 최장 증가 수열에 들어가는 자리(순번) 집합 */
function lis(seq) {
  const tails = [], prev = new Array(seq.length), idxAt = [];
  seq.forEach((v, i) => {
    let lo = 0, hi = tails.length;
    while (lo < hi) { const m = (lo + hi) >> 1; if (tails[m] < v) lo = m + 1; else hi = m; }
    tails[lo] = v; idxAt[lo] = i; prev[i] = lo > 0 ? idxAt[lo - 1] : -1;
  });
  const keep = new Set();
  for (let i = idxAt[tails.length - 1] ?? -1; i >= 0; i = prev[i]) keep.add(i);
  return keep;
}

const LCS_LIMIT = 4_000_000; // 칸 수가 이보다 크면 LCS 대신 자리끼리 짝 (아주 큰 키 없는 배열 대비)

/**
 * 키 없이 짝 맞추기
 * @param {any[]} L @param {any[]} R @param {(item:any, side:'l'|'r', idx:number)=>string} hashOf
 * @returns {Pair[]}
 */
export function matchKeyless(L, R, hashOf) {
  const hl = L.map((x, i) => hashOf(x, 'l', i));
  const hr = R.map((x, i) => hashOf(x, 'r', i));
  // 앞뒤 공통 부분은 바로 짝
  let pre = 0;
  while (pre < L.length && pre < R.length && hl[pre] === hr[pre]) pre++;
  let suf = 0;
  while (suf < L.length - pre && suf < R.length - pre && hl[L.length - 1 - suf] === hr[R.length - 1 - suf]) suf++;

  const n = L.length - pre - suf, m = R.length - pre - suf;
  /** 기준점(같은 항목) 쌍: [li, ri] */
  const anchors = [];
  for (let i = 0; i < pre; i++) anchors.push([i, i]);
  if (n > 0 && m > 0 && (n + 1) * (m + 1) <= LCS_LIMIT) {
    const W = m + 1, dp = new Uint32Array((n + 1) * W);
    for (let i = n - 1; i >= 0; i--) {
      for (let j = m - 1; j >= 0; j--) {
        dp[i * W + j] = hl[pre + i] === hr[pre + j] ? dp[(i + 1) * W + j + 1] + 1 : Math.max(dp[(i + 1) * W + j], dp[i * W + j + 1]);
      }
    }
    for (let i = 0, j = 0; i < n && j < m;) {
      if (hl[pre + i] === hr[pre + j]) { anchors.push([pre + i, pre + j]); i++; j++; }
      else if (dp[(i + 1) * W + j] >= dp[i * W + j + 1]) i++;
      else j++;
    }
  }
  for (let k = suf; k > 0; k--) anchors.push([L.length - k, R.length - k]);
  anchors.push([L.length, R.length]); // 끝 표시

  /** @type {Pair[]} */
  const out = [];
  const add = (li, ri) => out.push({
    id: ri >= 0 ? `#${ri}` : `#~${li}`, hasL: li >= 0, hasR: ri >= 0,
    l: li >= 0 ? L[li] : undefined, r: ri >= 0 ? R[ri] : undefined, li, ri, moved: false,
  });
  let pl = 0, pr = 0;
  for (const [al, ar] of anchors) {
    // 기준점 사이: 자리끼리 짝 → 수정, 남는 것은 추가/삭제
    const gl = al - pl, gr = ar - pr, both = Math.min(gl, gr);
    for (let k = 0; k < both; k++) add(pl + k, pr + k);
    for (let k = both; k < gl; k++) add(pl + k, -1);
    for (let k = both; k < gr; k++) add(-1, pr + k);
    if (al < L.length) add(al, ar);
    pl = al + 1; pr = ar + 1;
  }
  return out;
}
