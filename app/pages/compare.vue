<script setup lang="ts">
// SilverBio Compare 직접 해 보기 (/compare, /ko/compare). 비밀번호로 잠근 페이지 (CompareGate).
// 검색엔진에는 나오지 않게 함(noindex, sitemap 에서 뺌). 홈의 버튼(COMPARE_PUBLIC)을 누르면 비밀번호 화면
const { t } = useI18n();
const { pathTo } = useSiteNav();

usePageSeo({
  path: COMPARE_PATH,
  title: () => t('cdemo.metaTitle'),
  description: () => t('cdemo.lead'),
  ogImage: () => '/assets/og-image.png',
});
useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow, noarchive' }] });
useReveal();
const unlocked = ref(false);
</script>

<template>
  <div class="container cmp-back">
    <a :href="pathTo('/')"><span aria-hidden="true">←</span> {{ $t('cdemo.back') }}</a>
  </div>
  <ClientOnly>
    <!-- 비교 화면 코드는 잠금이 풀린 뒤에야 받는다 -->
    <LazySectionCompareLive v-if="unlocked" page />
    <CompareGate v-else @unlocked="unlocked = true" />
    <template #fallback><CompareGate /></template>
  </ClientOnly>
</template>
