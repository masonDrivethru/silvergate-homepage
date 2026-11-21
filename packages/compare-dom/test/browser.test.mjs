// 브라우저 자동 테스트: 납품 파일(dist/sg-compare.min.js)을 실제 브라우저에서 돌려 본다.
//   npm run test:browser -w @silvergate/compare-dom        (전체)
//   node test/browser.test.mjs legacy iframe               (이름에 이 글자가 든 것만)
// 준비: playwright 가 필요하다 →  npm i -D playwright && npx playwright install chromium
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PAGES } from './fixtures.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(here, '..');
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { try { ({ chromium } = (await import('node:module')).createRequire(import.meta.url)('playwright')); } catch {} }
if (!chromium) { console.error('playwright 가 없습니다:  npm i -D playwright && npx playwright install chromium'); process.exit(2); }

// ---------- 서버: /t/이름 = 테스트 화면, 나머지 = 패키지 파일 ----------
const TYPES = { '.js': 'text/javascript', '.html': 'text/html; charset=utf-8', '.css': 'text/css' };
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const name = decodeURIComponent(url.pathname);
  if (name.startsWith('/t/')) {
    const page = PAGES[name.slice(3)];
    if (!page) { res.statusCode = 404; return res.end('없음'); }
    res.setHeader('content-type', 'text/html; charset=utf-8');
    return res.end(typeof page === 'function' ? page(url.searchParams) : page);
  }
  try {
    const f = path.join(pkgRoot, name);
    if (!f.startsWith(pkgRoot)) throw new Error('밖');
    const data = await readFile(f);
    res.setHeader('content-type', TYPES[path.extname(f)] ?? 'application/octet-stream');
    res.end(data);
  } catch { res.statusCode = 404; res.end('없음'); }
});
await new Promise((r) => server.listen(0, r));
const PORT = server.address().port;
const BASE = `http://localhost:${PORT}`;
// 다른 도메인 흉내 (같은 서버, 다른 호스트 이름)
const OTHER = `http://127.0.0.1:${PORT}`;

const only = process.argv.slice(2);
const results = [];
const browser = await chromium.launch();

async function test(name, fn) {
  if (only.length && !only.some((o) => name.includes(o))) return;
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  const checks = [];
  const check = (what, ok, detail = '') => checks.push({ what, ok: !!ok, detail });
  const t0 = Date.now();
  try {
    await fn(page, check);
    check('화면 오류 없음', errs.length === 0, errs.join(' | '));
  } catch (e) { check('실행', false, String(e?.message ?? e).split('\n')[0]); }
  await page.close();
  const bad = checks.filter((c) => !c.ok);
  results.push({ name, ok: !bad.length });
  console.log(`${bad.length ? '✘' : '✔'} ${name}  (${checks.length - bad.length}/${checks.length}, ${Date.now() - t0}ms)`);
  for (const c of bad) console.log(`    ✘ ${c.what}${c.detail ? ' — ' + c.detail : ''}`);
}

/** 비교가 끝날 때까지 기다리고 요약을 돌려준다 (화면의 window.ctrl) */
const done = (page, extra = '') => page.evaluate(`(async () => {
  const c = window.ctrl ?? await window.ready;
  window.ctrl = c;
  for (let i = 0; i < 600 && (c.running || !c.timing); i++) await new Promise((r) => setTimeout(r, 25));
  await new Promise((r) => setTimeout(r, 150));
  return { stats: c.stats, n: c.changes.length, error: c.error ? String(c.error.message ?? c.error) : null, worker: c.timing?.worker, types: c.changes.map((x) => x.type + ':' + x.what) ${extra} };
})()`);

