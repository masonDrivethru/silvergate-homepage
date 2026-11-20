<script setup lang="ts">
// MBR 한 버전을 A4 쪽으로 그린다 (흰 종이). 비교 표시는 하지 않는다: 화면 비교 모듈(@silvergate/compare-dom)이
// 이렇게 그려진 화면 두 개를 읽어서 바뀐 곳에 색을 입힌다. → 실제 고객사 화면도 이 컴포넌트처럼 "그냥 그리면" 된다.
//  - data-sgc-key: 단계·파라미터 ID (가운데 끼워 넣거나 순서가 바뀌어도 정확히 짝지음)
//  - data-sgc-ignore: 쪽마다 반복되는 머리말·쪽 번호 (비교에서 뺌)
import type { MbrDocument, Param, Step } from '~/compare/types.js';
import { formatSpec } from '~/compare/engine.js';

const props = defineProps<{ doc: MbrDocument; approved?: boolean }>();
const { t } = useI18n();

type Item = { kind: 'group'; no: number; id: string; title: string } | { kind: 'step'; gid: string; step: Step };
/** 한 쪽에 들어갈 만큼 (단계 6개 정도) 나눈다. 구간 제목이 쪽 맨 아래에 홀로 남지 않게 */
const pages = computed(() => {
  const items: Item[] = [];
  props.doc.groups.forEach((g, gi) => {
    const id = g.groupId ?? g.title;
    items.push({ kind: 'group', no: gi + 1, id, title: g.title });
    for (const s of g.steps ?? []) items.push({ kind: 'step', gid: id, step: s });
  });
  const out: Item[][] = [];
  let cur: Item[] = [], used = 0;
  const cost = (it: Item) => (it.kind === 'group' ? 1.2 : 1.6 + (it.step.params?.length ?? 0) * 0.45);
  for (const it of items) {
    const need = it.kind === 'group' ? cost(it) + 2 : cost(it);
    if (cur.length && used + need > 13) { out.push(cur); cur = []; used = 0; }
    cur.push(it); used += cost(it);
  }
  if (cur.length || !out.length) out.push(cur);
  return out;
});
const docNo = computed(() => `MBR-${props.doc.productName.split(' ')[0]}-001`);
const val = (p: Param) => [p.value, p.unit].filter(Boolean).join(' ');
const range = (p: Param) => formatSpec(p.spec);
const stepKey = (gid: string, s: Step) => `s:${gid}:${s.stepId ?? s.title}`;
</script>

<template>
  <div class="mbr">
    <article v-for="(page, pi) in pages" :key="pi" class="mbr-page">
      <!-- 머리말: 첫 쪽만 비교 (나머지 쪽은 같은 내용 반복이라 뺌) -->
      <header class="mbr-head" :data-sgc-ignore="pi > 0 ? '' : undefined" :data-sgc-key="pi === 0 ? 'head' : undefined">
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
      <template v-for="it in page" :key="it.kind === 'group' ? 'g' + it.id : stepKey(it.gid, it.step)">
        <h3 v-if="it.kind === 'group'" class="mbr-sec" :data-sgc-key="'g:' + it.id">{{ it.no }}. {{ it.title }}</h3>
        <section v-else class="mbr-step" :data-sgc-key="stepKey(it.gid, it.step)">
          <div class="mbr-step__top">
            <span class="mbr-no">{{ it.step.stepId }}</span>
            <h4 class="mbr-title">{{ it.step.title }}</h4>
          </div>
          <p v-if="it.step.instruction" class="mbr-ins">{{ it.step.instruction }}</p>
          <table v-if="it.step.params?.length" class="mbr-params">
            <thead><tr><th>{{ t('cdemo.paper.colStep') }}</th><th>{{ t('cdemo.paper.colTarget') }}</th><th>{{ t('cdemo.paper.colRange') }}</th></tr></thead>
            <tbody>
              <tr v-for="p in it.step.params" :key="p.key" :data-sgc-key="'p:' + p.key">
                <td>{{ p.label }}</td><td>{{ val(p) }}</td><td>{{ range(p) }}</td>
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
