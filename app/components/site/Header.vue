<script setup lang="ts">
const { locale, switchLang } = useSiteLang();
const { isLight, toggle } = useTheme();
const canInstall = useState('pwa-can-install', () => false);
const { $installApp } = useNuxtApp();
const { href, homeHref, pathTo, isCurrent } = useSiteNav();
</script>

<template>
  <!-- ===== Header ===== -->
  <header class="nav" id="top">
    <div class="container nav__inner">
      <a :href="homeHref" class="brand" :aria-label="$t('a.home')">
        <svg class="brand__mark" aria-hidden="true"><use href="#sg-mark"/></svg>
        <span>SilverGate</span>
      </a>
      <nav class="nav__links" :aria-label="$t('a.menu')">
        <a :href="href('product')">{{ $t('nav.product') }}</a>
        <a :href="pathTo(PRODUCT_AUTHOR_PATH)" :class="{ 'is-active': isCurrent(PRODUCT_AUTHOR_PATH) }">{{ $t('nav.author') }}</a>
        <a :href="href('solutions')">{{ $t('nav.solutions') }}</a>
        <a :href="href('references')">{{ $t('nav.references') }}</a>
        <a :href="href('company')">{{ $t('nav.company') }}</a>
      </nav>
      <div class="nav__actions">
        <button class="btn btn--glass btn--sm install-btn" id="installBtn" type="button" :hidden="!canInstall" @click="$installApp()">{{ $t('nav.install') }}</button>
        <button class="theme" id="themeBtn" type="button" :aria-label="$t(isLight ? 'a.toDark' : 'a.toLight')" :aria-pressed="isLight" @click="toggle">
          <svg class="t-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          <svg class="t-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
        </button>
        <div class="lang" role="group" :aria-label="$t('a.lang')">
          <button type="button" data-lang="en" :aria-pressed="locale === 'en'" lang="en" @click="switchLang('en')">EN</button>
          <button type="button" data-lang="ko" :aria-pressed="locale === 'ko'" lang="ko" @click="switchLang('ko')">KO</button>
        </div>
      </div>
    </div>
  </header>
</template>
