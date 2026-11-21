/*
 * 테스트용 가상 문서 (전부 지어낸 내용: 회사·설비·사람·수치 모두 가상)
 * "설비 세척 SOP" v3 → v4. 쪽 수를 정하면 그만큼 만든다 (수천 쪽 성능 시험용).
 * 같은 데이터를 일반 HTML(JSP 방식) · Vue 3 · React 세 가지로 그린다. 마크업은 셋 다 같다.
 */
(function (global) {
  'use strict';

  var EQUIP = ['세척 탱크 T-201', '이송 펌프 P-104', '열교환기 HX-3', '충전 노즐 N-12', '여과 하우징 F-07', '배양기 BR-500', '버퍼 탱크 BT-30', '동결건조기 LY-2'];
  var AGENT = ['알칼리 세제 CIP-A(가상)', '산성 세제 CIP-B(가상)', '정제수(PW)', '주사용수(WFI)'];

  /** 쪽 하나의 내용. ver = 3 | 4 */
  function page(no, total, ver) {
    var eq = EQUIP[(no - 1) % EQUIP.length];
    var temp = 60 + ((no * 7) % 25);
    var p = {
      no: no, total: total,
      title: no + '. ' + eq + ' 세척 절차',
      paras: [
        eq + '의 사용이 끝나면 30분 이내에 세척을 시작한다. 잔류물이 마르기 전에 ' + AGENT[2] + '로 1차 헹굼을 한다.',
        '세척액은 ' + AGENT[no % 2] + '를 사용하며 온도는 ' + temp + ' °C, 순환 시간은 ' + (15 + (no % 4) * 5) + '분으로 한다.',
        '세척이 끝나면 ' + AGENT[3] + '로 최종 헹굼을 하고, 헹굼수의 전도도와 TOC를 측정하여 기록지에 남긴다.',
        '측정값이 기준을 벗어나면 세척을 반복하고, 두 번 연속 벗어나면 품질보증팀에 이탈 보고를 한다.',
      ],
      rows: [
        ['헹굼수 전도도', '≤ 1.3', 'µS/cm'],
        ['TOC', '≤ 500', 'ppb'],
        ['세척액 온도', (temp - 5) + ' ~ ' + (temp + 5), '°C'],
        ['육안 검사', '잔류물 없음', '-'],
      ],
      checks: ['세척 전 설비 상태 표지 확인', '세척액 농도 확인 (적정)', '배수 밸브 열림 확인', '세척 후 "세척 완료" 표지 부착'],
      note: null,
    };
    if (ver === 4) {
      // v4 에서 바뀐 것들 (쪽 번호에 따라 골고루)
      if (no % 5 === 1) p.paras[1] = p.paras[1].replace(temp + ' °C', (temp + 5) + ' °C').replace('순환 시간은', '순환 시간은 최소');
      if (no % 7 === 2) p.rows.splice(2, 0, ['세척액 농도', '1.0 ~ 1.5', '%']);
      if (no % 9 === 3) p.paras.splice(3, 1);
      if (no % 11 === 4) p.checks.splice(2, 0, '세척 시작 시각과 담당자 서명 기록');
      if (no % 13 === 5) p.rows[1] = ['TOC', '≤ 300', 'ppb'];
      if (no % 6 === 0) p.paras[0] = p.paras[0].replace('30분 이내에', '1시간 이내에');
      if (no % 17 === 6) p.checks.splice(3, 1);
      if (no % 19 === 7) p.note = '주의: 세척 중에는 탱크 맨홀을 열지 않는다. 고온 세척액에 화상을 입을 수 있다.';
      if (no % 23 === 8) p.rows.splice(3, 1);
      if (no % 29 === 9) p.title = no + '. ' + eq + ' 세척 및 건조 절차';
    }
    return p;
  }

  function make(ver, pages) {
    var cover = ver === 4
      ? { ver: 'v4', status: 'review', date: '2026-12-01', reason: '세척 온도 기준 상향, TOC 기준 강화, 세척액 농도 항목 추가', sign: [['작성', '김지원', '2026-11-10'], ['검토', '이서연', '2026-11-14'], ['검토', '최하준', '2026-11-15'], ['승인', '박도윤', '2026-11-18']] }
      : { ver: 'v3', status: 'superseded', date: '2025-06-01', reason: '정기 개정', sign: [['작성', '김지원', '2025-05-12'], ['검토', '이서연', '2025-05-20'], ['승인', '박도윤', '2025-05-26']] };
    var list = [];
    for (var i = 1; i <= pages; i++) list.push(page(i, pages, ver));
    return { cover: cover, pages: list, total: pages };
  }

  // ---------- 문서 양식: 홈페이지 /compare 와 같은 디자인. 쪽마다 반복되는 머리말(첫 쪽 제외)·꼬리말·도장은 data-sgc-ignore ----------
  var ORG = '실버바이오 데모 제약 (가상)', DOCNO = 'SOP-EQ-014', TITLE = '설비 세척 표준작업지침서';
  var DEPT = ['생산팀', '품질보증팀', '품질보증팀', '품질보증 책임자'];

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  var ATTR = { className: 'class', colSpan: 'colspan', rowSpan: 'rowspan' };
  /** el 과 같은 모양으로 HTML 글자를 만드는 함수 (JSP 처럼 서버가 내보내는 HTML) */
  function htmlEl(tag, props, kids) {
    var a = '';
    for (var k in props || {}) {
      if (k === 'key' || props[k] === undefined || props[k] === null || props[k] === false) continue;
      a += ' ' + (ATTR[k] || k) + (props[k] === '' ? '' : '="' + esc(props[k]) + '"');
    }
    if (tag === 'br' || tag === 'hr' || tag === 'img') return { __html: '<' + tag + a + '>' };
    var inner = (Array.isArray(kids) ? kids : kids === undefined || kids === null ? [] : [kids]).map(function (x) { return x && x.__html !== undefined ? x.__html : esc(x); }).join('');
    return { __html: '<' + tag + a + '>' + inner + '</' + tag + '>' };
  }

  /** 문서 전체를 el(tag, props, children) 로 그린다 — 일반 HTML · Vue · React 가 모두 이 하나를 쓴다.
   *  모양은 홈페이지 /compare(운영 중인 비교 화면)와 같은 문서 디자인 */
  function render(el, d) {
    var c = d.cover, total = d.pages.length + 1;     // 표지 + 본문
    var stamp = c.status === 'review' ? ['is-draft', '검토 중'] : c.status === 'superseded' ? ['is-old', '대체됨'] : ['is-ok', '승인'];
    function frame(no, kids, extraClass) {
      // 머리말: 첫 쪽만 비교 (나머지 쪽은 같은 내용 반복이라 뺌)
      var headProps = { className: 'sheet__head', key: 'h' };
      if (no > 0) headProps['data-sgc-ignore'] = '';
      return el('article', { className: 'page' + (extraClass ? ' ' + extraClass : ''), 'data-page': String(no), key: 'pg' + no }, [
        el('header', headProps, [
          el('div', { className: 'sheet__brand' }, [
            el('span', null, ORG), el('b', null, TITLE),
            el('span', { className: 'sheet__stamp ' + stamp[0], 'data-sgc-ignore': '' }, stamp[1]),
          ]),
          el('dl', { className: 'sheet__meta' }, [
            el('div', null, [el('dt', null, '문서명'), el('dd', null, TITLE)]),
            el('div', null, [el('dt', null, '문서 번호'), el('dd', null, DOCNO)]),
            el('div', null, [el('dt', null, '개정'), el('dd', null, c.ver)]),
            el('div', null, [el('dt', null, '시행일'), el('dd', null, c.date)]),
          ]),
        ]),
      ].concat(kids).concat([
        el('footer', { className: 'pg-foot', key: 'f', 'data-sgc-ignore': '' }, [
          el('span', null, DOCNO + ' · ' + c.ver), el('span', null, '샘플 — 가상 문서'), el('span', null, (no + 1) + ' / ' + total + '쪽'),
        ]),
      ]));
    }
    var cover = frame(0, [
      el('h2', { className: 'pg-title', key: 't' }, '개정 이력 · 승인'),
      el('table', { className: 'pg-table cv-meta', key: 'm' }, [el('tbody', null, [
        el('tr', null, [el('th', null, '개정 사유'), el('td', null, c.reason)]),
      ])]),
      el('table', { className: 'pg-table cv-sign', key: 's' }, [
        el('thead', null, [el('tr', null, [el('th', null, '구분'), el('th', null, '이름'), el('th', null, '부서'), el('th', null, '날짜')])]),
        el('tbody', null, c.sign.map(function (s, i) { return el('tr', { key: i }, [el('td', null, s[0]), el('td', null, s[1]), el('td', null, DEPT[i] || ''), el('td', null, s[2])]); })),
      ]),
    ], 'cover');
    var pages = d.pages.map(function (p) {
      return frame(p.no, [
        el('h2', { className: 'pg-title', key: 't' }, p.title),
      ].concat(p.paras.map(function (t, i) { return el('p', { className: 'pg-p', key: 'p' + i }, t); }))
        .concat(p.note ? [el('div', { className: 'pg-note', key: 'n' }, p.note)] : [])
        .concat([
          el('table', { className: 'pg-table', key: 'tb' }, [
            el('thead', null, [el('tr', null, [el('th', null, '항목'), el('th', null, '기준'), el('th', null, '단위')])]),
            el('tbody', null, p.rows.map(function (r, i) { return el('tr', { key: i }, [el('td', null, r[0]), el('td', null, r[1]), el('td', null, r[2])]); })),
          ]),
          el('h3', { className: 'pg-sub', key: 's' }, '확인 항목'),
          el('ul', { className: 'pg-checks', key: 'c' }, p.checks.map(function (t, i) { return el('li', { key: i }, t); })),
        ]));
    });
    return [cover].concat(pages);
  }
  function toHtml(d) { return render(htmlEl, d).map(function (x) { return x.__html; }).join(''); }

  /** 문서 용지 모양 (A4 통제 문서). 비교 모듈과 상관없는 "고객사 화면" CSS 역할 */
  var CSS = [
    /* 홈페이지 /compare(운영 중인 비교 화면)와 같은 문서 디자인: 흰 A4, 굵은 머리 줄, 가는 줄 표 */
    '.doc-root{--p-ink:#1d1f23;--p-ink-2:#4a4e56;--p-ink-3:#7b8089;--p-line:#d9dce1;--p-line-2:#aeb3bb;color:var(--p-ink);font:16px/1.5 Pretendard,"Pretendard Variable",-apple-system,"Apple SD Gothic Neo","Malgun Gothic","Noto Sans KR",sans-serif}',
    '.page{position:relative;width:794px;min-height:1123px;margin:0 auto 24px;padding:48px 56px 40px;background:#fff;box-shadow:0 1px 2px rgb(0 0 0/.25),0 12px 28px -12px rgb(0 0 0/.45);display:flex;flex-direction:column;gap:8px;content-visibility:auto;contain-intrinsic-size:auto 682px auto 1035px;box-sizing:border-box}',
    '.sheet__head{margin-bottom:6px}',
    '.sheet__brand{display:flex;align-items:baseline;gap:10px;padding-bottom:8px;border-bottom:2px solid var(--p-ink)}',
    '.sheet__brand span:first-child{font-size:.78em;font-weight:700;letter-spacing:.06em;color:var(--p-ink-3)}',
    '.sheet__brand b{font-size:1.25em;margin-right:auto}',
    '.sheet__stamp{font-size:.78em;font-weight:700;padding:1px 8px;border:1.5px solid currentColor;border-radius:3px}',
    '.sheet__stamp.is-ok{color:#1e7f4f}.sheet__stamp.is-draft{color:#b26b00}.sheet__stamp.is-old{color:var(--p-ink-3)}',
    '.sheet__meta{margin:0;display:grid;grid-template-columns:minmax(0,1.5fr) minmax(0,.7fr) minmax(0,1.1fr);column-gap:12px;border-bottom:1px solid var(--p-line-2)}',
    '.sheet__meta div:first-child{grid-column:1/-1}',
    '.sheet__meta div{display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px;padding:5px 0;border-bottom:1px solid var(--p-line);font-size:.88em}',
    '.sheet__meta div:nth-last-child(-n+3){border-bottom:0}',
    '.sheet__meta dt{color:var(--p-ink-3)}.sheet__meta dd{margin:0;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '.pg-title{margin:10px 0 2px;font-size:1.05em;font-weight:700;padding-bottom:4px;border-bottom:1px solid var(--p-line-2)}',
    '.page p{margin:0}.pg-p{color:var(--p-ink-2)}',
    '.pg-table{width:100%;border-collapse:collapse;font-size:.88em}',
    '.pg-table th,.pg-table td{padding:5px 6px;border-bottom:1px solid var(--p-line);text-align:left;font-variant-numeric:tabular-nums}',
    '.pg-table thead th{font-size:.9em;font-weight:700;color:var(--p-ink-2);border-bottom:1.5px solid var(--p-ink)}',
    '.cv-meta th{width:18%;color:var(--p-ink-3);font-weight:400}',
    '.pg-sub{margin:6px 0 0;font-size:.92em;font-weight:700;color:var(--p-ink-2)}',
    '.pg-checks{margin:0;padding-left:20px;color:var(--p-ink-2)}',
    '.pg-note{border-left:3px solid #b26b00;background:#fdf6e9;padding:6px 10px;font-size:.9em}',
    '.pg-foot{margin-top:auto;display:flex;justify-content:space-between;gap:8px;padding-top:8px;border-top:1px solid var(--p-line-2);font-size:.75em;color:var(--p-ink-3)}',
  ].join('\n');

  /** JSP 화면처럼 완성된 HTML 문서 한 장 (iframe 에 그대로 넣음) */
  function serverPage(d, title) {
    return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>' + esc(title) + '</title>' +
      '<style>body{margin:0;padding:24px 0;background:#2a2c31}' + CSS + '</style>' +
      '<script>function z(){var w=document.documentElement.clientWidth;document.body.style.zoom=Math.min(1,(w-24)/794)}addEventListener("resize",z);addEventListener("DOMContentLoaded",z)<\/script>' +
      '</head><body><main class="doc-root">' + toHtml(d) + '</main></body></html>';
  }

  // ---------- 복잡한 표 시험 (일반 HTML) ----------
  function cell(c) {
    if (typeof c === 'string') return '<td>' + esc(c) + '</td>';
    var tag = c.th ? 'th' : 'td';
    return '<' + tag + (c.cs ? ' colspan="' + c.cs + '"' : '') + (c.rs ? ' rowspan="' + c.rs + '"' : '') + '>' + esc(c.t) + '</' + tag + '>';
  }
  function table(rows, head) {
    return '<table class="pg-table">' + (head ? '<thead>' + head.map(function (r) { return '<tr>' + r.map(function (c) { return cell(typeof c === 'string' ? { t: c, th: 1 } : Object.assign({ th: 1 }, c)); }).join('') + '</tr>'; }).join('') + '</thead>' : '') +
      '<tbody>' + rows.map(function (r) { return '<tr>' + r.map(cell).join('') + '</tr>'; }).join('') + '</tbody></table>';
  }
  function cases() {
    var head = [['항목', '기준', '단위']];
    var base = [['전도도', '≤ 1.3', 'µS/cm'], ['TOC', '≤ 500', 'ppb'], ['온도', '60 ~ 70', '°C'], ['육안', '잔류물 없음', '-']];
    // 세척 검증 결과표: 머리글 2단 + 설비별 묶음(rowspan) + 측정 결과(colspan)
    var vh3 = [[{ t: '설비', rs: 2 }, { t: '시료 위치', rs: 2 }, { t: '측정 결과', cs: 3 }], ['전도도 (µS/cm)', 'TOC (ppb)', '육안']];
    var v3 = [
      [{ t: 'T-201', rs: 3 }, '벽면', '0.8', '210', '이상 없음'], ['바닥', '0.9', '260', '이상 없음'], ['노즐', '1.1', '340', '이상 없음'],
      [{ t: 'P-104', rs: 2 }, '입구', '0.7', '180', '이상 없음'], ['출구', '0.9', '230', '이상 없음'],
      [{ t: 'HX-3', rs: 2 }, '판 1', '1.0', '320', '이상 없음'], ['판 2', '1.2', '390', '이상 없음'],
    ];
    var vh4 = [[{ t: '설비', rs: 2 }, { t: '시료 위치', rs: 2 }, { t: '측정 결과', cs: 3 }, { t: '판정', rs: 2 }], ['전도도 (µS/cm)', 'TOC (ppb)', '육안']];
    var v4 = [
      [{ t: 'T-201', rs: 4 }, '벽면', '0.8', '210', '이상 없음', '적합'], ['바닥', '0.9', '260', '이상 없음', '적합'], ['노즐', '1.1', '340', '이상 없음', '적합'], ['맨홀', '1.0', '300', '이상 없음', '적합'],
      [{ t: 'P-104', rs: 2 }, '출구', '0.9', '230', '이상 없음', '적합'], ['입구', '0.7', '180', '이상 없음', '적합'],
      [{ t: 'HX-3', rs: 2 }, '판 1', '1.0', '410', { t: '이상 없음 (판 1·2 함께 확인)', rs: 2 }, '적합'], ['판 2', '1.2', '390', '적합'],
    ];
    return [
      { id: 'complex', title: '세척 검증 결과표 (머리글 2단·칸 병합·설비별 묶음)', tall: true,
        desc: '판정 열 추가, T-201 에 맨홀 줄 추가 (설비 칸 rowspan 3 → 4), P-104 입구·출구 순서 바뀜, HX-3 판 1 TOC 320 → 410, HX-3 육안 칸 두 개를 하나로 병합.',
        left: table(v3, vh3), right: table(v4, vh4) },
      { id: 'col', title: '열 추가', desc: '가운데에 "담당" 열이 새로 생김.',
        left: table(base, head), right: table(base.map(function (r, i) { return [r[0], ['김지원', '이서연', '김지원', '최하준'][i], r[1], r[2]]; }), [['항목', '담당', '기준', '단위']]) },
      { id: 'colspan', title: '가로 병합 (colspan)', desc: 'TOC 줄의 세 칸을 한 칸으로 합침.',
        left: table(base, head), right: table([base[0], [{ t: 'TOC ≤ 500 ppb', cs: 3 }], base[2], base[3]], head) },
      { id: 'rowspan', title: '세로 병합 (rowspan)', desc: '전도도·TOC 두 줄의 항목 칸을 한 칸으로 합침.',
        left: table(base, head), right: table([[{ t: '전도도·TOC', rs: 2 }, '≤ 1.3', 'µS/cm'], ['≤ 500', 'ppb'], base[2], base[3]], head) },
      { id: 'move', title: '줄 순서만 바뀜', desc: '내용은 그대로, 줄 순서만 바뀜 (ID 없이).',
        left: table(base, head), right: table([base[2], base[0], base[3], base[1]], head) },
      { id: 'list', title: '구조가 통째로 바뀜 (표 → 목록)', desc: '같은 내용을 표 대신 목록으로.',
        left: table(base, head), right: '<ul class="pg-checks">' + base.map(function (r) { return '<li>' + esc(r.join(' ')) + '</li>'; }).join('') + '</ul>' },
    ];
  }

  global.SgDemoDocs = {
    cases: cases, make: make, toHtml: toHtml, render: render, serverPage: serverPage, CSS: CSS };
})(typeof window !== 'undefined' ? window : globalThis);
