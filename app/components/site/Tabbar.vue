<script setup lang="ts">
// 휴대폰 아래 탭: 홈 · 제품 · 실적 · 회사 · 문의 (각 페이지로 이동)
const { homeHref, isHome, pathTo, isUnder } = useSiteNav();
const tabs = [
  { to: '/products', icon: 'i-layout-grid', label: 'nav.product' },
  { to: '/references', icon: 'i-award', label: 'tab.ref' },
  { to: '/company', icon: 'i-building', label: 'nav.company' },
  { to: CONTACT_PATH, icon: 'i-message-square', label: 'tab.contact' },
];
</script>

<template>
  <!-- ===== Mobile app tab bar ===== -->
  <nav class="tabbar tabbar--5" :aria-label="$t('a.mmenu')">
    <a :href="homeHref" :class="{ 'is-active': isHome }"><svg aria-hidden="true"><use href="#i-house"/></svg><span>{{ $t('tab.home') }}</span></a>
    <a v-for="tb in tabs" :key="tb.to" :href="pathTo(tb.to)" :class="{ 'is-active': isUnder(tb.to) }"><svg aria-hidden="true"><use :href="'#' + tb.icon"/></svg><span>{{ $t(tb.label) }}</span></a>
  </nav>
</template>
