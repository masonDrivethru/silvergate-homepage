// 하위 페이지 공통: 검색·공유용 정보(제목·설명·대표 이미지) + 스크롤하면 나타나는 연출
export function useSubPage(path: string, key: string) {
  const { t } = useI18n();
  usePageSeo({
    path,
    title: () => t(`pg.${key}.metaTitle`),
    description: () => t(`pg.${key}.lead`),
    ogImage: () => '/assets/og-image.png',
  });
  useReveal();
}
