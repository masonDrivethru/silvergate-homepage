/**
 * 변경 보고서: 비교 결과를 그 자체로 열리는 HTML 문서 한 장으로 만든다 (변경관리 첨부·인쇄·PDF 저장용).
 * 화면에 의존하지 않는다 (글자만). 문서 내용은 모두 글자로 넣는다(태그로 해석되지 않음).
 */
import { getMessages, attrLabel } from './messages.js';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const R = {
  ko: {
    title: '문서 비교 보고서', before: '이전 버전', after: '새 버전', made: '작성 일시', tool: '비교 도구', total: '변경 합계',
    no: '번호', type: '종류', where: '위치', content: '내용', was: '이전', now: '이후', none: '두 버전 사이에 바뀐 곳이 없습니다.',
    page: (p) => `${p}쪽`, column: (n) => `표 열 ${n}칸`, note: '이 보고서는 화면에 그려진 두 문서를 자동으로 비교한 결과입니다. 최종 판단은 담당자가 원문과 대조해 확인하십시오.',
    sign: ['작성', '검토', '승인'], printHint: '인쇄하거나 PDF 로 저장하려면 Ctrl+P',
  },
  en: {
    title: 'Document Comparison Report', before: 'Previous version', after: 'New version', made: 'Generated', tool: 'Tool', total: 'Total changes',
    no: 'No.', type: 'Type', where: 'Location', content: 'Content', was: 'Before', now: 'After', none: 'No differences between the two versions.',
    page: (p) => `p.${p}`, column: (n) => `Table column (${n} cells)`, note: 'This report was produced by automatically comparing the two rendered documents. Reviewers must confirm against the source documents.',
    sign: ['Prepared by', 'Reviewed by', 'Approved by'], printHint: 'Press Ctrl+P to print or save as PDF',
  },
};

/** 글자 수정의 이전/이후 (바뀐 부분만 강조) */
function diffSides(diffs) {
  let was = '', now = '';
  for (const [op, t] of diffs) {
    if (op === 0) { was += esc(t); now += esc(t); }
    else if (op < 0) was += `<del>${esc(t)}</del>`;
    else now += `<ins>${esc(t)}</ins>`;
  }
  return [was, now];
}

/**
 * @param {import('./index.d.ts').CompareController} ctrl
 * @param {{ title?: string, leftLabel?: string, rightLabel?: string, locale?: string, author?: string, version?: string }} [o]
 * @returns {string} HTML 문서
 */
