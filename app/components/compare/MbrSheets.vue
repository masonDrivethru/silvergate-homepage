<script setup lang="ts">
// MBR 한 버전을 A4 쪽으로 그린다 (흰 종이). 비교 표시는 하지 않는다: 화면 비교 모듈(@silvergate/compare-dom)이
// 이렇게 그려진 화면 두 개를 읽어서 바뀐 곳에 색을 입히고, 좌우 높이를 맞춘다.
// → 실제 고객사 화면도 이 컴포넌트처럼 "그냥 그리면" 된다.
//  - data-sgc-key: 단계·파라미터·원자재 ID (가운데 끼워 넣거나 순서가 바뀌어도 정확히 짝지음)
//  - data-sgc-ignore: 쪽마다 반복되는 머리말·쪽 번호·서명칸·도장 (비교에서 뺌)
//  - plan: 두 버전이 같은 쪽 나누기를 쓰도록 (app/compare/plan.js). 없으면 이 문서만으로 나눔
import type { MbrDocument, Material, Param, Step } from '~/compare/types.js';
import { formatSpec } from '~/compare/engine.js';
import { planPages } from '~/compare/plan.js';

const props = defineProps<{ doc: MbrDocument; approved?: boolean; plan?: string[][] }>();
const { t } = useI18n();

type Item =
  | { kind: 'head' }
  | { kind: 'mat' }
  | { kind: 'group'; no: number; id: string; title: string }
  | { kind: 'step'; gid: string; step: Step };

const byKey = computed(() => {
  const m = new Map<string, Item>([['head', { kind: 'head' }]]);
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
      <template v-for="[key, it] in page" :key="key">
        <!-- 표지 머리말 (비교 대상) -->
        <header v-if="it.kind === 'head'" class="mbr-head" data-sgc-key="head">
          <div class="mbr-brand">
            <span>{{ t('cdemo.paper.company') }}</span>
            <b>{{ t('cdemo.paper.title') }}</b>
            <span class="mbr-stamp" data-sgc-ignore :class="approved ? 'is-ok' : 'is-draft'">{{ t(approved ? 'cdemo.paper.approved' : 'cdemo.paper.review') }}</span>
          </div>
          <dl class="mbr-meta">
            <div><dt>{{ t('cdemo.paper.product') }}</dt><dd>{{ doc.productName }}</dd></div>
            <div><dt>{{ t('cdemo.paper.docNo') }}</dt><dd>{{ docNo }}</dd></div>
            <div><dt>{{ t('cdemo.paper.version') }}</dt><dd>{{ doc.version }}</dd></div>
            <div><dt>{{ t('cdemo.paper.effective') }}</dt><dd>{{ doc.effectiveDate }}</dd></div>
          </dl>
        </header>

        <!-- 원자재 표: 단순(열 3개) 또는 상세(머리글 2단 · 단계별 묶음 · 공급사) -->
        <section v-else-if="it.kind === 'mat'" class="mbr-mat" data-sgc-key="mat">
          <h3 class="mbr-sec">{{ t('cdemo.paper.materials') }}</h3>
          <table v-if="doc.materialsLayout === 'detailed'" class="mbr-params mbr-params--grid">
            <thead>
              <tr>
                <th rowspan="2">{{ t('cdemo.paper.colPhase') }}</th>
                <th rowspan="2">{{ t('cdemo.paper.colMaterial') }}</th>
                <th v-if="doc.materialsGrade" rowspan="2">{{ t('cdemo.paper.colGrade') }}</th>
                <th colspan="3">{{ t('cdemo.paper.colQty') }}</th>
                <th rowspan="2">{{ t('cdemo.paper.colUnit') }}</th>
                <th rowspan="2">{{ t('cdemo.paper.colSupplier') }}</th>
              </tr>
              <tr><th>{{ t('cdemo.paper.colTarget') }}</th><th>{{ t('cdemo.paper.colMin') }}</th><th>{{ t('cdemo.paper.colMax') }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in matRows" :key="matKey(r.m)" :data-sgc-key="matKey(r.m)">
                <td v-if="r.first" :rowspan="r.span" class="mbr-phase">{{ r.m.phase }}</td>
                <td>{{ r.m.name }}</td>
                <td v-if="doc.materialsGrade">{{ r.m.grade }}</td>
                <td v-if="r.m.qtyNote" colspan="3">{{ r.m.qtyNote }}</td>
                <template v-else><td>{{ r.m.qty }}</td><td>{{ r.m.min }}</td><td>{{ r.m.max }}</td></template>
                <td>{{ r.m.unit }}</td><td>{{ r.m.supplier }}</td>
              </tr>
            </tbody>
          </table>
          <table v-else class="mbr-params">
            <thead><tr><th>{{ t('cdemo.paper.colMaterial') }}</th><th>{{ t('cdemo.paper.colQty') }}</th><th>{{ t('cdemo.paper.colUnit') }}</th></tr></thead>
            <tbody>
              <tr v-for="m in doc.materials" :key="matKey(m)" :data-sgc-key="matKey(m)"><td>{{ m.name }}</td><td>{{ m.qty }}</td><td>{{ m.unit }}</td></tr>
            </tbody>
          </table>
        </section>

        <h3 v-else-if="it.kind === 'group'" class="mbr-sec" :data-sgc-key="key">{{ it.no }}. {{ it.title }}</h3>

        <section v-else class="mbr-step" :data-sgc-key="key">
          <div class="mbr-step__top">
            <span class="mbr-no">{{ it.step.stepId }}</span>
            <h4 class="mbr-title">{{ it.step.title }}</h4>
          </div>
          <p v-if="it.step.instruction" class="mbr-ins">{{ it.step.instruction }}</p>
          <table v-if="it.step.params?.length" class="mbr-params">
            <thead>
              <tr>
                <th>{{ t('cdemo.paper.colStep') }}</th><th>{{ t('cdemo.paper.colTarget') }}</th><th>{{ t('cdemo.paper.colRange') }}</th>
                <th v-if="doc.paramCpp">{{ t('cdemo.paper.colCpp') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="p in it.step.params" :key="p.key" :data-sgc-key="'p:' + p.key">
                <td>{{ p.label }}</td>
                <td v-if="p.note" colspan="2">{{ p.note }}</td>
                <template v-else><td>{{ val(p) }}</td><td>{{ range(p) }}</td></template>
                <td v-if="doc.paramCpp">{{ p.cpp ? t('cdemo.paper.yes') : '–' }}</td>
              </tr>
            </tbody>
          </table>
          <p class="mbr-sign" aria-hidden="true" data-sgc-ignore><span>{{ t('cdemo.paper.done') }}</span><span>{{ t('cdemo.paper.checked') }}</span></p>
        </section>
      </template>
      <footer class="mbr-foot" data-sgc-ignore>
        <span>{{ t('cdemo.paper.sample') }}</span>
        <span>{{ t('cdemo.paper.page', { n: pi + 1, total: pages.length }) }}</span>
      </footer>
    </article>
  </div>
</template>
