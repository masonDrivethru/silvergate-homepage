<script setup>
import { ref } from 'vue';
import { SgCompare } from '@silvergate/compare-vue';
import MyDocument from './MyDocument.vue'; // 고객사가 이미 가진 문서 화면 컴포넌트

const props = defineProps({ before: Object, after: Object });
const cmp = ref();
function onUpdate(ctrl) { console.log('변경', ctrl.stats); }
</script>

<template>
  <SgCompare ref="cmp" :left="props.before" :right="props.after"
             :left-label="props.before?.version" :right-label="props.after?.version"
             page=".page" locale="ko" height="80vh" @update="onUpdate">
    <template #doc="{ data }">
      <MyDocument :doc="data" />
    </template>
  </SgCompare>
</template>
