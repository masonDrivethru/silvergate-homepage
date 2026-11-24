<script setup lang="ts">
// /compare 의 "내 페이지 비교" 탭. 사용자가 저장한 웹페이지 파일 두 개를 화면 비교 모듈(mountViewer)로 비교한다.
// 파일은 브라우저 안에서만 읽고 어디에도 올리지 않는다. 스크립트는 실행하지 않음 (scripts: false → sandbox iframe)
import { isPageFile, readPageFile } from '~/compare/page-file.js';

const { t, locale } = useI18n();
const lang = computed(() => (locale.value === 'ko' ? 'ko' : 'en'));

type Side = 'left' | 'right';
type Picked = { name: string; title: string; url: string; html: string; urls: string[]; extras: number };
const picked = reactive<Record<Side, Picked | null>>({ left: null, right: null });
const busy = reactive<Record<Side, boolean>>({ left: false, right: false });
const error = ref('');
const over = ref<Side | 'both' | null>(null);
const host = ref<HTMLElement>();
let viewer: { destroy: () => void } | null = null;

type Item = { file: File; path: string };

/** 끌어다 놓은 것 → 파일 목록 (폴더면 안의 파일까지, 경로 포함) */
async function dropped(e: DragEvent): Promise<Item[]> {
  const out: Item[] = [];
  const items = [...(e.dataTransfer?.items ?? [])];
  const entries = items.map((i) => (i as any).webkitGetAsEntry?.()).filter(Boolean);
  if (!entries.length) return [...(e.dataTransfer?.files ?? [])].map((f) => ({ file: f, path: f.name }));
  const walk = async (en: any, dir: string): Promise<void> => {
    if (en.isFile) { const f: File = await new Promise((res, rej) => en.file(res, rej)); out.push({ file: f, path: dir + f.name }); return; }
    const reader = en.createReader();
    for (;;) {
      const batch: any[] = await new Promise((res, rej) => reader.readEntries(res, rej));
      if (!batch.length) break;
      for (const c of batch) await walk(c, dir + en.name + '/');
    }
  };
  for (const en of entries) await walk(en, '');
  return out;
}

/** 페이지 파일과 그 "_files" 폴더 파일들을 묶는다 */
function group(items: Item[]) {
  const pages = items.filter((x) => isPageFile(x.file.name) && !x.path.includes('/'));
  return pages
    .sort((a, b) => a.file.lastModified - b.file.lastModified)
    .map((p) => {
      const stem = p.file.name.replace(/\.[^.]+$/, '');
      const extras = items.filter((x) => x !== p && (x.path.startsWith(stem + '_files/') || (pages.length === 1 && (x.path.includes('/') || !isPageFile(x.file.name)))));
      return { page: p.file, extras };
    });
}

async function load(side: Side, page: File, extras: Item[]) {
  busy[side] = true; error.value = '';
  try {
    const r = await readPageFile(page, extras);
    release(side);
    picked[side] = { name: page.name, title: r.title, url: r.url, html: r.html, urls: r.urls, extras: extras.length };
  } catch {
    error.value = t('cdemo.files.bad', { name: page.name });
  } finally { busy[side] = false; }
}

async function take(side: Side | 'both', items: Item[]) {
  const groups = group(items);
  if (!groups.length) { error.value = t('cdemo.files.none'); return; }
  // 페이지 두 개를 한 번에 넣으면: 먼저 저장한 것 = 이전, 나중 것 = 새 버전
  if (groups.length >= 2) { await Promise.all([load('left', groups[0]!.page, groups[0]!.extras), load('right', groups[1]!.page, groups[1]!.extras)]); return; }
  const target: Side = side === 'both' ? (picked.left ? 'right' : 'left') : side;
  await load(target, groups[0]!.page, groups[0]!.extras);
}

async function onDrop(side: Side | 'both', e: DragEvent) {
  over.value = null;
  await take(side, await dropped(e));
}
function onPick(side: Side, e: Event) {
  const input = e.target as HTMLInputElement;
  const files = [...(input.files ?? [])];
  input.value = '';
  if (files.length) take(side, files.map((f) => ({ file: f, path: (f as any).webkitRelativePath || f.name })));
}

