<script setup lang="ts">
// /compare 비밀번호 화면. 비밀번호 자체는 사이트 어디에도 없고, 느리게 계산한 지문(PBKDF2)만 있다.
// 맞으면 이 탭(세션) 동안만 열림. 비밀번호를 바꾸면(지문이 바뀌면) 다시 물어본다.
// 주의: 정적 사이트라 화면을 가리는 수준의 잠금이다 (docs: HOMEPAGE.md "Compare 비밀번호")
const emit = defineEmits<{ unlocked: [] }>();
const { t } = useI18n();
const lock = String(useRuntimeConfig().public.compareLock || '');
const KEY = 'sg-compare-unlock';

const pw = ref('');
const busy = ref(false);
const wrong = ref(false);
const waitUntil = ref(0);
const now = ref(Date.now());
let fails = 0, timer = 0;
const waitSec = computed(() => Math.max(0, Math.ceil((waitUntil.value - now.value) / 1000)));

const b64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
async function check(input: string) {
  const [ver, iter, salt, hash] = lock.split(':');
  if (ver !== 'v1' || !iter || !salt || !hash) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(input.normalize('NFC')), 'PBKDF2', false, ['deriveBits']);
  const bits = new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: b64(salt), iterations: Number(iter) }, key, 256));
  const want = b64(hash);
  let diff = bits.length ^ want.length;
  for (let i = 0; i < want.length; i++) diff |= bits[i]! ^ want[i]!;
  return diff === 0;
}

async function submit() {
  if (busy.value || waitSec.value || !pw.value) return;
  busy.value = true; wrong.value = false;
  try {
    if (await check(pw.value)) {
      try { sessionStorage.setItem(KEY, lock); } catch {}
      emit('unlocked');
    } else {
      wrong.value = true;
      fails++;
      // 여러 번 틀리면 잠시 기다리게 (5번째부터 30초씩)
      if (fails >= 5) { waitUntil.value = Date.now() + 30000; clearInterval(timer); timer = window.setInterval(() => { now.value = Date.now(); if (!waitSec.value) clearInterval(timer); }, 500); }
    }
  } finally { busy.value = false; pw.value = ''; }
}

onMounted(() => {
  try { if (lock && sessionStorage.getItem(KEY) === lock) emit('unlocked'); } catch {}
});
onBeforeUnmount(() => clearInterval(timer));
</script>

<template>
  <section class="section cmp-gate" aria-labelledby="gate-title">
    <div class="container cmp-gate__box">
      <p class="product__name">SilverBio Compare</p>
      <h1 id="gate-title" class="section__title">{{ t('cdemo.gate.title') }}</h1>
      <template v-if="lock">
        <p class="cmp__lead">{{ t('cdemo.gate.lead') }}</p>
        <form class="cmp-gate__form" @submit.prevent="submit">
          <label class="sr-only" for="gate-pw">{{ t('cdemo.gate.label') }}</label>
          <input id="gate-pw" v-model="pw" type="password" autocomplete="current-password" :placeholder="t('cdemo.gate.label')" :disabled="busy || !!waitSec" required>
          <button type="submit" class="cmp-entry" :disabled="busy || !!waitSec">{{ busy ? t('cdemo.gate.checking') : t('cdemo.gate.open') }}</button>
        </form>
        <p v-if="waitSec" class="cmp-gate__msg" role="alert">{{ t('cdemo.gate.wait', { s: waitSec }) }}</p>
        <p v-else-if="wrong" class="cmp-gate__msg" role="alert">{{ t('cdemo.gate.wrong') }}</p>
      </template>
      <p v-else class="cmp__lead">{{ t('cdemo.gate.closed') }}</p>
    </div>
  </section>
</template>