/** i 번째 변경으로 가서 목표와의 차이(px)와 걸린 시간 */
const jump = (page, i, deskSel) => page.evaluate(async ([i, deskSel]) => {
  const c = window.ctrl;
  const t0 = performance.now();
  await c.goTo(i);
  const ms = Math.round(performance.now() - t0);
  await new Promise((r) => setTimeout(r, 120));
  const desk = deskSel ? document.querySelector(deskSel) : null;
  const ch = c.changes[((i % c.changes.length) + c.changes.length) % c.changes.length];
  const node = ch.right ?? ch.left;
  const el = node.nodeType === 1 ? node : node.parentElement;
  // 화면(맨 바깥 창) 기준 위치
  let top = el.getBoundingClientRect().top;
  for (let w = el.ownerDocument.defaultView; w !== window && w.frameElement; w = w.parent) top += w.frameElement.getBoundingClientRect().top;
  const viewTop = desk ? desk.getBoundingClientRect().top : 0, viewH = desk ? desk.clientHeight : innerHeight;
  // 문서 맨 끝·맨 처음이라 더 못 가는 경우는 30% 높이가 아니어도 정상
  const atEdge = desk ? desk.scrollTop <= 1 || desk.scrollTop >= desk.scrollHeight - desk.clientHeight - 1 : false;
  return { ms, inView: top >= viewTop - 2 && top <= viewTop + viewH, top: Math.round(top - viewTop), viewH, atEdge };
}, [i, deskSel]);

// =====================================================================
await test('기본: 같은 화면 안의 두 문서 (추가·수정·삭제, 높이 맞춤)', async (page, check) => {
  await page.goto(`${BASE}/t/basic`);
  const r = await done(page);
  check('오류 없음', !r.error, r.error);
  check('추가 2 · 수정 3 · 삭제 1', r.stats.added === 2 && r.stats.modified === 3 && r.stats.deleted === 1, JSON.stringify(r.stats));
  const g = await page.evaluate(() => ({
    hL: document.getElementById('left').offsetHeight, hR: document.getElementById('right').offsetHeight,
    spacers: document.querySelectorAll('.sgc-spacer').length,
    rowTops: ['A', 'C'].map((k) => document.querySelector(`#left [data-sgc-key="${k}"]`).getBoundingClientRect().top - document.querySelector(`#right [data-sgc-key="${k}"]`).getBoundingClientRect().top),
    staticRanges: [...CSS.highlights.values()].every((h) => [...h].every((x) => x instanceof StaticRange)),
    ranges: [...CSS.highlights.values()].reduce((a, h) => a + h.size, 0),
  }));
  check('좌우 높이 같음', g.hL === g.hR, `${g.hL} / ${g.hR}`);
  check('빈 칸 3개', g.spacers === 3, String(g.spacers));
  check('같은 줄이 같은 높이에', g.rowTops.every((d) => Math.abs(d) < 1), g.rowTops.join(','));
  check('글자 표시는 고정형(StaticRange)', g.staticRanges && g.ranges > 0, `ranges ${g.ranges}`);
  await page.evaluate(() => window.ctrl.destroy());
  const after = await page.evaluate(() => ({ spacers: document.querySelectorAll('.sgc-spacer').length, marks: document.querySelectorAll('[data-sgc]').length, hl: CSS.highlights.size, same: document.getElementById('left').innerHTML === window.__left0 && document.getElementById('right').innerHTML === window.__right0 }));
  check('정리(destroy) 후 원본 그대로', after.spacers === 0 && after.marks === 0 && after.hl === 0 && after.same, JSON.stringify(after));
});

