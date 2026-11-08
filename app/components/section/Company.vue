<template>
  <!-- ===== 6. Company ===== -->
  <section class="section" id="company" aria-labelledby="co-title">
    <div class="container split">
      <h2 id="co-title" class="section__title reveal">{{ $t('co.title') }}</h2>
      <dl class="facts reveal">
        <div><dt>{{ $t('co.name') }}</dt><dd>{{ $t('co.nameV') }}</dd></div>
        <div><dt>{{ $t('co.ceo') }}</dt><dd>Changkeun Lee</dd></div>
        <div><dt>{{ $t('co.founded') }}</dt><dd>{{ $t('co.foundedV') }}</dd></div>
        <div><dt>{{ $t('co.loc') }}</dt><dd>{{ $t('co.locV') }}</dd></div>
      </dl>
    </div>
  </section>
</template>
