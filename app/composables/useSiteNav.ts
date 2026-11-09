// 메뉴 링크: 홈에서는 같은 페이지 안의 #앵커로, 다른 페이지에서는 홈의 해당 위치(/#앵커)로
export const PRODUCT_AUTHOR_PATH = '/products/silverbio-author';

export function useSiteNav() {
  const route = useRoute();
  const isHome = computed(() => route.path === '/');
  const href = (id: string) => (isHome.value ? `#${id}` : `/#${id}`);
  const homeHref = computed(() => (isHome.value ? '#top' : '/'));
  const isCurrent = (path: string) => route.path.replace(/\/$/, '') === path;
  return { isHome, href, homeHref, isCurrent };
}
