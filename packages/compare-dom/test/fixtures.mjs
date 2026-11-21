// 테스트 화면들 (전부 지어낸 내용). /t/이름 으로 열린다
const SDK = '<script src="/dist/sg-compare.min.js"></script>';
const head = (title, css = '') => `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>${title}</title><style>body{margin:0;font:14px/1.6 sans-serif}${css}</style></head>`;
const DESK = '#desk{height:700px;overflow:auto;display:grid;grid-template-columns:1fr 1fr;align-items:start;background:#e6e8ec}.doc{background:#fff;margin:8px;padding:16px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #bbb;padding:3px 6px}';

// ---------- 기본 ----------
const basicDoc = (v) => `<div class="doc"><h2>작업 지시서 v1.${v - 1}</h2>
<p>원료를 칭량한 뒤 혼합기에 투입한다. 혼합 시간은 ${v === 1 ? 10 : 15}분으로 한다.</p>
<table><tr><th>원료</th><th>규격</th><th>양</th></tr>
<tr data-sgc-key="A"><td>원료 A</td><td>USP</td><td>${v === 1 ? '12.0' : '12.5'} kg</td></tr>
${v === 1 ? '<tr data-sgc-key="B"><td>원료 B</td><td>EP</td><td>3.5 kg</td></tr>' : ''}
<tr data-sgc-key="C"><td>원료 C</td><td>USP</td><td>0.8 kg</td></tr>
${v === 2 ? '<tr data-sgc-key="D"><td>원료 D</td><td>KP</td><td>1.2 kg</td></tr>' : ''}</table>
<p>혼합 후 균일성을 확인한다.</p>${v === 2 ? '<p>확인 결과를 기록지에 남긴다.</p>' : ''}</div>`;
const basic = `${head('기본', DESK)}<body><div id="desk"><div id="left">${basicDoc(1)}</div><div id="right">${basicDoc(2)}</div></div>${SDK}
<script>window.__left0 = left.innerHTML; window.__right0 = right.innerHTML;
window.ctrl = SgCompare.createCompare({ left, right, leftScroller: desk, rightScroller: desk });</script></body></html>`;

// ---------- 주소 두 개 비교 ----------
const viewer = (q) => `${head('뷰어')}<body><div id="v"></div>${SDK}<script>
window.viewer = SgCompare.mountViewer(document.getElementById('v'), {
  left: { url: '/t/${q.get('l')}?v=${q.get('lv')}&long=${q.get('long') ?? ''}', label: '이전' }, right: { url: '/t/${q.get('r')}?v=${q.get('rv')}&long=${q.get('long') ?? ''}', label: '새 버전' },
  layout: '${q.get('layout') ?? 'shared'}', height: '860px' });
window.ready = window.viewer.ready;</script></body></html>`;

// ---------- 옛날식 서버 화면: doctype 없음(호환 모드), 표로 짠 레이아웃, font·center ----------
const legacy = (q) => {
  const v = Number(q.get('v') ?? 1), long = q.get('long') === '1';
  const rows = [];
  const n = long ? 120 : 8;
  for (let i = 1; i <= n; i++) {
    if (v === 1 && i === 5) { rows.push(`<tr><td>${i}</td><td>세척 후 건조</td><td><font color="#333">60분</font></td></tr>`); continue; }
    if (v === 2 && i === 5) continue;                                            // 삭제
    const t = i === 3 ? (v === 1 ? '혼합 속도 20 rpm' : '혼합 속도 25 rpm') : i === n ? (v === 1 ? '최종 확인 후 서명' : '최종 확인 후 서명 및 날짜 기재') : `공정 단계 ${i} 수행`;
    rows.push(`<tr><td>${i}</td><td>${t}</td><td>${i % 4 === 0 ? '<b>확인</b>' : '-'}</td></tr>`);
    if (v === 2 && i === 6) rows.push('<tr><td>6-1</td><td>중간 시료 채취</td><td>QC</td></tr>');   // 추가
  }
  return `<html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><title>공정 기록</title>
<script>window.__ran = (window.__ran || 0) + 1;</script>
<style>td{font-size:12px;font-family:Gulim,sans-serif}</style></head>
<body bgcolor="#ffffff" text="#000000">
<center><table width="700" border="0" cellpadding="0" cellspacing="0"><tr><td>
  <table width="100%" border="1" cellpadding="4" cellspacing="0" bordercolor="#666666">
    <tr><td rowspan="${v === 1 ? 2 : 3}" width="120" align="center"><font size="4"><b>공정 기록</b></font></td><td>문서번호</td><td>PR-0001</td></tr>
    <tr><td>개정</td><td>${v === 1 ? 'Rev. 1' : 'Rev. 2'}</td></tr>
    <tr>${v === 1 ? '<td>&nbsp;</td>' : ''}<td>부서</td><td>생산</td></tr>
  </table><br>
  <table width="100%" border="1" cellpadding="3" cellspacing="0">
    <tr bgcolor="#dddddd"><td width="50">순번</td><td>내용</td><td width="80">비고</td></tr>
    ${rows.join('\n    ')}
  </table>
</td></tr></table></center></body></html>`;
};

