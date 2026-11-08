<script setup lang="ts">
// 홈페이지 (한 페이지). 섹션은 app/components/section/*, 머리글·바닥글은 app/components/site/*
const { t, locale } = useI18n();
const { isLight, syncFromDom } = useTheme();
const config = useRuntimeConfig().public;
const { $langReady } = useNuxtApp();
const initialQuery = useInitialQuery();

useHead({
  htmlAttrs: { lang: () => locale.value },
  title: () => t('meta.title'),
  meta: [
    { name: 'description', content: () => t('meta.desc') },
    { name: 'theme-color', content: () => (isLight.value ? '#eceef1' : '#050506') },
  ],
});

let scenes: ReturnType<typeof initScrollScenes> | null = null;
onMounted(async () => {
  syncFromDom();
  await ($langReady as Promise<void>);   // 처음 언어 적용이 끝난 뒤 연출 시작 (app/plugins/lang.client.ts)
  await nextTick();
  scenes = initScrollScenes();
  startVisitTracking(config.appsScriptUrl as string, () => locale.value, initialQuery);
});
// 언어를 바꾸면 단어 분할이 새로 그려지므로 다시 찾고 연출을 갱신
watch(locale, async () => {
  await nextTick();
  scenes?.refreshWords();
  scenes?.update();
});
onBeforeUnmount(() => scenes?.destroy());
</script>

<template>
  <div class="sprog" aria-hidden="true"></div>
  <div class="cursor-light" aria-hidden="true"></div>
  <a class="skip" href="#main">{{ $t('skip') }}</a>

  <!-- 아이콘: 브랜드 마크 + Lucide (ISC License) -->
  <SiteIcons />

  <SiteHeader />

  <main id="main">
    <SectionIntro />
    <SectionProduct />
    <SectionCompare />
    <SectionCapability />
    <SectionStrengths />
    <SectionIndustries />
    <SectionFaq />
    <SectionReferences />
    <SectionCompany />
    <SectionClosing />
    <SectionContact />
  </main>

  <SiteFooter />
  <SiteTabbar />
  <SiteToast />
</template>
