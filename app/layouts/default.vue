<script setup lang="ts">
// 모든 페이지 공통: 머리글·바닥글·모바일 탭바·알림, 테마 색, 화면 언어(html lang), 방문 기록
const { locale } = useI18n();
const { isLight, syncFromDom } = useTheme();
const config = useRuntimeConfig().public;
const initialQuery = useInitialQuery();

useHead({
  htmlAttrs: { lang: () => locale.value },
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
