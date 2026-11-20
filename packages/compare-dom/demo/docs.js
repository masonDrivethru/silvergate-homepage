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

  // ---------- 문서 양식: eQMS(문서 관리 시스템)에 올라가는 통제 문서(controlled document) 모양 ----------
  // 쪽마다 머리말 표 · 첫 쪽 문서 정보와 승인 서명표 · 번호 붙은 절 · 관리 문서 꼬리말 · 상태 워터마크 ·
  // 시스템 표시 줄 · 마지막 쪽 전자서명 기록. 반복되는 머리말·꼬리말·표시 줄은 data-sgc-ignore (비교에서 뺌)
  var ORG = '실버바이오 데모 제약 (가상)', DOCNO = 'SOP-EQ-014', TITLE = '설비 세척 표준작업지침서';
  var STATUS = { superseded: '대체됨', effective: '시행', review: '검토 중' };
  var WM = { superseded: 'SUPERSEDED', review: 'DRAFT – IN REVIEW' };
  var DEPT = ['생산팀', '품질보증팀', '품질보증팀', '품질보증 책임자'];
  var TIMES = ['09:12:41', '14:03:27', '15:20:09', '10:48:05'];
  var MEANING = { '작성': '작성자', '검토': '검토자', '승인': '승인자' };

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

  /** 문서 전체를 el(tag, props, children) 로 그린다 — 일반 HTML · Vue · React 가 모두 이 하나를 쓴다 */
  function render(el, d) {
    var c = d.cover, total = d.pages.length + 2;     // 표지 + 본문 + 전자서명 기록
    var ign = { 'data-sgc-ignore': '', 'aria-hidden': 'true' };
    function frame(no, kids, extraClass) {
      var props = { className: 'page' + (extraClass ? ' ' + extraClass : ''), 'data-page': String(no), key: 'pg' + no };
      if (WM[c.status]) props['data-watermark'] = WM[c.status];
      return el('article', props, [
        el('p', Object.assign({ className: 'pg-overlay pg-overlay--top', key: 'ot' }, ign), '상태: ' + STATUS[c.status] + ' · 시행일: ' + c.date),
        el('p', Object.assign({ className: 'pg-overlay pg-overlay--bottom', key: 'ob' }, ign), '인쇄본은 관리되지 않음 · 최신 버전은 문서 관리 시스템에서 확인'),
        el('table', Object.assign({ className: 'pg-run', key: 'run' }, ign), [el('tbody', null, [
          el('tr', null, [el('td', { className: 'pg-run__org', rowSpan: 2 }, ORG), el('td', { className: 'pg-run__title', rowSpan: 2 }, [el('b', null, TITLE), el('br', null, []), DOCNO]), el('td', { className: 'pg-run__k' }, '문서 번호'), el('td', { className: 'pg-run__v' }, DOCNO)]),
          el('tr', null, [el('td', { className: 'pg-run__k' }, '버전'), el('td', { className: 'pg-run__v' }, c.ver + ' · ' + (no + 1) + ' / ' + total + '쪽')]),
        ])]),
      ].concat(kids).concat([
        el('div', Object.assign({ className: 'pg-foot', key: 'f' }, ign), [el('span', null, '대외비 · 관리 문서 — 인쇄본은 관리되지 않습니다.'), el('span', null, DOCNO + ' ' + c.ver + ' · ' + (no + 1) + ' / ' + total + '쪽')]),
      ]));
    }
    var cover = frame(0, [
      el('h1', { className: 'cv-title', key: 't' }, TITLE),
      el('table', { className: 'cv-meta', key: 'm' }, [el('tbody', null, [
        el('tr', null, [el('th', null, '문서 번호'), el('td', null, DOCNO), el('th', null, '버전'), el('td', null, c.ver)]),
        el('tr', null, [el('th', null, '시행일'), el('td', null, c.date), el('th', null, '상태'), el('td', null, [el('span', { 'data-sgc-ignore': '' }, STATUS[c.status])])]),
        el('tr', null, [el('th', null, '개정 사유'), el('td', { colSpan: 3 }, c.reason)]),
      ])]),
      el('h3', { className: 'cv-h', key: 'ah' }, '승인'),
      el('table', { className: 'cv-sign', key: 's' }, [
        el('thead', null, [el('tr', null, [el('th', null, '구분'), el('th', null, '이름'), el('th', null, '부서'), el('th', null, '날짜')])]),
        el('tbody', null, c.sign.map(function (s, i) { return el('tr', { key: i }, [el('td', null, s[0]), el('td', null, s[1]), el('td', null, DEPT[i] || ''), el('td', null, s[2])]); })),
      ]),
    ], 'cover');
    var pages = d.pages.map(function (p) {
      return frame(p.no, [
        el('h2', { className: 'pg-title', key: 't' }, p.title),
      ].concat(p.paras.map(function (t, i) { return el('p', { key: 'p' + i }, t); }))
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
    var manifest = frame(d.pages.length + 1, [
      el('h2', { className: 'pg-title', key: 't' }, '전자서명 기록 (Signature Manifest)'),
      el('p', { key: 'n' }, '문서 관리 시스템에서 적용된 전자서명 (21 CFR Part 11). 이 쪽은 문서의 일부입니다.'),
      el('table', { className: 'pg-table mf-table', key: 'tb' }, [
        el('thead', null, [el('tr', null, [el('th', null, '서명자'), el('th', null, '서명 의미'), el('th', null, '서명 일시 (UTC)')])]),
        el('tbody', null, c.sign.map(function (s, i) { return el('tr', { key: i }, [el('td', null, s[1]), el('td', null, MEANING[s[0]] || s[0]), el('td', null, s[2] + ' ' + (TIMES[i] || '09:00:00') + ' UTC')]); })),
      ]),
    ], 'manifest');
    return [cover].concat(pages).concat([manifest]);
  }
  function toHtml(d) { return render(htmlEl, d).map(function (x) { return x.__html; }).join(''); }

  /** 문서 용지 모양 (A4 통제 문서). 비교 모듈과 상관없는 "고객사 화면" CSS 역할 */
  var CSS = [
    '.doc-root{--ink:#111;--ink2:#4a4a4a;--rule:#222;--head:#ededed;color:var(--ink);font:12px/1.5 Arial,"Helvetica Neue","Noto Sans KR","Malgun Gothic",sans-serif}',
    '.page{position:relative;width:794px;min-height:1123px;margin:0 auto 18px;padding:44px 60px 34px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.35);display:flex;flex-direction:column;gap:9px;content-visibility:auto;contain-intrinsic-size:auto 674px auto 1045px;box-sizing:border-box}',
    '.page[data-watermark]::before{content:attr(data-watermark);position:absolute;left:50%;top:50%;transform:translate(-50%,-50%) rotate(-35deg);font:700 64px/1 Arial,sans-serif;letter-spacing:.08em;color:rgba(0,0,0,.07);white-space:nowrap;pointer-events:none;z-index:0}',
    '.page>*{position:relative;z-index:1}',
    '.pg-overlay{position:absolute!important;left:60px;right:60px;margin:0!important;font-size:8.5px;color:#6b6b6b}',
    '.pg-overlay--top{top:18px}.pg-overlay--bottom{bottom:12px;text-align:center}',
    '.pg-run{width:100%;border-collapse:collapse;font-size:10px;margin-bottom:6px}',
    '.pg-run td{border:.75px solid var(--rule);padding:3px 6px;vertical-align:middle}',
    '.pg-run__org{width:24%;font-weight:700;text-align:center}.pg-run__title{text-align:center;line-height:1.35}.pg-run__title b{font-size:11.5px}',
    '.pg-run__k{width:12%;background:var(--head);white-space:nowrap}.pg-run__v{width:22%;white-space:nowrap}',
    '.cv-title{margin:4px 0 6px;font-size:15px;font-weight:700;text-align:center}',
    '.cv-h{margin:6px 0 0;font-size:12px;font-weight:700}',
    '.pg-title{margin:6px 0 0;font-size:13px;font-weight:700;padding-bottom:3px;border-bottom:1.25px solid var(--rule)}',
    '.page p{margin:0}',
    '.pg-table,.cv-meta,.cv-sign{border-collapse:collapse;width:100%;font-size:11px}',
    '.pg-table th,.pg-table td,.cv-meta th,.cv-meta td,.cv-sign th,.cv-sign td{border:.75px solid var(--rule);padding:3px 6px;text-align:left;vertical-align:top}',
    '.pg-table th,.cv-meta th,.cv-sign th{background:var(--head);font-weight:700}',
    '.cv-meta th{width:16%}',
    '.pg-sub{margin:4px 0 0;font-size:12px;font-weight:700}',
    '.pg-checks{margin:0;padding-left:20px}',
    '.pg-note{border:.75px solid var(--rule);background:#f6f6f6;padding:5px 9px;font-size:11px}',
    '.pg-foot{margin-top:auto;margin-bottom:10px;display:flex;justify-content:space-between;gap:16px;font-size:9.5px;color:var(--ink2);border-top:.75px solid var(--rule);padding-top:5px}',
  ].join('\n');

  /** JSP 화면처럼 완성된 HTML 문서 한 장 (iframe 에 그대로 넣음) */
  function serverPage(d, title) {
    return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>' + esc(title) + '</title>' +
      '<style>body{margin:0;padding:20px 0;background:#525659}' + CSS + '</style>' +
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
