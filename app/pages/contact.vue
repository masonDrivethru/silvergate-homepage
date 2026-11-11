<script setup lang="ts">
// 문의: 문의 양식 + 자주 묻는 질문 (홈의 섹션을 그대로 사용)
useSubPage('/contact', 'contact');
</script>

<template>
  <PageHero :eyebrow="$t('pg.contact.eyebrow')" :title="$t('pg.contact.title')" :lead="$t('pg.contact.lead')" />
  <SectionContact />
  <SectionFaq />
</template>
