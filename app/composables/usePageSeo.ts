// 페이지별 메타 정보: 탭 제목, 설명, 대표 주소(canonical), 언어별 주소(hreflang), OG 태그
// 영어 주소: /products/... , 한국어 주소: /ko/products/...  (각 주소의 HTML에 그 언어의 값이 미리 들어간다)
export const SITE_URL = 'https://www.silvergate-solutions.com';

type Text = () => string;

export function usePageSeo(opts: {
  path: string;              // 영어 기준 경로 (예: '/', '/products/silverbio-author')
  title: Text;
  description: Text;
  ogTitle?: Text;
  ogDescription?: Text;
  ogImage: Text;             // /assets/... 처럼 사이트 안 경로
  noindex?: boolean;
}) {
  const { locale } = useI18n();
  const localePath = useLocalePath();
  const abs = (code: string) => SITE_URL + (localePath(opts.path, code as 'en' | 'ko') || '/');

  useHead({
    title: opts.title,
    link: opts.noindex ? [] : [
      { rel: 'canonical', href: () => abs(locale.value) },
      { rel: 'alternate', hreflang: 'en', href: () => abs('en') },
      { rel: 'alternate', hreflang: 'ko', href: () => abs('ko') },
      { rel: 'alternate', hreflang: 'x-default', href: () => abs('en') },
    ],
    meta: [
      { name: 'description', content: opts.description },
      ...(opts.noindex ? [{ name: 'robots', content: 'noindex' }] : []),
      { property: 'og:title', content: opts.ogTitle ?? opts.title },
      { property: 'og:description', content: opts.ogDescription ?? opts.description },
      { property: 'og:url', content: () => abs(locale.value) },
      { property: 'og:image', content: () => SITE_URL + opts.ogImage() },
      { property: 'og:locale', content: () => (locale.value === 'ko' ? 'ko_KR' : 'en_US') },
      { property: 'og:locale:alternate', content: () => (locale.value === 'ko' ? 'en_US' : 'ko_KR') },
    ],
  });
}
