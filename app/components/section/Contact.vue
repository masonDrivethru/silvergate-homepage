<script setup lang="ts">
/* 문의 폼 → Google Apps Script(tools/contact-mailer.gs) → masonlee Gmail
   endpoint가 비어 있으면 메일 앱으로 작성. 스팸 방어(허니팟, 3초, 언어)는 서버에서도 다시 확인한다 */
const config = useRuntimeConfig().public;
const endpoint = config.appsScriptUrl as string;
const siteKey = config.turnstileSiteKey as string;
const { t, locale } = useI18n();
const { toast } = useToast();

const MIN_FILL_MS = 3000;            // 페이지를 연 뒤 3초 안의 제출은 봇으로 본다 (서버도 같은 기준으로 확인)
const formEl = ref<HTMLFormElement | null>(null);
const errors = reactive<Record<string, boolean>>({});
const errorMsg = ref('');
const sending = ref(false);
const showError = (msg: string) => { errorMsg.value = msg; };

// Cloudflare Turnstile: 사이트 키가 있을 때만, 폼이 화면에 가까워지면 불러온다
type Turnstile = { render: (el: string, o: object) => string; reset: (id: string) => void };
const ts = () => (window as unknown as { turnstile?: Turnstile }).turnstile;
let tsWidget: string | null = null;
onMounted(() => {
  if (!formEl.value || !siteKey) return;
  const loadTurnstile = () => {
    (window as unknown as { onTurnstileLoad: () => void }).onTurnstileLoad = () => {
      tsWidget = ts()!.render('#turnstile', {
        sitekey: siteKey,
        theme: 'auto',
        language: locale.value,
        appearance: 'interaction-only',   // 대부분은 보이지 않고, 확인이 필요할 때만 체크 상자가 뜬다
      });
    };
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad';
    s.async = true;
    document.head.appendChild(s);
  };
  const io = new IntersectionObserver((entries) => {
    if (entries.some((en) => en.isIntersecting)) { io.disconnect(); loadTurnstile(); }
  }, { rootMargin: '600px 0px' });
  io.observe(formEl.value);
});
const resetTurnstile = () => { if (tsWidget !== null) ts()?.reset(tsWidget); };

