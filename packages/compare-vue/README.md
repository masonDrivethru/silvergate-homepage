# @silvergate/compare-vue

Vue 3 에서 쓰는 화면 비교 부품. 실제 비교·표시는 `@silvergate/compare-dom` 이 하고, 이 패키지는 감싸기만 합니다.
**기존 문서 컴포넌트는 고치지 않습니다.** 왼쪽·오른쪽에 그대로 두 번 그리고, 그려진 화면을 비교합니다.

```vue
<script setup>
import { SgCompare } from '@silvergate/compare-vue';
import MbrDocument from './MbrDocument.vue';  // 원래 쓰던 문서 화면
const props = defineProps(['v1', 'v2']);
</script>

<template>
  <SgCompare :left="v1" :right="v2" left-label="v1.0" right-label="v1.1" page=".page" height="85vh">
    <template #doc="{ data }"><MbrDocument :doc="data" /></template>
  </SgCompare>
</template>
```

- 데이터가 바뀌어 화면이 다시 그려지면 자동으로 다시 비교합니다.
- props: `left`, `right`, `leftLabel`, `rightLabel`, `mode`('side' | 'redline', v-model:mode), `locale`('ko' | 'en'), `labels`, `page`, `height`, `options`(compare-dom 옵션), `toolbar`, `list`
- 이벤트: `update`(비교 끝), `focus`(변경 위치로 이동)
- 레이아웃을 직접 만들 때: `useCompare(leftRef, rightRef, { page: '.page' })`
- Nuxt 에서는 `<ClientOnly>` 안에 두세요 (브라우저 화면을 읽기 때문).

반복 항목에 바뀌지 않는 ID 를 `data-sgc-key` 로 달아 두면 더 정확합니다. 자세한 것은 compare-dom README.
