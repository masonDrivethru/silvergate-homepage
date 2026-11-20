/**
 * 대용량 가상 MBR 생성기. 수백 쪽짜리 실제 문서 규모를 흉내 낸다.
 * 사람이 쓴 데이터가 아니라 규칙으로 만든 가짜 데이터이며, seed가 같으면 항상 같은 문서가 나온다.
 *
 *   const { left, right } = makeLargePair({ groups: 30, stepsPerGroup: 35 })
 *   // left = v2.0, right = v2.1 (곳곳에 수정·추가·삭제가 섞임)
 *
 * 한 쪽(A4)에 스텝 3~4개가 들어간다고 보면 30 × 35 = 1,050 스텝 ≈ 300쪽.
 */

/** 작은 결정적 난수 (mulberry32) — 같은 seed면 같은 결과 */
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const AREAS = {
  ko: ['배지 준비', '접종', '세포 배양', '수확', '정밀 여과', '친화 크로마토그래피', '바이러스 불활성화', '이온교환 크로마토그래피',
    '한외여과·투석여과', '바이러스 제거 여과', '원액 조제', '충전', '육안 검사', '포장', '설비 세척', '멸균'],
  en: ['Media prep', 'Inoculation', 'Cell culture', 'Harvest', 'Clarification', 'Affinity chromatography', 'Viral inactivation',
    'Ion-exchange chromatography', 'UF/DF', 'Viral filtration', 'Bulk formulation', 'Filling', 'Visual inspection', 'Packaging',
    'Equipment cleaning', 'Sterilization'],
};
const ACTIONS = {
  ko: ['라인 점검', '자재 확인', '설비 상태 확인', '용액 투입', '온도 조정', 'pH 조정', '교반', '유지', '시료 채취', '압력 확인',
    '유량 설정', '밸브 정렬', '세척', '건조', '기록 확인', '이송'],
  en: ['Line clearance', 'Material check', 'Equipment status check', 'Solution charge', 'Temperature adjust', 'pH adjust', 'Mixing',
    'Hold', 'Sampling', 'Pressure check', 'Flow set', 'Valve line-up', 'Rinse', 'Dry', 'Record review', 'Transfer'],
};
const SENTENCES = {
  ko: ['작업 전 설비 식별표와 세척 상태표를 확인한다.', '지정된 순서대로 밸브를 열고 누수 여부를 확인한다.',
    '기준값을 벗어나면 즉시 작업을 멈추고 담당자에게 알린다.', '측정값과 측정 시각을 기록하고 확인자의 서명을 받는다.',
    '사용한 자재의 로트 번호를 바코드로 스캔한다.', '안정화될 때까지 최소 5분간 기다린 뒤 값을 읽는다.'],
  en: ['Check the equipment ID tag and clean-status label before starting.', 'Open the valves in the given order and check for leaks.',
    'If a value is out of range, stop at once and notify the supervisor.', 'Record the reading and time, and get the verifier signature.',
    'Scan the lot number of each material used.', 'Wait at least 5 minutes for the value to settle before reading.'],
};
const PARAMS = [
  { key: 'temp', ko: '온도', en: 'Temperature', unit: '°C', base: 25, span: 15, tol: 2, dp: 1 },
  { key: 'ph', ko: 'pH', en: 'pH', unit: '', base: 7, span: 1.2, tol: 0.2, dp: 2 },
  { key: 'time', ko: '시간', en: 'Time', unit: 'min', base: 30, span: 60, tol: 5, dp: 0 },
  { key: 'speed', ko: '교반 속도', en: 'Agitation', unit: 'rpm', base: 120, span: 200, tol: 10, dp: 0 },
  { key: 'pressure', ko: '압력', en: 'Pressure', unit: 'bar', base: 1, span: 2, tol: 0.2, dp: 2 },
  { key: 'flow', ko: '유량', en: 'Flow rate', unit: 'L/min', base: 5, span: 20, tol: 1, dp: 1 },
  { key: 'volume', ko: '부피', en: 'Volume', unit: 'L', base: 100, span: 900, tol: 10, dp: 0 },
  { key: 'cond', ko: '전도도', en: 'Conductivity', unit: 'mS/cm', base: 5, span: 20, tol: 1, dp: 1 },
];