await test('옛날식 서버 화면(JSP): doctype 없음 · 표 레이아웃 · font/center · 주소 두 개', async (page, check) => {
  await page.goto(`${BASE}/t/viewer?l=legacy&lv=1&r=legacy&rv=2`);
  const r = await done(page, `, quirks: [...document.querySelectorAll('iframe.sgc-frame--fit')].map((f) => f.contentDocument.compatMode), heights: [...document.querySelectorAll('iframe.sgc-frame--fit')].map((f) => f.offsetHeight)`);
  check('오류 없음', !r.error, r.error);
  check('호환 모드(doctype 없음) 화면', r.quirks.every((q) => q === 'BackCompat'), r.quirks.join(','));
  check('변경 찾음 (수정·추가·삭제 모두)', r.stats.modified >= 2 && r.stats.added >= 1 && r.stats.deleted >= 1, JSON.stringify(r.stats));
  check('rowspan 이 바뀐 칸은 병합 수정으로', r.types.some((t) => t.startsWith('modified')), r.types.join(' '));
  check('양쪽 화면 높이 같음', Math.abs(r.heights[0] - r.heights[1]) <= 1, r.heights.join(' / '));
  for (const i of [0, r.n - 1]) { const j = await jump(page, i, '.sgc-shared'); check(`#${i + 1} 변경으로 이동해 화면 안에`, j.inView, JSON.stringify(j)); }
  // 한 장 보기: 스크립트가 다시 실행되지 않고, 호환 모드 유지
  await page.evaluate(() => window.viewer.setMode('redline'));
  await page.waitForTimeout(600);
  const x = await page.evaluate(() => { const f = [...document.querySelectorAll('iframe.sgc-frame')].find((f) => !f.classList.contains('sgc-frame--fit')); const d = f.contentDocument; return { mode: d.compatMode, del: d.querySelectorAll('del.sgc-del,[data-sgc="deleted"]').length, ins: d.querySelectorAll('ins.sgc-ins,[data-sgc="added"]').length, scripts: d.querySelectorAll('script').length, ran: f.contentWindow.__ran ?? 0 }; });
  check('한 장 보기: 삭제·추가 표시', x.del > 0 && x.ins > 0, JSON.stringify(x));
  check('한 장 보기: 스크립트를 가져오지 않음', x.ran === 0, JSON.stringify(x));
  check('한 장 보기: 같은 호환 모드', x.mode === 'BackCompat', x.mode);
});

await test('문서 안에 iframe 이 든 화면 (iframe 안쪽 내용도 비교)', async (page, check) => {
  await page.goto(`${BASE}/t/viewer?l=portal&lv=1&r=portal&rv=2`);
  const r = await done(page);
  check('오류 없음', !r.error, r.error);
  check('바깥 1건 + iframe 안쪽 변경 찾음', r.n >= 3, JSON.stringify(r.stats));
  const g = await page.evaluate(() => {
    const c = window.ctrl;
    const inner = c.changes.filter((x) => (x.right ?? x.left).ownerDocument !== (c.changes[0].right ?? c.changes[0].left).ownerDocument || (x.right ?? x.left).ownerDocument.defaultView.frameElement?.id === 'inner');
    const d = document.querySelectorAll('iframe.sgc-frame--fit')[1].contentDocument.getElementById('inner').contentDocument;
    return { inner: inner.length, css: !!d.getElementById('sgc-mark-style'), marks: d.querySelectorAll('[data-sgc]').length + (d.defaultView.CSS.highlights?.size ?? 0), idx: c.changes.findIndex((x) => (x.right ?? x.left).ownerDocument === d) , last: c.changes.map((x, i) => [(x.right ?? x.left).ownerDocument === d, i]).filter((x) => x[0]).pop()?.[1] };
  });
  check('iframe 안쪽 문서에 표시', g.css && g.marks > 0, JSON.stringify(g));
  const j = await jump(page, g.last, '.sgc-shared');
  check('iframe 안쪽 아래에 있는 변경으로 이동 (안쪽 스크롤까지)', j.inView, JSON.stringify(j));
  const vis = await page.evaluate((i) => { const c = window.ctrl.changes[i]; const n = c.right ?? c.left; const el = n.nodeType === 1 ? n : n.parentElement; const w = el.ownerDocument.defaultView; const t = el.getBoundingClientRect().top; return t >= 0 && t <= w.innerHeight; }, g.last);
  check('안쪽 iframe 창 안에서도 보임', vis);
  await page.evaluate(() => window.viewer.setMode('redline'));
  await page.waitForTimeout(500);
  const x = await page.evaluate(() => { const f = [...document.querySelectorAll('iframe.sgc-frame')].find((f) => !f.classList.contains('sgc-frame--fit')); const d = f.contentDocument; return { frameBox: d.querySelectorAll('[data-sgc-frame]').length, marks: d.querySelectorAll('[data-sgc-frame] del, [data-sgc-frame] ins, [data-sgc-frame] [data-sgc]').length }; });
  check('한 장 보기에도 iframe 안쪽 변경', x.frameBox === 1 && x.marks > 0, JSON.stringify(x));
});

