<script setup lang="ts">
// 오류 페이지 (없는 주소 404 등). 사이트 머리글·바닥글·디자인을 그대로 쓰고, 주소(/ko/...)에 맞는 언어로 보여준다
import type { NuxtError } from '#app';

const props = defineProps<{ error: NuxtError }>();
const { t } = useI18n();
const { homePath, pathTo } = useSiteNav();
const is404 = computed(() => props.error?.statusCode === 404);

useHead({
  title: () => t(is404.value ? 'err.metaTitle404' : 'err.metaTitle'),
  meta: [{ name: 'robots', content: 'noindex' }],
});
</script>

<template>
  <NuxtLayout>
    <section class="section err" aria-labelledby="err-title">
      <div class="container">
        <p class="product__name">{{ error?.statusCode || 500 }}</p>
        <h1 id="err-title" class="err__title">{{ $t(is404 ? 'err.title404' : 'err.title') }}</h1>
        <p class="err__body">{{ $t(is404 ? 'err.body404' : 'err.body') }}</p>
        <div class="err__actions">
          <a class="btn btn--silver btn--lg" :href="homePath">{{ $t('err.home') }}</a>
          <a class="btn btn--glass btn--lg" :href="pathTo(PRODUCT_AUTHOR_PATH)">{{ $t('nav.author') }}</a>
          <a class="btn btn--glass btn--lg" :href="homePath + '#contact'">{{ $t('err.contact') }}</a>
        </div>
      </div>
    </section>
  </NuxtLayout>
</template>

<style scoped>
/* 화면 가운데에 크게. 색·글꼴·버튼은 전체 디자인(style.css)을 그대로 따른다 */
.err { min-height: calc(100vh - var(--nav-h)); display: flex; align-items: center; padding-top: calc(var(--nav-h) + var(--s6)); text-align: center; }
.err .container { width: 100%; }
.err__title { margin-top: var(--s2); font-size: var(--fs-h2); line-height: 1.2; }
.err__body { margin: var(--s2) auto 0; max-width: 46ch; color: var(--text-2); }
.err__actions { display: flex; flex-wrap: wrap; justify-content: center; gap: var(--s2); margin-top: var(--s5); }
</style>
