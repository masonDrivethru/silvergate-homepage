<script setup lang="ts">
// /compare 의 "복잡한 표" · "속도 측정" 탭. 화면 비교 모듈(@silvergate/compare-dom)의 뼈대(mountLayout)를 그대로 쓴다.
// 탭을 처음 열 때만 만들고, 다른 탭으로 가도 지우지 않는다 (다시 왔을 때 바로 보이게).
import { tableCases, speedDoc } from '~/compare/lab-data.js';

const props = defineProps<{ mode: 'tables' | 'speed' }>();
const { t, locale } = useI18n();
const lang = computed(() => (locale.value === 'ko' ? 'ko' : 'en'));

type Lay = { root: HTMLElement; left: HTMLElement; right: HTMLElement; desk: HTMLElement; attach: (c: any) => any; destroy: () => void };
let SG: typeof import('@silvergate/compare-dom') | null = null;
const load = async () => (SG ??= await import('@silvergate/compare-dom'));
const cleanups: Array<() => void> = [];
onBeforeUnmount(() => { for (const f of cleanups.splice(0)) f(); });

/** 뼈대 하나 + 비교 하나 */
function stage(host: HTMLElement, o: { leftLabel: string; rightLabel: string; height: string }) {
  const lay = SG!.mountLayout(host, { ...o, locale: lang.value }) as unknown as Lay;
  lay.root.classList.add('cmp-viewer');
  lay.desk.classList.add('lab-desk');
  return lay;
}

// ---------------- 복잡한 표 ----------------
const tablesHost = ref<HTMLElement>();
const cases = computed(() => tableCases(lang.value));
let tablesBuilt = '';
async function buildTables() {
  if (tablesBuilt === lang.value || !tablesHost.value) return;
  tablesBuilt = lang.value;
  await load();
  await nextTick();
  const boxes = tablesHost.value.querySelectorAll<HTMLElement>('.lab-case__stage');
  cases.value.forEach((c, i) => {
    const host = boxes[i];
    if (!host) return;
    const lay = stage(host, { leftLabel: 'Rev. 3', rightLabel: 'Rev. 4', height: c.tall ? '560px' : '420px' });
    lay.left.innerHTML = `<div class="mbr"><div class="lab-paper">${c.left}</div></div>`;
    lay.right.innerHTML = `<div class="mbr"><div class="lab-paper">${c.right}</div></div>`;
    const ctrl = lay.attach(SG!.createCompare({ left: lay.left, right: lay.right, leftScroller: lay.desk, rightScroller: lay.desk, locale: lang.value }));
    cleanups.push(() => { ctrl.destroy(); lay.destroy(); });
  });
}

// ---------------- 속도 측정 ----------------
const speedHost = ref<HTMLElement>();
/** 휴대폰·메모리가 적은 기기는 1,000쪽까지만 (3,000쪽이면 수십 초 걸리거나 멈출 수 있음) */
const small = ref(false);
const choices = computed(() => (small.value ? [100, 500, 1000] : [500, 1000, 2000, 3000]));
const pages = ref(1000);
const running = ref(false);
type Row = { pages: number; nodes: number; draw: number; snapshot: number; compare: number; paint: number; total: number; changes: number; worker: boolean };
const rows = ref<Row[]>([]);
const error = ref('');
let speed: { lay: Lay; ctrl: any; zoomRo: ResizeObserver } | null = null;

async function runSpeed() {
  if (running.value || !speedHost.value) return;
  running.value = true; error.value = '';
  try {
    await load();
    if (!speed) {
      const lay = stage(speedHost.value, { leftLabel: 'Rev. 1', rightLabel: 'Rev. 2', height: 'min(80vh, 900px)' });
      // A4 를 칸 폭에 맞춰 줄여 보이기 (양쪽 같은 배율)
      const zoomRo = new ResizeObserver(() => {
        const cols = getComputedStyle(lay.desk).gridTemplateColumns.split(' ').filter(Boolean).length || 2;
        const z = Math.min(1, Math.max(0.3, (lay.desk.clientWidth / cols - 24) / 794)).toFixed(3);
        lay.left.style.zoom = z; lay.right.style.zoom = z;
      });
      zoomRo.observe(lay.desk);
      speed = { lay, ctrl: null, zoomRo };
      cleanups.push(() => { speed?.zoomRo.disconnect(); speed?.ctrl?.destroy(); speed?.lay.destroy(); speed = null; });
    }
    const { lay } = speed;
    speed.ctrl?.destroy();
    speed.ctrl = null;
    await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));   // "그리는 중" 표시가 먼저 보이게
    const n = pages.value;
    const t0 = performance.now();
    lay.left.innerHTML = speedDoc(1, n, lang.value);
    lay.right.innerHTML = speedDoc(2, n, lang.value);
    lay.desk.scrollTop = 0;
    lay.left.getBoundingClientRect();     // 실제로 그려지게
    const draw = performance.now() - t0;
    const ctrl = SG!.createCompare({ left: lay.left, right: lay.right, leftScroller: lay.desk, rightScroller: lay.desk, page: '.mbr-page', worker: true, auto: false, locale: lang.value });
    speed.ctrl = ctrl;
    lay.attach(ctrl);
    await ctrl.run();
    const tm = ctrl.timing;
    if (!tm) throw ctrl.error ?? new Error('compare failed');
    rows.value = [{ pages: n, nodes: tm.nodes, draw, snapshot: tm.snapshot, compare: tm.compare, paint: tm.paint, total: tm.total, changes: ctrl.changes.length, worker: tm.worker }, ...rows.value].slice(0, 6);
  } catch (e: any) {
    error.value = String(e?.message ?? e);
  } finally {
    running.value = false;
  }
}

