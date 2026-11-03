/**
 * SilverGate 홈페이지 백엔드 (Google Apps Script 웹 앱)
 *  - action 없음 : 문의 폼 → Gmail 전송
 *  - action=chat : AI 상담 챗봇 (Claude API)
 *
 * 설정 (masonlee@silvergate-solutions.com 계정)
 * 1. script.google.com 의 "SilverGate Contact Mailer" 프로젝트에 이 파일 내용을 붙여넣고 저장
 * 2. 프로젝트 설정(톱니바퀴) → 스크립트 속성 → ANTHROPIC_API_KEY 추가 (값: Anthropic Console에서 만든 API 키)
 *    ※ 키는 여기에만 넣고, 코드·채팅·메일에는 절대 붙여넣지 않는다
 * 3. 배포 → 배포 관리 → 연필(수정) → 버전: 새 버전 → 배포 (URL은 그대로 유지됨)
 *    처음 한 번 "외부 서비스 연결" 권한 승인이 필요하다
 */
const TO = 'masonlee@silvergate-solutions.com';
const MAX_MAIL_PER_HOUR = 20;     // 문의 메일 폭주 방지
const MAX_CHAT_PER_HOUR = 120;    // 챗봇 요청 상한 (사이트 전체 기준, 비용 보호)
const MAX_CHAT_PER_6H = 400;     // CacheService 보관 한도가 6시간이라 6시간 단위로 제한

// 모델: 기본은 Claude Opus 5.5. 비용을 줄이려면 'claude-haiku-5-5'로 바꾸면 된다.
const MODEL = 'claude-opus-5-5';

const SYSTEM_PROMPT = [
  'You are the assistant on the website of SilverGate Co., Ltd. (주식회사 실버게이트), a Korean software company.',
  'Answer visitors\' questions about SilverGate, its products and services, and related compliance topics.',
  '',
  'Facts you may use (do not add facts beyond these):',
  '- Company: SilverGate Co., Ltd. CEO Changkeun Lee. Founded 2021 (sole proprietorship, later incorporated). Office: POSCO Tower-Songdo 26F, Incheon, Korea. The team has built enterprise systems since 2008.',
  '- Contact: +82 10-9690-0006, masonlee@silvergate-solutions.com. Visitors can also use the contact form or "Book a meeting" (Google Meet) at the bottom of this page.',
  '- Focus: MES, EBR (electronic batch record) and MBR (master batch record) systems for pharma and bio manufacturing.',
  '- SilverBio Author: authoring, review and approval of master batch records, with step-by-step records, electronic signatures (author, review, approve) and an audit trail of every action.',
  '- SilverBio Compare: compares versions of documents and templates (batch records, cleaning SOPs, QC specifications) side by side and lists every change, addition and deletion.',
  '- Capabilities: MBR covers master recipe authoring, review & approval workflow, e-signatures, audit trail. EBR adds step-by-step execution and review by exception. MES adds equipment & material tracking and ERP & LIMS integration.',
  '- Compliance: designed for 21 CFR Part 11 (audit trail, e-signatures, access control), EU GMP Annex 11 (validated system, backup, change control), GAMP 5 (URS, FS, IQ/OQ/PQ deliverables) and ALCOA+ data integrity (attributable, time-stamped, tamper-evident records).',
  '- How a project runs: 1) Assess: URS, gap analysis. 2) Design: FS, risk assessment. 3) Build & validate: IQ/OQ/PQ. 4) Go live: training, SOPs, hypercare.',
  '- Industries the team has delivered in: pharma & bio; insurance (new business, products, GA sales, call center, digital channels); banking & securities (bancassurance, retirement pensions, channel websites); public sector (next-generation core systems, EDI, facility management).',
  '- References: Samsung Biologics, MES MBR, PCS and EBR authoring (analysis, design, development), in progress since Feb 2025. Incheon International Airport Corporation, IFMS integrated facility management system, in progress with partner Hiddenwork.',
  '- Clients: Samsung Biologics, Incheon International Airport, National Pension Service, Hanwha General Insurance, KB Life Insurance (KB라이프생명), Lina Life.',
  '',
  'How to answer:',
  '- Reply in the language the visitor writes in (Korean or English).',
  '- Keep answers short: two to five sentences, plain text, no headings or tables.',
  '- Do not quote prices, schedules or contract terms. For those, and for anything that needs a real discussion, suggest the contact form or booking a meeting.',
  '- If you do not know something from the facts above, say so and suggest contacting the team. Never invent clients, numbers, certifications or features.',
  '- General questions about GMP, Part 11, Annex 11, GAMP 5 or data integrity may be answered from general knowledge, briefly and without legal advice.',
  '- Politely decline topics unrelated to SilverGate or regulated manufacturing software.',
].join('\n');

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p.action === 'chat') return chat(p);
  return mail(p);
}

