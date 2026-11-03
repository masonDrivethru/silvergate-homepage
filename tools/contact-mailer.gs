/**
 * SilverGate 홈페이지 문의 → Gmail 전송 (Google Apps Script)
 *
 * 설정 방법 (masonlee@silvergate-solutions.com 계정으로 로그인한 상태에서)
 * 1. https://script.google.com 에서 [새 프로젝트] → 이 파일 내용을 그대로 붙여넣고 저장
 * 2. [배포] → [새 배포] → 유형: 웹 앱
 *    - 실행 사용자: 나
 *    - 액세스 권한: 모든 사용자
 * 3. 권한 승인 후 나오는 "웹 앱 URL"(https://script.google.com/macros/s/.../exec)을
 *    index.html 문의 폼의 action="" 안에 넣고 배포
 */
const TO = 'masonlee@silvergate-solutions.com';
const MAX_PER_HOUR = 20;   // 스팸 폭주 방지

function doPost(e) {
  const p = (e && e.parameter) || {};
  if (p._gotcha) return json({ ok: true });                    // 봇이 채우는 숨김 칸

  const clean = (v, n) => String(v || '').trim().slice(0, n);
  const company = clean(p.company, 100);
  const name = clean(p.name, 100);
  const email = clean(p.email, 200);
  const message = clean(p.message, 5000);
  if (!company || !name || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok: false, error: 'invalid' });

  const cache = CacheService.getScriptCache();
  const count = Number(cache.get('count') || 0);
  if (count >= MAX_PER_HOUR) return json({ ok: false, error: 'rate' });
  cache.put('count', String(count + 1), 3600);

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

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
