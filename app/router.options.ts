import type { RouterConfig } from '@nuxt/schema';

const base = (r: { name?: unknown; path: string }): string => String(r.name ?? r.path).split('___')[0] ?? '';

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    // 같은 페이지 안의 #앵커 이동, 같은 페이지의 언어만 바꾸는 이동(/ ↔ /ko)은 스크롤 위치를 그대로 둔다
    // (#앵커는 브라우저 기본 동작: 부드러운 스크롤 + 메뉴바 높이만큼 여백)
    if (to.path === from.path || base(to) === base(from)) return false;
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash };
    return { top: 0 };
  },
};
