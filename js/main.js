(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const root = document.documentElement;

  /* ---------- Theme ---------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const saved = store.get('sg-theme');
  if (saved) root.dataset.theme = saved;
  else if (matchMedia('(prefers-color-scheme: dark)').matches) root.dataset.theme = 'dark';

  $('#themeToggle')?.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = next;
    store.set('sg-theme', next);
  });

  /* ---------- Nav border on scroll ---------- */
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const siblings = $$('.reveal', e.target.parentElement);
      e.target.style.transitionDelay = `${Math.min(siblings.indexOf(e.target), 5) * 70}ms`;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- Count-up stats ---------- */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const end = +el.dataset.count;
      const dur = 1400;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$('[data-count]').forEach((el) => countIO.observe(el));

  /* ---------- Active section (nav + tabbar) ---------- */
  const links = $$('.nav__links a, .tabbar a');
  const sections = ['top', 'services', 'process', 'works', 'about', 'contact']
    .map((id) => (id === 'top' ? $('.hero') : document.getElementById(id)))
    .filter(Boolean);
  const secIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id || 'top';
      links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => secIO.observe(s));

  /* ---------- Works filter ---------- */
  $$('.chip[data-filter]').forEach((chip) => {
    chip.addEventListener('click', () => {
      const f = chip.dataset.filter;
      $$('.chip[data-filter]').forEach((c) => {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-selected', on);
      });
      $$('.work').forEach((w) => w.classList.toggle('is-hidden', f !== 'all' && w.dataset.cat !== f));
    });
  });

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-show'), 2800);
  };

  /* ---------- Contact form ---------- */
  const form = $('#contactForm');
  form?.addEventListener('submit', (ev) => {
    ev.preventDefault();
    let ok = true;
    $$('[required]', form).forEach((input) => {
      const valid = input.checkValidity() && input.value.trim() !== '';
      input.closest('.field').classList.toggle('has-error', !valid);
      if (!valid && ok) { input.focus(); ok = false; }
    });
    if (!ok) return toast('필수 항목을 확인해 주세요.');

    // TODO: 실제 접수 API(예: Formspree, 사내 API) 연동
    const data = Object.fromEntries(new FormData(form));
    data.topic = new FormData(form).getAll('topic');
    console.info('[contact]', data);
    form.reset();
    toast('문의가 접수되었습니다. 곧 연락드릴게요!');
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
  addEventListener('appinstalled', () => toast('실버게이트 앱이 설치되었습니다.'));
})();
