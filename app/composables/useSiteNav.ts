// 메뉴 링크와 사이트 메뉴 구성
// - 페이지 주소는 현재 언어에 맞춰 (영어 /products/..., 한국어 /ko/products/...)
// - 홈 안의 #앵커는 홈에서는 #id, 다른 페이지에서는 홈주소#id
// 홈만 공개: true 이면 메뉴·아래 탭·세부 페이지 링크를 숨기고 홈 한 페이지(스크롤 연출)만 보여 준다
// 세부 페이지를 다시 열 때: false 로 바꾸고 nuxt.config.ts 의 PAGES, firebase.json 의 redirects, public/sitemap.xml 도 되돌린다
export const HOME_ONLY = true;

export const PRODUCT_AUTHOR_PATH = '/products/silverbio-author';
export const BOOK_URL = 'https://calendar.app.google/wLYapJcPyoxVQvN78';

// 언어와 상관없는 페이지 이름 (index___ko → index)
export const routeBaseName = (r: { name?: unknown; path: string }): string => String(r.name ?? r.path).split('___')[0] ?? '';

// 위 메뉴(PC 펼침 메뉴, 휴대폰 전체 메뉴) 구성. label 은 번역 키, text 는 번역하지 않는 글자
export type MenuLink = { label?: string; text?: string; to: string; external?: boolean };
export type MenuGroup = { key: string; label: string; to: string; main: MenuLink[]; more: MenuLink[] };
export const SITE_MENU: MenuGroup[] = [
  {
    key: 'products', label: 'nav.product', to: '/products',
    main: [
      { text: 'SilverBio Author', to: PRODUCT_AUTHOR_PATH },
      { label: 'mn.allProducts', to: '/products' },
    ],
    more: [
      { label: 'mn.features', to: PRODUCT_AUTHOR_PATH + '#features' },
      { label: 'mn.compliance', to: PRODUCT_AUTHOR_PATH + '#compliance' },
      { label: 'mn.process', to: PRODUCT_AUTHOR_PATH + '#process' },
      { label: 'mn.demo', to: BOOK_URL, external: true },
    ],
  },
  {
    key: 'industries', label: 'nav.industries', to: '/industries',
    main: [
      { label: 'ind.bio', to: '/industries#bio' },
      { label: 'ind.ins', to: '/industries#insurance' },
      { label: 'ind.fin', to: '/industries#finance' },
      { label: 'ind.pub', to: '/industries#public' },
    ],
    more: [
      { label: 'ref.title', to: '/references' },
      { label: 'mn.contactUs', to: '/contact' },
    ],
  },
  {
    key: 'references', label: 'nav.references', to: '/references',
    main: [
      { label: 'ref.title', to: '/references' },
      { label: 'cl.title', to: '/references#clients' },
    ],
    more: [
      { label: 'cl.partners', to: '/references#partners' },
      { label: 'mn.contactUs', to: '/contact' },
    ],
  },
  {
    key: 'company', label: 'nav.company', to: '/company',
    main: [
      { label: 'mn.about', to: '/company' },
    ],
    more: [
      { label: 'mn.contactUs', to: '/contact' },
      { label: 'mn.demo', to: BOOK_URL, external: true },
    ],
  },
];
export const CONTACT_PATH = '/contact';

export function useSiteNav() {
  const route = useRoute();
  const localePath = useLocalePath();
  const isHome = computed(() => routeBaseName(route) === 'index');
  const homePath = computed(() => localePath('/'));
  const href = (id: string) => (isHome.value ? `#${id}` : `${homePath.value}#${id}`);
  const homeHref = computed(() => (isHome.value ? '#top' : homePath.value));
  // 페이지 주소(#앵커 포함 가능)를 현재 언어 주소로. 같은 페이지의 #앵커는 #id 만 남긴다
  const pathTo = (p: string) => {
    if (/^https?:/.test(p)) return p;
    const [base = '/', hash] = p.split('#');
    const path = localePath(base) || base;
    if (hash && isCurrent(base)) return '#' + hash;
    return hash ? `${path}#${hash}` : path;
  };
  const here = () => route.path.replace(/\/$/, '') || '/';
  const isCurrent = (p: string) => here() === (localePath(p) || p).replace(/\/$/, '');
  // 이 페이지가 해당 메뉴 아래인지 (/products 와 /products/silverbio-author 모두 '제품')
  const isUnder = (p: string) => { const b = (localePath(p) || p).replace(/\/$/, ''); return here() === b || here().startsWith(b + '/'); };
  return { isHome, href, homeHref, homePath, pathTo, isCurrent, isUnder };
}
