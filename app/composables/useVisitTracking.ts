/* 방문 기록 (Apps Script → 본인 구글 시트)
   쿠키·IP·개인정보 없이 페이지·유입 경로·언어·시간대·기기 종류만 보낸다.
   같은 탭에서 새로고침하면 다시 세지 않는다 (탭을 새로 열면 새 방문).
   본인 방문 제외: 주소 뒤에 ?notrack=1 을 붙여 한 번 열면 그 브라우저는 기록 안 함 (?notrack=0 으로 해제) */
export function startVisitTracking(endpoint: string, getLang: () => string, qs: URLSearchParams) {
  if (qs.has('notrack')) store.set('sg-notrack', qs.get('notrack') === '0' ? '' : '1');
  if (!endpoint || store.get('sg-notrack') === '1' || navigator.webdriver) return;
  // 로컬에서 개발할 때는 운영 시트에 기록하지 않는다
  if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname) && endpoint.includes('script.google.com')) return;
  try {
    if (sessionStorage.getItem('sg-visited')) return;
    sessionStorage.setItem('sg-visited', '1');
  } catch { /* 저장 불가 환경 */ }

  let ref = '';
  try {
    const r = document.referrer ? new URL(document.referrer) : null;
    if (r && r.hostname !== location.hostname) ref = r.hostname.replace(/^www\./, '');
  } catch { /* 잘못된 referrer */ }
  ref = qs.get('utm_source') || ref;
  const ua = navigator.userAgent;
  const device = /iPad|Tablet/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1) ? '태블릿'
    : /Mobi|Android|iPhone/i.test(ua) ? '모바일' : 'PC';

  // 페이지 로딩이 끝난 뒤, 화면 동작에 영향 없게 조용히 보낸다 (언어는 보내는 시점의 화면 언어)
  const send = () => {
    const body = new URLSearchParams({
      action: 'visit',
      page: location.pathname,
      ref,
      lang: getLang(),
      blang: navigator.language || '',
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      device,
      app: matchMedia('(display-mode: standalone)').matches ? '1' : '0',
    });
    if (!(navigator.sendBeacon && navigator.sendBeacon(endpoint, body))) {
      fetch(endpoint, { method: 'POST', mode: 'no-cors', keepalive: true, body }).catch(() => {});
    }
  };
  if (document.readyState === 'complete') setTimeout(send, 1000);
  else addEventListener('load', () => setTimeout(send, 1000), { once: true });
}