await test('웹 컴포넌트(열린 shadow DOM) · SVG 글자 · 입력칸 값', async (page, check) => {
  await page.goto(`${BASE}/t/widgets`);
  const r = await done(page, `, texts: c.changes.map((x) => (x.text.diffs ?? []).map((d) => d[1]).join('') + '|' + (x.text.attr ?? '') + '|' + (x.text.after ?? ''))`);
  check('오류 없음', !r.error, r.error);
  const all = r.texts.join('\n');
  check('shadow DOM 안 글자 수정', /합격/.test(all), all);
  check('SVG 글자 수정', /압력/.test(all), all);
  check('입력칸 값(input)', /25/.test(all), all);
  check('체크박스', /on|off/.test(all), all);
  check('선택 상자(select)', /2등급/.test(all), all);
  check('여러 줄 입력(textarea)', /재시험/.test(all), all);
  // 입력을 바꾸면 자동으로 다시 비교
  const n0 = r.n;
  await page.evaluate(() => { const i = document.querySelector('#right input[type=text]'); i.value = '20'; i.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(700);
  const n1 = await page.evaluate(() => window.ctrl.changes.length);
  check('입력값을 되돌리면 변경이 하나 줄어듦 (자동 다시 비교)', n1 === n0 - 1, `${n0} → ${n1}`);
});

await test('보안: 주소 검사 · 문서 내용이 코드로 실행되지 않음', async (page, check) => {
  await page.goto(`${BASE}/t/blank`);
  const r = await page.evaluate(async (other) => {
    const out = {};
    const tryUrl = (url) => { const host = document.createElement('div'); document.body.appendChild(host); try { SgCompare.mountViewer(host, { left: { url }, right: { html: '<p>a</p>' } }); return 'ok'; } catch (e) { return 'blocked'; } finally { host.remove(); } };
    window.__x = 0;
    out.js = tryUrl('javascript:parent.__x=1');
    out.data = tryUrl('data:text/html,<script>parent.__x=2</scr' + 'ipt>');
    out.cross = tryUrl(other + '/t/legacy?v=1');
    out.same = tryUrl('/t/legacy?v=1');
    await new Promise((r) => setTimeout(r, 500));
    out.ran = window.__x;
    // 문서 내용에 든 태그가 변경 목록에서 실행되지 않는지
    const L = document.createElement('div'), R = document.createElement('div'), list = document.createElement('div');
    L.innerHTML = '<p>값 &lt;img src=x onerror="window.__x=9"&gt; 하나</p>'; R.innerHTML = '<p>값 &lt;img src=x onerror="window.__x=9"&gt; 둘</p>';
    document.body.append(L, R, list);
    const c = SgCompare.createCompare({ left: L, right: R });
    SgCompare.mountChangeList(list, c);
    for (let i = 0; i < 200 && !c.timing; i++) await new Promise((r) => setTimeout(r, 20));
    await new Promise((r) => setTimeout(r, 300));
    out.listImgs = list.querySelectorAll('img').length; out.ran2 = window.__x; out.n = c.changes.length;
    return out;
  }, OTHER);
  check('javascript: 주소 거부', r.js === 'blocked' && r.ran === 0, JSON.stringify(r));
  check('data: 주소 거부', r.data === 'blocked');
  check('다른 도메인 주소는 미리 알려 줌', r.cross === 'blocked');
  check('같은 도메인 주소는 허용', r.same === 'ok');
  check('변경 목록에 문서 내용이 글자로만 들어감', r.listImgs === 0 && r.ran2 === 0 && r.n === 1, JSON.stringify(r));
});

await test('쪽 건너뛰기 옵션 (고객 CSS 에 없을 때 모듈이 적용) + 되돌리기', async (page, check) => {
  await page.goto(`${BASE}/t/pages?n=120&cv=0&virt=1`);
  const before = await page.evaluate(() => ({ sh: document.getElementById('desk').scrollHeight }));
  await page.evaluate(() => window.start());
  const r = await done(page);
  check('오류 없음', !r.error, r.error);
  const g = await page.evaluate(() => { const ps = [...document.querySelectorAll('#left .page')]; return { on: ps.filter((p) => getComputedStyle(p).contentVisibility === 'auto').length, n: ps.length, sh: document.getElementById('desk').scrollHeight, hL: document.getElementById('left').offsetHeight, hR: document.getElementById('right').offsetHeight }; });
  check('모든 쪽에 적용', g.on === g.n && g.n === 120, `${g.on}/${g.n}`);
  check('좌우 높이 같음', Math.abs(g.hL - g.hR) < 1, `${g.hL} / ${g.hR}`);
  for (const i of [r.n - 1, Math.floor(r.n / 2), 0]) { const j = await jump(page, i, '#desk'); check(`#${i + 1} 로 이동: 화면 30% 높이 근처`, j.inView && (j.atEdge || Math.abs(j.top - j.viewH * 0.3) < 60), JSON.stringify(j)); }
  await page.evaluate(() => window.ctrl.destroy());
  const a = await page.evaluate(() => ({ on: [...document.querySelectorAll('.page')].filter((p) => p.style.contentVisibility || p.style.containIntrinsicSize).length, sh: document.getElementById('desk').scrollHeight }));
  check('정리 후 원래대로', a.on === 0 && Math.abs(a.sh - before.sh) < 2, JSON.stringify({ a, before }));
});

await test('쪽 건너뛰기: 모양이 달라지는 화면이면 스스로 되돌림', async (page, check) => {
  await page.goto(`${BASE}/t/pages?n=40&cv=0&collapse=1&virt=1`);
  const before = await page.evaluate(() => document.getElementById('desk').scrollHeight);
  await page.evaluate(() => window.start());
  const r = await done(page);
  const g = await page.evaluate(() => ({ on: [...document.querySelectorAll('.page')].filter((p) => p.style.contentVisibility).length, sh: document.getElementById('desk').scrollHeight, sp: [...document.querySelectorAll('.sgc-spacer')].reduce((a, s) => a + s.offsetHeight, 0) }));
  check('오류 없음', !r.error, r.error);
  check('문서 모양(전체 높이)이 달라지지 않음', g.on === 0 ? true : Math.abs(g.sh - g.sp / 2 - before) < 40, JSON.stringify({ g, before }));
});

await test('큰 문서 1,000쪽: 시간 · 멀리 이동 정확도', async (page, check) => {
  await page.goto(`${BASE}/t/pages?n=1000&cv=1`);
  await page.evaluate(() => window.start());
  const r = await done(page, `, timing: c.timing`);
  check('오류 없음', !r.error, r.error);
  check('백그라운드 계산 사용', r.worker === true);
  check(`비교 5초 안 (${Math.round(r.timing.total)}ms)`, r.timing.total < 5000);
  check('변경 수백 건', r.n > 300, String(r.n));
  let worst = 0, miss = 0;
  for (const i of [r.n - 1, 3, Math.floor(r.n * 0.6), r.n - 5, Math.floor(r.n * 0.2)]) {
    const j = await jump(page, i, '#desk');
    worst = Math.max(worst, j.ms);
    if (!(j.inView && (j.atEdge || Math.abs(j.top - j.viewH * 0.3) < 40))) miss++;
  }
  check('5번 이동 모두 정확', miss === 0, `빗나감 ${miss}`);
  check(`이동 2초 안 (가장 오래 ${worst}ms)`, worst < 2000);
});

await test('변경점으로 흘러가기: 멀어도 한 번에, 거꾸로 가거나 튀지 않게', async (page, check) => {
  await page.goto(`${BASE}/t/pages?n=1000&cv=1`);
  await page.evaluate(() => window.start());
  const r0 = await done(page);
  const fly = (k) => page.evaluate(async (k) => {
    const c = window.ctrl, ys = [], ts = [];
    let on = true;
    const tick = (now) => { ys.push(desk.scrollTop); ts.push(now); if (on) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    const t0 = performance.now();
    await c.goTo(k);
    const ms = Math.round(performance.now() - t0);
    on = false;
    const dir = Math.sign(ys.at(-1) - ys[0]) || 1;
    let back = 0, moving = 0, bigStepsNearEnd = 0;
    for (let i = 1; i < ys.length; i++) { const d = (ys[i] - ys[i - 1]) * dir; if (d < -1) back++; if (d > 0) moving++; }
    // 도착 직전 8프레임: 한 프레임에 화면 절반 넘게 튀면 안 됨 (천천히 멈춰야 함)
    const lastMove = ys.findLastIndex((v, i) => i > 0 && v !== ys[i - 1]);
    for (let i = Math.max(1, lastMove - 7); i <= lastMove; i++) if (Math.abs(ys[i] - ys[i - 1]) > desk.clientHeight * 0.5) bigStepsNearEnd++;
    const flash = !!document.querySelector('[data-sgc-focus]');
    return { ms, dist: Math.round(Math.abs(ys.at(-1) - ys[0])), back, moving, bigStepsNearEnd, flash };
  }, k);
  for (const [name, k] of [['맨 끝으로', r0.n - 1], ['맨 처음으로', 0], ['바로 옆으로', 1], ['가운데로', Math.floor(r0.n / 2)]]) {
    const f = await fly(k);
    check(`${name}: 1.5초 안에 도착 (${f.ms}ms, ${f.dist}px)`, f.ms < 1500, JSON.stringify(f));
    check(`${name}: 거꾸로 가지 않음`, f.back === 0, JSON.stringify(f));
    check(`${name}: 여러 프레임에 걸쳐 흘러감`, f.moving >= 8, JSON.stringify(f));
    check(`${name}: 도착 직전에 튀지 않음`, f.bigStepsNearEnd === 0, JSON.stringify(f));
    check(`${name}: 도착하면 반짝`, f.flash, JSON.stringify(f));
  }
});

await test('연속 다시 비교: 앞 비교는 취소되고 마지막 결과만', async (page, check) => {
  await page.goto(`${BASE}/t/pages?n=300&cv=1`);
  await page.evaluate(() => window.start());
  await done(page);
  const r = await page.evaluate(async () => {
    const c = window.ctrl; let updates = 0; c.on('update', () => updates++);
    const p = document.querySelector('#right .page p');
    const t0 = performance.now();
    for (let i = 0; i < 6; i++) { p.textContent = '연속 수정 ' + i; c.run(); await new Promise((r) => setTimeout(r, 30)); }
    for (let i = 0; i < 400 && (c.running || !updates); i++) await new Promise((r) => setTimeout(r, 25));
    await new Promise((r) => setTimeout(r, 300));
    return { updates, ms: Math.round(performance.now() - t0), has: c.changes.some((x) => (x.text.diffs ?? []).some((d) => /연속 수정 5|5/.test(d[1]))), error: c.error ? String(c.error) : null };
  });
  check('오류 없음', !r.error, r.error);
  check('결과는 한 번만 (마지막 것)', r.updates === 1, JSON.stringify(r));
  check('마지막 내용이 반영됨', r.has, JSON.stringify(r));
});

await test('따로 스크롤(split) · 창 스크롤 화면', async (page, check) => {
  await page.goto(`${BASE}/t/viewer?l=legacy&lv=1&r=legacy&rv=2&layout=split&long=1`);
  const r = await done(page);
  check('오류 없음', !r.error, r.error);
  const s = await page.evaluate(async () => {
    const [a, b] = [...document.querySelectorAll('iframe.sgc-frame')].slice(0, 2).map((f) => f.contentWindow);
    b.scrollTo(0, 1500); await new Promise((r) => setTimeout(r, 500));
    return { a: a.scrollY, b: b.scrollY };
  });
  check('한쪽을 스크롤하면 반대쪽도 따라옴', s.a > 800, JSON.stringify(s));
  const j = await page.evaluate(async () => { const c = window.ctrl; await c.goTo(c.changes.length - 1); await new Promise((r) => setTimeout(r, 300)); const n = c.changes.at(-1).right ?? c.changes.at(-1).left; const el = n.nodeType === 1 ? n : n.parentElement; const t = el.getBoundingClientRect().top; return t >= 0 && t <= el.ownerDocument.defaultView.innerHeight; });
  check('마지막 변경으로 이동', j);
});

await test('눈에 안 보이는 영역 빼기 (visibleOnly) · F7 단축키 범위', async (page, check) => {
  await page.goto(`${BASE}/t/hidden`);
  const r = await page.evaluate(async () => {
    const wait = async (c) => { for (let i = 0; i < 200 && !c.timing; i++) await new Promise((r) => setTimeout(r, 20)); return c.changes.length; };
    const L = document.getElementById('left'), R = document.getElementById('right');
    const a = SgCompare.createCompare({ left: L, right: R, align: false }); const all = await wait(a); a.destroy();
    const b = SgCompare.createCompare({ left: L, right: R, align: false, visibleOnly: true }); const vis = await wait(b);
    // 비교 창 두 개 + F7
    const mk = () => { const host = document.createElement('div'); document.body.appendChild(host); const lay = SgCompare.mountLayout(host, { height: '200px' }); lay.left.innerHTML = '<p>가</p><p>나</p>'; lay.right.innerHTML = '<p>가1</p><p>나1</p>'; const c = SgCompare.createCompare({ left: lay.left, right: lay.right, leftScroller: lay.desk, rightScroller: lay.desk }); lay.attach(c); return { c, lay }; };
    const v1 = mk(), v2 = mk(); await wait(v1.c); await wait(v2.c);
    v2.lay.desk.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'F7', bubbles: true }));
    await new Promise((r) => setTimeout(r, 400));
    return { all, vis, cur1: v1.c.current, cur2: v2.c.current };
  });
  check('기본은 숨긴 영역도 비교 (2건)', r.all === 2, String(r.all));
  check('visibleOnly 면 보이는 것만 (1건)', r.vis === 1, String(r.vis));
  check('F7 은 초점이 든 비교 창만 움직임', r.cur1 === -1 && r.cur2 === 0, JSON.stringify(r));
});

