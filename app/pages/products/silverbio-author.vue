<script setup lang="ts">
// 제품 상세: SilverBio Author (샘플 페이지). 내용은 홈·챗봇 설정에 있는 사실만 사용
const { t, locale } = useI18n();
const { homePath } = useSiteNav();
const BOOK_URL = 'https://calendar.app.google/wLYapJcPyoxVQvN78';

usePageSeo({
  path: PRODUCT_AUTHOR_PATH,
  title: () => t('pd.metaTitle'),
  description: () => t('pd.metaDesc'),
  ogTitle: () => t('pd.ogTitle'),
  ogDescription: () => t('pd.ogDesc'),
  ogImage: () => `/assets/og/silverbio-author-${locale.value}.png`,
});
useReveal();

const features = [
  { icon: 'i-clipboard-list', key: 'f1' },
  { icon: 'i-layers', key: 'f2' },
  { icon: 'i-file-check', key: 'f3' },
  { icon: 'i-history', key: 'f4' },
];
const regs = ['c1', 'c2', 'c3', 'c4'];
const steps = [
  { icon: 'i-clipboard-list', key: 'r1' },
  { icon: 'i-layers', key: 'r2' },
  { icon: 'i-shield-check', key: 'r3' },
  { icon: 'i-factory', key: 'r4' },
];
</script>

<template>
  <!-- ===== 소개 ===== -->
  <section class="section pd-hero" aria-labelledby="pd-title">
    <div class="container">
      <p class="product__name reveal">{{ $t('pd.eyebrow') }}</p>
      <h1 id="pd-title" class="pd-hero__title reveal">{{ $t('pd.title') }}</h1>
      <p class="pd-hero__lead reveal">{{ $t('pd.lead') }}</p>
      <div class="pd-actions reveal">
        <a class="btn btn--silver btn--lg" :href="homePath + '#contact'">{{ $t('pd.contact') }}</a>
        <a class="btn btn--glass btn--lg" :href="BOOK_URL" target="_blank" rel="noopener noreferrer">{{ $t('pd.book') }}<span class="sr-only">{{ $t('a.newtab') }}</span></a>
      </div>
    </div>
  </section>

  <!-- ===== 주요 기능 ===== -->
  <section class="section" aria-labelledby="pd-feat">
    <div class="container">
      <h2 id="pd-feat" class="section__title reveal">{{ $t('pd.featTitle') }}</h2>
      <ul class="industries reveal">
        <li v-for="f in features" :key="f.key">
          <svg class="icon" aria-hidden="true"><use :href="'#' + f.icon"/></svg>
          <h3>{{ $t('pd.' + f.key) }}</h3>
          <p>{{ $t('pd.' + f.key + 'd') }}</p>
        </li>
      </ul>
    </div>
  </section>

  <!-- ===== 규정 대응 ===== -->
  <section class="section" aria-labelledby="pd-comp">
    <div class="container split">
      <div class="reveal">
        <h2 id="pd-comp" class="section__title">{{ $t('pd.compTitle') }}</h2>
        <p class="section__note">{{ $t('pd.compNote') }}</p>
      </div>
      <dl class="facts pd-facts reveal">
        <div v-for="r in regs" :key="r"><dt>{{ $t('pd.' + r) }}</dt><dd>{{ $t('pd.' + r + 'd') }}</dd></div>
      </dl>
    </div>
  </section>

  <!-- ===== 프로젝트 진행 ===== -->
  <section class="section" aria-labelledby="pd-run">
    <div class="container">
      <h2 id="pd-run" class="section__title reveal">{{ $t('pd.runTitle') }}</h2>
      <ol class="industries pd-steps reveal">
        <li v-for="(s, i) in steps" :key="s.key">
          <svg class="icon" aria-hidden="true"><use :href="'#' + s.icon"/></svg>
          <h3><span class="pd-steps__no">{{ i + 1 }}</span>{{ $t('pd.' + s.key) }}</h3>
          <p>{{ $t('pd.' + s.key + 'd') }}</p>
        </li>
      </ol>
    </div>
  </section>

  <!-- ===== 마무리 ===== -->
  <section class="section pd-close" aria-labelledby="pd-close">
    <div class="container">
      <h2 id="pd-close" class="section__title reveal">{{ $t('close.text') }}</h2>
      <div class="pd-actions reveal">
        <a class="btn btn--silver btn--lg" :href="homePath + '#contact'">{{ $t('close.cta') }}</a>
        <a class="btn btn--glass btn--lg" :href="homePath">{{ $t('pd.backHome') }}</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
/* 이 페이지에만 쓰는 배치. 색·글꼴·카드 모양은 전체 디자인(style.css)을 그대로 따른다 */
.pd-hero { padding-top: calc(var(--nav-h) + clamp(48px, 10vh, 120px)); }
.pd-hero__title { margin-top: var(--s2); max-width: 18ch; font-size: var(--fs-h2); line-height: 1.15; }
.pd-hero__lead { margin-top: var(--s3); max-width: 60ch; color: var(--text-2); font-size: 1.125rem; }
.pd-actions { display: flex; flex-wrap: wrap; gap: var(--s2); margin-top: var(--s5); }
.pd-facts div { grid-template-columns: 168px minmax(0, 1fr); }
.pd-steps__no { margin-right: 10px; color: var(--text-3); font-variant-numeric: tabular-nums; }
.pd-close { text-align: center; }
.pd-close .pd-actions { justify-content: center; }
@media (max-width: 600px) {
  .pd-facts div { grid-template-columns: minmax(0, 1fr); gap: 4px; }
}
</style>
