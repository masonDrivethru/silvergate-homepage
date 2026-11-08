<template>
  <!-- ===== 6-1. Closing: 큰 문장이 줄어들며 자리 잡고, 버튼이 나타남 ===== -->
  <section class="pin pin--close" data-scroll="close" aria-labelledby="close-title">
    <div class="pin__stage">
      <div class="container closing">
        <h2 id="close-title" class="closing__text">{{ $t('close.text') }}</h2>
        <a href="#contact" class="btn btn--silver btn--lg closing__cta">{{ $t('close.cta') }}</a>
      </div>
    </div>
  </section>
</template>
