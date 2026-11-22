/**
 * /compare 의 "복잡한 표" · "속도 측정" 탭용 샘플 (전부 지어낸 내용: 회사·설비·사람·수치 모두 가상).
 * 화면 비교 모듈은 이 HTML 이 어떻게 만들어졌는지 모른다. 그려진 화면만 읽어서 비교한다.
 */

const T = {
  en: {
    item: 'Item', spec: 'Limit', unit: 'Unit', owner: 'Owner', equip: 'Equipment', loc: 'Sample point', result: 'Result', verdict: 'Verdict',
    cond: 'Conductivity (µS/cm)', toc: 'TOC (ppb)', visual: 'Visual',
    rows: [['Conductivity', '≤ 1.3', 'µS/cm'], ['TOC', '≤ 500', 'ppb'], ['Temperature', '60 – 70', '°C'], ['Visual', 'No residue', '-']],
    names: ['J. Kim', 'S. Lee', 'J. Kim', 'H. Choi'],
    pass: 'Pass', clean: 'Clean', cleanBoth: 'Clean (plates 1 and 2 checked together)',
    wall: 'Wall', floor: 'Floor', nozzle: 'Nozzle', manway: 'Manway', inlet: 'Inlet', outlet: 'Outlet', plate: 'Plate',
    cases: [
      ['complex', 'Cleaning validation results (two header rows, merged cells, grouped by equipment)', 'Verdict column added · Manway row added to T-201 (equipment cell rowspan 3 → 4) · P-104 inlet and outlet swapped · HX-3 plate 1 TOC 320 → 410 · HX-3 visual cells merged into one.'],
      ['col', 'Column added', 'A new "Owner" column in the middle.'],
      ['colspan', 'Cells merged across (colspan)', 'The three TOC cells become one.'],
      ['rowspan', 'Cells merged down (rowspan)', 'The item cells of the conductivity and TOC rows become one.'],
      ['move', 'Rows reordered', 'Same content, rows in a different order (no IDs).'],
      ['list', 'Structure replaced (table → list)', 'The same content as a list instead of a table.'],
    ],
  },
  ko: {
    item: '항목', spec: '기준', unit: '단위', owner: '담당', equip: '설비', loc: '시료 위치', result: '측정 결과', verdict: '판정',
    cond: '전도도 (µS/cm)', toc: 'TOC (ppb)', visual: '육안',
    rows: [['전도도', '≤ 1.3', 'µS/cm'], ['TOC', '≤ 500', 'ppb'], ['온도', '60 ~ 70', '°C'], ['육안', '잔류물 없음', '-']],
    names: ['김지원', '이서연', '김지원', '최하준'],
    pass: '적합', clean: '이상 없음', cleanBoth: '이상 없음 (판 1·2 함께 확인)',
    wall: '벽면', floor: '바닥', nozzle: '노즐', manway: '맨홀', inlet: '입구', outlet: '출구', plate: '판',
    cases: [
      ['complex', '세척 검증 결과표 (머리글 2단 · 칸 병합 · 설비별 묶음)', '판정 열 추가 · T-201 에 맨홀 줄 추가 (설비 칸 rowspan 3 → 4) · P-104 입구·출구 순서 바뀜 · HX-3 판 1 TOC 320 → 410 · HX-3 육안 칸 두 개를 하나로 병합.'],
      ['col', '열 추가', '가운데에 "담당" 열이 새로 생김.'],
      ['colspan', '가로 병합 (colspan)', 'TOC 줄의 세 칸을 한 칸으로 합침.'],
      ['rowspan', '세로 병합 (rowspan)', '전도도·TOC 두 줄의 항목 칸을 한 칸으로 합침.'],
      ['move', '줄 순서만 바뀜', '내용은 그대로, 줄 순서만 바뀜 (ID 없이).'],
      ['list', '구조가 통째로 바뀜 (표 → 목록)', '같은 내용을 표 대신 목록으로.'],
    ],
  },
};

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function cell(c) {
  const o = typeof c === 'string' ? { t: c } : c;
  const tag = o.th ? 'th' : 'td';
  return `<${tag}${o.cs ? ` colspan="${o.cs}"` : ''}${o.rs ? ` rowspan="${o.rs}"` : ''}>${esc(o.t)}</${tag}>`;
}
function table(rows, head) {
  const h = head ? `<thead>${head.map((r) => `<tr>${r.map((c) => cell(typeof c === 'string' ? { t: c, th: 1 } : { th: 1, ...c })).join('')}</tr>`).join('')}</thead>` : '';
  return `<table class="mbr-params mbr-params--grid">${h}<tbody>${rows.map((r) => `<tr>${r.map(cell).join('')}</tr>`).join('')}</tbody></table>`;
}

