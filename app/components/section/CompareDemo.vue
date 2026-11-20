<script setup lang="ts">
// SilverBio Compare 직접 해 보기. 비교는 app/compare/engine.js 가 하고, 여기서는 결과를 화면에 연결만 한다.
import type { Change, MbrDocument } from '~/compare/types.js';
import { compare } from '~/compare/engine.js';
import { getSamples } from '~/compare/sample-data.js';

const { locale } = useI18n();

// 샘플: 기본(짧은 문서) / 대용량(약 300쪽, 고를 때만 만들어서 홈 첫 화면은 가볍게)
const sample = ref<'basic' | 'large'>('basic');
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

const docs = computed(() => (sample.value === 'large' && largeDocs.value) || getSamples(locale.value));
const versions = computed(() => Object.keys(docs.value));
const leftVer = ref('1.0');
const rightVer = ref('1.1');
watch(versions, (v) => { leftVer.value = v[0]!; rightVer.value = v[1] ?? v[0]!; });
const countBy = ref<'step' | 'param'>('step');
const changedOnly = ref(false);
const side = ref<'left' | 'right'>('right');

const left = computed(() => docs.value[leftVer.value] ?? docs.value[versions.value[0]!]!);
const right = computed(() => docs.value[rightVer.value] ?? docs.value[versions.value[1] ?? versions.value[0]!]!);
const compareMs = ref(0);
const result = computed(() => {
  const t = performance.now();
  const r = compare(left.value, right.value, { countBy: countBy.value });
  compareMs.value = performance.now() - t;
  return r;
});
// 문서 규모 표시용 (비교 계산이 아니라 개수 세기)
const size = computed(() => {
  let steps = 0, params = 0;
  for (const g of right.value.groups) for (const s of g.steps ?? []) { steps++; params += s.params?.length ?? 0; }
  return { steps: steps.toLocaleString(), params: params.toLocaleString(), ms: Math.max(compareMs.value, 0.1).toFixed(1) };
});
const isLarge = computed(() => sample.value === 'large' && !!largeDocs.value);

function swap() {
  [leftVer.value, rightVer.value] = [rightVer.value, leftVer.value];
}

// 변경 목록 → 해당 위치로 스크롤 + 잠깐 강조
const panel = ref<{ scroller: HTMLElement | null } | null>(null);
const focusId = ref<string | null>(null);
let timer: ReturnType<typeof setTimeout> | undefined;

async function locate(c: Change) {
  // 휴대폰(한쪽만 보임)에서는 그 변경이 보이는 쪽으로 바꾼다
  side.value = c.type === 'deleted' ? 'left' : 'right';
  focusId.value = c.anchorId;
  await nextTick();
  const box = panel.value?.scroller;
  const el = box?.querySelector<HTMLElement>(`#${CSS.escape('cmp-' + c.anchorId)}`);
  if (box && el) {
    // 대용량은 화면 밖 줄을 그리지 않아(content-visibility) 위치가 어림값이라, 바로 점프한 뒤 한 번 더 맞춘다
    const reduce = isLarge.value || matchMedia('(prefers-reduced-motion: reduce)').matches;
    const target = () => Math.max(0, el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - box.clientHeight / 3);
    box.scrollTo({ top: target(), behavior: reduce ? 'auto' : 'smooth' });
    if (isLarge.value) requestAnimationFrame(() => requestAnimationFrame(() => box.scrollTo({ top: target() })));
    // 휴대폰처럼 문서 칸이 화면 밖이면 문서 칸부터 보이게
    const r = box.getBoundingClientRect();
    if (r.top < 0 || r.top > innerHeight * 0.6) box.scrollIntoView({ block: 'start', behavior: reduce ? 'auto' : 'smooth' });
  }
  clearTimeout(timer);
  timer = setTimeout(() => { focusId.value = null; }, 1800);
}
watch([leftVer, rightVer, changedOnly, locale], () => { focusId.value = null; });
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
  <!-- ===== 3-1. Compare 직접 해 보기: 버전을 고르면 엔진이 비교하고, 변경 목록을 누르면 그 위치로 이동 ===== -->
  <section class="section cmp" id="compare-demo" aria-labelledby="cmp-title">
    <div class="container">
      <h2 id="cmp-title" class="section__title reveal">{{ $t('cdemo.title') }}</h2>
      <p class="cmp__lead">{{ $t('cdemo.lead') }}</p>

      <div class="cmp-bar">
        <div class="cmp-seg" role="group" :aria-label="$t('cdemo.sample')">
          <button type="button" :aria-pressed="sample === 'basic'" @click="sample = 'basic'">{{ $t('cdemo.sampleBasic') }}</button>
          <button type="button" :aria-pressed="sample === 'large'" @click="sample = 'large'">{{ $t('cdemo.sampleLarge') }}</button>
        </div>
        <div class="cmp-vers">
          <label class="cmp-sel">
            <span class="sr-only">{{ $t('cdemo.from') }}</span>
            <select v-model="leftVer">
              <option v-for="v in versions" :key="v" :value="v">v{{ v }}</option>
            </select>
          </label>
          <button type="button" class="cmp-swap" :aria-label="$t('cdemo.swap')" :title="$t('cdemo.swap')" @click="swap">⇄</button>
          <label class="cmp-sel">
            <span class="sr-only">{{ $t('cdemo.to') }}</span>
            <select v-model="rightVer">
              <option v-for="v in versions" :key="v" :value="v">v{{ v }}</option>
            </select>
          </label>
        </div>
        <CompareStatsBar :stats="result.stats" :count-by="countBy" />
        <div class="cmp-opts">
          <div class="cmp-seg" role="group" :aria-label="$t('cdemo.countBy')">
            <button type="button" :aria-pressed="countBy === 'step'" @click="countBy = 'step'">{{ $t('cdemo.byStep') }}</button>
            <button type="button" :aria-pressed="countBy === 'param'" @click="countBy = 'param'">{{ $t('cdemo.byParam') }}</button>
          </div>
          <label class="cmp-check">
            <input v-model="changedOnly" type="checkbox">
            <span>{{ $t('cdemo.changedOnly') }}</span>
          </label>
        </div>
      </div>

      <!-- 휴대폰: 이전 / 새 버전 탭 -->
      <div class="cmp-tabs" role="group" :aria-label="$t('cdemo.view')">
        <button type="button" :aria-pressed="side === 'left'" @click="side = 'left'">v{{ leftVer }} · {{ $t('cdemo.old') }}</button>
        <button type="button" :aria-pressed="side === 'right'" @click="side = 'right'">v{{ rightVer }} · {{ $t('cdemo.new') }}</button>
      </div>

      <p class="cmp-perf" aria-live="polite">
        <template v-if="loading">{{ $t('cdemo.loading') }}</template>
        <template v-else>{{ $t('cdemo.perf', size) }}</template>
      </p>

      <div class="cmp-main" :class="{ 'is-large': isLarge }">
        <ComparePanel
          ref="panel"
          :result="result"
          :left-doc="left"
          :right-doc="right"
          :large="isLarge"
          :changed-only="changedOnly"
          :side="side"
          :focus-id="focusId"
        />
        <aside class="cmp-side" :aria-label="$t('cdemo.changes')">
          <h3 class="cmp-side__title">{{ $t('cdemo.changes') }} <span>{{ result.changes.length }}</span></h3>
          <CompareChangeList :changes="result.changes" :active-id="focusId" @select="locate" />
        </aside>
      </div>
      <p class="cmp__note">{{ $t('cdemo.note', { product: left.productName }) }}</p>
    </div>
  </section>
</template>
