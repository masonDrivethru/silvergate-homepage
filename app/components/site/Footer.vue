<script setup lang="ts">
const year = useState('year', () => String(new Date().getFullYear()));
onMounted(() => { year.value = String(new Date().getFullYear()); });
const { homeHref } = useSiteNav();
</script>

<template>
  <footer class="footer">
    <div class="container footer__inner">
      <a :href="homeHref" class="brand"><svg class="brand__mark" aria-hidden="true"><use href="#sg-mark"/></svg><span>SilverGate</span></a>
      <div class="footer__info">
        <p><span>{{ $t('ft.co') }}</span> &nbsp; <span>{{ $t('ft.ceo') }}</span> &nbsp; <span>{{ $t('ft.biz') }}</span> 721-86-03864</p>
        <p>{{ $t('ft.addr') }}</p>
        <p>© <span id="year">{{ year }}</span> SilverGate Co., Ltd.</p>
      </div>
    </div>
  </footer>
</template>