/* ---------------- 문의 폼 → Gmail ---------------- */
function mail(p) {
  if (p._gotcha) return json({ ok: true });                    // 봇이 채우는 숨김 칸

  const clean = (v, n) => String(v || '').trim().slice(0, n);
  const company = clean(p.company, 100);
  const name = clean(p.name, 100);
  const email = clean(p.email, 200);
  const message = clean(p.message, 5000);
  if (!company || !name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'invalid' });

  if (!underLimit('mail', MAX_MAIL_PER_HOUR, 3600)) return json({ ok: false, error: 'rate' });

  MailApp.sendEmail({
    to: TO,
    replyTo: email,
    name: 'SilverGate 홈페이지',
    subject: '[홈페이지 문의] ' + company + ' ' + name,
    body: [
      '회사: ' + company,
      '담당자: ' + name,
      '이메일: ' + email,
      '언어: ' + clean(p.lang, 5),
      '',
      message,
    ].join('\n'),
  });
  return json({ ok: true });
}

/* ---------------- AI 상담 챗봇 ---------------- */
function chat(p) {
  const key = PropertiesService.getScriptProperties().getProperty('ANTHROPIC_API_KEY');
  if (!key) return json({ ok: false, error: 'not_configured' });
  if (!underLimit('chat_h', MAX_CHAT_PER_HOUR, 3600) || !underLimit('chat_6h', MAX_CHAT_PER_6H, 21600)) {
    return json({ ok: false, error: 'rate' });
  }

  // 화면에서 보낸 대화: [{role, content}] — 최근 10개, 메시지당 1000자로 제한하고 순서를 정리
  let history;
  try { history = JSON.parse(p.messages || '[]'); } catch (err) { history = []; }
  const msgs = [];
  history.slice(-10).forEach(function (m) {
    const role = m && m.role === 'assistant' ? 'assistant' : 'user';
    const text = String((m && m.content) || '').trim().slice(0, 1000);
    if (!text) return;
    if (msgs.length && msgs[msgs.length - 1].role === role) msgs[msgs.length - 1].content += '\n' + text;
    else msgs.push({ role: role, content: text });
  });
  while (msgs.length && msgs[0].role !== 'user') msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return json({ ok: false, error: 'invalid' });

  const res = UrlFetchApp.fetch('https://api.anthropic.com/v1/messages', {
    method: 'post',
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: {
      'x-api-key': key,
      'anthropic-version': '2026-10-21',
      'anthropic-beta': 'server-side-fallback-2026-07-01',
    },
    payload: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      output_config: { effort: 'low' },         // 짧은 상담 답변: 빠르고 저렴하게
      fallbacks: 'default',                     // 안전 분류기가 거절하면 서버에서 다른 모델로 재시도
      messages: msgs,
    }),
  });

  const code = res.getResponseCode();
  let body;
  try { body = JSON.parse(res.getContentText()); } catch (err) { body = null; }
  if (code !== 200 || !body) {
    console.error('Claude API ' + code + ': ' + res.getContentText().slice(0, 500));
    return json({ ok: false, error: code === 429 || code === 529 ? 'busy' : 'api' });
  }
  if (body.stop_reason === 'refusal') return json({ ok: false, error: 'refusal' });

  const text = (body.content || [])
    .filter(function (b) { return b.type === 'text'; })
    .map(function (b) { return b.text; })
    .join('')
    .trim();
  if (!text) return json({ ok: false, error: 'empty' });
  return json({ ok: true, reply: text });
}

/* ---------------- 공통 ---------------- */
function underLimit(name, max, seconds) {
  const cache = CacheService.getScriptCache();
  const count = Number(cache.get(name) || 0);
  if (count >= max) return false;
  cache.put(name, String(count + 1), seconds);
  return true;
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
