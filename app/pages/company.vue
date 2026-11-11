<script setup lang="ts">
// 회사: 회사 정보 (홈의 '회사 소개' 섹션을 그대로 사용)
useSubPage('/company', 'company');
</script>

<template>
  <PageHero :eyebrow="$t('pg.company.eyebrow')" :title="$t('pg.company.title')" :lead="$t('pg.company.lead')" />
  <SectionCompany />
  <SectionIndustries />
  <PageCta />
</template>