// ---------- 문서 안에 iframe 이 든 화면 ----------
const portal = (q) => { const v = q.get('v'); return `${head('포털', 'iframe{width:100%;height:300px;border:1px solid #999}')}<body>
<h1>문서 조회 ${v === '1' ? '(구)' : '(신)'}</h1><p>아래 틀 안에 본문이 표시됩니다.</p>
<iframe id="inner" src="/t/inner?v=${v}"></iframe><p>끝.</p></body></html>`; };
const inner = (q) => { const v = q.get('v'); const ps = [];
  for (let i = 1; i <= 40; i++) ps.push(`<p>본문 ${i}번 문단. ${i === 3 && v === '2' ? '온도는 25도로 유지한다.' : i === 3 ? '온도는 20도로 유지한다.' : i === 35 && v === '2' ? '기록은 5년간 보관한다.' : i === 35 ? '기록은 3년간 보관한다.' : '내용은 같다.'}</p>`);
  if (v === '2') ps.splice(20, 0, '<p>새로 들어간 문단이다.</p>');
  return `${head('안쪽')}<body>${ps.join('')}</body></html>`; };

// ---------- 웹 컴포넌트 · SVG · 입력칸 ----------
const widgetDoc = (v) => `<div class="doc">
<p>판정: <x-badge data-t="${v === 1 ? '적합' : '합격'}"></x-badge></p>
<svg width="200" height="40"><text x="4" y="24">압력 ${v === 1 ? 100 : 120} kPa</text></svg>
<p><input type="text" value="${v === 1 ? 20 : 25}"> <label><input type="checkbox" ${v === 2 ? 'checked' : ''}> 확인함</label></p>
<p><select><option ${v === 1 ? 'selected' : ''}>1등급</option><option ${v === 2 ? 'selected' : ''}>2등급</option></select></p>
<p><textarea>${v === 1 ? '이상 없음' : '재시험 필요'}</textarea></p></div>`;
const widgets = `${head('위젯', DESK)}<body><div id="desk"><div id="left">${widgetDoc(1)}</div><div id="right">${widgetDoc(2)}</div></div>${SDK}
<script>customElements.define('x-badge', class extends HTMLElement { connectedCallback() { this.attachShadow({ mode: 'open' }).innerHTML = '<span style="padding:0 6px;border:1px solid #888">' + this.dataset.t + '</span>'; } });
window.ctrl = SgCompare.createCompare({ left, right, leftScroller: desk, rightScroller: desk, watch: true, debounce: 100 });</script></body></html>`;

const blank = `${head('빈 화면')}<body>${SDK}</body></html>`;

