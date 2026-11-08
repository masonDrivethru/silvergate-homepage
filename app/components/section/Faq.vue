<script setup lang="ts">
const open = ref(0);
const toggle = (i: number) => { open.value = open.value === i ? 0 : i; };
</script>

<template>
  <!-- ===== 4-1. FAQ: 자주 묻는 질문 (누르면 부드럽게 펼쳐짐) ===== -->
  <section class="section" id="faq" aria-labelledby="faq-title">
    <div class="container">
      <h2 id="faq-title" class="section__title reveal">{{ $t('faq.title') }}</h2>
      <ul class="faq reveal">
        <li class="faq__item" :class="{ 'is-open': open === 1 }">
          <h3><button type="button" class="faq__q" :aria-expanded="open === 1" @click="toggle(1)" aria-controls="faq-a1" id="faq-q1"><span>{{ $t('faq.q1') }}</span><i aria-hidden="true"></i></button></h3>
          <div class="faq__a" id="faq-a1" role="region" aria-labelledby="faq-q1"><div><p>{{ $t('faq.a1') }}</p></div></div>
        </li>
        <li class="faq__item" :class="{ 'is-open': open === 2 }">
          <h3><button type="button" class="faq__q" :aria-expanded="open === 2" @click="toggle(2)" aria-controls="faq-a2" id="faq-q2"><span>{{ $t('faq.q2') }}</span><i aria-hidden="true"></i></button></h3>
          <div class="faq__a" id="faq-a2" role="region" aria-labelledby="faq-q2"><div><p>{{ $t('faq.a2') }}</p></div></div>
        </li>
        <li class="faq__item" :class="{ 'is-open': open === 3 }">
          <h3><button type="button" class="faq__q" :aria-expanded="open === 3" @click="toggle(3)" aria-controls="faq-a3" id="faq-q3"><span>{{ $t('faq.q3') }}</span><i aria-hidden="true"></i></button></h3>
          <div class="faq__a" id="faq-a3" role="region" aria-labelledby="faq-q3"><div><p>{{ $t('faq.a3') }}</p></div></div>
        </li>
        <li class="faq__item" :class="{ 'is-open': open === 4 }">
          <h3><button type="button" class="faq__q" :aria-expanded="open === 4" @click="toggle(4)" aria-controls="faq-a4" id="faq-q4"><span>{{ $t('faq.q4') }}</span><i aria-hidden="true"></i></button></h3>
          <div class="faq__a" id="faq-a4" role="region" aria-labelledby="faq-q4"><div><p>{{ $t('faq.a4') }}</p></div></div>
        </li>
        <li class="faq__item" :class="{ 'is-open': open === 5 }">
          <h3><button type="button" class="faq__q" :aria-expanded="open === 5" @click="toggle(5)" aria-controls="faq-a5" id="faq-q5"><span>{{ $t('faq.q5') }}</span><i aria-hidden="true"></i></button></h3>
          <div class="faq__a" id="faq-a5" role="region" aria-labelledby="faq-q5"><div><p>{{ $t('faq.a5') }}</p></div></div>
        </li>
        <li class="faq__item" :class="{ 'is-open': open === 6 }">
          <h3><button type="button" class="faq__q" :aria-expanded="open === 6" @click="toggle(6)" aria-controls="faq-a6" id="faq-q6"><span>{{ $t('faq.q6') }}</span><i aria-hidden="true"></i></button></h3>
          <div class="faq__a" id="faq-a6" role="region" aria-labelledby="faq-q6"><div><p>{{ $t('faq.a6') }}</p></div></div>
        </li>
      </ul>
    </div>
  </section>
</template>
