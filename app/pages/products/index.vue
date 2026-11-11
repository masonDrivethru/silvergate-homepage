<script setup lang="ts">
// 제품 (전체 제품 목록). 지금은 SilverBio Author 하나, 제품이 늘면 products 배열에 추가
useSubPage('/products', 'products');
const { pathTo } = useSiteNav();
const products = [{ name: 'SilverBio Author', to: PRODUCT_AUTHOR_PATH, desc: 'pd.lead', tags: ['MBR', 'GMP', 'Part 11'] }];
</script>

<template>
  <PageHero :eyebrow="$t('pg.products.eyebrow')" :title="$t('pg.products.title')" :lead="$t('pg.products.lead')" />

  <section class="section" aria-labelledby="plist-title">
    <div class="container">
      <h2 id="plist-title" class="sr-only">{{ $t('mn.allProducts') }}</h2>
      <ul class="projects plist reveal">
        <li v-for="p in products" :key="p.to" class="project">
          <p class="project__client">{{ $t('pg.products.cardLabel') }}</p>
          <h3 class="project__title">{{ p.name }}</h3>
          <p class="plist__desc">{{ $t(p.desc) }}</p>
          <p class="project__tags"><span v-for="tg in p.tags" :key="tg" class="chip">{{ tg }}</span></p>
          <div class="plist__actions">
            <a class="btn btn--silver" :href="pathTo(p.to)">{{ $t('mn.learnMore') }}</a>
            <a class="btn btn--glass" :href="pathTo(CONTACT_PATH)">{{ $t('mn.contactUs') }}</a>
          </div>
        </li>
      </ul>
    </div>
  </section>

  <SectionCapability />
  <PageCta />
</template>

<style scoped>
.plist { grid-template-columns: minmax(0, 1fr); }
.plist__desc { margin-top: var(--s2); max-width: 60ch; color: var(--text-2); }
.plist__actions { display: flex; flex-wrap: wrap; gap: var(--s2); margin-top: var(--s4); }
</style>
