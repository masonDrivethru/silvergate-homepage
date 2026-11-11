<script setup lang="ts">
// 하위 페이지 첫머리: 작은 제목(eyebrow) + 큰 제목(h1) + 설명
defineProps<{ eyebrow: string; title: string; lead?: string }>();
</script>

<template>
  <section class="section phero" aria-labelledby="phero-title">
    <div class="container">
      <p class="product__name reveal">{{ eyebrow }}</p>
      <h1 id="phero-title" class="phero__title reveal">{{ title }}</h1>
      <p v-if="lead" class="phero__lead reveal">{{ lead }}</p>
      <div v-if="$slots.default" class="phero__actions reveal"><slot /></div>
    </div>
  </section>
</template>

<style scoped>
.phero { padding-top: calc(var(--nav-h) + clamp(48px, 10vh, 120px)); padding-bottom: 0; }
.phero__title { margin-top: var(--s2); max-width: 20ch; font-size: var(--fs-h2); line-height: 1.15; }
.phero__lead { margin-top: var(--s3); max-width: 60ch; color: var(--text-2); font-size: 1.125rem; }
.phero__actions { display: flex; flex-wrap: wrap; gap: var(--s2); margin-top: var(--s5); }
</style>
