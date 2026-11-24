<script setup lang="ts">
// SilverBio Compare 직접 해 보기 (/compare). 두 버전을 각각 그냥 그리고(MbrSheets),
// 화면 비교 모듈(@silvergate/compare-dom)이 그려진 화면끼리 비교해 원본 위에 색을 입힌다.
// 예전 화면(CompareDemo + app/compare 엔진)은 그대로 남겨 둠
import type { MbrDocument } from '~/compare/types.js';
import { getAllSamples } from '~/compare/sample-more.js';
import { planPages } from '~/compare/plan.js';

defineProps<{ page?: boolean }>();
const { locale } = useI18n();

const sample = ref<'basic' | 'large' | 'tables' | 'speed' | 'files'>('basic');
/** 복잡한 표 · 속도 측정 탭 (한 번 열면 그대로 둠) */
const lab = computed(() => sample.value === 'tables' || sample.value === 'speed');
const labUsed = ref(false);
/** 내 페이지 비교 탭 (저장한 웹페이지 파일 두 개) */
const files = computed(() => sample.value === 'files');
const filesUsed = ref(false);
watch(files, (v) => { if (v) filesUsed.value = true; });
/** 샘플 문서 화면을 숨기는 탭 */
const other = computed(() => lab.value || files.value);
watch(lab, (v) => { if (v) labUsed.value = true; });
const largeDocs = shallowRef<Record<string, MbrDocument> | null>(null);
const loading = ref(false);
async function loadLarge() {
  loading.value = true;
  const { makeLargePair } = await import('~/compare/sample-large.js');
  const { left, right } = makeLargePair({ groups: 30, stepsPerGroup: 35, lang: locale.value === 'ko' ? 'ko' : 'en' });
  largeDocs.value = { [left.version]: left, [right.version]: right };
  loading.value = false;
}
watch([sample, locale], () => { if (sample.value === 'large') loadLarge(); });

const docs = computed(() => (sample.value === 'large' && largeDocs.value) || getAllSamples(locale.value));
const versions = computed(() => Object.keys(docs.value));
// 짧은 문서는 가장 최근 두 버전(v2.0 → v2.1: 복잡한 표 변경)이 처음 보이게. 대용량은 처음 두 버전
const pickPair = (v: string[]) => (sample.value === 'basic' && v.length > 1 ? [v[v.length - 2]!, v[v.length - 1]!] : [v[0]!, v[1] ?? v[0]!]);
const leftVer = ref(pickPair(Object.keys(getAllSamples(locale.value)))[0]!);
const rightVer = ref(pickPair(Object.keys(getAllSamples(locale.value)))[1]!);
watch(versions, (v) => { [leftVer.value, rightVer.value] = pickPair(v) as [string, string]; });
const left = computed(() => docs.value[leftVer.value] ?? docs.value[versions.value[0]!]!);
const right = computed(() => docs.value[rightVer.value] ?? docs.value[versions.value[1] ?? versions.value[0]!]!);
/** 두 버전이 같은 쪽 나누기를 쓰게 (좌우 쪽마다 같은 항목 → 빈 칸과 함께 높이가 늘 맞음) */
const plan = computed(() => planPages(left.value, right.value));
function swap() { [leftVer.value, rightVer.value] = [rightVer.value, leftVer.value]; }

// ---------- 화면 비교 모듈 연결 (브라우저에서만) ----------
const lDoc = ref<HTMLElement>(), rDoc = ref<HTMLElement>(), xDoc = ref<HTMLElement>();
// 두 문서를 한 스크롤 영역(desk)에 나란히: 브라우저가 한 장처럼 함께 움직여 늦거나 떨리지 않는다
const desk = ref<HTMLElement>(), xScroll = ref<HTMLElement>();
/** 휴대폰(좁은 화면)에서 보여 줄 쪽 */
const phoneSide = ref<'left' | 'right'>('right');
const bar = ref<HTMLElement>(), list = ref<HTMLElement>();
const mode = ref<'side' | 'redline'>('side');
const zoom = ref(1);
let cleanup: (() => void) | null = null;

onMounted(async () => {
  const { createCompare, mountToolbar, mountChangeList } = await import('@silvergate/compare-dom');
  const lang = locale.value === 'ko' ? 'ko' : 'en';
  const ctrl = createCompare({
    left: lDoc.value!, right: rDoc.value!, leftScroller: desk.value, rightScroller: desk.value,
    page: '.mbr-page', watch: true, locale: lang,
  });
  let dirty = true;
  const drawRedline = () => { if (xDoc.value) { ctrl.renderRedline(xDoc.value); dirty = false; } };
  ctrl.on('update', () => { dirty = true; if (mode.value === 'redline') drawRedline(); });
  // 휴대폰(한쪽만 보임): 누른 변경의 내용이 안 보이는 쪽에만 있으면(삭제 등) 그쪽으로 바꿔 보여 준다
  ctrl.on('focus', (c: any) => {
    const s = ctrl.contentSide(c), el = desk.value;
    if (!el || s === phoneSide.value || c[phoneSide.value]) return;
    const col = el.querySelector<HTMLElement>(`.cmp-col--${s}`);
    if (col && getComputedStyle(col).display === 'none') phoneSide.value = s;
  });
  const tb = mountToolbar(bar.value!, ctrl, {
    locale: lang, modes: true,
    onMode: (m) => { mode.value = m; if (m === 'redline' && dirty) nextTick(drawRedline); },
  });
  const cl = mountChangeList(list.value!, ctrl, { locale: lang });
  // 문서 칸 폭에 맞춰 A4 를 줄여 보이기 (양쪽 같은 배율). 넓은 화면은 두 칸, 좁은 화면은 한 칸
  const ro = new ResizeObserver(() => {
    const el = desk.value;
    if (!el) return;
    const cols = getComputedStyle(el).gridTemplateColumns.split(' ').filter(Boolean).length || 2;
    const w = el.clientWidth / cols;
    zoom.value = Math.min(1, Math.max(0.3, (w - 20) / 794));
  });
  ro.observe(desk.value!);
  cleanup = () => { ro.disconnect(); tb.destroy(); cl.destroy(); ctrl.destroy(); };
});
onBeforeUnmount(() => cleanup?.());
</script>

