/**
 * 글자 단위 비교 (diff-match-patch). 결과: [op, text][]   op: -1 삭제, 0 같음, 1 추가
 */
import DiffMatchPatch from 'diff-match-patch';

const dmp = new DiffMatchPatch();

/**
 * @param {string} a 이전
 * @param {string} b 새 값
 * @param {number} [longMin=20] 이 길이 이상이면 사람이 읽기 좋게 단어 단위로 정리
 * @returns {Array<[-1|0|1, string]>}
 */
export function textDiff(a, b, longMin = 20) {
  const d = dmp.diff_main(String(a), String(b));
  if (Math.max(String(a).length, String(b).length) >= longMin) dmp.diff_cleanupSemantic(d);
  else dmp.diff_cleanupEfficiency(d);
  return d.map(([op, t]) => [op, t]);
}
