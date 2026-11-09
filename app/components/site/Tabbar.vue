<script setup lang="ts">
const { href, homeHref, isHome, pathTo, isCurrent } = useSiteNav();
</script>

<template>
  <!-- ===== Mobile app tab bar ===== -->
  <nav class="tabbar tabbar--5" :aria-label="$t('a.mmenu')">
    <a :href="homeHref" :class="{ 'is-active': isHome }"><svg aria-hidden="true"><use href="#i-house"/></svg><span>{{ $t('tab.home') }}</span></a>
    <a :href="href('product')"><svg aria-hidden="true"><use href="#i-layout-grid"/></svg><span>{{ $t('nav.product') }}</span></a>
    <a :href="pathTo(PRODUCT_AUTHOR_PATH)" :class="{ 'is-active': isCurrent(PRODUCT_AUTHOR_PATH) }"><svg aria-hidden="true"><use href="#i-clipboard-list"/></svg><span>{{ $t('nav.authorTab') }}</span></a>
    <a :href="href('references')"><svg aria-hidden="true"><use href="#i-award"/></svg><span>{{ $t('tab.ref') }}</span></a>
    <a :href="href('contact')"><svg aria-hidden="true"><use href="#i-message-square"/></svg><span>{{ $t('tab.contact') }}</span></a>
  </nav>
</template>
