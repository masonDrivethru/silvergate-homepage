<script setup lang="ts">
const chip = useMockChip();
</script>

<template>
  <!-- ===== 2. Product: 목업이 세워지고, 단계가 하나씩 승인됨 ===== -->
  <section class="pin pin--product" id="product" data-scroll="product" aria-labelledby="product-title">
    <div class="pin__stage">
      <div class="hscroll">
        <div class="hscroll__track">
          <div class="hslide">
      <div class="container product">
        <p class="product__name">SilverBio Author</p>
        <h2 id="product-title" class="product__title">{{ $t('product.title') }}</h2>
        <figure class="mock" :aria-label="$t('a.mock')">
          <div class="mock__bar" aria-hidden="true">
            <span class="mock__dots"><i></i><i></i><i></i></span>
            <span class="mock__url">SilverBio Author</span>
          </div>
          <div class="mock__body" aria-hidden="true">
            <div class="mock__side">
              <span class="is-on">{{ $t('mock.s1') }}</span>
              <span>{{ $t('mock.s2') }}</span>
              <span>{{ $t('mock.s3') }}</span>
              <span>{{ $t('mock.s4') }}</span>
              <span>{{ $t('mock.s5') }}</span>
            </div>
            <div class="mock__main">
              <div class="mock__head">
                <div class="mock__doc"><strong>{{ $t('mock.doc') }}</strong><small>MBR-0142 &nbsp;v1.3</small></div>
                <span class="mock__chip" id="mockChip">{{ $t('s.' + chip) }}</span>
              </div>
              <ol class="mock__steps">
                <li class="seq"><b><svg><use href="#i-check"/></svg></b><span>{{ $t('mock.t1') }}</span><em>09:02</em></li>
                <li class="seq"><b><svg><use href="#i-check"/></svg></b><span>{{ $t('mock.t2') }}</span><em>09:18</em></li>
                <li class="seq"><b><svg><use href="#i-check"/></svg></b><span>{{ $t('mock.t3') }}</span><em>09:41</em></li>
                <li class="seq"><b><svg><use href="#i-check"/></svg></b><span>{{ $t('mock.t4') }}</span><em>10:26</em></li>
                <li class="seq"><b><svg><use href="#i-check"/></svg></b><span>{{ $t('mock.t5') }}</span><em>10:47</em></li>
              </ol>
              <div class="mock__sign">
                <div><p><small>{{ $t('mock.author') }}</small><i>J. Kim</i></p><span class="seq"><svg><use href="#i-check"/></svg></span></div>
                <div><p><small>{{ $t('mock.review') }}</small><i>S. Park</i></p><span class="seq"><svg><use href="#i-check"/></svg></span></div>
                <div><p><small>{{ $t('mock.approve') }}</small><i>QA Lead</i></p><span class="seq"><svg><use href="#i-check"/></svg></span></div>
              </div>
            </div>
          </div>
          <figcaption class="mock__note">{{ $t('mock.note') }}</figcaption>
        </figure>
      </div>
          </div>
          <div class="hslide">
      <div class="container product product--flat">
        <p class="product__name">{{ $t('mock.audit') }}</p>
        <h2 class="product__title">{{ $t('mock.auditTitle') }}</h2>
        <figure class="mock" :aria-label="$t('a.audit')">
          <div class="mock__bar" aria-hidden="true">
            <span class="mock__dots"><i></i><i></i><i></i></span>
            <span class="mock__url">SilverBio Author</span>
          </div>
          <div class="audit" aria-hidden="true">
            <div class="audit__head"><span>{{ $t('mock.hTime') }}</span><span>{{ $t('mock.hUser') }}</span><span>{{ $t('mock.hAction') }}</span><span>{{ $t('mock.hDetail') }}</span></div>
            <ol class="audit__rows">
              <li class="aseq"><time>09:18:04</time><span class="audit__user">J. Kim</span><b class="tag tag--edit">{{ $t('mock.aEdit') }}</b><span class="audit__detail">{{ $t('mock.a1') }}</span></li>
              <li class="aseq"><time>09:42:10</time><span class="audit__user">S. Park</span><b class="tag tag--note">{{ $t('mock.aNote') }}</b><span class="audit__detail">{{ $t('mock.a2') }}</span></li>
              <li class="aseq"><time>09:55:47</time><span class="audit__user">J. Kim</span><b class="tag tag--edit">{{ $t('mock.aEdit') }}</b><span class="audit__detail">{{ $t('mock.a3') }}</span></li>
              <li class="aseq"><time>10:26:12</time><span class="audit__user">J. Kim</span><b class="tag tag--sign">{{ $t('mock.aSign') }}</b><span class="audit__detail">{{ $t('mock.a4') }}</span></li>
              <li class="aseq"><time>10:31:05</time><span class="audit__user">S. Park</span><b class="tag tag--sign">{{ $t('mock.aSign') }}</b><span class="audit__detail">{{ $t('mock.a5') }}</span></li>
              <li class="aseq"><time>10:47:12</time><span class="audit__user">QA Lead</span><b class="tag tag--ok">{{ $t('mock.aOk') }}</b><span class="audit__detail">{{ $t('mock.a6') }}</span></li>
            </ol>
            <p class="audit__foot">{{ $t('mock.auditFoot') }}</p>
          </div>
          <figcaption class="mock__note">{{ $t('mock.note') }}</figcaption>
        </figure>
      </div>
          </div>
          <div class="hslide">
      <div class="container product product--flat">
        <p class="product__name">{{ $t('mock.esign') }}</p>
        <h2 class="product__title">{{ $t('mock.esignTitle') }}</h2>
        <figure class="mock" :aria-label="$t('a.esign')">
          <div class="mock__bar" aria-hidden="true">
            <span class="mock__dots"><i></i><i></i><i></i></span>
            <span class="mock__url">SilverBio Author</span>
          </div>
          <div class="esign" aria-hidden="true">
            <div class="esign__info">
              <div class="mock__doc"><strong>{{ $t('mock.doc') }}</strong><small>MBR-0142 &nbsp;v1.3</small></div>
              <dl class="esign__meta">
                <div><dt>{{ $t('mock.mSigner') }}</dt><dd>QA Lead</dd></div>
                <div><dt>{{ $t('mock.mMeaning') }}</dt><dd>{{ $t('mock.approve') }}</dd></div>
                <div><dt>{{ $t('mock.mTime') }}</dt><dd>2026-11-03 10:47:12 KST</dd></div>
              </dl>
              <ul class="esign__checks">
                <li class="sseq"><b><svg><use href="#i-check"/></svg></b><span>{{ $t('mock.c1') }}</span></li>
                <li class="sseq"><b><svg><use href="#i-check"/></svg></b><span>{{ $t('mock.c2') }}</span></li>
                <li class="sseq"><b><svg><use href="#i-check"/></svg></b><span>{{ $t('mock.c3') }}</span></li>
                <li class="sseq"><b><svg><use href="#i-check"/></svg></b><span>{{ $t('mock.c4') }}</span></li>
              </ul>
            </div>
            <div class="esign__seal sseq">
              <svg class="esign__mark"><use href="#sg-mark"/></svg>
              <strong>{{ $t('mock.signed') }}</strong>
              <small>10:47:12</small>
            </div>
          </div>
          <figcaption class="mock__note">{{ $t('mock.note') }}</figcaption>
        </figure>
      </div>
          </div>
        </div>
        <ol class="hdots" :aria-label="$t('a.slides')"><li class="is-on" role="button" tabindex="0" aria-label="1"></li><li role="button" tabindex="0" aria-label="2"></li><li role="button" tabindex="0" aria-label="3"></li></ol>
      </div>
    </div>
  </section>
</template>
