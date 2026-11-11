<script setup lang="ts">
// 실적: 진행 중인 프로젝트, 고객사, 협력사 (홈의 '실적' 섹션을 그대로 사용)
useSubPage('/references', 'references');
</script>

<template>
  <PageHero :eyebrow="$t('pg.references.eyebrow')" :title="$t('pg.references.title')" :lead="$t('pg.references.lead')" />
  <SectionReferences />
  <PageCta />
</template>