await test('복잡한 표: 병합 · 열 추가 · 줄 순서 바뀜', async (page, check) => {
  await page.goto(`${BASE}/t/tables`);
  const r = await done(page, `, cols: c.changes.filter((x) => x.what === 'column').map((x) => x.count)`);
  check('오류 없음', !r.error, r.error);
  check('열 추가는 한 건으로 묶임', r.cols.length === 1 && r.cols[0] >= 3, JSON.stringify(r.cols));
  check('줄 순서 바뀜은 이동으로', r.stats.moved >= 1, JSON.stringify(r.stats));
  check('병합(rowspan) 바뀜은 수정으로', r.types.some((t) => t === 'modified:attr' || t === 'modified:text'), r.types.join(' '));
  const g = await page.evaluate(() => { const a = document.querySelectorAll('#left table'), b = document.querySelectorAll('#right table'); return [...a].map((t, i) => Math.abs(t.offsetHeight - b[i].offsetHeight)); });
  check('표 높이 좌우 같음', g.every((d) => d <= 1), g.join(','));
});

await test('JSON 으로 표를 그리는 바닐라 JS 컴포넌트 (늦게 그림 · 통째로 다시 그림 · 키 없음)', async (page, check) => {
  await page.goto(`${BASE}/t/jsontable`);
  await page.waitForTimeout(1200);
  const r = await done(page, `, cols: c.changes.filter((x) => x.what === 'column').map((x) => x.count), texts: c.changes.map((x) => x.type + ':' + (x.text.diffs ?? []).map((d) => d[1]).join('') + (x.text.context ?? '') + (x.text.attr ?? ''))`);
  check('오류 없음', !r.error, r.error);
  const all = r.texts.join(' | ');
  check('표가 늦게 그려져도 자동으로 비교됨', r.n > 0, String(r.n));
  check('열 추가(시험자)는 한 건으로', r.cols.length === 1, JSON.stringify(r.cols) + ' ' + all);
  check('칸 값 수정 (기준 2.0 → 1.5, 결과 99.6 → 99.8)', /1\.|2\.0/.test(all) && /99\./.test(all), all);
  check('줄 추가(입도) · 줄 삭제(유연물질)', r.stats.added >= 1 && r.stats.deleted >= 1, JSON.stringify(r.stats) + ' ' + all);
  check('병합(rowspan) 바뀜', /rowspan|병합/.test(all), all);
  const h = await page.evaluate(() => [document.querySelector('#left table').offsetHeight, document.querySelector('#right table').offsetHeight, document.getElementById('left').offsetHeight, document.getElementById('right').offsetHeight]);
  check('표·문서 높이 좌우 같음', Math.abs(h[0] - h[1]) <= 1 && Math.abs(h[2] - h[3]) <= 1, h.join(','));
  // 데이터가 바뀌어 컴포넌트가 표를 통째로 다시 그림 → 자동으로 다시 비교, 옛 표시·빈 칸은 남지 않음
  const again = await page.evaluate(async () => {
    const c = window.ctrl; let updates = 0; c.on('update', () => updates++);
    const d = JSON.parse(JSON.stringify(window.v2)); d.rows[3].val = '100.1%';
    window.drawTable(document.querySelector('#right .grid'), d);
    for (let i = 0; i < 100 && !updates; i++) await new Promise((r) => setTimeout(r, 25));
    await new Promise((r) => setTimeout(r, 300));
    return { updates, has: c.changes.some((x) => (x.text.diffs ?? []).some((p) => /100/.test(p[1]))), spacersL: document.querySelectorAll('#left .sgc-spacer').length, spacersR: document.querySelectorAll('#right .sgc-spacer').length, hL: document.getElementById('left').offsetHeight, hR: document.getElementById('right').offsetHeight, error: c.error ? String(c.error) : null };
  });
  check('다시 그리면 자동으로 다시 비교', again.updates >= 1 && again.has && !again.error, JSON.stringify(again));
  check('다시 그린 뒤에도 높이 같음', Math.abs(again.hL - again.hR) <= 1, JSON.stringify(again));
  // 같은 데이터로 양쪽을 그리면 변경 없음
  const same = await page.evaluate(async () => { window.drawTable(document.querySelector('#right .grid'), window.v1); await new Promise((r) => setTimeout(r, 700)); return { n: window.ctrl.changes.length, spacers: document.querySelectorAll('.sgc-spacer').length, marks: document.querySelectorAll('[data-sgc]').length }; });
  check('양쪽이 같아지면 변경 0건, 표시·빈 칸 없음', same.n === 0 && same.spacers === 0 && same.marks === 0, JSON.stringify(same));
});

await browser.close();
server.close();
const bad = results.filter((r) => !r.ok);
console.log(`\n${results.length - bad.length} / ${results.length} 통과`);
process.exit(bad.length ? 1 : 0);
