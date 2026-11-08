<script setup lang="ts">
const { t, locale } = useI18n();
const text = computed(() => t('words.text').trim());
const parts = computed(() => text.value.split(/\s+/));
</script>

<template>
  <!-- ===== 4. Strengths: 문장이 단어 단위로 채워짐 ===== -->
  <section class="pin pin--words" id="strengths" data-scroll="words" aria-labelledby="str-title">
    <div class="pin__stage">
      <div class="container words">
        <h2 id="str-title" class="words__text" :aria-label="text"><template v-for="(w, i) in parts" :key="locale + i"><span class="w" aria-hidden="true">{{ w }}</span><br v-if="w.endsWith('.') && i < parts.length - 1"><template v-else>{{ ' ' }}</template></template></h2>
        <ul class="pills">
          <li><svg class="icon" aria-hidden="true"><use href="#i-shield-check"/></svg>GMP</li>
          <li><svg class="icon" aria-hidden="true"><use href="#i-file-check"/></svg>CSV</li>
          <li><svg class="icon" aria-hidden="true"><use href="#i-database"/></svg><span>{{ $t('words.di') }}</span></li>
        </ul>
      </div>
    </div>
  </section>
</template>
