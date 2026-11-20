// 콘솔 확인용: node app/compare/check.mjs
import { compare } from './engine.js';
import { mbrV10, mbrV11 } from './sample-data.js';

const byStep = compare(mbrV10, mbrV11);
const byParam = compare(mbrV10, mbrV11, { countBy: 'param' });
const same = compare(mbrV10, mbrV10);

console.log('== 집계 (countBy: step) ==', byStep.stats);
console.log('== 집계 (countBy: param) ==', byParam.stats);
console.log('== 같은 문서끼리 ==', same.stats, `changes: ${same.changes.length}`);
console.log('\n== 변경 목록 ==');
for (const c of byStep.changes) {
  const where = [c.groupId, c.stepId, c.paramKey].filter(Boolean).join(' / ');
  console.log(`[${c.type.padEnd(8)}] ${c.level.padEnd(5)} ${where.padEnd(22)} ${c.label}${c.field ? `  (${c.field})` : ''}`);
  if (c.left !== null || c.right !== null) console.log(`           ${c.left ?? '∅'}  →  ${c.right ?? '∅'}`);
  if (c.diffs) console.log('           diffs:', JSON.stringify(c.diffs));
  console.log(`           #${c.anchorId}`);
}
console.log('\n== 롤업 ==');
console.log('groupFlags', byStep.groupFlags);
console.log('stepFlags ', byStep.stepFlags);
console.log('\n== 좌우 정렬 순서 ==');
for (const g of byStep.aligned) {
  console.log(`${g.key} ${g.status ?? ''}`);
  for (const s of g.steps) {
    console.log(`   ${s.key.padEnd(4)} L:${s.left ? 'O' : '-'} R:${s.right ? 'O' : '-'} ${s.status ?? ''}`);
  }
}
console.log('\n== 전체 ChangeSet 1건 예시 (배양 온도) ==');
console.log(JSON.stringify(byStep.changes.find((c) => c.paramKey === 'temperature'), null, 2));
