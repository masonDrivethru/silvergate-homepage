/**
 * 변경 목록 등에 짧게 보여 줄 값 글자. 객체·배열은 줄여서.
 * @param {*} v
 * @param {number} [max=60]
 */
export function formatValue(v, max = 60) {
  if (v === undefined) return '';
  if (v === null) return 'null';
  let s;
  if (typeof v === 'object') {
    s = Array.isArray(v) ? `[${v.length}]` : JSON.stringify(v);
  } else {
    s = String(v);
  }
  return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
