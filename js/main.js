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
  const hs = $('.hscroll');
  const dots = $$('.hdots li');
  const auditRows = $$('.audit__rows .aseq');
  const signSeq = $$('.esign .sseq');
  // 세로 스크롤을 3장의 가로 슬라이드로 나눔: [시작, 끝] 구간마다 해당 슬라이드의 진행도 0→1
  const SLIDES = [[0, 0.36], [0.46, 0.66], [0.76, 1]];
  const ease = (t) => t * t * (3 - 2 * t);
  const setSlides = (p) => {
    let x = 0;
    SLIDES.forEach(([, e], i) => { if (i < SLIDES.length - 1) x += ease(clamp((p - e) / (SLIDES[i + 1][0] - e))); });
    hs.style.setProperty('--x', x.toFixed(4));
    const cur = Math.round(x);
    dots.forEach((d, i) => d.classList.toggle('is-on', i === cur));
    const local = (i) => clamp((p - SLIDES[i][0]) / (SLIDES[i][1] - SLIDES[i][0]));
    setProduct(local(0));
    const na = Math.round(clamp(local(1) / 0.85) * auditRows.length);
    auditRows.forEach((el, i) => { el.classList.toggle('is-done', i < na); el.classList.toggle('is-now', i === na - 1); });
    const ns = Math.round(clamp(local(2) / 0.8) * signSeq.length);
    signSeq.forEach((el, i) => el.classList.toggle('is-done', i < ns));
  };
  const diff = $('[data-scroll="diff"]');
  const wordsSec = $('[data-scroll="words"]');
  const closeSec = $('[data-scroll="close"]');
  const closing = $('.closing');
  const pills = $('.pills');

  const setProduct = (p) => {
    const p1 = clamp(p / 0.35);                                  // 0~35%: 목업이 세워짐
    productInner.style.setProperty('--p1', p1.toFixed(3));
    const n = Math.round(clamp((p - 0.38) / 0.55) * seq.length); // 38~93%: 하나씩 승인
    seq.forEach((el, i) => el.classList.toggle('is-done', i < n));
    steps.forEach((el, i) => el.classList.toggle('is-now', i === n && n < steps.length));
    chip.textContent = S(n >= seq.length ? 'approved' : n > steps.length ? 'inReview' : 'drafting');
    chip.classList.toggle('is-final', n >= seq.length);
  };

  // Compare: 템플릿 슬라이드마다 변경점 행 + 변경 내역(data-c = 강조 순서)을 따로 계산
  const dtrack = $('.dtrack-wrap');
  const dtabs = $$('.dtabs li');
  const dslides = $$('.dslide').map((el) => {
    const items = $$('[data-c]', el);
    return {
      el, items,
      count: Math.max(0, ...items.map((x) => +x.dataset.c)),
      log: $$('.diffx__log li', el),
      stats: { mod: $('.s-mod', el), add: $('.s-add', el), del: $('.s-del', el) },
    };
  });
  const setDiffSlide = (s, p, enter) => {
    const e = enter ? clamp(p / 0.12) : 1;                      // 첫 장만: 두 패널이 양옆에서 모임
    const scan = clamp((p - 0.12) / 0.7);                       // 스캔 빔이 위→아래
    s.el.style.setProperty('--e', e.toFixed(3));
    s.el.style.setProperty('--scan', scan.toFixed(3));
    s.el.style.setProperty('--scan-o', p > 0.1 && p < 0.86 ? '1' : '0');
    const n = Math.round(scan * s.count);
    s.items.forEach((x) => x.classList.toggle('is-on', +x.dataset.c <= n));
    const count = { mod: 0, add: 0, del: 0 };
    s.log.forEach((li) => {
      if (+li.dataset.c > n) return;
      count[li.classList.contains('is-add') ? 'add' : li.classList.contains('is-del') ? 'del' : 'mod'] += 1;
    });
    if (s.stats.mod) {
      s.stats.mod.textContent = `~${count.mod}`; s.stats.add.textContent = `+${count.add}`; s.stats.del.textContent = `−${count.del}`;
      Object.keys(s.stats).forEach((k) => s.stats[k].classList.toggle('is-on', count[k] > 0));
    }
  };
  const DSLIDES = [[0, 0.27], [0.37, 0.63], [0.73, 1]];
  const setDiff = (p) => {
    let x = 0;
    DSLIDES.forEach(([, e], i) => { if (i < DSLIDES.length - 1) x += ease(clamp((p - e) / (DSLIDES[i + 1][0] - e))); });
    if (dtrack) dtrack.style.setProperty('--x', x.toFixed(4));
    const cur = Math.round(x);
    dtabs.forEach((t, i) => t.classList.toggle('is-on', i === cur));
    dslides.forEach((s, i) => {
      const [a, b] = DSLIDES[i] || [0, 1];
      setDiffSlide(s, clamp((p - a) / (b - a)), i === 0);
    });
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

  /* ---------- FX: 진행 막대, 진행 단계, 기능 표 순서 ---------- */
  const sprog = $('.sprog');
  const stepsEl = $('.steps');
  const stepItems = stepsEl ? $$('li', stepsEl) : [];
  const setFx = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (sprog) sprog.style.setProperty('--sp', (max > 0 ? scrollY / max : 0).toFixed(4));
    if (stepsEl) {
      const r = stepsEl.getBoundingClientRect();
      const prog = reduceMotion ? 1 : clamp((innerHeight * 0.92 - r.top) / (innerHeight * 0.55));
      stepItems.forEach((li, i) => {
        const f = clamp(prog * stepItems.length - i);
        li.style.setProperty('--f', f.toFixed(3));
        li.classList.toggle('is-lit', f >= 1);
      });
    }
  };
  // 기능 표: 체크 표시마다 열/행 번호를 넣어 열 순서대로 켜지게
  $$('.matrix tbody tr').forEach((tr, row) => {
    $$('td', tr).forEach((td, col) => {
      const ok = $('.ok', td);
      if (ok) { ok.style.setProperty('--col', col); ok.style.setProperty('--row', row); }
    });
  });

  /* ---------- FX: 유리 카드 — 커서 빛 + 기울기 (마우스 환경만) ---------- */
  if (!reduceMotion && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const spots = $$('.industries li, .steps li, .project, .client, .facts, .form');
    const tilts = new Set($$('.industries li, .steps li, .project, .client'));
    spots.forEach((el) => {
      el.classList.add('spot');
      el.addEventListener('pointermove', (ev) => {
        const r = el.getBoundingClientRect();
        const x = (ev.clientX - r.left) / r.width;
        const y = (ev.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        if (tilts.has(el)) {
          el.classList.add('is-tilt');
          el.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 8).toFixed(2)}deg) rotateY(${((x - 0.5) * 10).toFixed(2)}deg) translateY(-4px)`;
        }
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- FX 2: 커서 빛, 화면 기울기, 인트로 먼지 ---------- */
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduceMotion && fine) {
    const light = $('.cursor-light');
    let raf = 0, cx = 0, cy = 0;
    addEventListener('pointermove', (ev) => {
      cx = ev.clientX; cy = ev.clientY;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        light?.style.setProperty('--cx', cx + 'px');
        light?.style.setProperty('--cy', cy + 'px');
        light?.classList.add('is-on');
        root.style.setProperty('--tx', ((cx / innerWidth) * 2 - 1).toFixed(3));
        root.style.setProperty('--ty', ((cy / innerHeight) * 2 - 1).toFixed(3));
      });
    }, { passive: true });
    document.addEventListener('pointerleave', () => light?.classList.remove('is-on'));
  }

  // 인트로: 은빛 먼지가 천천히 떠오름 (인트로가 보일 때만 그림)
  const dust = $('.intro__dust');
  if (dust && !reduceMotion) {
    const ctx = dust.getContext('2d');
    let w = 0, h = 0, dpr = 1, parts = [];
    const size = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = dust.clientWidth; h = dust.clientHeight;
      dust.width = w * dpr; dust.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(90, (w * h) / 16000));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.4 + 0.3, v: Math.random() * 0.25 + 0.06,
        a: Math.random() * Math.PI * 2, s: Math.random() * 0.02 + 0.006,
      }));
    };
    size();
    addEventListener('resize', size);
    const draw = () => {
      requestAnimationFrame(draw);
      if (scrollY > innerHeight) return;               // 인트로를 지나면 쉼
      const lightMode = root.dataset.theme === 'light';
      ctx.clearRect(0, 0, w, h);
      parts.forEach((p) => {
        p.y -= p.v; p.a += p.s; p.x += Math.sin(p.a) * 0.15;
        if (p.y < -4) { p.y = h + 4; p.x = Math.random() * w; }
        const tw = 0.35 + 0.65 * Math.abs(Math.sin(p.a));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = lightMode ? `rgba(60,64,72,${0.35 * tw})` : `rgba(235,238,242,${0.7 * tw})`;
        ctx.fill();
      });
    };
    requestAnimationFrame(draw);
  }

  /* ---------- 스크롤 루프 (한 프레임에 한 번) ---------- */
  let ticking = false;
  const update = () => {
    ticking = false;
    if (reduceMotion) {
      setProduct(1); setDiff(1); setWords(1);
      auditRows.forEach((el) => el.classList.add('is-done')); signSeq.forEach((el) => el.classList.add('is-done'));  // 모션 줄이기: 완성 상태로 고정
    } else {
      if (intro) intro.style.setProperty('--p', clamp(scrollY / (innerHeight * 0.75)).toFixed(3));
      if (product) setSlides(pinProgress(product));
      if (diff) setDiff(pinProgress(diff));
      if (wordsSec) setWords(pinProgress(wordsSec));
      if (closeSec) closing.style.setProperty('--c', (1 - Math.pow(1 - clamp(pinProgress(closeSec) / 0.8), 3)).toFixed(3));
    }
    reveal();
    setFx();
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
    if (typeof syncThemeBtn === 'function') syncThemeBtn();
    update();
  };

  $$('.lang button').forEach((b) => b.addEventListener('click', () => {
    setLang(b.dataset.lang);
    store.set('sg-lang', lang);
  }));

  /* ---------- 테마: 다크(기본) ↔ 라이트 ---------- */
  const themeBtn = $('#themeBtn');
  const themeMeta = $('meta[name="theme-color"]');
  const syncThemeBtn = () => {
    const light = root.dataset.theme === 'light';
    const key = light ? 'a.toDark' : 'a.toLight';
    themeBtn?.setAttribute('aria-label', lang === 'ko' ? ko[key] : (light ? 'Switch to dark mode' : 'Switch to light mode'));
    themeBtn?.setAttribute('aria-pressed', String(light));
  };
  const setTheme = (t) => {
    if (t === 'light') root.dataset.theme = 'light'; else delete root.dataset.theme;
    if (themeMeta) themeMeta.content = t === 'light' ? '#eceef1' : '#050506';
    syncThemeBtn();
  };
  themeBtn?.addEventListener('click', () => {
    const next = root.dataset.theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    store.set('sg-theme', next);
  });

  // 우선순위: 주소의 ?lang= → 저장된 선택 → 영어
  const qLang = new URLSearchParams(location.search).get('lang');
  setLang(qLang || store.get('sg-lang') || 'en');
  syncThemeBtn();

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);

  /* ---------- 홈 버튼: 맨 위로 ----------
     #top이 고정된 메뉴바라서 브라우저가 스크롤하지 않음 → 직접 맨 위로 이동 */
  $$('a[href="#top"]').forEach((a) => a.addEventListener("click", (ev) => {
    ev.preventDefault();
    scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", location.pathname + location.search);
  }));

  /* ---------- 인터랙티브 데모 ----------
     탭/점을 누르면 해당 장면이 완성된 위치로 스크롤, 변경점을 누르면 양쪽 패널의 같은 행을 강조 */
  const goToSlide = (pin, ranges, i) => {
    if (!pin || !ranges[i]) return;
    const [a0, b0] = ranges[i];
    const p = a0 + (b0 - a0) * 0.97;
    const top = pin.getBoundingClientRect().top + scrollY + (pin.offsetHeight - innerHeight) * p;
    scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  const onActivate = (el, fn) => {
    el.addEventListener('click', fn);
    el.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); fn(ev); } });
  };
  dots.forEach((d, i) => onActivate(d, () => goToSlide(product, SLIDES, i)));
  dtabs.forEach((t, i) => onActivate(t, () => goToSlide(diff, DSLIDES, i)));

  dslides.forEach((s) => {
    let timer;
    const locate = (c) => {
      const hits = $$(`.row[data-c="${c}"], .diffx__log li[data-c="${c}"]`, s.el);
      $$('.is-focus', s.el).forEach((x) => x.classList.remove('is-focus'));
      void s.el.offsetWidth;                    // 같은 항목을 다시 눌러도 애니메이션이 다시 돌게
      hits.forEach((x) => x.classList.add('is-focus'));
      s.el.classList.add('is-locating');
      clearTimeout(timer);
      timer = setTimeout(() => { s.el.classList.remove('is-locating'); hits.forEach((x) => x.classList.remove('is-focus')); }, 1800);
    };
    $$('.diffx__log li[data-c], .row[data-c]', s.el).forEach((el) => onActivate(el, () => locate(el.dataset.c)));
  });

  /* ---------- FAQ: 한 번에 하나씩 펼침 ---------- */
  const faqItems = $$('.faq__item');
  faqItems.forEach((item) => {
    const btn = $('.faq__q', item);
    btn.addEventListener('click', () => {
      const open = !item.classList.contains('is-open');
      faqItems.forEach((other) => {
        other.classList.remove('is-open');
        $('.faq__q', other).setAttribute('aria-expanded', 'false');
      });
      item.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', String(open));
    });
  });

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
  const MIN_FILL_MS = 3000;            // 페이지를 연 뒤 3초 안의 제출은 봇으로 본다 (서버도 같은 기준으로 확인)
  const showError = (msg) => { errorEl.textContent = msg; errorEl.hidden = false; };

  // Cloudflare Turnstile: 사이트 키가 있을 때만, 폼이 화면에 가까워지면 불러온다
  const siteKey = form?.dataset.turnstileSitekey;
  let tsWidget = null;
  if (form && siteKey) {
    const loadTurnstile = () => {
      window.onTurnstileLoad = () => {
        tsWidget = window.turnstile.render('#turnstile', {
          sitekey: siteKey,
          theme: 'auto',
          language: lang,
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
    io.observe(form);
  }
  const resetTurnstile = () => { if (tsWidget !== null) window.turnstile?.reset(tsWidget); };

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

    // 1. 허니팟이 채워졌으면 보내지 않고 성공한 척
    if (data.get('website')) { form.reset(); toast(S('sent')); return; }
    // 2. 페이지를 연 뒤 너무 빨리 보낸 경우
    const elapsed = Math.round(performance.now());
    if (elapsed < MIN_FILL_MS) { showError(S('errTooFast')); return; }
    // 3. Turnstile 토큰이 아직 없으면 (확인 중이거나 체크가 필요한 상태)
    if (siteKey && !data.get('cf-turnstile-response')) { showError(S('errCaptcha')); return; }

    const btn = $('button[type="submit"]', form);
    btn.disabled = true;
    try {
      if (endpoint.includes('script.google.com')) {
        // Gmail 연결(Apps Script): 서버 응답 {ok, error}을 읽어 결과를 보여준다
        data.set('lang', lang);
        data.set('_t', String(elapsed));
        const res = await fetch(endpoint, { method: 'POST', body: new URLSearchParams(data) });
        const out = await res.json();
        if (!out.ok) {
          resetTurnstile();
          const key = { invalid: 'errFields', captcha: 'errCaptcha', rate: 'errRate' }[out.error];
          if (key) { showError(S(key)); return; }
          throw new Error(out.error);
        }
      } else {
        const res = await fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.status);
      }
      form.reset();
      resetTurnstile();                 // 토큰은 1회용이라 다음 문의를 위해 새로 받는다
      toast(S('sent'));
    } catch {
      resetTurnstile();
      showError(S('sendFail')(CONTACT_EMAIL));
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();

  /* ---------- PWA ---------- */
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').then((reg) => {
      // 앱을 다시 열거나 화면으로 돌아올 때마다 새 버전이 있는지 확인
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    }).catch(() => {}));
    // 새 버전이 설치되면 한 번 새로고침해서 바로 적용 (처음 설치 때는 제외)
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      location.reload();
    });
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