function release(side: Side) { for (const u of picked[side]?.urls ?? []) URL.revokeObjectURL(u); }
function clear(side: Side) { release(side); picked[side] = null; }
function swap() { [picked.left, picked.right] = [picked.right, picked.left]; }
const host_ = (p: Picked | null) => { try { return p?.url ? new URL(p.url).host : ''; } catch { return ''; } };

// 두 파일이 다 있으면 비교 화면을 (다시) 그린다
let SG: typeof import('@silvergate/compare-dom') | null = null;
watch(() => [picked.left, picked.right, lang.value], async () => {
  viewer?.destroy(); viewer = null;
  const l = picked.left, r = picked.right;
  if (!l || !r) return;
  SG ??= await import('@silvergate/compare-dom');
  await nextTick();
  if (!host.value || picked.left !== l || picked.right !== r) return;
  viewer = SG.mountViewer(host.value, {
    left: { html: l.html, label: l.title }, right: { html: r.html, label: r.title },
    scripts: false, locale: lang.value, height: 'min(85vh, 1000px)',
  }) as any;
  host.value.querySelector('.sgc-viewer')?.classList.add('cmp-viewer');
});
onBeforeUnmount(() => { viewer?.destroy(); release('left'); release('right'); });
</script>

<template>
  <div class="cmp-files" @dragover.prevent="over ??= 'both'" @dragleave.self="over = null" @drop.prevent="onDrop('both', $event)">
    <p class="cmp__lead lab-lead">{{ t('cdemo.files.lead') }}</p>

    <div class="files-picks">
      <div
        v-for="side in (['left', 'right'] as const)" :key="side"
        class="files-drop" :class="{ 'is-over': over === side || over === 'both', 'is-set': picked[side] }"
        @dragover.prevent.stop="over = side" @dragleave="over = null" @drop.prevent.stop="onDrop(side, $event)"
      >
        <span class="sgc-badge" :class="side === 'left' ? 'sgc-badge-old' : 'sgc-badge-new'">{{ side === 'left' ? t('cdemo.old') : t('cdemo.new') }}</span>
        <template v-if="picked[side]">
          <p class="files-drop__title">{{ picked[side]!.title }}</p>
          <p class="files-drop__meta">
            {{ picked[side]!.name }}<template v-if="host_(picked[side])"> · {{ host_(picked[side]) }}</template>
            <template v-if="picked[side]!.extras"> · {{ t('cdemo.files.extras', { n: picked[side]!.extras }) }}</template>
          </p>
          <div class="files-drop__act">
            <label class="files-btn">{{ t('cdemo.files.change') }}<input type="file" multiple accept=".mhtml,.mht,.html,.htm,text/html,multipart/related" @change="onPick(side, $event)"></label>
            <button type="button" class="files-btn" @click="clear(side)">{{ t('cdemo.files.remove') }}</button>
          </div>
        </template>
        <template v-else>
          <p class="files-drop__title">{{ busy[side] ? t('cdemo.files.reading') : t('cdemo.files.drop') }}</p>
          <p class="files-drop__meta">.mhtml · .html</p>
          <div class="files-drop__act">
            <label class="files-btn files-btn--main">{{ t('cdemo.files.choose') }}<input type="file" multiple accept=".mhtml,.mht,.html,.htm,text/html,multipart/related" @change="onPick(side, $event)"></label>
          </div>
        </template>
      </div>
      <button type="button" class="cmp-swap files-swap" :disabled="!picked.left && !picked.right" :aria-label="t('cdemo.swap')" :title="t('cdemo.swap')" @click="swap">⇄</button>
    </div>
    <p v-if="error" class="files-error" role="alert">{{ error }}</p>

    <div v-show="picked.left && picked.right" ref="host" class="files-stage" />

    <details class="files-help" :open="!picked.left && !picked.right">
      <summary>{{ t('cdemo.files.howTitle') }}</summary>
      <ol>
        <li v-for="(s, i) in (t('cdemo.files.how') as unknown as string).split('\n')" :key="i">{{ s }}</li>
      </ol>
      <p class="files-help__note">{{ t('cdemo.files.privacy') }}</p>
    </details>
  </div>
</template>