<template>
  <!-- ===== 3-1. Compare 직접 해 보기: 그려진 두 화면을 비교해 원본 위에 표시 ===== -->
  <section class="section cmp cmp-live" :class="{ 'cmp--page': page }" id="compare-demo" aria-labelledby="cmp-title">
    <div class="container">
      <p v-if="page" class="product__name">SilverBio Compare</p>
      <component :is="page ? 'h1' : 'h2'" id="cmp-title" class="section__title reveal">{{ $t('cdemo.title') }}</component>
      <p class="cmp__lead">{{ $t('cdemo.lead') }}</p>

      <div class="cmp-bar">
        <div class="cmp-seg" role="group" :aria-label="$t('cdemo.sample')">
          <button type="button" :aria-pressed="sample === 'basic'" @click="sample = 'basic'">{{ $t('cdemo.sampleBasic') }}</button>
          <button type="button" :aria-pressed="sample === 'large'" @click="sample = 'large'">{{ $t('cdemo.sampleLarge') }}</button>
          <button type="button" :aria-pressed="sample === 'tables'" @click="sample = 'tables'">{{ $t('cdemo.sampleTables') }}</button>
          <button type="button" :aria-pressed="sample === 'speed'" @click="sample = 'speed'">{{ $t('cdemo.sampleSpeed') }}</button>
          <button type="button" :aria-pressed="sample === 'files'" @click="sample = 'files'">{{ $t('cdemo.sampleFiles') }}</button>
        </div>
        <div v-show="!other" class="cmp-vers">
          <label class="cmp-sel">
            <span class="sr-only">{{ $t('cdemo.from') }}</span>
            <select v-model="leftVer"><option v-for="v in versions" :key="v" :value="v">v{{ v }}</option></select>
          </label>
          <button type="button" class="cmp-swap" :aria-label="$t('cdemo.swap')" :title="$t('cdemo.swap')" @click="swap">⇄</button>
          <label class="cmp-sel">
            <span class="sr-only">{{ $t('cdemo.to') }}</span>
            <select v-model="rightVer"><option v-for="v in versions" :key="v" :value="v">v{{ v }}</option></select>
          </label>
        </div>
        <p v-if="loading" class="cmp-perf" aria-live="polite">{{ $t('cdemo.loading') }}</p>
      </div>

      <div v-show="!other" class="sgc-viewer cmp-viewer" :data-mode="mode">
        <div ref="bar" />
        <div class="sgc-body">
          <div class="sgc-panes">
            <section class="sgc-pane cmp-both" :hidden="mode === 'redline'">
              <!-- 머리: 넓은 화면은 두 칸 제목, 좁은 화면은 이전/새 버전 고르기 -->
              <div class="cmp-heads" role="group" :aria-label="$t('cdemo.view')">
                <button type="button" class="sgc-pane-head" :aria-pressed="phoneSide === 'left'" @click="phoneSide = 'left'"><span class="sgc-badge sgc-badge-old">{{ $t('cdemo.old') }}</span>v{{ left.version }}</button>
                <button type="button" class="sgc-pane-head" :aria-pressed="phoneSide === 'right'" @click="phoneSide = 'right'"><span class="sgc-badge sgc-badge-new">{{ $t('cdemo.new') }}</span>v{{ right.version }}</button>
              </div>
              <div ref="desk" class="cmp-desk cmp-desk--two" :data-phone="phoneSide" tabindex="0" :aria-label="`v${left.version} ↔ v${right.version}`">
                <div class="cmp-col cmp-col--left"><div ref="lDoc" class="cmp-zoom" :style="{ zoom }"><CompareMbrSheets :doc="left" :plan="plan" approved /></div></div>
                <div class="cmp-col cmp-col--right"><div ref="rDoc" class="cmp-zoom" :style="{ zoom }"><CompareMbrSheets :doc="right" :plan="plan" /></div></div>
              </div>
            </section>
            <section class="sgc-pane" :hidden="mode !== 'redline'">
              <header class="sgc-pane-head">v{{ left.version }} → v{{ right.version }}</header>
              <div ref="xScroll" class="cmp-desk" tabindex="0">
                <div class="cmp-zoom" :style="{ zoom }"><div ref="xDoc" /></div>
              </div>
            </section>
          </div>
          <aside ref="list" :aria-label="$t('cdemo.changes')" />
        </div>
      </div>
      <p v-show="!other" class="cmp__note">{{ $t('cdemo.note', { product: left.productName }) }}</p>
      <ClientOnly><CompareFiles v-if="filesUsed" v-show="files" /></ClientOnly>
      <ClientOnly><CompareLab v-if="labUsed" v-show="lab" :mode="sample === 'speed' ? 'speed' : 'tables'" /></ClientOnly>
    </div>
  </section>
</template>
