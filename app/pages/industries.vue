<script setup lang="ts">
// 산업: 일해 온 분야 (홈의 '산업' 섹션을 그대로 쓰고, 메뉴에서 분야별로 바로 갈 수 있게)
useSubPage('/industries', 'industries');
</script>

<template>
  <PageHero :eyebrow="$t('pg.industries.eyebrow')" :title="$t('pg.industries.title')" :lead="$t('pg.industries.lead')" />
  <SectionIndustries />
  <PageCta />
</template>
