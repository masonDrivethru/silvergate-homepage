/**
 * 비교 계산 (DOM 없이 JSON 트리만). Web Worker 안에서도, 화면 스레드에서도 돈다.
 */
import { compare, alignSequences } from '@silvergate/compare-core';

/** 글자 두 개씩 묶음 (비슷함 판정용). 너무 긴 글은 앞부분만 */
const bigramCache = new WeakMap();
const textCache = new WeakMap();
function textOf(n) {
  if (n.v !== undefined) return n.v;
  let t = textCache.get(n);
  if (t === undefined) {
    t = '';
    for (const c of n.c) { t += (t ? ' ' : '') + textOf(c); if (t.length > 2000) break; }
    textCache.set(n, t);
  }
  return t;
}
function bigrams(n) {
  let b = bigramCache.get(n);
  if (!b) {
    const t = textOf(n).slice(0, 600);
    b = new Map();
    for (let i = 0; i < t.length - 1; i++) { const g = t.substr(i, 2); b.set(g, (b.get(g) ?? 0) + 1); }
    bigramCache.set(n, b);
  }
  return b;
}
/** 0~1. 종류(글자/태그)가 다르면 0 */
export function similarity(a, b) {
  const ta = a.v !== undefined, tb = b.v !== undefined;
  if (ta !== tb) return 0;
  if (!ta && a.n !== b.n) return 0;
  if (!ta && a.k && b.k) return a.k === b.k ? 1 : 0;
  // 첫 칸(제목 칸·번호 등)이 똑같은 표 줄·항목은 같은 줄로 본다
  const lead = !ta && a.c.length > 1 && b.c.length > 1 && a.c[0].h === b.c[0].h ? 0.75 : 0;
  const A = bigrams(a), B = bigrams(b);
  if (!A.size && !B.size) return ta ? (a.v === b.v ? 1 : 0.55) : 0.75;
  if (!A.size || !B.size) return Math.max(lead, 0.55);   // 아주 짧은 글(한 글자 등)
  let inter = 0, na = 0, nb = 0;
  for (const v of A.values()) na += v;
  for (const v of B.values()) nb += v;
  for (const [g, v] of A) { const w = B.get(g); if (w) inter += Math.min(v, w); }
  const dice = (2 * inter) / (na + nb);
  // 짧은 값(버전·날짜·숫자 등)은 글자가 많이 달라도 같은 자리의 "수정"으로 본다
  const short = textOf(a).length <= 24 && textOf(b).length <= 24 ? 0.55 : 0;
  if (ta) return Math.max(dice, short);
  return Math.max(0.3 + 0.7 * dice, short, lead);      // 같은 태그면 기본 점수
}

export const DOM_RULES = {
  identity: { '**': (n) => (n && typeof n === 'object' && !Array.isArray(n) ? n.h : undefined) },
  ignore: ['**.h', '**.i', '**.k', '**.virt'],
  keys: { '**.c': (n) => (n && n.k ? n.n + '#' + n.k : null) },
  similar: { '**.c.*': similarity },
  raw: true,
  textMin: 12,
  detectMoves: true,
};

/**
 * @param {{ left: any, right: any, leftAnchors?: string[], rightAnchors?: string[], options?: any }} job
 */
export function diffTrees(job) {
  const t0 = now();
  const r = compare(job.left, job.right, { ...DOM_RULES, ...(job.options ?? {}) });
  const changes = r.changes.map((c) => ({
    type: c.type, kind: c.kind, path: c.path, at: c.at, diffs: c.diffs,
    // 덩어리 값은 화면 쪽에서 DOM 으로 다시 읽으므로 보내지 않는다 (큰 문서에서 전송량 절약)
    left: c.left !== null && typeof c.left === 'object' ? null : c.left,
    right: c.right !== null && typeof c.right === 'object' ? null : c.right,
  }));
  const t1 = now();
  const pairs = job.leftAnchors && job.rightAnchors ? alignSequences(job.leftAnchors, job.rightAnchors) : [];
  const anchorPairs = new Int32Array(pairs.length * 2);
  pairs.forEach(([a, b], k) => { anchorPairs[2 * k] = a; anchorPairs[2 * k + 1] = b; });
  return { changes, stats: r.stats, anchorPairs, ms: { compare: t1 - t0, anchors: now() - t1 } };
}

function now() { return (typeof performance !== 'undefined' ? performance : Date).now(); }
