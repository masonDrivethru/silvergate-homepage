<template>
  <!-- ===== Mobile app tab bar ===== -->
  <nav class="tabbar" :aria-label="$t('a.mmenu')">
    <a href="#top" class="is-active"><svg aria-hidden="true"><use href="#i-house"/></svg><span>{{ $t('tab.home') }}</span></a>
    <a href="#product"><svg aria-hidden="true"><use href="#i-layout-grid"/></svg><span>{{ $t('nav.product') }}</span></a>
    <a href="#references"><svg aria-hidden="true"><use href="#i-award"/></svg><span>{{ $t('tab.ref') }}</span></a>
    <a href="#contact"><svg aria-hidden="true"><use href="#i-message-square"/></svg><span>{{ $t('tab.contact') }}</span></a>
  </nav>
</template>
