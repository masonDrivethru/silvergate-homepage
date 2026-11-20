<script setup lang="ts">
// SilverBio Compare 직접 해 보기 (/compare, /ko/compare). 홈 Compare 연출의 탭 버튼에서 들어온다.
// 홈만 공개 중에도 이 페이지는 공개 (nuxt.config.ts PAGES, public/sitemap.xml 에 들어 있음)
const { t } = useI18n();
const { pathTo } = useSiteNav();

usePageSeo({
  path: COMPARE_PATH,
  title: () => t('cdemo.metaTitle'),
  description: () => t('cdemo.lead'),
  ogImage: () => '/assets/og-image.png',
});
useReveal();
</script>

<template>
  <div class="container cmp-back">
    <a :href="pathTo('/#solutions')"><span aria-hidden="true">←</span> {{ $t('cdemo.back') }}</a>
  </div>
  <SectionCompareLive page />
</template>
