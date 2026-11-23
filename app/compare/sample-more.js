/**
 * 가상 MBR 샘플 버전 추가 (v1.2, v2.0) + 원자재 표. 제품·공정·수치·공급사는 전부 지어낸 것이다.
 *
 * v1.1 → v1.2
 *   수정  1.3 지시문, 1.4 생존율 기준 ≥ 90 → ≥ 92 %, 2.2 최대 차압 1.5 → 1.4 bar
 *   이동  3.2 와 3.3 순서 바뀜
 *   원자재  소포제 줄 추가, 배지 수량 450 → 460 L
 * v1.2 → v2.0 (표 구조가 크게 바뀜)
 *   원자재 표: 열 3개 → 머리글 2단(수량: 목표/하한/상한) + 공정 단계별 묶음(rowspan) + 공급사 열, 한 줄 삭제
 *   파라미터 표: CPP(핵심 공정 변수) 열 추가
 *   구간: "정밀 여과" 구간 새로 생김 (2.2 가 이 구간으로 옮겨감), 3.3 삭제, 3.4 바이러스 여과 추가
 * v2.0 → v2.1 (이미 복잡한 표가 또 바뀜)
 *   원자재 표: "등급" 열 추가, "배지 조제" 단계를 새로 나눔(세로 묶음 다시 짬), 수산화나트륨 수량 세 칸 → "필요량" 한 칸(가로 병합),
 *             정제 단계 두 줄 순서 바뀜, 소포제 수량 0.5 → 0.6, 레진 공급사 바뀜
 *   파라미터 표: 1.2 에 "기록 주기" 줄 추가(설정값·허용 범위 칸 합침), 3.1 부하량 CPP 해제
 */
import { getSamples } from './sample-data.js';

const clone = (o) => JSON.parse(JSON.stringify(o));

const TEXT = {
  en: {
    media: 'Basal media', glucose: 'Glucose feed', antifoam: 'Antifoam C', buffer: 'Phosphate buffer', resin: 'Protein A resin', naoh: 'Sodium hydroxide 1 M',
    culture: 'Cell Culture', harvest: 'Harvest', purif: 'Purification', clar: 'Clarification',
    ph13: 'Keep the pH within range with CO2 sparging and base addition. Record the reading every hour.',
    vf: 'Virus filtration', vfIns: 'Pass the neutralized pool through the virus filter at constant pressure and check filter integrity after use.',
    pressure: 'Filter pressure', integrity: 'Integrity test', pass: 'Pass',
    supplierA: 'Fictional Supplier A', supplierB: 'Fictional Supplier B', supplierC: 'Fictional Supplier C',
    prep: 'Media Preparation', asNeeded: 'As needed (pH adjustment)', interval: 'Recording interval', everyHour: 'Every hour (automatic log)',
    gradeCompendial: 'Compendial', gradeCell: 'Cell culture', gradeChrom: 'Chromatography',
  },
  ko: {
    media: '기본 배지', glucose: '포도당 공급액', antifoam: '소포제 C', buffer: '인산 완충액', resin: 'Protein A 레진', naoh: '수산화나트륨 1 M',
    culture: '세포 배양', harvest: '회수', purif: '정제', clar: '정밀 여과',
    ph13: 'CO2 주입과 염기 투입으로 pH를 범위 안에 유지하고, 1시간마다 측정값을 기록한다.',
    vf: '바이러스 여과', vfIns: '중화된 용액을 일정 압력으로 바이러스 필터에 통과시키고, 사용 후 필터 무결성을 확인한다.',
    pressure: '여과 압력', integrity: '무결성 시험', pass: '적합',
    supplierA: '가상 공급사 A', supplierB: '가상 공급사 B', supplierC: '가상 공급사 C',
    prep: '배지 조제', asNeeded: '필요량 (pH 조정용)', interval: '기록 주기', everyHour: '1시간마다 (자동 기록)',
    gradeCompendial: '약전 등급', gradeCell: '세포 배양용', gradeChrom: '크로마토그래피용',
  },
};

/** 원자재 줄: 공정 단계 · 이름 · 수량(목표/하한/상한) · 단위 · 공급사 */
function materials(t, ver) {
  const rows = [
    { phase: t.culture, name: t.media, qty: ver >= 1.2 ? '460' : '450', min: '440', max: '480', unit: 'L', supplier: t.supplierA },
    { phase: t.culture, name: t.glucose, qty: '12', min: '10', max: '14', unit: 'kg', supplier: t.supplierB },
    ...(ver >= 1.2 ? [{ phase: t.culture, name: t.antifoam, qty: '0.5', min: '0.4', max: '0.6', unit: 'L', supplier: t.supplierB }] : []),
    { phase: t.harvest, name: t.buffer, qty: '200', min: '190', max: '210', unit: 'L', supplier: t.supplierC },
    { phase: t.purif, name: t.resin, qty: '35', min: '33', max: '37', unit: 'L', supplier: t.supplierA },
    { phase: t.purif, name: t.naoh, qty: '20', min: '18', max: '22', unit: 'L', supplier: t.supplierC },
  ];
  // v2.0: 인산 완충액 줄 삭제
  const out = ver >= 2 ? rows.filter((r) => r.name !== t.buffer) : rows;
  if (ver < 2.1) return out;
  // v2.1: 배지 조제 단계 분리 · 등급 열 · 수량 칸 병합 · 정제 두 줄 순서 · 값 수정
  const by = (n) => out.find((r) => r.name === n);
  by(t.media).phase = t.prep;
  by(t.antifoam).qty = '0.6';
  by(t.resin).supplier = t.supplierB;
  const naoh = by(t.naoh);
  naoh.qtyNote = t.asNeeded;
  const grade = { [t.media]: t.gradeCell, [t.glucose]: t.gradeCompendial, [t.antifoam]: t.gradeCompendial, [t.resin]: t.gradeChrom, [t.naoh]: t.gradeCompendial };
  for (const r of out) r.grade = grade[r.name];
  return [by(t.media), by(t.glucose), by(t.antifoam), naoh, by(t.resin)];
}

