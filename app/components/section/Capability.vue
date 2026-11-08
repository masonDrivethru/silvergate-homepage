<template>
  <!-- ===== 3-1. Capability matrix ===== -->
  <section class="section" aria-labelledby="cap-title">
    <div class="container">
      <h2 id="cap-title" class="section__title reveal">{{ $t('cap.title') }}</h2>
      <div class="table-glass reveal">
        <table class="matrix">
          <caption class="sr-only">{{ $t('cap.caption') }}</caption>
          <thead>
            <tr><th scope="col">{{ $t('cap.feature') }}</th><th scope="col">MBR</th><th scope="col">EBR</th><th scope="col">MES</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">{{ $t('cap.r1') }}</th><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td><td></td><td></td></tr>
            <tr><th scope="row">{{ $t('cap.r2') }}</th><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td><td></td></tr>
            <tr><th scope="row">{{ $t('cap.r3') }}</th><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td></tr>
            <tr><th scope="row">{{ $t('cap.r4') }}</th><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td></tr>
            <tr><th scope="row">{{ $t('cap.r5') }}</th><td></td><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td></tr>
            <tr><th scope="row">{{ $t('cap.r6') }}</th><td></td><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td><td></td></tr>
            <tr><th scope="row">{{ $t('cap.r7') }}</th><td></td><td></td><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td></tr>
            <tr><th scope="row">{{ $t('cap.r8') }}</th><td></td><td></td><td><i class="ok" role="img" :aria-label="$t('a.yes')"></i></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
</template>
