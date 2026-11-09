<script setup lang="ts">
// 같은 페이지의 언어만 바뀔 때(/ ↔ /ko)는 페이지를 새로 만들지 않고 글자만 바꾼다
// (스크롤 연출·펼친 FAQ·입력 중인 문의 내용이 그대로 유지됨)
const pageKey = (r: { name?: unknown; path: string }) => routeBaseName(r);
</script>

<template>
  <NuxtLayout>
    <NuxtPage :page-key="pageKey" />
  </NuxtLayout>
</template>
