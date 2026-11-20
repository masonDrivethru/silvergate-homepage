# @silvergate/compare-core

어떤 모양의 JSON 이든 두 버전을 비교하는 엔진 (DOM·프레임워크 무관, Node·브라우저·Worker 어디서나).
화면 비교는 이 엔진을 쓰는 `@silvergate/compare-dom` 을 쓰세요. 데이터끼리 직접 비교할 때 이 패키지를 씁니다.

```js
import { compare } from '@silvergate/compare-core';
const r = compare(v1, v2, {
  keys: { groups: 'groupId', 'groups.*.steps': 'stepId' },   // 배열 항목 짝 맞출 키 (없으면 id/key/uuid/code 자동)
  ignore: ['**.updatedAt'],
  labels: { 'groups.*.steps.*.instruction': '지시문' },
  countBy: 'groups.*.steps.*',
});
r.stats; r.changes; r.statusOf(obj, 'field'); r.merged;
```

규칙: `keys`, `ignore`, `titles`, `labels`, `equals`, `similar`(키 없는 배열에서 비슷한 것끼리 짝), `identity`(같으면 건너뛸 해시), `countBy`, `numeric`, `whitespace`, `detectMoves`, `raw`. 타입은 `src/types.d.ts`.

**주의:** 배열 항목을 정확히 짝지으려면 데이터에 바뀌지 않는 ID 가 있어야 합니다. 없으면 똑같은 항목을 기준점으로 잡고 그 사이를 자리끼리(또는 `similar` 로 비슷한 것끼리) 짝짓습니다.

테스트: `npm test` (21개)