const fmtN = (n: number) => n.toLocaleString(lang.value === 'ko' ? 'ko-KR' : 'en-US');
const sec = (ms: number) => (ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`);

let speedStarted = false;
async function activate() {
  if (props.mode === 'tables') await buildTables();
  if (props.mode === 'speed' && !speedStarted) { speedStarted = true; await nextTick(); runSpeed(); }
}
onMounted(() => {
  const mem = (navigator as any).deviceMemory as number | undefined;
  small.value = matchMedia('(max-width: 768px)').matches || (mem !== undefined && mem <= 4);
  if (small.value) pages.value = 500;
  activate();
});
watch(() => props.mode, activate);
// 언어를 바꾸면 표 사례를 그 언어로 다시
watch(lang, async () => {
  for (const f of cleanups.splice(0)) f();
  tablesBuilt = ''; speedStarted = false; rows.value = [];
  await nextTick();
  activate();
});
</script>

<template>
  <div class="cmp-lab">
    <!-- 복잡한 표 -->
    <div v-show="mode === 'tables'" ref="tablesHost" class="lab-cases">
      <p class="cmp__lead lab-lead">{{ t('cdemo.lab.tablesLead') }}</p>
      <article v-for="c in cases" :key="lang + c.id" class="lab-case">
        <h3 class="lab-case__title">{{ c.title }}</h3>
        <p class="lab-case__desc"><span>{{ t('cdemo.lab.changed') }}</span> {{ c.desc }}</p>
        <div class="lab-case__stage" />
      </article>
    </div>

    <!-- 속도 측정 -->
    <div v-show="mode === 'speed'" class="lab-speed">
      <p class="cmp__lead lab-lead">{{ t('cdemo.lab.speedLead') }}</p>
      <div class="lab-speed__bar">
        <div class="cmp-seg" role="group" :aria-label="t('cdemo.lab.pages')">
          <button v-for="n in choices" :key="n" type="button" :aria-pressed="pages === n" :disabled="running" @click="pages = n">{{ t('cdemo.lab.pagesN', { n: fmtN(n) }) }}</button>
        </div>
        <button type="button" class="cmp-entry lab-run" :disabled="running" @click="runSpeed">
          <span class="cmp-entry__dot" aria-hidden="true" />{{ running ? t('cdemo.lab.running') : t('cdemo.lab.run') }}
        </button>
        <p v-if="small" class="cmp-perf">{{ t('cdemo.lab.small') }}</p>
      </div>
      <div class="lab-table-wrap">
        <table class="lab-table" :aria-label="t('cdemo.lab.results')">
          <thead>
            <tr>
              <th>{{ t('cdemo.lab.colPages') }}</th><th>{{ t('cdemo.lab.colNodes') }}</th><th>{{ t('cdemo.lab.colDraw') }}</th>
              <th>{{ t('cdemo.lab.colRead') }}</th><th>{{ t('cdemo.lab.colCompare') }}</th><th>{{ t('cdemo.lab.colPaint') }}</th>
              <th>{{ t('cdemo.lab.colTotal') }}</th><th>{{ t('cdemo.lab.colChanges') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!rows.length"><td colspan="8" class="lab-table__empty">{{ running ? t('cdemo.lab.running') : t('cdemo.lab.empty') }}</td></tr>
            <tr v-for="(r, i) in rows" :key="i">
              <td>{{ fmtN(r.pages) }}</td><td>{{ fmtN(r.nodes) }}</td><td>{{ sec(r.draw) }}</td>
              <td>{{ sec(r.snapshot) }}</td><td>{{ sec(r.compare) }}<small v-if="r.worker"> · {{ t('cdemo.lab.bg') }}</small></td><td>{{ sec(r.paint) }}</td>
              <td class="lab-table__total">{{ sec(r.total) }}</td><td>{{ fmtN(r.changes) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-if="error" class="cmp-perf" role="alert">{{ error }}</p>
      <p class="cmp-perf">{{ t('cdemo.lab.speedNote') }}</p>
      <div ref="speedHost" class="lab-speed__stage" />
    </div>
  </div>
</template>
