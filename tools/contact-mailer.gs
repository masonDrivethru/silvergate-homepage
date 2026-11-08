/**
 * SilverGate 홈페이지 백엔드 (Google Apps Script 웹 앱)
 *  - action 없음 : 문의 폼 → Gmail 전송
 *  - action=chat : AI 상담 챗봇 (Claude API)
 *
 * 설정 (masonlee@silvergate-solutions.com 계정)
 * 1. script.google.com 의 "SilverGate Contact Mailer" 프로젝트에 이 파일 내용을 붙여넣고 저장
 * 2. 프로젝트 설정(톱니바퀴) → 스크립트 속성 → ANTHROPIC_API_KEY 추가 (값: Anthropic Console에서 만든 API 키)
 *    ※ 키는 여기에만 넣고, 코드·채팅·메일에는 절대 붙여넣지 않는다
 *    같은 곳에 TURNSTILE_SECRET 추가 (값: Cloudflare 대시보드 → Turnstile → 위젯의 Secret Key)
 *    ※ TURNSTILE_SECRET이 없으면 Turnstile 검증만 건너뛴다 (나머지 방어는 그대로 동작)
 * 3. 배포 → 배포 관리 → 연필(수정) → 버전: 새 버전 → 배포 (URL은 그대로 유지됨)
 *    처음 한 번 "외부 서비스 연결" 권한 승인이 필요하다
 */
const TO = 'masonlee@silvergate-solutions.com';
const MAX_MAIL_PER_HOUR = 20;     // 문의 메일 폭주 방지 (사이트 전체 기준)
const MAX_MAIL_PER_SENDER = 2;    // 같은 이메일 주소로는 10분에 2건까지
const SENDER_WINDOW_SEC = 600;
const MIN_FILL_MS = 3000;         // 페이지를 연 뒤 3초 안에 보낸 제출은 봇으로 본다
const VALID_LANGS = ['ko', 'en']; // 화면이 자동으로 보내는 언어 값. 이 외의 값(빈 값 포함)은 봇으로 본다
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
  // 스팸 판정 (메일 발송 전, 서버에서 확인). 걸리면 메일 없이 성공한 척 응답해 봇이 눈치채지 못하게 한다.
  const spam = spamReason(p);
  if (spam) {
    console.warn('스팸 차단(' + spam + '): ' + String(p.email || '').slice(0, 100));
    return json({ ok: true });
  }

  const clean = (v, n) => String(v || '').trim().slice(0, n);
  const company = clean(p.company, 100);
  const name = clean(p.name, 100);
  const email = clean(p.email, 200);
  const message = clean(p.message, 5000);
  if (!company || !name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'invalid' });

  // Cloudflare Turnstile 토큰을 서버에서 검증 (토큰은 1회용)
  if (!verifyTurnstile(p['cf-turnstile-response'])) return json({ ok: false, error: 'captcha' });

  // 반복 제출 제한: 같은 이메일 주소 10분 2건 + 사이트 전체 1시간 20건
  //    ※ Apps Script는 요청자 IP를 알려주지 않아 IP 대신 이메일 주소 기준으로 제한한다
  if (!underLimit('mail_s_' + digest(email.toLowerCase()), MAX_MAIL_PER_SENDER, SENDER_WINDOW_SEC)) return json({ ok: false, error: 'rate' });
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
      '언어: ' + p.lang,
      '',
      message,
    ].join('\n'),
  });
  return json({ ok: true });
}

// 스팸이면 이유(문자열), 정상이면 '' 를 돌려준다
function spamReason(p) {
  // 1. 허니팟: 사람 눈에 안 보이는 칸(website)이 채워져 있으면 봇
  if (p.website || p._gotcha) return 'honeypot';
  // 2. 언어: 화면이 현재 언어(ko/en)를 자동으로 붙여 보낸다. 없거나 다른 값이면 화면을 거치지 않은 요청
  if (VALID_LANGS.indexOf(p.lang) < 0) return 'lang';
  // 3. 제출 시간: 화면이 보낸 경과 시간(_t, ms)이 없거나 3초 미만이면 봇
  const elapsed = Number(p._t);
  if (!p._t || !isFinite(elapsed) || elapsed < MIN_FILL_MS) return 'too_fast';
  return '';
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
function verifyTurnstile(token) {
  const secret = PropertiesService.getScriptProperties().getProperty('TURNSTILE_SECRET');
  if (!secret) return true;                                   // 아직 설정 전이면 검증 생략
  if (!token) return false;
  try {
    const res = UrlFetchApp.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'post',
      muteHttpExceptions: true,
      payload: { secret: secret, response: String(token).slice(0, 2048) },
    });
    const body = JSON.parse(res.getContentText());
    if (!body.success) console.warn('Turnstile 실패: ' + JSON.stringify(body['error-codes'] || []));
    return body.success === true;
  } catch (err) {
    console.error('Turnstile 검증 오류: ' + err);
    return false;
  }
}

function digest(text) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, text)
    .map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); })
    .join('');
}

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
