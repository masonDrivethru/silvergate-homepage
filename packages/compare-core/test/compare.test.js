import { test } from 'node:test';
import assert from 'node:assert/strict';
import { compare } from '../src/index.js';

const types = (r) => r.changes.map((c) => `${c.type}:${c.path}`);

test('같은 문서면 변경 없음', () => {
  const doc = { a: 1, list: [{ id: 'x', v: 'hello' }] };
  const r = compare(doc, structuredClone(doc));
  assert.deepEqual(r.stats, { added: 0, modified: 0, deleted: 0, moved: 0 });
  assert.equal(r.changes.length, 0);
});

test('값 수정·필드 추가·필드 삭제', () => {
  const r = compare({ a: 1, b: 'x', gone: true }, { a: 2, b: 'x', fresh: 'y' });
  assert.deepEqual(types(r), ['modified:a', 'added:fresh', 'deleted:gone']);
  assert.deepEqual(r.changes[0].diffs, [[-1, '1'], [1, '2']]);
});

test('배열은 id 를 자동으로 찾아 키로 짝을 맞춤 (가운데 끼워 넣어도 뒤가 밀리지 않음)', () => {
  const L = { items: [{ id: 'a', t: '1' }, { id: 'b', t: '2' }, { id: 'c', t: '3' }] };
  const R = { items: [{ id: 'a', t: '1' }, { id: 'n', t: 'new' }, { id: 'b', t: '2' }, { id: 'c', t: '3!' }] };
  const r = compare(L, R);
  assert.deepEqual(types(r), ['added:items[n]', 'modified:items[c].t']);
});

test('키 규칙: 패턴별 필드, 여러 단계', () => {
  const L = { groups: [{ gid: 'G1', steps: [{ sid: '1', p: 1 }, { sid: '2', p: 2 }] }] };
  const R = { groups: [{ gid: 'G1', steps: [{ sid: '2', p: 2 }, { sid: '3', p: 3 }] }] };
  const r = compare(L, R, { keys: { groups: 'gid', 'groups.*.steps': 'sid' } });
  assert.deepEqual(types(r), ['deleted:groups[G1].steps[1]', 'added:groups[G1].steps[3]']);
});

test('순서만 바뀐 항목은 moved', () => {
  const L = { s: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }] };
  const R = { s: [{ id: 'a' }, { id: 'c' }, { id: 'd' }, { id: 'b' }] };
  const r = compare(L, R);
  assert.deepEqual(types(r), ['moved:s[b]']);
  assert.equal(r.stats.moved, 1);
  assert.equal(compare(L, R, { detectMoves: false }).changes.length, 0);
});

test('키 없는 배열: 같은 항목은 기준점, 사이에 낀 것은 자리끼리 수정', () => {
  const r = compare({ tags: ['A', 'B', 'C', 'D'] }, { tags: ['A', 'X', 'C', 'D', 'E'] });
  assert.deepEqual(types(r), ['modified:tags[#1]', 'added:tags[#4]']);
  const r2 = compare({ tags: ['A', 'B', 'C'] }, { tags: ['A', 'C'] });
  assert.deepEqual(types(r2), ['deleted:tags[#~1]']);
});

test('키 없는 객체 배열 + 무시 필드는 같음 판정에서도 빠짐', () => {
  const L = { rows: [{ v: 1, at: 't1' }, { v: 2, at: 't1' }] };
  const R = { rows: [{ v: 1, at: 't2' }, { v: 2, at: 't2' }, { v: 3, at: 't2' }] };
  const r = compare(L, R, { ignore: ['**.at'] });
  assert.deepEqual(types(r), ['added:rows[#2]']);
});

test('ignore, numeric, whitespace, equals', () => {
  const L = { meta: { updatedAt: '1' }, n: '36.0', s: ' a  b ', amt: '1,000' };
  const R = { meta: { updatedAt: '2' }, n: 36, s: 'a b', amt: '1000' };
  assert.equal(compare(L, R).changes.length, 4);
  const r = compare(L, R, { ignore: 'meta.updatedAt', numeric: true, whitespace: true, equals: { amt: (a, b) => String(a).replace(/,/g, '') === String(b) } });
  assert.equal(r.changes.length, 0);
});

test('롤업: 조상은 child, 추가된 덩어리 안쪽은 모두 added', () => {
  const L = { g: [{ id: 'G', s: [{ id: 'S', v: 1 }] }] };
  const R = { g: [{ id: 'G', s: [{ id: 'S', v: 2 }, { id: 'T', sub: { x: 1 } }] }] };
  const r = compare(L, R);
  assert.equal(r.statusOf('g[G]'), 'child');
  assert.equal(r.statusOf('g[G].s[S].v'), 'modified');
  assert.equal(r.statusOf('g[G].s[T].sub.x'), 'added');
  assert.equal(r.statusOf('g[G].s[S].id'), null);
});

