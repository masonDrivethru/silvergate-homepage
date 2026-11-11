<script setup lang="ts">
// more: 홈에서만 '자세히 보기' 링크를 보여 준다
defineProps<{ more?: boolean }>();
const { pathTo } = useSiteNav();
</script>

<template>
  <!-- ===== 4-0. Industries: 바이오만이 아님 (팀 경력 기준, 고객사명은 쓰지 않음) ===== -->
  <section class="section" id="industries" aria-labelledby="ind-title">
    <div class="container">
      <h2 id="ind-title" class="section__title reveal">{{ $t('ind.title') }}</h2>
      <p class="section__note reveal">{{ $t('ind.note') }}</p>
      <ul class="industries reveal">
        <li id="bio">
          <svg class="icon" aria-hidden="true"><use href="#i-flask"/></svg>
          <h3>{{ $t('ind.bio') }}</h3>
          <p>{{ $t('ind.bioD') }}</p>
        </li>
        <li id="insurance">
          <svg class="icon" aria-hidden="true"><use href="#i-umbrella"/></svg>
          <h3>{{ $t('ind.ins') }}</h3>
          <p>{{ $t('ind.insD') }}</p>
        </li>
        <li id="finance">
          <svg class="icon" aria-hidden="true"><use href="#i-landmark"/></svg>
          <h3>{{ $t('ind.fin') }}</h3>
          <p>{{ $t('ind.finD') }}</p>
        </li>
        <li id="public">
          <svg class="icon" aria-hidden="true"><use href="#i-building"/></svg>
          <h3>{{ $t('ind.pub') }}</h3>
          <p>{{ $t('ind.pubD') }}</p>
        </li>
      </ul>
      <p v-if="more" class="more-link reveal"><a :href="pathTo('/industries')">{{ $t('mn.learnMore') }} <span aria-hidden="true">→</span><span class="sr-only">: {{ $t('ind.title') }}</span></a></p>
    </div>
  </section>
</template>
