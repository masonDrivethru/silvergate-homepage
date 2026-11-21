/**
 * 두 버전을 같은 쪽 나누기로 그리기 위한 계획.
 * 양쪽 항목(표지·원자재·구간·단계)을 ID로 합친 순서를 만들고, 그 순서로 쪽을 나눈다.
 * → 같은 쪽 번호에 같은 항목이 있어, 화면 비교 모듈이 넣는 빈 칸(추가·삭제)과 함께 좌우 높이가 늘 맞는다.
 *   (각자 쪽을 나누면 앞에 단계가 하나 추가될 때 뒤쪽 쪽 경계가 전부 어긋난다)
 */

/** @param {import('./types.js').MbrDocument} doc */
export function itemsOf(doc) {
  const out = [{ key: 'head', cost: 3 }];
  if (doc.materials?.length) out.push({ key: 'mat', cost: 1.4 + doc.materials.length * 0.5 + (doc.materialsLayout === 'detailed' ? 1.1 : 0) });   // 실제 높이에 맞춤 (상세 표는 머리글 2단)
  doc.groups.forEach((g) => {
    const gid = g.groupId ?? g.title;
    out.push({ key: `g:${gid}`, cost: 1.2 });
    for (const s of g.steps ?? []) {
      const len = (s.instruction?.length ?? 0) / 90;
      out.push({ key: `s:${gid}:${s.stepId ?? s.title}`, cost: 1.7 + Math.ceil(len) * 0.35 + (s.params?.length ? 0.5 + s.params.length * 0.42 : 0) });
    }
  });
  return out;
}

/**
 * @returns {string[][]} 쪽마다 항목 키 목록 (양쪽 공통)
 */
export function planPages(left, right, pageCost = 17) {
  const L = itemsOf(left), R = itemsOf(right);
  const lpos = new Map(L.map((x, i) => [x.key, i]));
  const rset = new Set(R.map((x) => x.key));
  const cost = new Map();
  for (const x of [...L, ...R]) cost.set(x.key, Math.max(cost.get(x.key) ?? 0, x.cost));
  // 합친 순서: 오른쪽 순서를 기준으로, 왼쪽에만 있는 항목은 왼쪽에서 앞에 있던 공통 항목 바로 뒤에
  const merged = [];
  let li = 0;
  const flushLeft = (until) => {
    while (li < L.length && L[li].key !== until) { if (!rset.has(L[li].key)) merged.push(L[li].key); li++; }
    if (li < L.length && L[li].key === until) li++;
  };
  for (const x of R) {
    if (lpos.has(x.key) && lpos.get(x.key) >= li) flushLeft(x.key);
    merged.push(x.key);
  }
  flushLeft(undefined);
  // 쪽 나누기 (구간 제목이 쪽 맨 아래에 홀로 남지 않게)
  const pages = [];
  let cur = [], used = 0;
  merged.forEach((k, i) => {
    const c = cost.get(k) ?? 1;
    const need = k.startsWith('g:') ? c + (cost.get(merged[i + 1]) ?? 0) : c;
    if (cur.length && used + need > pageCost) { pages.push(cur); cur = []; used = 0; }
    cur.push(k); used += c;
  });
  if (cur.length || !pages.length) pages.push(cur);
  return pages;
}
