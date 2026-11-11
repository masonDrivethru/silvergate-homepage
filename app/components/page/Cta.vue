<script setup lang="ts">
// 하위 페이지 마무리: 문의하기 + 미팅 예약
const { pathTo } = useSiteNav();
</script>

<template>
  <section class="section pcta" aria-labelledby="pcta-title">
    <div class="container">
      <h2 id="pcta-title" class="section__title reveal">{{ $t('close.text') }}</h2>
      <div class="pcta__actions reveal">
        <a class="btn btn--silver btn--lg" :href="pathTo(CONTACT_PATH)">{{ $t('close.cta') }}</a>
        <a class="btn btn--glass btn--lg" :href="BOOK_URL" target="_blank" rel="noopener noreferrer">{{ $t('mn.demo') }}<span class="sr-only">{{ $t('a.newtab') }}</span></a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pcta { text-align: center; }
.pcta__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--s2); margin-top: var(--s5); }
</style>
