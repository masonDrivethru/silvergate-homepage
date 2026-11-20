/**
 * 경로 도구.
 *
 * 경로(path): 비교 결과에서 위치를 가리키는 문자열. 배열 항목은 순번이 아니라 "키"로 적는다.
 *   groups[G1].steps[1.2].params[temperature].value
 * 패턴(pattern): 규칙을 걸 때 쓰는 모양. 배열 항목과 아무 키 하나는 *, 여러 단계는 **
 *   groups.*.steps.*.params.*.value   /   **.updatedAt
 */

/** 항목 id 안의 [ ] \ 는 \ 로 감싼다 */
const esc = (s) => String(s).replace(/[\\[\]]/g, (m) => '\\' + m);

/**
 * @typedef {{ k: string } | { i: string }} Seg   k = 객체 키, i = 배열 항목 id
 */

/** @param {Seg[]} segs */
export function toPath(segs) {
  let out = '';
  for (const s of segs) {
    if ('i' in s) out += `[${esc(s.i)}]`;
    else out += (out ? '.' : '') + s.k;
  }
  return out;
}

/** @param {Seg[]} segs */
export function toPattern(segs) {
  return segs.map((s) => ('i' in s ? '*' : s.k)).join('.');
}

/** 패턴 조각과 경로 조각 비교 (* = 한 단계, ** = 0단계 이상) */
function matchParts(pat, pi, parts, xi) {
  if (pi === pat.length) return xi === parts.length;
  const p = pat[pi];
  if (p === '**') {
    for (let k = xi; k <= parts.length; k++) if (matchParts(pat, pi + 1, parts, k)) return true;
    return false;
  }
  if (xi === parts.length) return false;
  if (p !== '*' && p !== parts[xi]) return false;
  return matchParts(pat, pi + 1, parts, xi + 1);
}

/**
 * 규칙 표를 찾기 함수로 만든다. 먼저 적은 규칙이 우선.
 *   { 'groups': 'groupId', 'groups.*.steps': 'stepId' }  →  find('groups.*.steps') === 'stepId'
 *   ['**.updatedAt', 'meta']                            →  find('a.updatedAt') === true
 * @template T
 * @param {Record<string, T> | string[] | string | undefined} spec
 * @returns {(pattern: string) => T | true | undefined}
 */
export function makeMatcher(spec) {
  if (!spec) return () => undefined;
  const list = typeof spec === 'string' ? [[spec, true]]
    : Array.isArray(spec) ? spec.map((p) => [p, true])
    : Object.entries(spec);
  const rules = list.map(([p, v]) => [p.split('.'), v]);
  const cache = new Map();
  return (pattern) => {
    if (cache.has(pattern)) return cache.get(pattern);
    const parts = pattern === '' ? [] : pattern.split('.');
    let found;
    for (const [pat, v] of rules) {
      if (matchParts(pat, 0, parts, 0)) { found = v; break; }
    }
    cache.set(pattern, found);
    return found;
  };
}

/** 키 순서와 상관없이 같은 값이면 같은 글자가 나오는 JSON (키 없는 배열의 같음 판정용) */
export function stableHash(v, skip) {
  return JSON.stringify(sortDeep(v, skip, []));
}
function sortDeep(v, skip, segs) {
  if (Array.isArray(v)) return v.map((x, i) => sortDeep(x, skip, [...segs, { i: String(i) }]));
  if (v && typeof v === 'object') {
    const out = {};
    for (const k of Object.keys(v).sort()) {
      const next = [...segs, { k }];
      if (skip && skip(toPattern(next))) continue;
      out[k] = sortDeep(v[k], skip, next);
    }
    return out;
  }
  return v;
}
