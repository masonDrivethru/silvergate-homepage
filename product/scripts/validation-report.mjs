// 검증 보고서 만들기: 브라우저 자동 테스트를 돌리고 결과를 사람이 읽는 HTML 문서로.
//   node product/scripts/validation-report.mjs [출력 파일]      (기본: release/검증보고서.html)
// 고객사 컴퓨터 검증(IQ/OQ)용으로도 같은 명령을 그 환경에서 돌리면 된다 (playwright 필요)
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const out = path.resolve(process.argv[2] ?? path.join(root, 'release', '검증보고서.html'));
const tmp = path.join(os.tmpdir(), `sgc-validation-${process.pid}.json`);
let code = 0;
try { execFileSync(process.execPath, [path.join(root, 'packages/compare-dom/test/browser.test.mjs'), '--json', tmp], { stdio: 'inherit' }); }
catch (e) { code = e.status ?? 1; }
let r;
try { r = JSON.parse(readFileSync(tmp, 'utf8')); } catch { console.error('테스트 결과를 읽지 못했습니다 (playwright 설치 확인)'); process.exit(2); }
rmSync(tmp, { force: true });

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const nTests = r.results.length, okTests = r.results.filter((x) => x.ok).length;
const nChecks = r.results.reduce((a, x) => a + x.checks.length, 0), okChecks = r.results.reduce((a, x) => a + x.checks.filter((c) => c.ok).length, 0);
const pass = okTests === nTests;
const when = new Date(r.date).toLocaleString('ko-KR', { hour12: false });
const body = r.results.map((t, i) => `
<section class="case ${t.ok ? 'ok' : 'ng'}"><h3><span class="no">TC-${String(i + 1).padStart(2, '0')}</span> ${esc(t.name)} <span class="res">${t.ok ? '적합' : '부적합'}</span></h3>
<table><thead><tr><th style="width:56px">번호</th><th>확인 항목 (기대 결과)</th><th style="width:72px">결과</th><th style="width:34%">실제 값</th></tr></thead><tbody>
${t.checks.map((c, k) => `<tr><td>${i + 1}.${k + 1}</td><td>${esc(c.what)}</td><td class="${c.ok ? 'p' : 'f'}">${c.ok ? '적합' : '부적합'}</td><td class="d">${esc(c.detail).slice(0, 400)}</td></tr>`).join('')}
</tbody></table><p class="ms">소요 ${(t.ms / 1000).toFixed(1)}초</p></section>`).join('');
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>SilverBio Compare 검증 보고서</title>
<style>
body{margin:0;background:#f4f5f7;color:#1b2130;font:13px/1.55 "Noto Sans KR","Malgun Gothic",system-ui,sans-serif}
.page{max-width:1000px;margin:24px auto;background:#fff;padding:40px 44px;box-shadow:0 1px 3px rgba(0,0,0,.12)}
h1{margin:0;font-size:22px}h2{font-size:16px;margin:28px 0 8px;border-bottom:1.5px solid #1b2130;padding-bottom:4px}
.sub{color:#5b6474;margin:4px 0 18px}
.meta{display:grid;grid-template-columns:repeat(3,1fr);border:1px solid #d3d8df}.meta div{padding:8px 12px;border-left:1px solid #d3d8df;border-top:1px solid #d3d8df}
.meta div:nth-child(3n+1){border-left:0}.meta div:nth-child(-n+3){border-top:0}.meta dt{font-size:11px;color:#5b6474}.meta dd{margin:0;font-weight:600}
.verdict{margin:16px 0;padding:12px 16px;border-radius:6px;font-weight:700;font-size:15px}.verdict.ok{background:#dcfce7;color:#14532d}.verdict.ng{background:#fee2e2;color:#7f1d1d}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #d3d8df;padding:5px 8px;text-align:left;vertical-align:top}th{background:#eff1f4;font-size:12px;color:#5b6474}
td.p{color:#15803d;font-weight:700}td.f{color:#b91c1c;font-weight:700}td.d{font-size:11px;color:#5b6474;overflow-wrap:anywhere}
.case{margin:18px 0;break-inside:avoid-page}.case h3{font-size:14px;margin:0 0 6px;display:flex;gap:8px;align-items:baseline}.no{color:#5b6474;font-variant-numeric:tabular-nums}
.res{margin-left:auto;font-size:12px;padding:1px 8px;border-radius:4px}.ok .res{background:#dcfce7;color:#15803d}.ng .res{background:#fee2e2;color:#b91c1c}
.ms{margin:4px 0 0;font-size:11px;color:#5b6474;text-align:right}
.sum td:nth-child(n+2){text-align:right;font-variant-numeric:tabular-nums}
.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:36px}.sign div{border-top:1px solid #1b2130;padding-top:6px;font-size:11px;color:#5b6474;height:56px}
ol{margin:0;padding-left:20px}
@media print{body{background:#fff}.page{box-shadow:none;margin:0;max-width:none;padding:0}}
</style></head><body><div class="page">
<h1>SilverBio Compare 검증 보고서</h1>
<p class="sub">브라우저 자동 테스트 결과 · 문서 번호 SGC-VR-${esc(r.sdk)} · (주)실버게이트</p>
<dl class="meta">
<div><dt>대상</dt><dd>SilverBio Compare SDK ${esc(r.sdk)}</dd></div>
<div><dt>실행 일시</dt><dd>${esc(when)}</dd></div>
<div><dt>판정</dt><dd>${pass ? '적합' : '부적합'}</dd></div>
<div><dt>브라우저</dt><dd>${esc(r.browser)}</dd></div>
<div><dt>실행 환경</dt><dd>Node.js ${esc(r.node)} · ${esc(r.platform)}</dd></div>
<div><dt>결과</dt><dd>시험 ${okTests}/${nTests} · 확인 항목 ${okChecks}/${nChecks}</dd></div>
</dl>
<p class="verdict ${pass ? 'ok' : 'ng'}">${pass ? `모든 시험 항목 적합 (시험 ${nTests}건, 확인 항목 ${nChecks}개)` : `부적합 ${nTests - okTests}건 — 아래 부적합 항목을 확인하십시오`}</p>
<h2>1. 목적과 범위</h2>
<p>SilverBio Compare SDK 가 브라우저에 그려진 두 문서(JSP·Vue·React·일반 HTML 등)를 원본을 바꾸지 않고 비교하여 추가·수정·삭제·이동을 정확히 표시하고, 좌우 높이를 맞추며, 변경 위치로 정확히 이동하는지 확인한다. 보안(주소 검사·문서 내용 실행 방지)과 대용량(1,000쪽) 성능을 포함한다.</p>
<h2>2. 방법</h2>
<ol><li>시험용 가상 문서(전부 지어낸 내용)를 실제 브라우저(Chromium)에 그린다.</li><li>납품 파일(<code>dist/sg-compare.min.js</code>)로 비교하고 결과·화면 위치·높이·시간을 자동으로 잰다.</li><li>항목마다 기대 결과와 실제 값을 비교해 적합/부적합을 판정한다. 같은 명령으로 언제든 다시 실행할 수 있다: <code>node product/scripts/validation-report.mjs</code></li></ol>
<h2>3. 결과 요약</h2>
<table class="sum"><thead><tr><th>시험</th><th>확인 항목</th><th>적합</th><th>판정</th></tr></thead><tbody>
${r.results.map((t, i) => `<tr><td>TC-${String(i + 1).padStart(2, '0')} ${esc(t.name)}</td><td>${t.checks.length}</td><td>${t.checks.filter((c) => c.ok).length}</td><td class="${t.ok ? 'p' : 'f'}">${t.ok ? '적합' : '부적합'}</td></tr>`).join('')}
</tbody></table>
<h2>4. 시험 상세</h2>
${body}
<div class="sign"><div>시험자</div><div>검토자</div><div>승인자</div></div>
</div></body></html>`;
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, html);
console.log(`\n검증 보고서: ${out}  (시험 ${okTests}/${nTests}, 확인 항목 ${okChecks}/${nChecks})`);
process.exit(code);