const round = (n, dp) => Number(n.toFixed(dp));
const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

function makeParam(r, lang, def) {
  const v = round(def.base + r() * def.span, def.dp);
  return { key: def.key, label: def[lang], value: v.toFixed(def.dp), unit: def.unit || undefined,
    spec: { lcl: round(v - def.tol, def.dp), ucl: round(v + def.tol, def.dp) } };
}

function makeStep(r, lang, gi, si) {
  const n = 1 + Math.floor(r() * 5); // 파라미터 1~5개
  const defs = [...PARAMS].sort(() => r() - 0.5).slice(0, n);
  return {
    stepId: `${gi}.${si}`,
    title: pick(r, ACTIONS[lang]),
    instruction: `${pick(r, SENTENCES[lang])} ${pick(r, SENTENCES[lang])}`,
    params: defs.map((d) => makeParam(r, lang, d)),
  };
}

/** 원본 문서 (v2.0) */
export function makeLargeDoc({ groups = 30, stepsPerGroup = 35, seed = 101, lang = 'ko' } = {}) {
  const r = rng(seed);
  const areas = AREAS[lang];
  return {
    version: '2.0',
    productName: 'SGB-202 Bispecific Antibody',
    effectiveDate: '2026-01-10',
    groups: Array.from({ length: groups }, (_, g) => ({
      groupId: `G${g + 1}`,
      title: `${areas[g % areas.length]}${g >= areas.length ? ` ${Math.floor(g / areas.length) + 1}` : ''}`,
      steps: Array.from({ length: stepsPerGroup }, (_, s) => makeStep(r, lang, g + 1, s + 1)),
    })),
  };
}

/**
 * 원본을 복사해 변경을 흩뿌린 새 버전 (v2.1).
 * rate: 스텝 하나가 바뀔 확률 (기본 4% → 1,050 스텝이면 40건 안팎)
 */
export function mutateDoc(doc, { seed = 202, rate = 0.04, lang = 'ko' } = {}) {
  const r = rng(seed);
  const next = structuredClone(doc);
  next.version = '2.1';
  next.effectiveDate = '2026-09-01';
  for (const g of next.groups) {
    const steps = [];
    for (const s of g.steps) {
      if (r() >= rate) { steps.push(s); continue; }
      const kind = r();
      if (kind < 0.12) continue;                                    // 스텝 삭제
      if (kind < 0.5 && s.params.length) {                         // 값 수정
        const p = pick(r, s.params);
        const d = PARAMS.find((x) => x.key === p.key);
        p.value = (Number(p.value) + d.tol / 2).toFixed(d.dp);
      } else if (kind < 0.65 && s.params.length) {                  // 스펙 범위 좁힘
        const p = pick(r, s.params);
        const d = PARAMS.find((x) => x.key === p.key);
        p.spec = { lcl: round(p.spec.lcl + d.tol / 4, d.dp), ucl: round(p.spec.ucl - d.tol / 4, d.dp) };
      } else if (kind < 0.8) {                                      // 지시문 문장 교체
        s.instruction = `${s.instruction.split(/(?<=[.다]) /)[0]} ${pick(r, SENTENCES[lang])}`;
      } else {                                                      // 파라미터 추가
        const def = PARAMS.find((x) => !s.params.some((p) => p.key === x.key));
        if (def) s.params.push(makeParam(r, lang, def));
      }
      steps.push(s);
      if (r() < 0.1) steps.push({ ...makeStep(r, lang, g.groupId.slice(1), 0), stepId: `${s.stepId}a` }); // 스텝 추가
    }
    g.steps = steps;
  }
  return next;
}

export function makeLargePair(opts = {}) {
  const left = makeLargeDoc(opts);
  return { left, right: mutateDoc(left, { lang: opts.lang }) };
}