// ---------- 쪽 문서 (n 쪽). cv=1: 고객 CSS 에 쪽 건너뛰기 있음, collapse=1: 여백이 쪽 밖으로 겹치는 구조 ----------
const pages = (q) => {
  const n = Number(q.get('n') ?? 50), cv = q.get('cv') === '1', collapse = q.get('collapse') === '1';
  const page = (i, v) => {
    const ps = [];
    for (let k = 1; k <= 6; k++) {
      if (v === 2 && i % 11 === 5 && k === 4) continue;
      ps.push(`<p>${i}쪽 ${k}번 문단. ${v === 2 && i % 3 === 1 && k === 2 ? '기준값은 ' + (i + 10) + '로 바꾼다.' : '기준값은 ' + i + '이다.'}</p>`);
      if (v === 2 && i % 7 === 2 && k === 3) ps.push(`<p>${i}쪽에 새로 추가한 주의 문구.</p>`);
    }
    return `<section class="page"><h3>${i}. 절차</h3>${ps.join('')}<table><tr><th>항목</th><th>값</th></tr><tr><td>수량</td><td>${v === 2 && i % 5 === 0 ? i * 2 : i}</td></tr></table></section>`;
  };
  const doc = (v) => Array.from({ length: n }, (_, i) => page(i + 1, v)).join('');
  const css = collapse
    ? '.page{background:#fff;min-height:500px}.page h3{margin:30px 0 10px}table{border-collapse:collapse}td,th{border:1px solid #bbb;padding:2px 6px}'
    : `.page{box-sizing:border-box;background:#fff;min-height:560px;margin:10px;padding:24px;${cv ? 'content-visibility:auto;contain-intrinsic-size:auto 500px auto 512px;' : ''}}.page h3{margin:0 0 8px}p{margin:0 0 8px}table{border-collapse:collapse}td,th{border:1px solid #bbb;padding:2px 6px}`;
  return `${head('쪽 문서', '#desk{height:800px;overflow:auto;display:grid;grid-template-columns:1fr 1fr;align-items:start;background:#e6e8ec}' + css)}<body>
<div id="desk"><div id="left">${doc(1)}</div><div id="right">${doc(2)}</div></div>${SDK}
<script>window.start = () => { window.ctrl = SgCompare.createCompare({ left, right, leftScroller: desk, rightScroller: desk, page: '.page'${q.get('virt') === '1' ? ', virtualize: true' : ''} }); };</script></body></html>`;
};

// ---------- 숨긴 영역 ----------
const hiddenDoc = (v) => `<div><p>보이는 문단 ${v}</p><div style="display:none"><p>접힌 탭 안 내용 ${v}</p></div></div>`;
const hidden = `${head('숨김')}<body><div id="left">${hiddenDoc(1)}</div><div id="right">${hiddenDoc(2)}</div>${SDK}</body></html>`;

// ---------- 복잡한 표 ----------
const tableDoc = (v) => `<div class="doc">
<table id="t1"><tr><th>항목</th><th>기준</th>${v === 2 ? '<th>단위</th>' : ''}</tr>
<tr><td>전도도</td><td>1.3 이하</td>${v === 2 ? '<td>µS/cm</td>' : ''}</tr>
<tr><td>유기탄소</td><td>500 이하</td>${v === 2 ? '<td>ppb</td>' : ''}</tr>
<tr><td>온도</td><td>60 ~ 70</td>${v === 2 ? '<td>°C</td>' : ''}</tr></table><br>
<table id="t2"><tr><th>순서</th><th>작업</th></tr>
${(v === 1 ? ['가열 후 30분 유지', '냉각수 순환 시작', '시료 채취 및 기록'] : ['냉각수 순환 시작', '가열 후 30분 유지', '시료 채취 및 기록']).map((t) => `<tr><td>작업</td><td>${t}</td></tr>`).join('')}</table><br>
<table id="t3"><tr><td rowspan="${v === 1 ? 2 : 3}">구분</td><td>1차</td><td>적합</td></tr><tr><td>2차</td><td>적합</td></tr><tr>${v === 1 ? '<td>기타</td>' : ''}<td>3차</td><td>${v === 1 ? '적합' : '보류'}</td></tr></table></div>`;
const tables = `${head('표', DESK)}<body><div id="desk"><div id="left">${tableDoc(1)}</div><div id="right">${tableDoc(2)}</div></div>${SDK}
<script>window.ctrl = SgCompare.createCompare({ left, right, leftScroller: desk, rightScroller: desk });</script></body></html>`;

export const PAGES = { basic, viewer, legacy, portal, inner, widgets, blank, pages, hidden, tables };
