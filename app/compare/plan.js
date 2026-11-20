/**
 * 두 버전을 같은 쪽 나누기로 그리기 위한 계획.
 * 양쪽 항목(표지·원자재·구간·단계)을 ID로 합친 순서를 만들고, 그 순서로 쪽을 나눈다.
 * → 같은 쪽 번호에 같은 항목이 있어, 화면 비교 모듈이 넣는 빈 칸(추가·삭제)과 함께 좌우 높이가 늘 맞는다.
 *   (각자 쪽을 나누면 앞에 단계가 하나 추가될 때 뒤쪽 쪽 경계가 전부 어긋난다)
 */

/** @param {import('./types.js').MbrDocument} doc */
export function itemsOf(doc) {
  // 높이 (px, 문서 글자 16px 기준, 실제 잰 값 + 여유). 머리말·표 머리·꼬리말(약 240px)은 쪽마다 따로라 빼고, 쪽 본문 약 790px
  const out = [];
  const perLine = (text) => (/[\uac00-\ud7a3]/.test(text ?? '') ? 36 : 66);   // 한 줄에 들어가는 글자 수 (한글 / 영문)
  if (doc.materials?.length) out.push({ key: 'mat', cost: 75 + doc.materials.length * 33 + (doc.materialsLayout === 'detailed' ? 32 : 0) });
  doc.groups.forEach((g) => {
    const gid = g.groupId ?? g.title;
    out.push({ key: `g:${gid}`, cost: 48 });
    for (const s of g.steps ?? []) {
      const lines = Math.max(1, Math.ceil((s.instruction?.length ?? 0) / perLine(s.instruction)));
      out.push({ key: `s:${gid}:${s.stepId ?? s.title}`, cost: 100 + (lines - 1) * 24 + (s.params?.length ?? 0) * 33 });
    }
  });
  return out;
}

/**
 * @returns {string[][]} 쪽마다 항목 키 목록 (양쪽 공통)
 */
export function planPages(left, right, pageCost = 740) {
  const L = itemsOf(left), R = itemsOf(right);
  const lpos = new Map(L.map((x, i) => [x.key, i]));
  const rset = new Set(R.map((x) => x.key));
  const cost = new Map(), fresh = new Set();
  for (const x of [...L, ...R]) { cost.set(x.key, Math.max(cost.get(x.key) ?? 0, x.cost)); if (x.newPage) fresh.add(x.key); }
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
    if (cur.length && (used + need > pageCost || fresh.has(k))) { pages.push(cur); cur = []; used = 0; }
    cur.push(k); used += c;
  });
  if (cur.length || !pages.length) pages.push(cur);
  return pages;
}
