<script setup lang="ts">
// 좌우 A4 문서 비교. 실제 문서관리 시스템의 비교 화면처럼 흰 종이 두 장을 나란히 놓고
// 바뀐 곳에 변경 막대·색 표시를 한다.
// 좌우 칸은 같은 줄(grid row)에 있어 줄 높이가 늘 맞고, 스크롤 영역이 하나라 좌우가 함께 움직인다.
// 비교 계산은 하지 않는다: 상태(status)와 글자 diff는 엔진 결과를 읽기만 하고, 여기서는 쪽 나누기만 한다.
import type { ChangeSet, Change, DiffOp, MbrDocument, Param, Step } from '~/compare/types.js';
import { formatSpec } from '~/compare/engine.js';

const props = defineProps<{
  result: ChangeSet;
  leftDoc: MbrDocument;
  rightDoc: MbrDocument;
  changedOnly: boolean;
  /** 휴대폰에서 보여 줄 쪽 (PC에서는 양쪽 다 보임) */
  side: 'left' | 'right';
  focusId: string | null;
  /** 대용량이면 화면 밖 쪽을 그리지 않는다 */
  large?: boolean;
}>();

const { t, locale } = useI18n();
type Side = 'left' | 'right';
type Row =
  | { kind: 'group'; id: string; no: number; status: string | null; left: string | null; right: string | null; renamed: boolean }
  | { kind: 'step'; id: string; key: string; status: string | null; left: Step | null; right: Step | null; own: Change[] }
  | { kind: 'param'; id: string; status: string | null; left: Param | null; right: Param | null };

const byAnchor = computed(() => {
  const m = new Map<string, Change[]>();
  for (const c of props.result.changes) m.set(c.anchorId, [...(m.get(c.anchorId) ?? []), c]);
  return m;
});

const rows = computed<Row[]>(() => {
  const out: Row[] = [];
  const show = (status: string | null) => !props.changedOnly || !!status;
  props.result.aligned.forEach((g, gi) => {
    if (!show(g.status)) return;
    const renamed = (byAnchor.value.get(g.anchorId) ?? []).some((c) => c.level === 'group' && c.type === 'modified');
    out.push({ kind: 'group', id: g.anchorId, no: gi + 1, status: g.status, left: g.left?.title ?? null, right: g.right?.title ?? null, renamed });
    for (const s of g.steps) {
      if (!show(s.status)) continue;
      const own = (byAnchor.value.get(s.anchorId) ?? []).filter((c) => c.level === 'step');
      out.push({ kind: 'step', id: s.anchorId, key: s.key, status: s.status, left: s.left, right: s.right, own });
      for (const p of s.params) {
        if (show(p.status)) out.push({ kind: 'param', id: p.anchorId, status: p.status, left: p.left, right: p.right });
      }
    }
  });
  return out;
});

// 쪽 나누기: 줄마다 대략의 높이(줄 수)를 매겨 한 쪽에 들어갈 만큼 채운다. 좌우 중 긴 쪽 기준
const PAGE_LINES = 34;
function lines(row: Row) {
  if (row.kind === 'group') return 2.4;
  if (row.kind === 'param') return 1.15;
  const per = locale.value === 'ko' ? 34 : 56; // 지시문 한 줄에 들어가는 글자 수 어림
  const len = Math.max(row.left?.instruction?.length ?? 0, row.right?.instruction?.length ?? 0);
  return 2.6 + Math.ceil(len / per);
}
const pages = computed(() => {
  const out: Row[][] = [];
  let cur: Row[] = [], used = 0;
  for (const row of rows.value) {
    const h = lines(row);
    // 구간 제목이 쪽 맨 아래에 홀로 남지 않게
    const need = row.kind === 'group' ? h + 4 : h;
    if (cur.length && used + need > PAGE_LINES) { out.push(cur); cur = []; used = 0; }
    cur.push(row); used += h;
  }
  if (cur.length || !out.length) out.push(cur);
  return out;
});

/** 칸 상태: 추가는 오른쪽, 삭제는 왼쪽, 수정은 양쪽. 반대쪽은 빈 자리 */
function cellState(row: Row, side: Side): string {
  const has = side === 'left' ? row.left : row.right;
  if (!has) return 'is-gap';
  if (row.status === 'added') return 'is-add';
  if (row.status === 'deleted') return 'is-del';
  if (row.status !== 'modified') return '';
  if (row.kind === 'step' && !row.own.length) return 'is-child';
  if (row.kind === 'group') return row.renamed ? 'is-mod' : 'is-child';
  return 'is-mod';
}

/** 엔진의 diff를 한쪽 화면용으로: 왼쪽은 지운 글자, 오른쪽은 넣은 글자를 표시 */
function pieces(diffs: DiffOp[], side: Side) {
  const drop = side === 'left' ? 1 : -1;
  return diffs.filter(([op]) => op !== drop).map(([op, text]) => ({ text, mark: op !== 0 }));
}
function fieldDiff(row: Extract<Row, { kind: 'step' }>, field: 'title' | 'instruction') {
  return row.own.find((c) => c.field === field)?.diffs ?? null;
}
const val = (p: Param | null) => (p ? [p.value, p.unit].filter(Boolean).join(' ') : '');
const range = (p: Param | null) => formatSpec(p?.spec);
const pick = <T,>(row: { left: T | null; right: T | null }, sd: Side) => (sd === 'left' ? row.left : row.right);

const docNo = (d: MbrDocument) => `MBR-${d.productName.split(' ')[0]}-001`;

const scroller = ref<HTMLElement | null>(null);
defineExpose({ scroller });
</script>

