<template>
  <!-- ===== 4-0. Industries: 바이오만이 아님 (팀 경력 기준, 고객사명은 쓰지 않음) ===== -->
  <section class="section" id="industries" aria-labelledby="ind-title">
    <div class="container">
      <h2 id="ind-title" class="section__title reveal">{{ $t('ind.title') }}</h2>
      <p class="section__note reveal">{{ $t('ind.note') }}</p>
      <ul class="industries reveal">
        <li>
          <svg class="icon" aria-hidden="true"><use href="#i-flask"/></svg>
          <h3>{{ $t('ind.bio') }}</h3>
          <p>{{ $t('ind.bioD') }}</p>
        </li>
        <li>
          <svg class="icon" aria-hidden="true"><use href="#i-umbrella"/></svg>
          <h3>{{ $t('ind.ins') }}</h3>
          <p>{{ $t('ind.insD') }}</p>
        </li>
        <li>
          <svg class="icon" aria-hidden="true"><use href="#i-landmark"/></svg>
          <h3>{{ $t('ind.fin') }}</h3>
          <p>{{ $t('ind.finD') }}</p>
        </li>
        <li>
          <svg class="icon" aria-hidden="true"><use href="#i-building"/></svg>
          <h3>{{ $t('ind.pub') }}</h3>
          <p>{{ $t('ind.pubD') }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>
