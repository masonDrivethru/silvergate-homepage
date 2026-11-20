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
      ? { ver: 'v4', date: '2026-12-01', reason: '세척 온도 기준 상향, TOC 기준 강화, 세척액 농도 항목 추가', sign: [['작성', '김지원', '2026-11-10'], ['검토', '이서연', '2026-11-14'], ['검토', '최하준', '2026-11-15'], ['승인', '박도윤', '2026-11-18']] }
      : { ver: 'v3', date: '2025-06-01', reason: '정기 개정', sign: [['작성', '김지원', '2025-05-12'], ['검토', '이서연', '2025-05-20'], ['승인', '박도윤', '2025-05-26']] };
    var list = [];
    for (var i = 1; i <= pages; i++) list.push(page(i, pages, ver));
    return { cover: cover, pages: list, total: pages };
  }

  // ---------- 일반 HTML 문자열 (JSP·서버 화면이 내보내는 것과 같은 모양) ----------
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function coverHtml(d) {
    var c = d.cover;
    return '<article class="page cover" data-page="0">' +
      '<div class="pg-head"><span class="pg-org">실버바이오 데모 제약 (가상)</span><span class="pg-doc">SOP-EQ-014</span></div>' +
      '<h1 class="cv-title">설비 세척 표준작업지침서</h1>' +
      '<table class="cv-meta"><tbody>' +
      '<tr><th>문서 번호</th><td>SOP-EQ-014</td><th>개정</th><td>' + esc(c.ver) + '</td></tr>' +
      '<tr><th>시행일</th><td>' + esc(c.date) + '</td><th>쪽수</th><td>' + d.total + '</td></tr>' +
      '<tr><th>개정 사유</th><td colspan="3">' + esc(c.reason) + '</td></tr>' +
      '</tbody></table>' +
      '<table class="cv-sign"><thead><tr><th>구분</th><th>이름</th><th>날짜</th></tr></thead><tbody>' +
      c.sign.map(function (s) { return '<tr><td>' + esc(s[0]) + '</td><td>' + esc(s[1]) + '</td><td>' + esc(s[2]) + '</td></tr>'; }).join('') +
      '</tbody></table></article>';
  }
  function pageHtml(p) {
    return '<article class="page" data-page="' + p.no + '">' +
      '<div class="pg-head"><span class="pg-org">실버바이오 데모 제약 (가상)</span><span class="pg-doc">SOP-EQ-014</span></div>' +
      '<h2 class="pg-title">' + esc(p.title) + '</h2>' +
      p.paras.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') +
      (p.note ? '<div class="pg-note">' + esc(p.note) + '</div>' : '') +
      '<table class="pg-table"><thead><tr><th>항목</th><th>기준</th><th>단위</th></tr></thead><tbody>' +
      p.rows.map(function (r) { return '<tr><td>' + esc(r[0]) + '</td><td>' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td></tr>'; }).join('') +
      '</tbody></table>' +
      '<h3 class="pg-sub">확인 항목</h3><ul class="pg-checks">' +
      p.checks.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') +
      '</ul><div class="pg-foot"><span>SOP-EQ-014</span><span>' + p.no + ' / ' + p.total + '</span></div></article>';
  }
  function toHtml(d) { return coverHtml(d) + d.pages.map(pageHtml).join(''); }

  // ---------- 같은 마크업을 Vue / React 로 (h / createElement 함수만 넘기면 됨) ----------
  /** el(tag, props, children) 모양의 함수로 문서를 그린다 */
  function render(el, d, keyed) {
    var c = d.cover;
    var cover = el('article', { className: 'page cover', 'data-page': '0', key: 'cover' }, [
      el('div', { className: 'pg-head' }, [el('span', { className: 'pg-org' }, '실버바이오 데모 제약 (가상)'), el('span', { className: 'pg-doc' }, 'SOP-EQ-014')]),
      el('h1', { className: 'cv-title' }, '설비 세척 표준작업지침서'),
      el('table', { className: 'cv-meta' }, [el('tbody', null, [
        el('tr', null, [el('th', null, '문서 번호'), el('td', null, 'SOP-EQ-014'), el('th', null, '개정'), el('td', null, c.ver)]),
        el('tr', null, [el('th', null, '시행일'), el('td', null, c.date), el('th', null, '쪽수'), el('td', null, String(d.total))]),
        el('tr', null, [el('th', null, '개정 사유'), el('td', { colSpan: 3 }, c.reason)]),
      ])]),
      el('table', { className: 'cv-sign' }, [
        el('thead', null, [el('tr', null, [el('th', null, '구분'), el('th', null, '이름'), el('th', null, '날짜')])]),
        el('tbody', null, c.sign.map(function (s, i) { return el('tr', { key: i }, [el('td', null, s[0]), el('td', null, s[1]), el('td', null, s[2])]); })),
      ]),
    ]);
    var pages = d.pages.map(function (p) {
      return el('article', { className: 'page', 'data-page': String(p.no), key: 'p' + p.no }, [
        el('div', { className: 'pg-head', key: 'h' }, [el('span', { className: 'pg-org' }, '실버바이오 데모 제약 (가상)'), el('span', { className: 'pg-doc' }, 'SOP-EQ-014')]),
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
          el('div', { className: 'pg-foot', key: 'f' }, [el('span', null, 'SOP-EQ-014'), el('span', null, p.no + ' / ' + p.total)]),
        ]));
    });
    return [cover].concat(pages);
  }

  /** 문서 용지 모양 (A4). 비교 모듈과 상관없는 "고객사 화면" CSS 역할 */
  var CSS = [
    '.doc-root{--paper:#fff;--ink:#1d2330;--ink2:#5b6474;--rule:#cfd5de;--head:#eef1f5;font-family:"Noto Serif KR","Batang",serif;color:var(--ink)}',
    '.page{width:794px;min-height:1123px;margin:0 auto 18px;padding:56px 64px 48px;background:var(--paper);box-shadow:0 1px 3px rgba(16,24,40,.12),0 0 0 1px rgba(16,24,40,.06);display:flex;flex-direction:column;gap:12px;content-visibility:auto;contain-intrinsic-size:auto 794px auto 1123px;box-sizing:border-box}',
    '.pg-head{display:flex;justify-content:space-between;font:12px/1.4 "Noto Sans KR",sans-serif;color:var(--ink2);border-bottom:1px solid var(--rule);padding-bottom:8px;margin-bottom:8px}',
    '.pg-title{font-size:21px;margin:6px 0 4px;font-weight:700}',
    '.page p{font-size:15px;line-height:1.75;margin:0}',
    '.pg-table,.cv-meta,.cv-sign{border-collapse:collapse;width:100%;font:14px/1.5 "Noto Sans KR",sans-serif}',
    '.pg-table th,.pg-table td,.cv-meta th,.cv-meta td,.cv-sign th,.cv-sign td{border:1px solid var(--rule);padding:7px 10px;text-align:left}',
    '.pg-table th,.cv-meta th,.cv-sign th{background:var(--head);font-weight:600}',
    '.pg-sub{font:600 15px/1.4 "Noto Sans KR",sans-serif;margin:10px 0 0}',
    '.pg-checks{margin:0;padding-left:22px;font-size:15px;line-height:1.8}',
    '.pg-note{border:1px solid #e9b949;background:#fff8e6;padding:10px 14px;font:14px/1.6 "Noto Sans KR",sans-serif}',
    '.pg-foot{margin-top:auto;display:flex;justify-content:space-between;font:12px "Noto Sans KR",sans-serif;color:var(--ink2);border-top:1px solid var(--rule);padding-top:8px}',
    '.cover{justify-content:flex-start;gap:28px}.cv-title{font-size:30px;text-align:center;margin:120px 0 40px;letter-spacing:.04em}',
  ].join('\n');

  /** JSP 화면처럼 완성된 HTML 문서 한 장 (iframe 에 그대로 넣음) */
  function serverPage(d, title) {
    return '<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>' + esc(title) + '</title>' +
      '<style>body{margin:0;padding:20px 0;background:#e9ecf1}' + CSS + '</style>' +
      '<script>function z(){var w=document.documentElement.clientWidth;document.body.style.zoom=Math.min(1,(w-24)/794)}addEventListener("resize",z);addEventListener("DOMContentLoaded",z)<\/script>' +
      '</head><body><main class="doc-root">' + toHtml(d) + '</main></body></html>';
  }

  global.SgDemoDocs = { make: make, toHtml: toHtml, render: render, serverPage: serverPage, CSS: CSS };
})(typeof window !== 'undefined' ? window : globalThis);