<template>
  <div class="paper-desk" :class="['paper-desk--' + side, { 'is-large': large }]">
    <div ref="scroller" class="paper-desk__scroll" tabindex="0" :aria-label="`v${leftDoc.version} ↔ v${rightDoc.version}`">
      <div
        v-for="(page, pi) in pages"
        :key="pi"
        class="sheet-pair"
        :style="{ gridTemplateRows: `auto auto repeat(${page.length}, auto) 1fr auto` }"
      >
        <!-- 머리말: 문서 정보 표 (쪽마다 반복) -->
        <header v-for="sd in (['left', 'right'] as const)" :key="'h' + sd" class="sheet__cell sheet__head" :class="'sheet__cell--' + sd">
          <div class="sheet__brand">
            <span>{{ t('cdemo.paper.company') }}</span>
            <b>{{ t('cdemo.paper.title') }}</b>
            <span class="sheet__stamp" :class="sd === 'left' ? 'is-ok' : 'is-draft'">{{ t(sd === 'left' ? 'cdemo.paper.approved' : 'cdemo.paper.review') }}</span>
          </div>
          <dl class="sheet__meta">
            <div><dt>{{ t('cdemo.paper.product') }}</dt><dd>{{ (sd === 'left' ? leftDoc : rightDoc).productName }}</dd></div>
            <div><dt>{{ t('cdemo.paper.docNo') }}</dt><dd>{{ docNo(sd === 'left' ? leftDoc : rightDoc) }}</dd></div>
            <div><dt>{{ t('cdemo.paper.version') }}</dt><dd>{{ (sd === 'left' ? leftDoc : rightDoc).version }}</dd></div>
            <div><dt>{{ t('cdemo.paper.effective') }}</dt><dd>{{ (sd === 'left' ? leftDoc : rightDoc).effectiveDate }}</dd></div>
          </dl>
        </header>
        <!-- 표 머리 -->
        <div v-for="sd in (['left', 'right'] as const)" :key="'c' + sd" class="sheet__cell sheet__cols" :class="'sheet__cell--' + sd" aria-hidden="true">
          <span>{{ t('cdemo.paper.colNo') }}</span><span>{{ t('cdemo.paper.colStep') }}</span><span>{{ t('cdemo.paper.colTarget') }}</span><span>{{ t('cdemo.paper.colRange') }}</span>
        </div>

        <!-- 본문 줄: 좌우 칸이 같은 grid 줄 -->
        <template v-for="row in page" :key="row.kind + row.id">
          <div
            v-for="sd in (['left', 'right'] as const)"
            :id="sd === 'right' ? 'cmp-' + row.id : undefined"
            :key="sd"
            class="sheet__cell sheet__row"
            :class="['sheet__cell--' + sd, 'sheet__row--' + row.kind, cellState(row, sd), row.status ? 'st-' + row.status : '', { 'is-focus': focusId === row.id }]"
          >
            <template v-if="cellState(row, sd) === 'is-gap'">
              <span class="sheet__gap" :data-side="sd">{{ t(sd === 'left' ? 'cdemo.paper.notInOld' : 'cdemo.paper.notInNew') }}</span>
            </template>

            <template v-else-if="row.kind === 'group'">
              <h4 class="sheet__section">{{ row.no }}. {{ pick(row, sd) }}</h4>
            </template>

            <template v-else-if="row.kind === 'step'">
              <span class="sheet__no">{{ row.key }}</span>
              <div class="sheet__step">
                <p class="sheet__title">
                  <template v-if="fieldDiff(row, 'title')"><span v-for="(pc, i) in pieces(fieldDiff(row, 'title')!, sd)" :key="i" :class="{ 'mk': pc.mark }">{{ pc.text }}</span></template>
                  <template v-else>{{ pick(row, sd)?.title }}</template>
                </p>
                <p class="sheet__ins">
                  <template v-if="fieldDiff(row, 'instruction')"><span v-for="(pc, i) in pieces(fieldDiff(row, 'instruction')!, sd)" :key="i" :class="{ 'mk': pc.mark }">{{ pc.text }}</span></template>
                  <template v-else>{{ pick(row, sd)?.instruction }}</template>
                </p>
                <p class="sheet__sign" aria-hidden="true"><span>{{ t('cdemo.paper.done') }}</span><span>{{ t('cdemo.paper.checked') }}</span></p>
              </div>
            </template>

            <template v-else>
              <span class="sheet__no"></span>
              <span class="sheet__plabel">{{ pick(row, sd)?.label }}</span>
              <span class="sheet__pval">
                <s v-if="sd === 'right' && row.status === 'modified' && val(row.left) !== val(row.right)" class="sheet__was">{{ val(row.left) }}</s>
                {{ val(pick(row, sd)) }}
              </span>
              <span class="sheet__pval">
                <s v-if="sd === 'right' && row.status === 'modified' && range(row.left) !== range(row.right)" class="sheet__was">{{ range(row.left) }}</s>
                {{ range(pick(row, sd)) }}
              </span>
            </template>
          </div>
        </template>

        <!-- 빈 공간 + 꼬리말 -->
        <div v-for="sd in (['left', 'right'] as const)" :key="'f' + sd" class="sheet__cell sheet__fill" :class="'sheet__cell--' + sd"></div>
        <footer v-for="sd in (['left', 'right'] as const)" :key="'ft' + sd" class="sheet__cell sheet__foot" :class="'sheet__cell--' + sd">
          <span>{{ docNo(sd === 'left' ? leftDoc : rightDoc) }} · v{{ (sd === 'left' ? leftDoc : rightDoc).version }}</span>
          <span>{{ t('cdemo.paper.sample') }}</span>
          <span>{{ t('cdemo.paper.page', { n: pi + 1, total: pages.length }) }}</span>
        </footer>
      </div>
      <p v-if="!rows.length" class="paper-desk__empty">{{ $t('cdemo.none') }}</p>
    </div>
  </div>
</template>