test('pathOf / statusOf: 원본 객체만 넘겨도 위치를 찾음 (left·right·merged 모두)', () => {
  const L = { list: [{ id: 'a', v: 1 }, { id: 'b', v: 1 }] };
  const R = { list: [{ id: 'a', v: 2 }] };
  const r = compare(L, R);
  assert.equal(r.pathOf(R.list[0]), 'list[a]');
  assert.equal(r.pathOf(R.list[0], 'v'), 'list[a].v');
  assert.equal(r.statusOf(R.list[0], 'v'), 'modified');
  assert.equal(r.statusOf(L.list[1]), 'deleted');
  assert.equal(r.statusOf(r.merged.list[1]), 'deleted');
  assert.equal(r.merged.list.length, 2);
  assert.equal(r.merged.list[0].v, 2);
});

test('countBy: 스텝 단위로 묶어 세기', () => {
  const L = { steps: [{ id: '1', a: 1, b: 1 }, { id: '2', a: 1 }] };
  const R = { steps: [{ id: '1', a: 2, b: 2 }, { id: '3', a: 1 }] };
  assert.deepEqual(compare(L, R).stats, { added: 1, modified: 2, deleted: 1, moved: 0 });
  assert.deepEqual(compare(L, R, { countBy: 'steps.*' }).stats, { added: 1, modified: 1, deleted: 1, moved: 0 });
});

test('제목·이름 규칙이 변경 목록에 쓰임', () => {
  const L = { sec: [{ id: 'S1', heading: '목적', items: [{ no: '1', text: '가' }] }] };
  const R = { sec: [{ id: 'S1', heading: '목적', items: [{ no: '1', text: '나' }] }] };
  const r = compare(L, R, { keys: { 'sec.*.items': 'no' }, titles: { 'sec.*.items.*': (it) => `항목 ${it.no}` }, labels: { 'sec.*.items.*.text': '내용' } });
  assert.deepEqual(r.changes[0].crumbs, ['목적', '항목 1']);
  assert.equal(r.changes[0].label, '내용');
});

test('모양이 바뀜(값 ↔ 객체), null, 최상위 배열', () => {
  const r = compare({ a: 'x', b: null }, { a: { y: 1 }, b: 0 });
  assert.deepEqual(types(r), ['modified:a', 'modified:b']);
  assert.equal(r.changes[0].kind, 'node');
  const top = compare([{ id: 1 }, { id: 2 }], [{ id: 2 }, { id: 3 }]);
  assert.deepEqual(types(top), ['deleted:[1]', 'added:[3]']);
});

test('id 에 [ ] 가 있어도 경로가 깨지지 않음', () => {
  const r = compare({ l: [{ id: 'a[1]', v: 1 }] }, { l: [{ id: 'a[1]', v: 2 }] });
  assert.equal(r.changes[0].path, 'l[a\\[1\\]].v');
});

test('큰 문서도 빠름 (스텝 2,000개)', () => {
  const mk = (n, bump) => ({ g: Array.from({ length: 40 }, (_, gi) => ({ id: `G${gi}`, s: Array.from({ length: n }, (_, si) => ({ id: `${gi}.${si}`, text: `step ${si} text body`, p: [{ key: 't', v: (si + bump * (si % 17 === 0 ? 1 : 0)).toString() }] })) })) });
  const t = performance.now();
  const r = compare(mk(50, 0), mk(50, 1));
  const ms = performance.now() - t;
  assert.ok(r.changes.length > 0);
  assert.ok(ms < 500, `took ${ms}ms`);
});

test('pathOf(배열, 순번): 문자열 배열 항목도 위치를 찾음 (left·right·merged 각각의 순번)', () => {
  const L = { tags: ['A', 'B', 'C'] };
  const R = { tags: ['A', 'C', 'D'] };
  const r = compare(L, R);
  assert.equal(r.statusOf(L.tags, 1), 'deleted');
  assert.equal(r.statusOf(R.tags, 2), 'added');
  assert.equal(r.statusOf(R.tags, 0), null);
  assert.equal(r.pathOf(R.tags, 1), r.pathOf(L.tags, 2));
  const mi = r.merged.tags.indexOf('B');
  assert.equal(r.statusOf(r.merged.tags, mi), 'deleted');
  assert.equal(r.pathOf(R.tags, 9), null);
  // 키 있는 배열·추가된 덩어리 안쪽 배열도
  const r2 = compare({ s: [] }, { s: [{ id: 'x', refs: ['a', 'b'] }] });
  assert.equal(r2.statusOf(r2.merged.s[0].refs, 1), 'added');
});

