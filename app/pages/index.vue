<script setup lang="ts">
// 홈 (한 페이지). 섹션은 app/components/section/*, 머리글·바닥글은 app/layouts/default.vue
const { t, locale } = useI18n();
const { $langReady } = useNuxtApp();

useHead({
  title: () => t('meta.title'),
  meta: [{ name: 'description', content: () => t('meta.desc') }],
});

let scenes: ReturnType<typeof initScrollScenes> | null = null;
onMounted(async () => {
  await ($langReady as Promise<void>);   // 처음 언어 적용이 끝난 뒤 연출 시작 (app/plugins/lang.client.ts)
  await nextTick();
  scenes = initScrollScenes();
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
</template>