/** 표 구조가 바뀌는 경우들: [{ id, title, desc, left, right, tall }] */
export function tableCases(lang = 'en') {
  const t = T[lang === 'ko' ? 'ko' : 'en'];
  const head = [[t.item, t.spec, t.unit]];
  const base = t.rows;
  const vh3 = [[{ t: t.equip, rs: 2 }, { t: t.loc, rs: 2 }, { t: t.result, cs: 3 }], [t.cond, t.toc, t.visual]];
  const v3 = [
    [{ t: 'T-201', rs: 3 }, t.wall, '0.8', '210', t.clean], [t.floor, '0.9', '260', t.clean], [t.nozzle, '1.1', '340', t.clean],
    [{ t: 'P-104', rs: 2 }, t.inlet, '0.7', '180', t.clean], [t.outlet, '0.9', '230', t.clean],
    [{ t: 'HX-3', rs: 2 }, `${t.plate} 1`, '1.0', '320', t.clean], [`${t.plate} 2`, '1.2', '390', t.clean],
  ];
  const vh4 = [[{ t: t.equip, rs: 2 }, { t: t.loc, rs: 2 }, { t: t.result, cs: 3 }, { t: t.verdict, rs: 2 }], [t.cond, t.toc, t.visual]];
  const v4 = [
    [{ t: 'T-201', rs: 4 }, t.wall, '0.8', '210', t.clean, t.pass], [t.floor, '0.9', '260', t.clean, t.pass], [t.nozzle, '1.1', '340', t.clean, t.pass], [t.manway, '1.0', '300', t.clean, t.pass],
    [{ t: 'P-104', rs: 2 }, t.outlet, '0.9', '230', t.clean, t.pass], [t.inlet, '0.7', '180', t.clean, t.pass],
    [{ t: 'HX-3', rs: 2 }, `${t.plate} 1`, '1.0', '410', { t: t.cleanBoth, rs: 2 }, t.pass], [`${t.plate} 2`, '1.2', '390', t.pass],
  ];
  const right = {
    complex: table(v4, vh4),
    col: table(base.map((r, i) => [r[0], t.names[i], r[1], r[2]]), [[t.item, t.owner, t.spec, t.unit]]),
    colspan: table([base[0], [{ t: `${base[1][0]} ${base[1][1]} ${base[1][2]}`, cs: 3 }], base[2], base[3]], head),
    rowspan: table([[{ t: `${base[0][0]} · ${base[1][0]}`, rs: 2 }, base[0][1], base[0][2]], [base[1][1], base[1][2]], base[2], base[3]], head),
    move: table([base[2], base[0], base[3], base[1]], head),
    list: `<ul class="lab-list">${base.map((r) => `<li>${esc(r.join(' '))}</li>`).join('')}</ul>`,
  };
  return t.cases.map(([id, title, desc]) => ({ id, title, desc, tall: id === 'complex', left: id === 'complex' ? table(v3, vh3) : table(base, head), right: right[id] }));
}

