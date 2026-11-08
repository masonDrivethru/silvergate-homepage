import type { RouterConfig } from '@nuxt/schema';

// 같은 페이지 안의 #앵커 이동은 브라우저 기본 동작(부드러운 스크롤 + 메뉴바 높이만큼 여백)에 맡긴다
export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (to.path === from.path) return false;
    if (savedPosition) return savedPosition;
    if (to.hash) return { el: to.hash };
    return { top: 0 };
  },
};
