<script setup lang="ts">
// 변경 목록. 항목을 누르면 select 이벤트로 알리고, 이동은 부모가 한다.
import type { Change } from '~/compare/types.js';

defineProps<{ changes: Change[]; activeId: string | null }>();
const emit = defineEmits<{ select: [change: Change] }>();
const { t } = useI18n();

const MARK = { added: '+', modified: '~', deleted: '−' } as const;

/** 어디서: "1.2 배양 온도 설정" 또는 그룹 이름 */
function where(c: Change) {
  return c.level === 'group' ? c.groupTitle : `${c.stepId} ${c.stepTitle}`;
}

/** 무엇이: 화면 문구는 field·level로 i18n에서 고른다 (엔진은 문구를 만들지 않음) */
function what(c: Change) {
  if (c.level === 'param') {
    if (c.type === 'added') return t('cdemo.paramAdded', { label: c.label });
    if (c.type === 'deleted') return t('cdemo.paramDeleted', { label: c.label });
    return c.label;
  }
  if (c.type !== 'modified') return t(`cdemo.${c.level}${c.type === 'added' ? 'Added' : 'Deleted'}`);
  return t('cdemo.fieldChanged', { field: t(`cdemo.field.${c.field}`) });
}
</script>

<template>
  <ol class="cmp-list">
    <li v-for="c in changes" :key="c.anchorId + (c.field ?? '')">
      <button
        type="button"
        class="cmp-list__item"
        :class="['is-' + c.type, { 'is-active': activeId === c.anchorId }]"
        @click="emit('select', c)"
      >
        <b class="cmp-list__mark" aria-hidden="true">{{ MARK[c.type] }}</b>
        <span class="cmp-list__body">
          <span class="cmp-list__where">{{ where(c) }}</span>
          <span class="cmp-list__what">{{ what(c) }}</span>
          <span v-if="c.level === 'param' && c.type === 'modified'" class="cmp-list__vals">
            <s>{{ c.left }}</s> → {{ c.right }}
          </span>
        </span>
      </button>
    </li>
    <li v-if="!changes.length" class="cmp-list__empty">{{ $t('cdemo.none') }}</li>
  </ol>
</template>
