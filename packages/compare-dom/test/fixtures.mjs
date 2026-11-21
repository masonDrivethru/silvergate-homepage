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

// ---------- JSON 을 받아 바닐라 JS 로 표를 그리는 컴포넌트 (늦게 그리고, 데이터가 바뀌면 표 전체를 새로 그림) ----------
const jsontable = `${head('JSON 표', DESK)}<body><div id="desk"><div id="left"><div class="doc"><h3>시험 결과</h3><div class="grid"></div><p>비고: 없음</p></div></div><div id="right"><div class="doc"><h3>시험 결과</h3><div class="grid"></div><p>비고: 없음</p></div></div></div>${SDK}
<script>
// 고객사 표 컴포넌트 흉내: 키(data-sgc-key) 같은 것은 모른다. 부를 때마다 표를 통째로 새로 만든다
function drawTable(host, data) {
  var t = document.createElement('table'), thead = t.createTHead().insertRow();
  data.columns.forEach(function (c) { var th = document.createElement('th'); th.textContent = c.title; thead.appendChild(th); });
  var body = t.createTBody();
  data.rows.forEach(function (r) {
    var tr = body.insertRow();
    data.columns.forEach(function (c) {
      var v = r[c.field];
      if (v && v.skip) return;                                   // 위 칸이 병합해서 내려옴
      var td = tr.insertCell(); td.textContent = v && v.text !== undefined ? v.text : v;
      if (v && v.rowspan) td.rowSpan = v.rowspan;
    });
  });
  host.replaceChildren(t);
}
var cols = [{ field: 'grp', title: '구분' }, { field: 'item', title: '항목' }, { field: 'spec', title: '기준' }, { field: 'val', title: '결과' }];
window.v1 = { columns: cols, rows: [
  { grp: { text: '물리', rowspan: 2 }, item: '성상', spec: '흰색 분말', val: '적합' },
  { grp: { skip: 1 }, item: '수분', spec: '2.0% 이하', val: '1.2%' },
  { grp: { text: '화학', rowspan: 2 }, item: '함량', spec: '98.0 ~ 102.0%', val: '99.6%' },
  { grp: { skip: 1 }, item: '유연물질', spec: '0.5% 이하', val: '0.1%' } ] };
window.v2 = { columns: cols.concat([{ field: 'by', title: '시험자' }]), rows: [
  { grp: { text: '물리', rowspan: 3 }, item: '성상', spec: '흰색 분말', val: '적합', by: '가' },
  { grp: { skip: 1 }, item: '수분', spec: '1.5% 이하', val: '1.2%', by: '가' },
  { grp: { skip: 1 }, item: '입도', spec: '90% 이상', val: '94%', by: '나' },
  { grp: { text: '화학', rowspan: 1 }, item: '함량', spec: '98.0 ~ 102.0%', val: '99.8%', by: '나' } ] };
window.drawTable = drawTable;
// 비교는 먼저 걸어 두고, 표는 나중에(서버에서 JSON 이 온 뒤) 그려진다
window.ctrl = SgCompare.createCompare({ left, right, leftScroller: desk, rightScroller: desk, watch: true, debounce: 100 });
setTimeout(function () { drawTable(document.querySelector('#left .grid'), v1); }, 250);
setTimeout(function () { drawTable(document.querySelector('#right .grid'), v2); }, 400);
</script></body></html>`;

