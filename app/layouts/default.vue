<script setup lang="ts">
// 모든 페이지 공통: 머리글·바닥글·모바일 탭바·알림, 테마 색, 화면 언어(html lang), 방문 기록
const { locale } = useI18n();
const { isLight, syncFromDom } = useTheme();
const config = useRuntimeConfig().public;
const initialQuery = useInitialQuery();
// 화려한 연출(스크롤 애니메이션, 마우스 빛, 빛나는 효과)은 홈에서만. 세부 페이지는 차분하게 (style.css 의 data-motion="calm")
const { isHome } = useSiteNav();

useHead({
  htmlAttrs: { lang: () => locale.value, 'data-motion': () => (isHome.value ? 'full' : 'calm') },
  meta: [{ name: 'theme-color', content: () => (isLight.value ? '#eceef1' : '#050506') }],
});

onMounted(() => {
  syncFromDom();
  startVisitTracking(config.appsScriptUrl as string, () => locale.value, initialQuery);
});
</script>

<template>
  <div class="sprog" aria-hidden="true"></div>
  <div class="cursor-light" aria-hidden="true"></div>
  <a class="skip" href="#main">{{ $t('skip') }}</a>

  <!-- 아이콘: 브랜드 마크 + Lucide (ISC License) -->
  <SiteIcons />

  <SiteHeader />

  <main id="main">
    <slot />
  </main>

  <SiteFooter />
  <SiteTabbar />
  <SiteToast />
</template>
