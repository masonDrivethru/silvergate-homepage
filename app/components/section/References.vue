<template>
  <!-- ===== 5. References ===== -->
  <section class="section" id="references" aria-labelledby="ref-title">
    <div class="container">
      <h2 id="ref-title" class="section__title reveal">{{ $t('ref.title') }}</h2>
      <ul class="projects reveal">
        <li class="project">
          <p class="project__status"><span class="live" aria-hidden="true"></span><span>{{ $t('ref.live') }}</span></p>
          <p class="project__client">{{ $t('ref.p1.client') }}</p>
          <h3 class="project__title">MES MBR&nbsp;· PCS&nbsp;· EBR Authoring</h3>
          <dl class="project__meta">
            <div><dt>{{ $t('ref.field') }}</dt><dd>{{ $t('ind.bio') }}</dd></div>
            <div><dt>{{ $t('ref.scope') }}</dt><dd>{{ $t('ref.p1.scope') }}</dd></div>
            <div><dt>{{ $t('ref.since') }}</dt><dd>{{ $t('ref.p1.since') }}</dd></div>
            <div><dt>{{ $t('ref.partner') }}</dt><dd>{{ $t('ref.p1.partner') }}</dd></div>
          </dl>
          <p class="project__tags"><span class="chip">Vue 3</span><span class="chip">Java</span><span class="chip">Oracle</span><span class="chip">WebLogic</span></p>
        </li>
        <li class="project">
          <p class="project__status"><span class="live" aria-hidden="true"></span><span>{{ $t('ref.live') }}</span></p>
          <p class="project__client">{{ $t('ref.p2.client') }}</p>
          <h3 class="project__title">{{ $t('ref.p2.title') }}</h3>
          <dl class="project__meta">
            <div><dt>{{ $t('ref.field') }}</dt><dd>{{ $t('ref.p2.field') }}</dd></div>
            <div><dt>{{ $t('ref.partner') }}</dt><dd>{{ $t('ref.p2.partner') }}</dd></div>
          </dl>
        </li>
      </ul>

      <!-- 고객사 목록 (2021 개인사업자 등록 이후 수행)
           공식 로고로 바꾸려면: assets/clients/에 파일을 넣고 <span class="client__name">을
           <img class="client__logo" src="assets/clients/파일명.svg" alt="회사명" />으로 바꾸면 은색 단색으로 표시됨 -->
      <h3 class="clients__title reveal">{{ $t('cl.title') }}</h3>
      <ul class="clients reveal">
        <li class="client"><a class="client__link" href="https://www.samsungbiologics.com/" target="_blank" rel="noopener noreferrer"><span class="client__name">{{ $t('cl.c1') }}</span><span class="sr-only">{{ $t('a.newtab') }}</span></a><span class="client__field">{{ $t('ind.bio') }}</span></li>
        <li class="client"><a class="client__link" href="https://www.airport.kr/" target="_blank" rel="noopener noreferrer"><span class="client__name">{{ $t('cl.c2') }}</span><span class="sr-only">{{ $t('a.newtab') }}</span></a><span class="client__field">{{ $t('ind.pub') }}</span></li>
        <li class="client"><a class="client__link" href="https://www.nps.or.kr/" target="_blank" rel="noopener noreferrer"><span class="client__name">{{ $t('cl.c3') }}</span><span class="sr-only">{{ $t('a.newtab') }}</span></a><span class="client__field">{{ $t('ind.pub') }}</span></li>
        <li class="client"><a class="client__link" href="https://www.hwgeneralins.com/" target="_blank" rel="noopener noreferrer"><span class="client__name">{{ $t('cl.c4') }}</span><span class="sr-only">{{ $t('a.newtab') }}</span></a><span class="client__field">{{ $t('ind.ins') }}</span></li>
        <li class="client"><a class="client__link" href="https://www.kblife.co.kr/" target="_blank" rel="noopener noreferrer"><span class="client__name">{{ $t('cl.c5') }}</span><span class="sr-only">{{ $t('a.newtab') }}</span></a><span class="client__field">{{ $t('ind.ins') }}</span></li>
        <li class="client"><a class="client__link" href="https://www.lina.co.kr/" target="_blank" rel="noopener noreferrer"><span class="client__name">{{ $t('cl.c6') }}</span><span class="sr-only">{{ $t('a.newtab') }}</span></a><span class="client__field">{{ $t('ind.ins') }}</span></li>
      </ul>
      <p class="partners reveal"><span>{{ $t('cl.partners') }}</span><span class="chip">{{ $t('ref.p2.partner') }}</span><span class="chip">{{ $t('cl.pt2') }}</span></p>
    </div>
  </section>
</template>