// ---------- 기준정보(블록)를 쌓아 표를 만들고, 조건에 따라 칸을 합치고, 실행 데이터(회차)만큼 표를 반복하는 컴포넌트 ----------
export const BRICK_JS = `
// 고객사 컴포넌트 흉내 (바닐라 JS). 비교 모듈은 모른다. 부를 때마다 통째로 새로 그린다
function drawSheet(host, model) {
  host.replaceChildren();
  model.runs.forEach(function (run) {
    var cap = document.createElement('h4'); cap.textContent = run.title; cap.style.margin = '12px 0 4px'; host.appendChild(cap);
    var t = document.createElement('table'), hr = t.createTHead().insertRow();
    ['구분', '항목', '기준', '결과', '판정'].forEach(function (x) { var th = document.createElement('th'); th.textContent = x; hr.appendChild(th); });
    var body = t.createTBody(), last = null, lastCell = null;
    model.bricks.forEach(function (b) {                 // 블록 하나 = 줄 하나 (기준정보가 늘면 블록이 늘어난다)
      var tr = body.insertRow(), v = run.values[b.id];
      if (b.group === last && lastCell) lastCell.rowSpan += 1;       // 같은 구분이 이어지면 세로로 합침
      else { lastCell = tr.insertCell(); lastCell.textContent = b.group; last = b.group; }
      tr.insertCell().textContent = b.item;
      if (v === undefined || v === null) {                           // 조건: 해당 없음 → 기준·결과·판정 칸을 하나로 합침
        var c = tr.insertCell(); c.colSpan = 3; c.textContent = '해당 없음'; c.style.textAlign = 'center';
      } else if (b.noSpec) {                                         // 조건: 기준이 없는 항목 → 기준·결과를 합침
        var c2 = tr.insertCell(); c2.colSpan = 2; c2.textContent = v; tr.insertCell().textContent = '-';
      } else {
        tr.insertCell().textContent = b.spec; tr.insertCell().textContent = v;
        tr.insertCell().textContent = b.judge ? b.judge(v) : '적합';
      }
    });
    host.appendChild(t);
  });
}
var B1 = [
  { id: 'look', group: '물리', item: '성상', spec: '흰색 분말' },
  { id: 'water', group: '물리', item: '수분', spec: '2.0% 이하' },
  { id: 'assay', group: '화학', item: '함량', spec: '98.0 ~ 102.0%' },
  { id: 'imp', group: '화학', item: '유연물질', spec: '0.5% 이하' },
  { id: 'note', group: '기타', item: '특이 사항', noSpec: true } ];
var M1 = { bricks: B1, runs: [
  { title: '1회차 (오전)', values: { look: '흰색 분말', water: '1.2%', assay: '99.6%', imp: '0.1%', note: '없음' } },
  { title: '2회차 (오후)', values: { look: '흰색 분말', water: '1.3%', assay: '99.4%', imp: '0.1%', note: '없음' } } ] };
function makeM2() {
  var B2 = B1.slice(); B2[1] = { id: 'water', group: '물리', item: '수분', spec: '1.5% 이하' };
  B2.splice(2, 0, { id: 'size', group: '물리', item: '입도', spec: '90% 이상' });          // 기준정보 추가 → 블록 하나 더
  return { bricks: B2, runs: [
    { title: '1회차 (오전)', values: { look: '흰색 분말', water: '1.2%', size: '94%', assay: '99.6%', imp: '0.1%', note: '없음' } },
    { title: '재시험', values: { look: '흰색 분말', water: '1.1%', size: '95%', assay: '99.9%', imp: null, note: '수분 재측정' } },   // 실행 데이터 추가 → 표가 한 번 더 (가운데)
    { title: '2회차 (오후)', values: { look: '흰색 분말', water: '1.3%', size: '93%', assay: '99.4%', imp: null, note: '없음' } } ] };   // 유연물질: 해당 없음 → 칸 합침
}
`;
const bricks = `${head('블록 표', DESK)}<body><div id="desk"><div id="left"><div class="doc"><h3>시험 기록</h3><div class="grid"></div><p>끝.</p></div></div><div id="right"><div class="doc"><h3>시험 기록</h3><div class="grid"></div><p>끝.</p></div></div></div>${SDK}
<script>${BRICK_JS}
window.M1 = M1; window.makeM2 = makeM2; window.drawSheet = drawSheet;
window.ctrl = SgCompare.createCompare({ left, right, leftScroller: desk, rightScroller: desk, watch: true, debounce: 100 });
setTimeout(function () { drawSheet(document.querySelector('#left .grid'), M1); }, 200);
setTimeout(function () { drawSheet(document.querySelector('#right .grid'), makeM2()); }, 350);
</script></body></html>`;

export const PAGES = { bricks, jsontable, basic, viewer, legacy, portal, inner, widgets, blank, pages, hidden, tables };