const onSubmit = async () => {
  const form = formEl.value!;
  let firstInvalid: HTMLInputElement | null = null;
  form.querySelectorAll<HTMLInputElement>('[required]').forEach((input) => {
    const valid = input.type === 'checkbox' ? input.checked : input.checkValidity() && input.value.trim() !== '';
    errors[input.name] = !valid;
    if (!valid && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) {
    const el = firstInvalid as HTMLInputElement;
    showError(t(el.type === 'checkbox' ? 's.errAgree' : 's.errFields'));
    el.focus();
    return;
  }
  errorMsg.value = '';

  const data = new FormData(form);

  if (!endpoint) {
    const subject = `${t('s.mailSubject')} ${data.get('company')} ${data.get('name')}`;
    const body = [
      `${t('s.lCompany')}: ${data.get('company')}`,
      `${t('s.lName')}: ${data.get('name')}`,
      `${t('s.lEmail')}: ${data.get('email')}`,
      '',
      data.get('message'),
    ].join('\n');
    location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    toast(t('s.mailToast'));
    return;
  }

  // 1. 허니팟이 채워졌으면 보내지 않고 성공한 척
  if (data.get('website')) { form.reset(); toast(t('s.sent')); return; }
  // 2. 페이지를 연 뒤 너무 빨리 보낸 경우
  const elapsed = Math.round(performance.now());
  if (elapsed < MIN_FILL_MS) { showError(t('s.errTooFast')); return; }
  // 3. Turnstile 토큰이 아직 없으면 (확인 중이거나 체크가 필요한 상태)
  if (siteKey && !data.get('cf-turnstile-response')) { showError(t('s.errCaptcha')); return; }

  sending.value = true;
  try {
    if (endpoint.includes('script.google.com')) {
      // Gmail 연결(Apps Script): 서버 응답 {ok, error}을 읽어 결과를 보여준다
      data.set('lang', locale.value);
      data.set('_t', String(elapsed));
      const res = await fetch(endpoint, { method: 'POST', body: new URLSearchParams(data as unknown as Record<string, string>) });
      const out = await res.json();
      if (!out.ok) {
        resetTurnstile();
        const key = ({ invalid: 's.errFields', captcha: 's.errCaptcha', rate: 's.errRate' } as Record<string, string>)[out.error];
        if (key) { showError(t(key)); return; }
        throw new Error(out.error);
      }
    } else {
      const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(String(res.status));
    }
    form.reset();
    resetTurnstile();                 // 토큰은 1회용이라 다음 문의를 위해 새로 받는다
    toast(t('s.sent'));
  } catch {
    resetTurnstile();
    showError(t('s.sendFail', { mail: CONTACT_EMAIL }));
  } finally {
    sending.value = false;
  }
};
</script>

<template>
  <!-- ===== 7. Contact ===== -->
  <section class="section" id="contact" aria-labelledby="ct-title">
    <div class="container split">
      <div class="reveal">
        <h2 id="ct-title" class="section__title">{{ $t('ct.title') }}</h2>
        <ul class="contact__list">
          <li><svg class="icon" aria-hidden="true"><use href="#i-phone"/></svg><span><span class="sr-only">{{ $t('ct.phone') }}</span><a href="tel:+821096900006">+82 10-9690-0006</a></span></li>
          <li><svg class="icon" aria-hidden="true"><use href="#i-mail"/></svg><span><span class="sr-only">{{ $t('ct.email') }}</span><a href="mailto:masonlee@silvergate-solutions.com">masonlee@silvergate-solutions.com</a></span></li>
        </ul>
        <!-- 상담 예약: Google 캘린더 예약 페이지 -->
        <a class="btn btn--glass book-btn" id="bookBtn" href="https://calendar.app.google/wLYapJcPyoxVQvN78" target="_blank" rel="noopener noreferrer">{{ $t('ct.book') }}</a>
      </div>

      <!-- 주의: form 요소에는 :class를 쓰지 않는다 (스크롤 연출이 reveal/spot 클래스를 직접 붙이기 때문) -->
      <form ref="formEl" class="form reveal" id="contactForm" :action="endpoint" method="POST" novalidate :data-turnstile-sitekey="siteKey" @submit.prevent="onSubmit">
        <div class="form__row">
          <div class="field" :class="{ 'has-error': errors.company }"><label for="f-company">{{ $t('f.company') }}</label><input id="f-company" name="company" required autocomplete="organization" /></div>
          <div class="field" :class="{ 'has-error': errors.name }"><label for="f-name">{{ $t('f.name') }}</label><input id="f-name" name="name" required autocomplete="name" /></div>
        </div>
        <div class="field" :class="{ 'has-error': errors.email }"><label for="f-email">{{ $t('f.email') }}</label><input id="f-email" name="email" type="email" required autocomplete="email" /></div>
        <div class="field" :class="{ 'has-error': errors.message }"><label for="f-msg">{{ $t('f.msg') }}</label><textarea id="f-msg" name="message" rows="4" required></textarea></div>
        <label class="agree" :class="{ 'has-error': errors.agree }"><input type="checkbox" name="agree" required /><span>{{ $t('f.agree') }}</span></label>
        <!-- 허니팟: 사람에게는 안 보이고, 봇만 채우는 칸 -->
        <div class="hp" aria-hidden="true"><label for="f-website">Website</label><input id="f-website" type="text" name="website" tabindex="-1" autocomplete="off" /></div>
        <div class="turnstile" id="turnstile"></div>
        <p class="form__error" id="formError" role="alert" :hidden="!errorMsg">{{ errorMsg }}</p>
        <button class="btn btn--silver btn--lg btn--block" type="submit" :disabled="sending">{{ $t('f.send') }}</button>
      </form>
    </div>
  </section>
</template>
