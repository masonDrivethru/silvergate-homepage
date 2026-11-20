<script setup lang="ts">
// MBR 한 버전을 A4 쪽으로 그린다 (흰 종이, 지금 운영 중인 비교 화면과 같은 문서 디자인).
// 비교 표시는 하지 않는다: 화면 비교 모듈(@silvergate/compare-dom)이 이렇게 그려진 화면 두 개를 읽어서
// 바뀐 곳에 색을 입히고 좌우 높이를 맞춘다. → 실제 고객사 화면도 이 컴포넌트처럼 "그냥 그리면" 된다.
//  - data-sgc-key: 단계·파라미터·원자재 ID (가운데 끼워 넣거나 순서가 바뀌어도 정확히 짝지음)
//  - data-sgc-ignore: 쪽마다 반복되는 머리말(첫 쪽 제외)·표 머리·쪽 번호·서명칸·도장 (비교에서 뺌)
//  - plan: 두 버전이 같은 쪽 나누기를 쓰도록 (app/compare/plan.js)
import type { MbrDocument, Material, Param, Step } from '~/compare/types.js';
import { formatSpec } from '~/compare/engine.js';
import { planPages } from '~/compare/plan.js';

const props = defineProps<{ doc: MbrDocument; approved?: boolean; plan?: string[][] }>();
const { t } = useI18n();

type Item =
  | { kind: 'mat' }
  | { kind: 'group'; no: number; id: string; title: string }
  | { kind: 'step'; gid: string; step: Step };

const byKey = computed(() => {
  const m = new Map<string, Item>();
  if (props.doc.materials?.length) m.set('mat', { kind: 'mat' });
  props.doc.groups.forEach((g, gi) => {
    const id = g.groupId ?? g.title;
    m.set(`g:${id}`, { kind: 'group', no: gi + 1, id, title: g.title });
    for (const s of g.steps ?? []) m.set(`s:${id}:${s.stepId ?? s.title}`, { kind: 'step', gid: id, step: s });
  });
  return m;
});
/** 쪽마다 [키, 항목]. 이 버전에 없는 항목은 건너뜀 (빈 칸은 비교 모듈이 그림) */
const pages = computed(() => (props.plan ?? planPages(props.doc, props.doc))
  .map((keys) => keys.filter((k) => byKey.value.has(k)).map((k) => [k, byKey.value.get(k)!] as const)));

const docNo = computed(() => `MBR-${props.doc.productName.split(' ')[0]}-001`);
/** 도장: 시행본·승인본은 초록, 검토 중은 주황, 대체됨은 회색 */
const stamp = computed(() => {
  const st = props.doc.status ?? (props.approved ? 'effective' : 'review');
  if (st === 'review') return { cls: 'is-draft', text: t('cdemo.paper.review') };
  if (st === 'superseded') return { cls: 'is-old', text: t('cdemo.paper.st_superseded') };
  return { cls: 'is-ok', text: t('cdemo.paper.approved') };
});
const val = (p: Param) => [p.value, p.unit].filter(Boolean).join(' ');
const range = (p: Param) => formatSpec(p.spec);
/** 상세 원자재 표: 공정 단계별로 묶어 첫 줄에만 단계 칸(rowspan) */
const matRows = computed(() => {
  const rows = props.doc.materials ?? [];
  return rows.map((m, i) => {
    const first = i === 0 || rows[i - 1]!.phase !== m.phase;
    let span = 1;
    if (first) while (rows[i + span]?.phase === m.phase) span++;
    return { m, first, span };
  });
});
const matKey = (m: Material) => 'm:' + m.name;
</script>

