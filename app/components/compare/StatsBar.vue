<script setup lang="ts">
// 추가 / 수정 / 삭제 집계. 숫자는 엔진 결과(stats)를 그대로 보여 준다.
defineProps<{
  stats: { added: number; modified: number; deleted: number };
  countBy: 'step' | 'param';
}>();
</script>

<template>
  <div class="cmp-stats" role="status" aria-live="polite">
    <span class="cmp-stat is-add"><b>+{{ stats.added }}</b>{{ $t('cdemo.added') }}</span>
    <span class="cmp-stat is-mod"><b>~{{ stats.modified }}</b>{{ $t('cdemo.modified') }}</span>
    <span class="cmp-stat is-del"><b>−{{ stats.deleted }}</b>{{ $t('cdemo.deleted') }}</span>
    <span class="cmp-stats__unit">{{ $t(countBy === 'step' ? 'cdemo.unitStep' : 'cdemo.unitParam') }}</span>
  </div>
</template>
