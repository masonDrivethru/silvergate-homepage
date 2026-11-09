// 메뉴 링크
// - 홈에서는 같은 페이지 안의 #앵커로, 다른 페이지에서는 홈의 해당 위치로 (영어 /#앵커, 한국어 /ko#앵커)
// - 페이지 주소는 현재 언어에 맞춰 (영어 /products/..., 한국어 /ko/products/...)
export const PRODUCT_AUTHOR_PATH = '/products/silverbio-author';

// 언어와 상관없는 페이지 이름 (index___ko → index)
export const routeBaseName = (r: { name?: unknown; path: string }): string => String(r.name ?? r.path).split('___')[0] ?? '';

export function useSiteNav() {
  const route = useRoute();
  const localePath = useLocalePath();
  const isHome = computed(() => routeBaseName(route) === 'index');
  const homePath = computed(() => localePath('/'));
  const href = (id: string) => (isHome.value ? `#${id}` : `${homePath.value}#${id}`);
  const homeHref = computed(() => (isHome.value ? '#top' : homePath.value));
  const pathTo = (p: string) => localePath(p);
  const isCurrent = (p: string) => route.path.replace(/\/$/, '') === localePath(p);
  return { isHome, href, homeHref, homePath, pathTo, isCurrent };
}
