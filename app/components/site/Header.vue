<script setup lang="ts">
// 머리글: PC는 마우스를 올리면 펼쳐지는 큰 메뉴(애플 홈페이지 방식), 휴대폰은 ☰ 버튼으로 여는 전체 화면 메뉴
const { locale, switchLang } = useSiteLang();
const { isLight, toggle } = useTheme();
const canInstall = useState('pwa-can-install', () => false);
const { $installApp } = useNuxtApp();
const { homeHref, pathTo, isUnder } = useSiteNav();

const menu = SITE_MENU;
const open = ref<string | null>(null);      // PC: 펼쳐진 메뉴
const mobileOpen = ref(false);              // 휴대폰: 전체 메뉴
let timer: ReturnType<typeof setTimeout> | undefined;

// 마우스를 잠깐 스치기만 해도 열리지 않게 살짝 늦게, 다른 메뉴로 옮길 때는 바로
const enter = (key: string | null) => {
  clearTimeout(timer);
  if (open.value) { open.value = key; return; }
  timer = setTimeout(() => { open.value = key; }, 120);
};
const leave = () => { clearTimeout(timer); timer = setTimeout(() => { open.value = null; }, 160); };
const closeAll = () => { clearTimeout(timer); open.value = null; mobileOpen.value = false; };
const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAll(); };

watch(mobileOpen, (v) => { document.documentElement.classList.toggle('menu-open', v); });
onMounted(() => addEventListener('keydown', onKey));
onBeforeUnmount(() => { removeEventListener('keydown', onKey); document.documentElement.classList.remove('menu-open'); });

const { t } = useI18n();
const linkText = (l: MenuLink) => l.text ?? (l.label ? t(l.label) : '');
</script>

<template>
  <!-- ===== Header ===== -->
  <header class="nav" :class="{ 'is-open': open, 'is-mopen': mobileOpen }" id="top" @mouseleave="leave">
    <div class="container nav__inner">
      <a :href="homeHref" class="brand" :aria-label="$t('a.home')">
        <svg class="brand__mark" aria-hidden="true"><use href="#sg-mark"/></svg>
        <span>SilverGate</span>
      </a>
      <nav class="nav__links" :aria-label="$t('a.menu')">
        <a v-for="g in menu" :key="g.key" :href="pathTo(g.to)" :class="{ 'is-active': isUnder(g.to), 'is-hover': open === g.key }"
           @mouseenter="enter(g.key)">{{ $t(g.label) }}</a>
        <a :href="pathTo(CONTACT_PATH)" :class="{ 'is-active': isUnder(CONTACT_PATH) }" @mouseenter="enter(null)">{{ $t('nav.contact') }}</a>
      </nav>
      <div class="nav__actions" @mouseenter="enter(null)">
        <button class="btn btn--glass btn--sm install-btn" id="installBtn" type="button" :hidden="!canInstall" @click="$installApp()">{{ $t('nav.install') }}</button>
        <button class="theme" id="themeBtn" type="button" :aria-label="$t(isLight ? 'a.toDark' : 'a.toLight')" :aria-pressed="isLight" @click="toggle">
          <svg class="t-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          <svg class="t-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
        </button>
        <div class="lang" role="group" :aria-label="$t('a.lang')">
          <button type="button" data-lang="en" :aria-pressed="locale === 'en'" lang="en" @click="switchLang('en')">EN</button>
          <button type="button" data-lang="ko" :aria-pressed="locale === 'ko'" lang="ko" @click="switchLang('ko')">KO</button>
        </div>
        <button class="burger" type="button" :aria-expanded="mobileOpen" aria-controls="mmenu" :aria-label="$t(mobileOpen ? 'a.closeMenu' : 'a.openMenu')" @click="mobileOpen = !mobileOpen">
          <i aria-hidden="true"></i><i aria-hidden="true"></i>
        </button>
      </div>
    </div>

    <!-- PC 펼침 메뉴: 마우스를 올리면 열린다(키보드는 위 링크로 각 페이지에 바로 간다). 메뉴마다 한 판. 왼쪽은 큰 글씨(둘러보기), 오른쪽은 작은 글씨(더 알아보기) -->
    <div class="mega" @mouseenter="enter(open)">
      <div v-for="g in menu" :key="g.key" class="mega__panel" :class="{ 'is-on': open === g.key }" :inert="open !== g.key">
        <div class="container mega__inner">
          <div class="mega__col">
            <p class="mega__head">{{ $t('mn.explore') }}</p>
            <ul class="mega__main">
              <li v-for="l in g.main" :key="l.to"><a :href="pathTo(l.to)" @click="closeAll">{{ linkText(l) }}</a></li>
            </ul>
          </div>
          <div class="mega__col">
            <p class="mega__head">{{ $t('mn.more') }}</p>
            <ul class="mega__more">
              <li v-for="l in g.more" :key="l.to">
                <a :href="pathTo(l.to)" :target="l.external ? '_blank' : undefined" :rel="l.external ? 'noopener noreferrer' : undefined" @click="closeAll">{{ linkText(l) }}<span v-if="l.external" class="sr-only">{{ $t('a.newtab') }}</span></a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 휴대폰 전체 메뉴 -->
    <div id="mmenu" class="mmenu" :inert="!mobileOpen">
      <div class="container">
        <section v-for="g in menu" :key="g.key" class="mmenu__group">
          <a class="mmenu__top" :href="pathTo(g.to)" @click="closeAll">{{ $t(g.label) }}</a>
          <ul>
            <li v-for="l in [...g.main, ...g.more].filter((l, i, a) => a.findIndex((x) => x.to === l.to) === i)" :key="l.to">
              <a :href="pathTo(l.to)" :target="l.external ? '_blank' : undefined" :rel="l.external ? 'noopener noreferrer' : undefined" @click="closeAll">{{ linkText(l) }}</a>
            </li>
          </ul>
        </section>
        <section class="mmenu__group">
          <a class="mmenu__top" :href="pathTo(CONTACT_PATH)" @click="closeAll">{{ $t('nav.contact') }}</a>
        </section>
      </div>
    </div>
  </header>
  <div class="mega-scrim" :class="{ 'is-on': open }" aria-hidden="true" @mouseenter="closeAll"></div>
</template>