export function exportReport(ctrl, o = {}) {
  const lang = (o.locale ?? 'ko').startsWith('ko') ? 'ko' : 'en';
  const t = R[lang], m = getMessages(lang);
  const changes = ctrl.changes ?? [];
  const s = ctrl.stats ?? {};
  const when = new Date();
  const stamp = when.toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US', { hour12: false });
  const rows = changes.map((c, i) => {
    const page = c.page?.right ?? c.page?.left;
    const where = page ? t.page(page) : '';
    let content = '', was = '', now = '';
    const tx = c.text ?? {};
    if (c.what === 'text' && c.diffs) {
      [was, now] = diffSides(c.diffs);
      if (tx.span) { const an = esc(attrLabel(m, tx.span.attr, c.right ?? c.left)); was += `<div class="sub">${an}: ${esc(tx.span.before)}</div>`; now += `<div class="sub">${an}: ${esc(tx.span.after)}</div>`; }
    } else if (c.what === 'attr') {
      const an = esc(attrLabel(m, tx.attr, c.right ?? c.left));
      const ctx = tx.context ? `<div class="sub">${esc(tx.context)}</div>` : '';
      was = `${an}: <del>${esc(tx.before)}</del>${ctx}`; now = `${an}: <ins>${esc(tx.after)}</ins>${ctx}`;
    } else if (c.what === 'column') {
      content = `${esc(t.column(tx.column))} · ${esc(tx.context ?? '')}`;
      if (c.type === 'deleted') was = content; else now = content;
      content = '';
    } else if (c.type === 'deleted') was = `<del>${esc(tx.context ?? '')}</del>`;
    else if (c.type === 'added') now = `<ins>${esc(tx.context ?? '')}</ins>`;
    else content = esc(tx.context ?? '');
    return `<tr class="t-${c.type}"><td class="n">${i + 1}</td><td><span class="tag">${esc(m[c.type])}</span></td><td class="w">${esc(where)}</td>`
      + (content ? `<td colspan="2">${content}</td>` : `<td>${was}</td><td>${now}</td>`) + '</tr>';
  }).join('');
  const title = o.title ?? t.title;
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<style>
body{margin:0;background:#f4f5f7;color:#1b2130;font:13px/1.55 "Noto Sans KR","Malgun Gothic",system-ui,sans-serif}
.page{max-width:1080px;margin:24px auto;background:#fff;padding:36px 40px;box-shadow:0 1px 3px rgba(0,0,0,.12)}
h1{margin:0 0 4px;font-size:20px}.hint{margin:0 0 18px;color:#667085;font-size:12px}
.meta{display:grid;grid-template-columns:repeat(4,1fr);border:1px solid #d3d8df;margin-bottom:14px}
.meta div{padding:8px 12px;border-left:1px solid #d3d8df}.meta div:first-child{border-left:0}
.meta dt{font-size:11px;color:#5b6474}.meta dd{margin:0;font-weight:600;overflow-wrap:anywhere}
.stats{display:flex;gap:16px;margin:0 0 14px;font-weight:600}.stats .a{color:#15803d}.stats .m{color:#1d4ed8}.stats .d{color:#b91c1c}.stats .v{color:#6d28d9}
table{width:100%;border-collapse:collapse}th,td{border:1px solid #d3d8df;padding:6px 8px;text-align:left;vertical-align:top;overflow-wrap:anywhere}
th{background:#eff1f4;font-size:12px;color:#5b6474}td.n,td.w{white-space:nowrap;color:#5b6474}
.tag{display:inline-block;padding:0 6px;border-radius:4px;font-size:11px;font-weight:700}
.t-added .tag{background:#dcfce7;color:#15803d}.t-modified .tag{background:#dbeafe;color:#1d4ed8}.t-deleted .tag{background:#fee2e2;color:#b91c1c}.t-moved .tag{background:#ede9fe;color:#6d28d9}
ins{background:#dcfce7;color:#15803d;text-decoration:none}del{background:#fee2e2;color:#b91c1c}
.sub{margin-top:4px;font-size:11px;color:#5b6474}.empty{padding:20px;color:#5b6474}
.note{margin:16px 0 0;font-size:11px;color:#5b6474}
.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:28px}.sign div{border-top:1px solid #1b2130;padding-top:6px;font-size:11px;color:#5b6474;height:48px}
@media print{body{background:#fff}.page{box-shadow:none;margin:0;max-width:none;padding:0}.hint{display:none}tr{break-inside:avoid}}
</style></head><body><div class="page">
<h1>${esc(title)}</h1><p class="hint">${esc(t.printHint)}</p>
<dl class="meta">
<div><dt>${esc(t.before)}</dt><dd>${esc(o.leftLabel ?? '')}</dd></div>
<div><dt>${esc(t.after)}</dt><dd>${esc(o.rightLabel ?? '')}</dd></div>
<div><dt>${esc(t.made)}</dt><dd>${esc(stamp)}${o.author ? ` · ${esc(o.author)}` : ''}</dd></div>
<div><dt>${esc(t.tool)}</dt><dd>SilverBio Compare ${esc(o.version ?? '')}</dd></div>
</dl>
<p class="stats"><span>${esc(t.total)} ${changes.length}</span><span class="a">${esc(m.added)} ${s.added ?? 0}</span><span class="m">${esc(m.modified)} ${s.modified ?? 0}</span><span class="d">${esc(m.deleted)} ${s.deleted ?? 0}</span><span class="v">${esc(m.moved)} ${s.moved ?? 0}</span></p>
${changes.length ? `<table><thead><tr><th>${esc(t.no)}</th><th>${esc(t.type)}</th><th>${esc(t.where)}</th><th style="width:40%">${esc(t.was)}</th><th style="width:40%">${esc(t.now)}</th></tr></thead><tbody>${rows}</tbody></table>` : `<p class="empty">${esc(t.none)}</p>`}
<p class="note">${esc(t.note)}</p>
<div class="sign">${t.sign.map((x) => `<div>${esc(x)}</div>`).join('')}</div>
</div></body></html>`;
}

/** 보고서를 파일로 내려받게 (브라우저). 파일 이름 기본: compare-report-YYYYMMDD-HHMM.html */
export function downloadReport(ctrl, o = {}) {
  const html = exportReport(ctrl, o);
  const d = new Date(), p = (n) => String(n).padStart(2, '0');
  const name = o.fileName ?? `compare-report-${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}.html`;
  const doc = o.document ?? document;
  const a = doc.createElement('a');
  a.href = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
  a.download = name;
  doc.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  return name;
}
