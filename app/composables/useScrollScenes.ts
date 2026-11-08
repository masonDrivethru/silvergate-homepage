/* =========================================================
   스크롤 연출 — 섹션마다 진행도(0→1)를 계산해 연출을 갱신
   (기존 js/main.js의 수치·순서를 그대로 옮김. 매 프레임 바뀌는 클래스·CSS 변수는
    Vue 렌더링을 거치지 않고 DOM에 직접 쓴다: 스크롤 성능 때문)
   글자가 바뀌는 부분(목업 상태 칩, 단어 분할)은 Vue 상태로 처리한다.
   ========================================================= */
export type ChipState = 'drafting' | 'inReview' | 'approved';

export function useMockChip() {
  return useState<ChipState>('mock-chip', () => 'drafting');
}

const $ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => el.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, el: ParentNode = document) => [...el.querySelectorAll<T>(s)];
const ease = (t: number) => t * t * (3 - 2 * t);

export function initScrollScenes() {
  const chipState = useMockChip();
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const cleanups: Array<() => void> = [];
  const on = (target: EventTarget, type: string, fn: EventListenerOrEventListenerObject, opts?: AddEventListenerOptions) => {
    target.addEventListener(type, fn, opts);
    cleanups.push(() => target.removeEventListener(type, fn, opts));
  };

  // 고정 섹션의 진행도: 섹션 상단이 화면 위에 닿을 때 0, 섹션 끝이 화면 아래에 닿을 때 1
  const pinProgress = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    return clamp(-r.top / (r.height - innerHeight));
  };

  // 단어(언어를 바꾸면 Vue가 다시 그리므로 refreshWords로 다시 찾는다)
  const wordsEl = $('.words__text');
  let words: HTMLElement[] = [];
  const refreshWords = () => { words = wordsEl ? $$('.w', wordsEl) : []; };
  refreshWords();

  const intro = $('.intro');
  const product = $('[data-scroll="product"]');
  const productInner = $('.product')!;
  const seq = $$('.mock .seq');          // 단계 5개 + 서명 3개
  const steps = $$('.mock__steps li');
  const chip = $('#mockChip');
  const hs = $('.hscroll')!;
  const dots = $$('.hdots li');
  const auditRows = $$('.audit__rows .aseq');
  const signSeq = $$('.esign .sseq');
  // 세로 스크롤을 3장의 가로 슬라이드로 나눔: [시작, 끝] 구간마다 해당 슬라이드의 진행도 0→1
  const SLIDES: Array<[number, number]> = [[0, 0.36], [0.46, 0.66], [0.76, 1]];

  const setProduct = (p: number) => {
    const p1 = clamp(p / 0.35);                                  // 0~35%: 목업이 세워짐
    productInner.style.setProperty('--p1', p1.toFixed(3));
    const n = Math.round(clamp((p - 0.38) / 0.55) * seq.length); // 38~93%: 하나씩 승인
    seq.forEach((el, i) => el.classList.toggle('is-done', i < n));
    steps.forEach((el, i) => el.classList.toggle('is-now', i === n && n < steps.length));
    chipState.value = n >= seq.length ? 'approved' : n > steps.length ? 'inReview' : 'drafting';
    chip?.classList.toggle('is-final', n >= seq.length);
  };

  const setSlides = (p: number) => {
    let x = 0;
    SLIDES.forEach(([, e], i) => { if (i < SLIDES.length - 1) x += ease(clamp((p - e) / (SLIDES[i + 1]![0] - e))); });
    hs.style.setProperty('--x', x.toFixed(4));
    const cur = Math.round(x);
    dots.forEach((d, i) => d.classList.toggle('is-on', i === cur));
    const local = (i: number) => clamp((p - SLIDES[i]![0]) / (SLIDES[i]![1] - SLIDES[i]![0]));
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

  // Compare: 템플릿 슬라이드마다 변경점 행 + 변경 내역(data-c = 강조 순서)을 따로 계산
  const dtrack = $('.dtrack-wrap');
  const dtabs = $$('.dtabs li');
  const dslides = $$('.dslide').map((el) => {
    const items = $$('[data-c]', el);
    return {
      el, items,
      count: Math.max(0, ...items.map((x) => +x.dataset.c!)),
      log: $$('.diffx__log li', el),
      stats: { mod: $('.s-mod', el), add: $('.s-add', el), del: $('.s-del', el) },
    };
  });
  type DSlide = (typeof dslides)[number];
  const setDiffSlide = (s: DSlide, p: number, enter: boolean) => {
    const e = enter ? clamp(p / 0.12) : 1;                      // 첫 장만: 두 패널이 양옆에서 모임
    const scan = clamp((p - 0.12) / 0.7);                       // 스캔 빔이 위→아래
    s.el.style.setProperty('--e', e.toFixed(3));
    s.el.style.setProperty('--scan', scan.toFixed(3));
    s.el.style.setProperty('--scan-o', p > 0.1 && p < 0.86 ? '1' : '0');
    const n = Math.round(scan * s.count);
    s.items.forEach((x) => x.classList.toggle('is-on', +x.dataset.c! <= n));
    const count = { mod: 0, add: 0, del: 0 };
    s.log.forEach((li) => {
      if (+li.dataset.c! > n) return;
      count[li.classList.contains('is-add') ? 'add' : li.classList.contains('is-del') ? 'del' : 'mod'] += 1;
    });
    const { mod, add, del } = s.stats;
    if (mod && add && del) {
      mod.textContent = `~${count.mod}`; add.textContent = `+${count.add}`; del.textContent = `−${count.del}`;
      mod.classList.toggle('is-on', count.mod > 0);
      add.classList.toggle('is-on', count.add > 0);
      del.classList.toggle('is-on', count.del > 0);
    }
  };
  const DSLIDES: Array<[number, number]> = [[0, 0.27], [0.37, 0.63], [0.73, 1]];
  const setDiff = (p: number) => {
    let x = 0;
    DSLIDES.forEach(([, e], i) => { if (i < DSLIDES.length - 1) x += ease(clamp((p - e) / (DSLIDES[i + 1]![0] - e))); });
    dtrack?.style.setProperty('--x', x.toFixed(4));
    const cur = Math.round(x);
    dtabs.forEach((t, i) => t.classList.toggle('is-on', i === cur));
    dslides.forEach((s, i) => {
      const [a, b] = DSLIDES[i] || [0, 1];
      setDiffSlide(s, clamp((p - a) / (b - a)), i === 0);
    });
  };

  const setWords = (p: number) => {
    const n = Math.round(clamp(p / 0.75) * words.length);
    words.forEach((el, i) => el.classList.toggle('is-on', i < n));
    pills?.classList.toggle('is-on', p > 0.8);
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
    .map((id) => [id, id === 'top' ? intro : document.getElementById(id)] as const)
    .filter((x): x is readonly [string, HTMLElement] => !!x[1]);
  let activeId = '';
  const markActive = () => {
    const mid = innerHeight * 0.45;
    let id = 'top';
    sections.forEach(([sid, el]) => { if (el.getBoundingClientRect().top <= mid) id = sid; });
    if (id === activeId) return;
    activeId = id;
    links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`));
  };

  /* ---------- FX: 진행 막대, 진행 단계 ---------- */
  const sprog = $('.sprog');
  const stepsEl = $('.steps');
  const stepItems = stepsEl ? $$('li', stepsEl) : [];
  const setFx = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    sprog?.style.setProperty('--sp', (max > 0 ? scrollY / max : 0).toFixed(4));
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
      if (ok) { ok.style.setProperty('--col', String(col)); ok.style.setProperty('--row', String(row)); }
    });
  });

  /* ---------- FX: 유리 카드 — 커서 빛 + 기울기 (마우스 환경만) ---------- */
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!reduceMotion && fine) {
    const spots = $$('.industries li, .steps li, .project, .client, .facts, .form');
    const tilts = new Set($$('.industries li, .steps li, .project, .client'));
    spots.forEach((el) => {
      el.classList.add('spot');
      on(el, 'pointermove', (ev) => {
        const pe = ev as PointerEvent;
        const r = el.getBoundingClientRect();
        const x = (pe.clientX - r.left) / r.width;
        const y = (pe.clientY - r.top) / r.height;
        el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
        if (tilts.has(el)) {
          el.classList.add('is-tilt');
          el.style.transform = `perspective(900px) rotateX(${((0.5 - y) * 8).toFixed(2)}deg) rotateY(${((x - 0.5) * 10).toFixed(2)}deg) translateY(-4px)`;
        }
      });
      on(el, 'pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* ---------- FX 2: 커서 빛, 화면 기울기 ---------- */
  if (!reduceMotion && fine) {
    const light = $('.cursor-light');
    let raf = 0, cx = 0, cy = 0;
    on(window, 'pointermove', (ev) => {
      const pe = ev as PointerEvent;
      cx = pe.clientX; cy = pe.clientY;
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
    on(document, 'pointerleave', () => light?.classList.remove('is-on'));
  }

  // 인트로: 은빛 먼지가 천천히 떠오름 (인트로가 보일 때만 그림)
  const dust = $<HTMLCanvasElement>('.intro__dust');
  let dustRaf = 0;
  if (dust && !reduceMotion) {
    const ctx = dust.getContext('2d')!;
    let w = 0, h = 0, dpr = 1;
    let parts: Array<{ x: number; y: number; r: number; v: number; a: number; s: number }> = [];
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
    on(window, 'resize', size);
    const draw = () => {
      dustRaf = requestAnimationFrame(draw);
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
    dustRaf = requestAnimationFrame(draw);
    cleanups.push(() => cancelAnimationFrame(dustRaf));
  }

  /* ---------- 스크롤 루프 (한 프레임에 한 번) ---------- */
  let ticking = false;
  const update = () => {
    ticking = false;
    if (reduceMotion) {
      setProduct(1); setDiff(1); setWords(1);
      auditRows.forEach((el) => el.classList.add('is-done')); signSeq.forEach((el) => el.classList.add('is-done'));  // 모션 줄이기: 완성 상태로 고정
    } else {
      intro?.style.setProperty('--p', clamp(scrollY / (innerHeight * 0.75)).toFixed(3));
      if (product) setSlides(pinProgress(product));
      if (diff) setDiff(pinProgress(diff));
      if (wordsSec) setWords(pinProgress(wordsSec));
      if (closeSec && closing) closing.style.setProperty('--c', (1 - Math.pow(1 - clamp(pinProgress(closeSec) / 0.8), 3)).toFixed(3));
    }
    reveal();
    setFx();
    markActive();
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  on(window, 'scroll', onScroll, { passive: true });
  on(window, 'resize', onScroll);

  /* ---------- 홈 버튼: 맨 위로 ----------
     #top이 고정된 메뉴바라서 브라우저가 스크롤하지 않음 → 직접 맨 위로 이동 */
  $$('a[href="#top"]').forEach((a) => on(a, 'click', (ev) => {
    ev.preventDefault();
    scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    history.replaceState(history.state, '', location.pathname + location.search);
  }));

  /* ---------- 인터랙티브 데모 ----------
     탭/점을 누르면 해당 장면이 완성된 위치로 스크롤, 변경점을 누르면 양쪽 패널의 같은 행을 강조 */
  const goToSlide = (pin: HTMLElement | null, ranges: Array<[number, number]>, i: number) => {
    if (!pin || !ranges[i]) return;
    const [a0, b0] = ranges[i]!;
    const p = a0 + (b0 - a0) * 0.97;
    const top = pin.getBoundingClientRect().top + scrollY + (pin.offsetHeight - innerHeight) * p;
    scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  const onActivate = (el: HTMLElement, fn: () => void) => {
    on(el, 'click', fn);
    on(el, 'keydown', (ev) => {
      const k = (ev as KeyboardEvent).key;
      if (k === 'Enter' || k === ' ') { ev.preventDefault(); fn(); }
    });
  };
  dots.forEach((d, i) => onActivate(d, () => goToSlide(product, SLIDES, i)));
  dtabs.forEach((t, i) => onActivate(t, () => goToSlide(diff, DSLIDES, i)));

  dslides.forEach((s) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const locate = (c: string) => {
      const hits = $$(`.row[data-c="${c}"], .diffx__log li[data-c="${c}"]`, s.el);
      $$('.is-focus', s.el).forEach((x) => x.classList.remove('is-focus'));
      void s.el.offsetWidth;                    // 같은 항목을 다시 눌러도 애니메이션이 다시 돌게
      hits.forEach((x) => x.classList.add('is-focus'));
      s.el.classList.add('is-locating');
      clearTimeout(timer);
      timer = setTimeout(() => { s.el.classList.remove('is-locating'); hits.forEach((x) => x.classList.remove('is-focus')); }, 1800);
    };
    $$('.diffx__log li[data-c], .row[data-c]', s.el).forEach((el) => onActivate(el, () => locate(el.dataset.c!)));
  });

  update();

  return {
    update,
    refreshWords,
    destroy: () => cleanups.forEach((fn) => fn()),
  };
}
