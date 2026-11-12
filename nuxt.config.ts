// SilverGate 홈페이지 — Nuxt 4 (Vue 3)
// 빌드: npm run build → .output/public (정적 HTML) → Firebase Hosting
const SITE = 'https://www.silvergate-solutions.com';
// 미리 HTML로 만들 페이지 (영어: 주소 그대로, 한국어: /ko 아래). public/sitemap.xml 도 같이 고친다
// 지금은 홈만 공개 (app/composables/useSiteNav.ts 의 HOME_ONLY). 세부 페이지를 다시 열 때 아래 주석의 목록으로 되돌린다
// const PAGES = ['/', '/products', '/products/silverbio-author', '/industries', '/references', '/company', '/contact'];
const PAGES = ['/'];

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
    // 영어는 주소 그대로(/products/...), 한국어는 /ko 아래(/ko/products/...)에 따로 HTML을 만든다
    // → 링크 미리보기(카카오톡·슬랙 등)와 검색엔진이 한국어 페이지를 한국어로 읽는다
    // ?lang= 과 저장된 언어 선택은 app/plugins/lang.client.ts 에서 해당 언어 주소로 옮겨 준다
    strategy: 'prefix_except_default',
    baseUrl: SITE,
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
      meta: [
        { name: 'theme-color', content: '#050506' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        { name: 'mobile-web-app-capable', content: 'yes' },
        { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
        { name: 'apple-mobile-web-app-title', content: 'SilverGate' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'SilverGate' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
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
    prerender: { routes: [...PAGES, ...PAGES.map((p) => (p === '/' ? '/ko' : '/ko' + p))], crawlLinks: false },
  },
});
