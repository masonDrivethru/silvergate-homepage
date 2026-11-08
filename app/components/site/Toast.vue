<script setup lang="ts">
const { state } = useToast();
</script>

<template>
  <div class="toast" id="toast" role="status" aria-live="polite" :class="{ 'is-show': state.show }">{{ state.msg }}</div>
</template>