// ---------------- 속도 측정용 큰 문서 (운영 문서 양식 .mbr-page 그대로) ----------------
const S = {
  en: {
    company: 'DEMO BIOLOGICS', title: 'Equipment Cleaning Procedure', page: (n, t) => `Page ${n} of ${t}`,
    equip: ['Cleaning tank T-201', 'Transfer pump P-104', 'Heat exchanger HX-3', 'Filling nozzle N-12', 'Filter housing F-07', 'Bioreactor BR-500', 'Buffer tank BT-30', 'Freeze dryer LY-2'],
    sec: (n, eq) => `${n}. Cleaning ${eq}`,
    steps: [
      ['Pre-rinse', (eq) => `Start cleaning ${eq} within 30 minutes of use. Pre-rinse with purified water before residue dries.`],
      ['Wash', (eq, temp, min) => `Circulate alkaline detergent at ${temp} °C for ${min} minutes.`],
      ['Final rinse', () => 'Rinse with water for injection and record the conductivity and TOC of the rinse water.'],
      ['Release', () => 'If a result is out of limit, repeat the wash. Report to QA after two consecutive failures.'],
    ],
    params: ['Conductivity', 'TOC', 'Temperature'], units: ['µS/cm', 'ppb', '°C'],
    colP: 'Parameter', colT: 'Target', colR: 'Range',
    addStep: 'Record start time and operator signature.', addParam: 'Detergent concentration',
  },
  ko: {
    company: 'DEMO BIOLOGICS', title: '설비 세척 절차서', page: (n, t) => `${n} / ${t}쪽`,
    equip: ['세척 탱크 T-201', '이송 펌프 P-104', '열교환기 HX-3', '충전 노즐 N-12', '여과 하우징 F-07', '배양기 BR-500', '버퍼 탱크 BT-30', '동결건조기 LY-2'],
    sec: (n, eq) => `${n}. ${eq} 세척`,
    steps: [
      ['1차 헹굼', (eq) => `${eq}의 사용이 끝나면 30분 이내에 세척을 시작한다. 잔류물이 마르기 전에 정제수로 헹군다.`],
      ['세척', (eq, temp, min) => `알칼리 세제를 ${temp} °C 로 ${min}분간 순환한다.`],
      ['최종 헹굼', () => '주사용수로 헹구고 헹굼수의 전도도와 TOC 를 측정하여 기록한다.'],
      ['출하 판정', () => '측정값이 기준을 벗어나면 세척을 반복하고, 두 번 연속 벗어나면 품질보증팀에 보고한다.'],
    ],
    params: ['전도도', 'TOC', '온도'], units: ['µS/cm', 'ppb', '°C'],
    colP: '파라미터', colT: '설정값', colR: '허용 범위',
    addStep: '세척 시작 시각과 담당자 서명을 기록한다.', addParam: '세제 농도',
  },
};

/** 쪽 하나 (HTML). ver = 1 (이전) | 2 (새 버전). 쪽 번호에 따라 골고루 바뀜 */
function speedPage(no, total, ver, s) {
  const eq = s.equip[(no - 1) % s.equip.length];
  const temp = 60 + ((no * 7) % 25);
  const min = 15 + (no % 4) * 5;
  const steps = s.steps.map(([title, fn], k) => ({ id: `s${k}`, title, text: fn(eq, temp, min),
    params: k === 2 ? [[s.params[0], '1.0', '≤ 1.3'], [s.params[1], '300', '≤ 500']] : k === 1 ? [[s.params[2], String(temp), `${temp - 5} – ${temp + 5}`]] : [] }));
  if (ver === 2) {
    if (no % 5 === 1) steps[1].text = steps[1].text.replace(`${temp} °C`, `${temp + 5} °C`);
    if (no % 7 === 2) steps[1].params.push([s.addParam, '1.2', '1.0 – 1.5']);
    if (no % 9 === 3) steps.splice(3, 1);
    if (no % 11 === 4) steps.splice(1, 0, { id: 'sx', title: s.steps[0][0], text: s.addStep, params: [] });
    if (no % 13 === 5) steps.find((x) => x.id === 's2').params[1] = [s.params[1], '250', '≤ 300'];
  }
  const p = (row) => `<tr data-sgc-key="${esc(row[0])}"><td>${esc(row[0])}</td><td>${esc(row[1])}</td><td>${esc(row[2])}</td></tr>`;
  return `<article class="mbr-page"><div class="mbr-brand" data-sgc-ignore><span>${s.company}</span><b>${esc(s.title)}</b><span>${s.page(no, total)}</span></div>`
    + `<h3 class="mbr-sec" data-sgc-key="h${no}">${esc(s.sec(no, eq))}</h3>`
    + steps.map((st, k) => `<section class="mbr-step" data-sgc-key="${no}-${st.id}"><div class="mbr-step__top"><span class="mbr-no">${no}.${k + 1}</span><p class="mbr-title">${esc(st.title)}</p></div>`
      + `<p class="mbr-ins">${esc(st.text)}</p>`
      + (st.params.length ? `<table class="mbr-params"><thead><tr><th>${s.colP}</th><th>${s.colT}</th><th>${s.colR}</th></tr></thead><tbody>${st.params.map(p).join('')}</tbody></table>` : '')
      + '</section>').join('')
    + '</article>';
}

/** 쪽 수만큼 만든 문서 (HTML 문자열) */
export function speedDoc(ver, pages, lang = 'en') {
  const s = S[lang === 'ko' ? 'ko' : 'en'];
  const out = new Array(pages);
  for (let i = 0; i < pages; i++) out[i] = speedPage(i + 1, pages, ver, s);
  return `<div class="mbr">${out.join('')}</div>`;
}