<template>
  <div class="mbr">
    <article v-for="(page, pi) in pages" :key="pi" class="mbr-page">
      <!-- 머리말: 첫 쪽만 비교 (나머지 쪽은 같은 내용 반복이라 뺌) -->
      <header class="sheet__head" :data-sgc-key="pi === 0 ? 'head' : undefined" :data-sgc-ignore="pi > 0 ? '' : undefined">
        <div class="sheet__brand">
          <span>{{ t('cdemo.paper.company') }}</span>
          <b>{{ t('cdemo.paper.title') }}</b>
          <span class="sheet__stamp" :class="stamp.cls" data-sgc-ignore>{{ stamp.text }}</span>
        </div>
        <dl class="sheet__meta">
          <div><dt>{{ t('cdemo.paper.product') }}</dt><dd>{{ doc.productName }}</dd></div>
          <div><dt>{{ t('cdemo.paper.docNo') }}</dt><dd>{{ docNo }}</dd></div>
          <div><dt>{{ t('cdemo.paper.version') }}</dt><dd>{{ doc.version }}</dd></div>
          <div><dt>{{ t('cdemo.paper.effective') }}</dt><dd>{{ doc.effectiveDate }}</dd></div>
        </dl>
      </header>
      <!-- 표 머리 (쪽마다 같음, 비교에서 뺌) -->
      <div class="sheet__cols" data-sgc-ignore aria-hidden="true">
        <span>{{ t('cdemo.paper.colNo') }}</span><span>{{ t('cdemo.paper.colStep') }}</span><span>{{ t('cdemo.paper.colTarget') }}</span><span>{{ t('cdemo.paper.colRange') }}</span>
      </div>

      <template v-for="[key, it] in page" :key="key">
        <!-- 원자재 표: 단순(열 3개) 또는 상세(머리글 2단 · 단계별 묶음 · 공급사) -->
        <section v-if="it.kind === 'mat'" class="sheet__row sheet__row--group sheet__mat" data-sgc-key="mat">
          <h4 class="sheet__section">{{ t('cdemo.paper.materials') }}</h4>
          <table v-if="doc.materialsLayout === 'detailed'" class="sheet__tbl sheet__tbl--grid">
            <thead>
              <tr>
                <th rowspan="2">{{ t('cdemo.paper.colPhase') }}</th>
                <th rowspan="2">{{ t('cdemo.paper.colMaterial') }}</th>
                <th colspan="3">{{ t('cdemo.paper.colQty') }}</th>
                <th rowspan="2">{{ t('cdemo.paper.colUnit') }}</th>
                <th rowspan="2">{{ t('cdemo.paper.colSupplier') }}</th>
              </tr>
              <tr><th>{{ t('cdemo.paper.colTarget') }}</th><th>{{ t('cdemo.paper.colMin') }}</th><th>{{ t('cdemo.paper.colMax') }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in matRows" :key="matKey(r.m)" :data-sgc-key="matKey(r.m)">
                <td v-if="r.first" :rowspan="r.span">{{ r.m.phase }}</td>
                <td>{{ r.m.name }}</td><td>{{ r.m.qty }}</td><td>{{ r.m.min }}</td><td>{{ r.m.max }}</td><td>{{ r.m.unit }}</td><td>{{ r.m.supplier }}</td>
              </tr>
            </tbody>
          </table>
          <table v-else class="sheet__tbl">
            <thead><tr><th>{{ t('cdemo.paper.colMaterial') }}</th><th>{{ t('cdemo.paper.colQty') }}</th><th>{{ t('cdemo.paper.colUnit') }}</th></tr></thead>
            <tbody>
              <tr v-for="m in doc.materials" :key="matKey(m)" :data-sgc-key="matKey(m)"><td>{{ m.name }}</td><td>{{ m.qty }}</td><td>{{ m.unit }}</td></tr>
            </tbody>
          </table>
        </section>

        <div v-else-if="it.kind === 'group'" class="sheet__row sheet__row--group" :data-sgc-key="key">
          <h4 class="sheet__section">{{ it.no }}. {{ it.title }}</h4>
        </div>

        <!-- 단계: 번호 · 제목 · 지시문 · 서명칸, 그 아래 파라미터 줄들 -->
        <section v-else class="sheet__stepbox" :data-sgc-key="key">
          <div class="sheet__row sheet__row--step">
            <span class="sheet__no">{{ it.step.stepId }}</span>
            <div class="sheet__step">
              <p class="sheet__title">{{ it.step.title }}</p>
              <p v-if="it.step.instruction" class="sheet__ins">{{ it.step.instruction }}</p>
              <p class="sheet__sign" aria-hidden="true" data-sgc-ignore><span>{{ t('cdemo.paper.done') }}</span><span>{{ t('cdemo.paper.checked') }}</span></p>
            </div>
          </div>
          <div v-for="p in it.step.params ?? []" :key="p.key" class="sheet__row sheet__row--param" :data-sgc-key="'p:' + p.key">
            <span class="sheet__no"></span>
            <span class="sheet__plabel">{{ p.label }}<em v-if="doc.paramCpp && p.cpp" class="sheet__cpp">{{ t('cdemo.paper.colCpp') }}</em></span>
            <span class="sheet__pval">{{ val(p) }}</span>
            <span class="sheet__pval">{{ range(p) }}</span>
          </div>
        </section>
      </template>

      <footer class="sheet__foot" data-sgc-ignore>
        <span>{{ docNo }} · v{{ doc.version }}</span>
        <span>{{ t('cdemo.paper.sample') }}</span>
        <span>{{ t('cdemo.paper.page', { n: pi + 1, total: pages.length }) }}</span>
      </footer>
    </article>
  </div>
</template>
