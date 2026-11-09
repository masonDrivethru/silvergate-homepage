// SilverGate 홈페이지 — Nuxt 4 (Vue 3)
// 빌드: npm run build → .output/public (정적 HTML) → Firebase Hosting
const SITE = 'https://www.silvergate-solutions.com';
const META_EN = {
  title: 'SilverGate | MES, EBR & MBR for Pharma and Bio',
  ogDesc: 'From master batch record to shop-floor execution. GMP, CSV and data integrity, designed in from day one.',
};

export default defineNuxtConfig({
  compatibilityDate: '2026-11-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/i18n'],
  css: ['~/assets/css/style.css'],

  // 원래 HTML과 공백 처리를 똑같이 (Vue 기본값은 태그 사이 공백을 줄여서 글자 간격이 미세하게 달라질 수 있음)
  vue: { compilerOptions: { whitespace: 'preserve' } },

  runtimeConfig: {
    public: {
      // Google Apps Script 웹 앱 (tools/contact-mailer.gs): 문의 메일, 방문 기록
      appsScriptUrl: 'https://script.google.com/macros/s/AKfycbzQc8NsvP7o6lRXvOTyZ5GKrL8MZaRfhF0fzz6Kc39EPLR4OvNgijxH2YiZkn5H9Ld4/exec',
      // Cloudflare Turnstile 사이트 키 (비우면 Turnstile 없이 동작)
      turnstileSiteKey: '',
    },
  },

  i18n: {
    // 주소는 그대로 두고(/), 화면 언어만 바꾼다. 우선순위: ?lang= → 저장된 선택 → 영어 (app/composables/useSiteLang.ts)
    strategy: 'no_prefix',
    defaultLocale: 'en',
    detectBrowserLanguage: false,     // 쿠키를 쓰지 않는다
    locales: [
      { code: 'en', language: 'en', file: 'en.json' },
      { code: 'ko', language: 'ko', file: 'ko.json' },
    ],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
      title: META_EN.title,
      meta: [
        { name: 'theme-color', content: '#050506' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'SilverGate' },
        { property: 'og:type', content: 'website' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:locale:alternate', content: 'ko_KR' },
        { property: 'og:site_name', content: 'SilverGate' },
        { property: 'og:title', content: META_EN.title },
        { property: 'og:description', content: META_EN.ogDesc },
        { property: 'og:url', content: SITE + '/' },
        { property: 'og:image', content: SITE + '/assets/og-image.png' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'canonical', href: SITE + '/' },
        { rel: 'icon', href: '/assets/icons/logo.svg', type: 'image/svg+xml' },
        { rel: 'apple-touch-icon', href: '/assets/icons/icon-180.png' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
        { rel: 'preconnect', href: 'https://cdn.jsdelivr.net', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap' },
      ],
      script: [
        {
          // 화면이 그려지기 전에 저장된 테마(라이트)를 적용해 깜빡임을 막는다
          innerHTML: "(function(){var t=new URLSearchParams(location.search).get('theme');try{t=t||localStorage.getItem('sg-theme')}catch(e){}if(t==='light'){document.documentElement.setAttribute('data-theme','light');var m=document.querySelector('meta[name=\"theme-color\"]');if(m)m.setAttribute('content','#eceef1')}})();",
          tagPosition: 'head',
        },
      ],
    },
  },

  nitro: {
    prerender: { routes: ['/', '/products/silverbio-author'], crawlLinks: false },
  },
});
