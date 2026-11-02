(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const CONTACT_EMAIL = 'masonlee@silvergate-solutions.com';
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };

  /* =========================================================
     Language — 영어 기본, 한국어 전환 (js/i18n.js)
     ========================================================= */
  const DICT = window.SG_I18N || { ko: {}, strings: { en: {}, ko: {} } };
  let lang = 'en';
  const S = (k) => (DICT.strings[lang] || DICT.strings.en)[k];

  // 영어 원문은 HTML에 있으므로 처음 한 번 저장해 둔다
  const textNodes = $$('[data-i18n]');
  textNodes.forEach((n) => { n.dataset.en = n.innerHTML; });
  const attrNodes = $$('[data-i18n-attr]').map((n) => {
    const pairs = n.dataset.i18nAttr.split(';').map((p) => p.split(':'));
    return { n, pairs: pairs.map(([attr, key]) => ({ attr, key, en: n.getAttribute(attr) })) };
  });
  const meta = { title: document.title, desc: $('meta[name="description"]')?.content };

  /* =========================================================
     Scroll scenes — 섹션마다 진행도(0→1)를 계산해 연출을 갱신
     ========================================================= */
  // 고정 섹션의 진행도: 섹션 상단이 화면 위에 닿을 때 0, 섹션 끝이 화면 아래에 닿을 때 1
  const pinProgress = (el) => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight));
  };

  // 단어 단위로 쪼개기 (언어를 바꿀 때마다 다시). 화면 낭독기는 aria-label로 원문을 읽는다
  const wordsEl = $('.words__text');
  let words = [];
  const splitWords = () => {
    if (!wordsEl) return;
    const text = wordsEl.textContent.trim();
    wordsEl.setAttribute('aria-label', text);
    const parts = text.split(/\s+/);
    // 마침표로 끝나는 단어 뒤에서 줄바꿈 (문장 단위로 끊어 읽히게)
    wordsEl.innerHTML = parts.map((w, i) => `<span class="w" aria-hidden="true">${w}</span>${w.endsWith('.') && i < parts.length - 1 ? '<br>' : ' '}`).join('');
    words = $$('.w', wordsEl);
  };

  const intro = $('.intro');
  const product = $('[data-scroll="product"]');
  const productInner = $('.product');
  const seq = $$('.mock .seq');          // 단계 5개 + 서명 3개
  const steps = $$('.mock__steps li');
  const chip = $('#mockChip');
  const diff = $('[data-scroll="diff"]');
  const diffItems = $$('.diffx [data-c]');   // 변경점 행 + 변경 내역 (data-c = 순서)
  const diffCount = Math.max(0, ...diffItems.map((el) => +el.dataset.c));
  const wordsSec = $('[data-scroll="words"]');
  const pills = $('.pills');

  const setProduct = (p) => {
    const p1 = clamp(p / 0.3);                                   // 0~30%: 목업이 세워짐
    productInner.style.setProperty('--p1', p1.toFixed(3));
    const n = Math.round(clamp((p - 0.32) / 0.6) * seq.length);  // 32~92%: 하나씩 승인
    seq.forEach((el, i) => el.classList.toggle('is-done', i < n));
    steps.forEach((el, i) => el.classList.toggle('is-now', i === n && n < steps.length));
    chip.textContent = S(n >= seq.length ? 'approved' : n > steps.length ? 'inReview' : 'drafting');
    chip.classList.toggle('is-final', n >= seq.length);
  };

  const diffInner = $('.diffx');
  const diffLog = $$('.diffx__log li');       // 변경 종류: is-add / is-del / 그 외는 값 변경
  const stats = { mod: $('.s-mod'), add: $('.s-add'), del: $('.s-del') };
  const setDiff = (p) => {
    const e = clamp(p / 0.12);                                  // 0~12%: 두 패널이 양옆에서 모임
    const scan = clamp((p - 0.12) / 0.7);                       // 12~82%: 스캔 빔이 위→아래
    diffInner.style.setProperty('--e', e.toFixed(3));
    diffInner.style.setProperty('--scan', scan.toFixed(3));
    diffInner.style.setProperty('--scan-o', p > 0.1 && p < 0.86 ? '1' : '0');
    const n = Math.round(scan * diffCount);                     // 빔이 지나간 만큼 변경점 점등
    diffItems.forEach((el) => el.classList.toggle('is-on', +el.dataset.c <= n));
    const count = { mod: 0, add: 0, del: 0 };
    diffLog.forEach((li) => {
      if (+li.dataset.c > n) return;
      count[li.classList.contains('is-add') ? 'add' : li.classList.contains('is-del') ? 'del' : 'mod'] += 1;
    });
    if (stats.mod) {
      stats.mod.textContent = `~${count.mod}`; stats.add.textContent = `+${count.add}`; stats.del.textContent = `−${count.del}`;
      Object.keys(stats).forEach((k) => stats[k].classList.toggle('is-on', count[k] > 0));
    }
  };

  const setWords = (p) => {
    const n = Math.round(clamp(p / 0.75) * words.length);
    words.forEach((el, i) => el.classList.toggle('is-on', i < n));
    pills.classList.toggle('is-on', p > 0.8);
  };

  /* ---------- Reveal (정적 섹션): 화면 아래 10% 지점에 들어오면 한 번 ---------- */
  let pending = $$('.reveal');
  const reveal = () => {
    pending = pending.filter((el) => {
      if (el.getBoundingClientRect().top < innerHeight * 0.9) { el.classList.add('is-in'); return false; }
      return true;
    });
  };

  /* ---------- Active section (nav + tabbar): 화면 중앙에 걸친 섹션 ---------- */
  const links = $$('.nav__links a, .tabbar a');
  const sections = ['top', 'product', 'solutions', 'strengths', 'references', 'company', 'contact']
    .map((id) => [id, id === 'top' ? intro : document.getElementById(id)])
    .filter(([, el]) => el);
  let activeId = '';
  const markActive = () => {
    const mid = innerHeight * 0.45;
    let id = 'top';
    sections.forEach(([sid, el]) => { if (el.getBoundingClientRect().top <= mid) id = sid; });
    if (id === activeId) return;
    activeId = id;
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
  };

  /* ---------- 스크롤 루프 (한 프레임에 한 번) ---------- */
  let ticking = false;
  const update = () => {
    ticking = false;
    if (reduceMotion) {
      setProduct(1); setDiff(1); setWords(1);  // 모션 줄이기: 완성 상태로 고정
    } else {
      if (intro) intro.style.setProperty('--p', clamp(scrollY / (innerHeight * 0.75)).toFixed(3));
      if (product) setProduct(pinProgress(product));
      if (diff) setDiff(pinProgress(diff));
      if (wordsSec) setWords(pinProgress(wordsSec));
    }
    reveal();
    markActive();
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  /* ---------- 언어 적용 ---------- */
  const ko = DICT.ko;
  const setLang = (next) => {
    lang = next === 'ko' ? 'ko' : 'en';
    root.lang = lang;
    textNodes.forEach((n) => { n.innerHTML = lang === 'ko' && ko[n.dataset.i18n] != null ? ko[n.dataset.i18n] : n.dataset.en; });
    attrNodes.forEach(({ n, pairs }) => pairs.forEach(({ attr, key, en }) => {
      n.setAttribute(attr, lang === 'ko' && ko[key] != null ? ko[key] : en);
    }));
    document.title = lang === 'ko' ? ko['meta.title'] : meta.title;
    const desc = $('meta[name="description"]');
    if (desc) desc.content = lang === 'ko' ? ko['meta.desc'] : meta.desc;
    $$('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
    splitWords();
    update();
  };

  $$('.lang button').forEach((b) => b.addEventListener('click', () => {
    setLang(b.dataset.lang);
    store.set('sg-lang', lang);
  }));

  // 우선순위: 주소의 ?lang= → 저장된 선택 → 영어
  const qLang = new URLSearchParams(location.search).get('lang');
  setLang(qLang || store.get('sg-lang') || 'en');

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 3200);
  };

  /* ---------- Contact form ----------
     action이 비어 있으면 메일 앱으로 작성, Formspree 주소를 넣으면 그쪽으로 전송 */
  const form = $('#contactForm');
  const errorEl = $('#formError');
  form?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    let firstInvalid = null;
    $$('[required]', form).forEach((input) => {
      const valid = input.type === 'checkbox' ? input.checked : input.checkValidity() && input.value.trim() !== '';
      (input.closest('.field') || input.closest('.agree')).classList.toggle('has-error', !valid);
      if (!valid && !firstInvalid) firstInvalid = input;
    });
    if (firstInvalid) {
      errorEl.textContent = S(firstInvalid.type === 'checkbox' ? 'errAgree' : 'errFields');
      errorEl.hidden = false;
      firstInvalid.focus();
      return;
    }
    errorEl.hidden = true;

    const data = new FormData(form);
    const endpoint = form.getAttribute('action');

    if (!endpoint) {
      const subject = `${S('mailSubject')} ${data.get('company')} ${data.get('name')}`;
      const body = [
        `${S('lCompany')}: ${data.get('company')}`,
        `${S('lName')}: ${data.get('name')}`,
        `${S('lEmail')}: ${data.get('email')}`,
        '',
        data.get('message'),
      ].join('\n');
      location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      toast(S('mailToast'));
      return;
    }

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    try {
      const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
      if (!res.ok) throw new Error(res.status);
      form.reset();
      toast(S('sent'));
    } catch {
      errorEl.textContent = S('sendFail')(CONTACT_EMAIL);
      errorEl.hidden = false;
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- PWA ---------- */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }
  let deferred;
  const installBtn = $('#installBtn');
  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    installBtn.hidden = false;
  });
  installBtn?.addEventListener('click', async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice;
    deferred = null;
    installBtn.hidden = true;
  });
  addEventListener('appinstalled', () => toast(S('installed')));
})();
