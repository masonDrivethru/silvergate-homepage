<template>
  <!-- ===== 1. Intro: 스크롤하면 로고가 작아지며 사라짐 ===== -->
  <section class="intro" data-scroll="intro" aria-labelledby="intro-title">
    <canvas class="intro__dust" aria-hidden="true"></canvas>
    <div class="container intro__inner">
      <div class="intro__focus">
      <svg class="intro__mark" viewBox="6 6 166 92" role="img" :aria-label="$t('a.logo')">
        <defs>
          <linearGradient id="mark-silver" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#ffffff"/>
            <stop offset=".5" stop-color="#b9bdc3"/>
            <stop offset="1" stop-color="#eceef0"/>
          </linearGradient>
          <linearGradient id="mark-glint" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="46" y2="18">
            <stop offset="0" stop-color="#fff" stop-opacity="0"/>
            <stop offset=".5" stop-color="#fff" stop-opacity=".95"/>
            <stop offset="1" stop-color="#fff" stop-opacity="0"/>
            <animateTransform attributeName="gradientTransform" type="translate" values="-70 0; 200 0; 200 0" keyTimes="0; .38; 1" dur="5.5s" begin="1.6s" repeatCount="indefinite"/>
          </linearGradient>
        </defs>
        <g fill="url(#mark-silver)"><path class="intro__deck" d="M8 72.5 C25 64 50 62 80 61.8 C110 61.6 140 66 170 72.5 C140 68.5 110 64.6 80 64.9 C50 65.2 25 66.5 8 72.5 Z"/><path class="intro__tower" d="M60.5 15.5 C61.2 25 62.6 33 64.2 38 C63.4 50 63.6 72 62.4 91.5 C61.4 72 61.2 50 60.6 40 C59.8 33 60 25 60.5 15.5 Z"/><path class="intro__tower" d="M118 8.5 C118.2 22 118.3 30 118.6 38 C118.3 52 118.2 74 116.9 95.5 C115.6 74 115.3 52 115.2 40 C114.4 36 113.6 34 112.2 33 C115.4 26 117.3 20 118 8.5 Z"/><path class="intro__cable" d="M35 53.3 Q50 48.5 61.5 29.5 L61.5 40.5 Q49 51 35 53.6 Z"/><path class="intro__cable" d="M61 30 C66 37 72 44.5 85 45.6 C97 45.8 105 38 116.5 24 L116.5 34 C107 42 97 49.4 85 49.6 C72 49.5 66 43 61.2 38 Z"/><path class="intro__cable" d="M117.5 32.5 C121 42 130 50 143 54.2 C129 52.5 121 48 117.5 40.5 Z"/></g><g class="intro__glint" fill="url(#mark-glint)"><path class="intro__deck" d="M8 72.5 C25 64 50 62 80 61.8 C110 61.6 140 66 170 72.5 C140 68.5 110 64.6 80 64.9 C50 65.2 25 66.5 8 72.5 Z"/><path class="intro__tower" d="M60.5 15.5 C61.2 25 62.6 33 64.2 38 C63.4 50 63.6 72 62.4 91.5 C61.4 72 61.2 50 60.6 40 C59.8 33 60 25 60.5 15.5 Z"/><path class="intro__tower" d="M118 8.5 C118.2 22 118.3 30 118.6 38 C118.3 52 118.2 74 116.9 95.5 C115.6 74 115.3 52 115.2 40 C114.4 36 113.6 34 112.2 33 C115.4 26 117.3 20 118 8.5 Z"/><path class="intro__cable" d="M35 53.3 Q50 48.5 61.5 29.5 L61.5 40.5 Q49 51 35 53.6 Z"/><path class="intro__cable" d="M61 30 C66 37 72 44.5 85 45.6 C97 45.8 105 38 116.5 24 L116.5 34 C107 42 97 49.4 85 49.6 C72 49.5 66 43 61.2 38 Z"/><path class="intro__cable" d="M117.5 32.5 C121 42 130 50 143 54.2 C129 52.5 121 48 117.5 40.5 Z"/></g>
      </svg>
      </div>
      <h1 id="intro-title" class="sr-only">SilverGate</h1>
    </div>
    <a href="#product" class="intro__next">
      <span>{{ $t('intro.scroll') }}</span>
      <svg class="icon" aria-hidden="true"><use href="#i-chevron-down"/></svg>
    </a>
  </section>
</template>