test('similar: 문단 추가 + 옆 문단 수정을 구분 (자리끼리 짝이면 엉뚱하게 수정으로 나옴)', () => {
  const L = { p: ['첫째 문단입니다.', '둘째 문단은 원래 이렇습니다.', '끝'] };
  const R = { p: ['첫째 문단입니다.', '완전히 새로 들어간 안내 문구', '둘째 문단은 이렇게 바뀌었습니다.', '끝'] };
  const sim = (a, b) => { const A = new Set(a), B = new Set(b); let n = 0; for (const c of A) if (B.has(c)) n++; return n / Math.max(A.size, B.size); };
  const r = compare(L, R, { similar: { 'p.*': sim } });
  assert.deepEqual(r.changes.map((c) => c.type), ['added', 'modified']);
  assert.equal(r.changes[1].left, '둘째 문단은 원래 이렇습니다.');
  assert.deepEqual(compare(L, R).changes.map((c) => c.type), ['modified', 'added']); // 규칙 없으면 자리끼리
});

test('키 함수가 일부 항목에 null 이면 그 배열은 키 없이 비교', () => {
  const keyOf = (x) => x.k ?? null;
  const r = compare({ a: [{ k: 'x', v: 1 }, { v: 2 }] }, { a: [{ k: 'x', v: 1 }, { v: 3 }] }, { keys: { a: keyOf } });
  assert.deepEqual(types(r), ['modified:a[#1].v']);
});

test('identity: 같은 해시면 안쪽을 건너뜀 + raw: 양쪽 실제 위치', () => {
  const L = { c: [{ h: 'a', v: 'x' }, { h: 'b', v: 'y' }, { h: 'c', v: 'z' }] };
  const R = { c: [{ h: 'a', v: 'DIFFERENT-but-same-hash' }, { h: 'q', v: 'new' }, { h: 'c2', v: 'zz' }] };
  const r = compare(L, R, { identity: { '**': (n) => n?.h }, ignore: '**.h', raw: true, similar: { 'c.*': () => 0 } });
  // a 는 해시가 같아서 건너뜀, b 삭제 · q 추가 (비슷하지 않음), c → c2 도 삭제·추가
  assert.deepEqual(r.changes.map((c) => c.type), ['deleted', 'deleted', 'added', 'added']);
  const del = r.changes.find((c) => c.type === 'deleted' && c.left.v === 'y');
  assert.deepEqual(del.at.left, ['c', 1]);
  assert.equal(del.at.right, null);
  assert.deepEqual(del.at.gap, { side: 'right', parent: ['c'], index: 1 });
  const add = r.changes.find((c) => c.type === 'added' && c.right.v === 'new');
  assert.deepEqual(add.at.right, ['c', 1]);
  assert.deepEqual(add.at.gap, { side: 'left', parent: ['c'], index: 3 });
  const r2 = compare({ s: 'abc', n: { t: 'x' } }, { s: 'abd', n: { t: 'y' } }, { raw: true });
  assert.deepEqual(r2.changes.map((c) => c.at), [{ left: ['s'], right: ['s'] }, { left: ['n', 't'], right: ['n', 't'] }]);
});

test('아주 긴 키 없는 배열(5만 개)도 흩어진 변경을 정확히 짝지음 (Myers)', async () => {
  const { alignSequences } = await import('../src/index.js');
  const L = Array.from({ length: 50000 }, (_, i) => `p${i}`);
  const R = L.slice();
  R[100] = 'X'; R.splice(20000, 0, 'NEW'); R.splice(40000, 1);
  const t = performance.now();
  const r = compare({ c: L }, { c: R });
  const ms = performance.now() - t;
  assert.deepEqual(r.changes.map((c) => c.type), ['modified', 'added', 'deleted']);
  assert.ok(ms < 1500, `took ${ms}ms`);
  const pairs = alignSequences(L, R);
  assert.equal(pairs.length, 49998);
});

test('similar: 0.7 처럼 소수점이 딱 떨어지지 않는 점수도 같은 것끼리 짝지음 (정밀도 회귀)', () => {
  const L = { c: [{ t: 'a1' }, { t: 'b1' }, { t: 'c1' }] };
  const R = { c: [{ t: 'a2' }, { t: 'b2' }, { t: 'c2' }] };
  const r = compare(L, R, { similar: { 'c.*': (a, b) => (a.t[0] === b.t[0] ? 0.7 : 0.1) } });
  assert.deepEqual(r.changes.map((c) => `${c.type}:${c.path}`), ['modified:c[#0].t', 'modified:c[#1].t', 'modified:c[#2].t']);
});
