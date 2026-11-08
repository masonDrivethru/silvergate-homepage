// SilverGate service worker — offline support
// Nuxt 빌드 파일(/_nuxt/*)은 이름에 해시가 붙으므로 미리 저장하지 않고, 처음 받을 때 아래 fetch 처리에서 저장된다
const CACHE = 'sg-v42';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/icons/logo.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS.map((u) => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// 사이트 파일(HTML·CSS·JS·이미지): network-first (브라우저 HTTP 캐시도 건너뛰고 서버에 확인) → 수정 사항이 바로 반영되고, 오프라인일 때만 캐시 사용
// 외부 파일(폰트 CDN): stale-while-revalidate
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).hostname === 'challenges.cloudflare.com') return;   // Turnstile은 캐시하면 안 됨

  if (new URL(req.url).origin === self.location.origin) {
    e.respondWith(
      fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' })
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((cached) => {
      const net = fetch(req)
        .then((res) => {
          if (res.ok || res.type === 'opaque') caches.open(CACHE).then((c) => c.put(req, res.clone()));
          return res;
        })
        .catch(() => cached);
      return cached || net;
    })
  );
});