/** 언어별 전체 샘플: 버전 → 문서 */
export function getAllSamples(locale) {
  const lang = locale === 'ko' ? 'ko' : 'en';
  const t = TEXT[lang];
  const base = getSamples(lang);
  const v10 = { ...clone(base['1.0']), materials: materials(t, 1.0), materialsLayout: 'simple' };
  const v11 = { ...clone(base['1.1']), materials: materials(t, 1.1), materialsLayout: 'simple' };

  // v1.2
  const v12 = clone(v11);
  v12.version = '1.2';
  v12.effectiveDate = '2026-09-01';
  v12.materials = materials(t, 1.2);
  const g = (d, id) => d.groups.find((x) => x.groupId === id);
  const st = (d, gid, sid) => g(d, gid).steps.find((x) => x.stepId === sid);
  st(v12, 'G1', '1.3').instruction = t.ph13;
  const via = st(v12, 'G1', '1.4').params?.[0];
  if (via) via.value = via.value.replace('90', '92');
  const pr = st(v12, 'G2', '2.2').params?.[0];
  if (pr) pr.value = '1.4';
  const g3 = g(v12, 'G3');
  const i32 = g3.steps.findIndex((x) => x.stepId === '3.2'), i33 = g3.steps.findIndex((x) => x.stepId === '3.3');
  [g3.steps[i32], g3.steps[i33]] = [g3.steps[i33], g3.steps[i32]];

  // v2.0: 표 구조 변경
  const v20 = clone(v12);
  v20.version = '2.0';
  v20.effectiveDate = '2027-01-15';
  v20.materials = materials(t, 2);
  v20.materialsLayout = 'detailed';
  v20.paramCpp = true;
  for (const grp of v20.groups) for (const s of grp.steps ?? []) for (const p of s.params ?? []) {
    p.cpp = ['temperature', 'ph', 'load', 'hold', 'pressure'].includes(p.key);
  }
  // 정밀 여과 구간 신설: 2.2 를 옮김
  const g2 = g(v20, 'G2');
  const moved = g2.steps.splice(g2.steps.findIndex((x) => x.stepId === '2.2'), 1)[0];
  v20.groups.splice(2, 0, { groupId: 'G2B', title: t.clar, steps: [moved] });
  // 3.3 삭제, 3.4 추가
  const g3b = g(v20, 'G3');
  g3b.steps = g3b.steps.filter((x) => x.stepId !== '3.3');
  g3b.steps.push({
    stepId: '3.4', title: t.vf, instruction: t.vfIns,
    params: [
      { key: 'vfPressure', label: t.pressure, value: '2.0', unit: 'bar', spec: { ucl: 2.2 }, cpp: true },
      { key: 'integrity', label: t.integrity, value: t.pass, cpp: false },
    ],
  });
  // v2.1: 이미 복잡한 표가 또 바뀜
  const v21 = clone(v20);
  v21.version = '2.1';
  v21.effectiveDate = '2027-04-01';
  v21.materials = materials(t, 2.1);
  v21.materialsGrade = true;
  const s12 = st(v21, 'G1', '1.2');
  if (s12?.params) s12.params.push({ key: 'interval', label: t.interval, note: t.everyHour, cpp: false });
  for (const grp of v21.groups) for (const s of grp.steps ?? []) for (const p of s.params ?? []) if (p.key === 'load') p.cpp = false;

  // 서명표·개정 사유 (사람·날짜 모두 가상)
  const people = lang === 'ko' ? ['김지원', '이서연', '박도윤'] : ['J. Kim', 'S. Lee', 'D. Park'];
  const sign = (d1, d2, d3) => [people[0], d1, people[1], d2, people[2], d3];
  const reasons = lang === 'ko'
    ? { '1.0': '최초 제정', '1.1': '배양 온도 변경, 중간 샘플링 추가', '1.2': '기준값 조정, 단계 순서 변경', '2.0': '원자재 표·파라미터 표 개편, 정밀 여과 구간 신설', '2.1': '원자재 등급 열 추가, 배지 조제 단계 분리, 기록 주기 추가' }
    : { '1.0': 'Initial issue', '1.1': 'Culture temperature change, in-process sampling added', '1.2': 'Limits adjusted, step order changed', '2.0': 'Material and parameter tables restructured, clarification section added', '2.1': 'Material grade column added, media preparation split out, recording interval added' };
  // 문서 관리 시스템의 상태 (가상): 1.0·1.1·1.2 대체됨, 2.0 시행, 2.1 검토 중
  v10.status = 'superseded'; v11.status = 'superseded'; v12.status = 'superseded'; v20.status = 'effective'; v21.status = 'review';
  v10.signatures = sign('2026-02-10', '2026-02-18', '2026-02-24'); v10.reason = reasons['1.0'];
  v11.signatures = sign('2026-05-20', '2026-06-02', '2026-06-09'); v11.reason = reasons['1.1'];
  v12.signatures = sign('2026-08-11', '2026-08-19', '2026-08-26'); v12.reason = reasons['1.2'];
  v20.signatures = sign('2026-12-14', '2026-12-22', '2027-01-08'); v20.reason = reasons['2.0'];
  v21.signatures = sign('2027-03-08', '2027-03-16', '2027-03-24'); v21.reason = reasons['2.1'];
  return { '1.0': v10, '1.1': v11, '1.2': v12, '2.0': v20, '2.1': v21 };
}
