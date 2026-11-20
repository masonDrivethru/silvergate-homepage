/**
 * 스크롤 영역 다루기 + 좌우 스크롤 맞춤.
 * 맞춤 기준: 양쪽 문서에서 똑같은 덩어리(문단·표 줄 등)끼리 짝지은 목록 → 화면 맨 위 덩어리를 반대쪽 짝과 같은 높이로.
 */

/** 스크롤 대상: 요소 또는 (iframe·페이지의) window */
export function makeScroller(root, given) {
  const doc = root.ownerDocument;
  const win = doc.defaultView;
  let el = given ?? null;
  if (!el) {
    for (let p = root; p && p.nodeType === 1; p = p.parentElement) {
      const oy = win.getComputedStyle(p).overflowY;
      if ((oy === 'auto' || oy === 'scroll' || oy === 'overlay') && p !== doc.body && p !== doc.documentElement) { el = p; break; }
    }
  }
  if (el && el !== win && el !== doc.scrollingElement && el.nodeType === 1) {
    return {
      target: el, doc: el.ownerDocument,
      get top() { return el.scrollTop; },
      set top(v) { el.scrollTop = v; },
      viewTop: () => el.getBoundingClientRect().top,
      height: () => el.clientHeight,
      max: () => el.scrollHeight - el.clientHeight,
    };
  }
  const se = () => doc.scrollingElement ?? doc.documentElement;
  return {
    target: win, doc,
    get top() { return se().scrollTop; },
    set top(v) { se().scrollTop = v; },
    viewTop: () => 0,
    height: () => win.innerHeight,
    max: () => se().scrollHeight - win.innerHeight,
  };
}

/**
 * el 의 화면 위쪽 위치를 doc(스크롤 영역이 있는 문서) 기준으로.
 * el 이 iframe 안에 있으면 iframe 위치를 더한다 (iframe 두 개를 한 스크롤 영역에 나란히 둘 때)
 */
export function topIn(el, doc) {
  let top = el.getBoundingClientRect().top;
  let w = el.ownerDocument.defaultView;
  while (w && w.document !== doc && w.frameElement) {
    const f = w.frameElement;
    const cs = f.ownerDocument.defaultView.getComputedStyle(f);
    top += f.getBoundingClientRect().top + (parseFloat(cs.borderTopWidth) || 0) + (parseFloat(cs.paddingTop) || 0);
    w = w.parent;
  }
  return top;
}

/** 스크롤 영역 안에서 el 이 위에서 ratio 높이에 오게 */
export function scrollIntoScroller(sc, el, ratio = 0.3, smooth = true) {
  const top = sc.top + (topIn(el, sc.doc) - sc.viewTop()) - sc.height() * ratio;
  const t = sc.target;
  const v = Math.max(0, Math.min(top, sc.max()));
  // smooth 가 아니면 페이지 CSS(scroll-behavior: smooth)와 상관없이 즉시
  if (t.scrollTo) t.scrollTo({ top: v, behavior: smooth ? 'smooth' : 'instant' });
  else sc.top = v;
}

/**
 * @param {ReturnType<typeof makeScroller>} A @param {ReturnType<typeof makeScroller>} B
 * @param {() => { left: Side, right: Side, pairL: Int32Array, pairR: Int32Array }} getAnchors
 *   Side = { els: Element[], pages?: Element[], start?: Int32Array }  start[p] = p쪽 첫 기준점 순번 (pages.length+1 개)
 */
export function linkScroll(A, B, getAnchors) {
  if (A.target === B.target) return { destroy() {}, enabled: true, pause() {} };
  const lockUntil = new Map();
  let enabled = true, pausedUntil = 0;
  const now = () => performance.now();

  /** list[lo..hi] 에서 화면 맨 위에 걸친 첫 요소 (이진 탐색) */
  function search(list, top, lo, hi) {
    let ans = -1;
    while (lo <= hi) {
      const m = (lo + hi) >> 1;
      const r = list[m].getBoundingClientRect();
      if (r.bottom > top) { ans = m; hi = m - 1; } else lo = m + 1;
    }
    return ans;
  }
  /**
   * 쪽 정보가 있으면: 먼저 쪽(상자 크기만 있으면 됨)을 찾고, 그 쪽 안의 기준점만 찾는다.
   * → 화면 밖(아직 안 그려진) 쪽 안쪽을 건드리지 않아 content-visibility 문서에서도 스크롤이 무겁지 않음
   */
  function firstVisible(side, sc) {
    const top = sc.viewTop() + 1;
    const list = side.els;
    if (side.pages && side.pages.length && side.start) {
      const p = search(side.pages, top, 0, side.pages.length - 1);
      if (p >= 0) {
        const a = side.start[p], b = side.start[p + 1] - 1;
        if (b >= a) { const k = search(list, top, a, b); return k >= 0 ? k : Math.min(b + 1, list.length - 1); }
        return Math.min(a, list.length - 1);
      }
    }
    return search(list, top, 0, list.length - 1);
  }

  /**
   * 쪽 문서: 같은 쪽끼리 맞춘다. 쪽 상자 위치만 읽으므로(안쪽 글자 배치는 안 읽음)
   * 화면 밖 쪽을 그리게 만들지 않아 가장 가볍다
   */
  function syncPages(from, to, fromSide, toSide) {
    const top = from.viewTop() + 1;
    const p = search(fromSide.pages, top, 0, fromSide.pages.length - 1);
    if (p < 0) return proportional(from, to);
    const q = fromSide.pagePair[p];
    const a = fromSide.pages[p].getBoundingClientRect();
    const b = toSide.pages[q].getBoundingClientRect();
    const frac = a.height ? (from.viewTop() - a.top) / a.height : 0;
    const want = (b.top + frac * b.height - to.viewTop()) - (a.top + frac * a.height - from.viewTop());
    move(to, to.top + want);
  }

  function sync(from, to, fromSide, toSide, pair) {
    if (fromSide.pagePair && toSide.pages?.length) return syncPages(from, to, fromSide, toSide);
    const fromList = fromSide.els, toList = toSide.els;
    if (!fromList.length) return proportional(from, to);
    let k = firstVisible(fromSide, from);
    if (k < 0) k = fromList.length - 1;
    // 짝이 있는 가장 가까운 덩어리 (위로 먼저, 없으면 아래로)
    let j = k;
    while (j >= 0 && pair[j] < 0 && k - j < 400) j--;
    if (j < 0 || pair[j] < 0) { j = k; while (j < fromList.length && pair[j] < 0 && j - k < 400) j++; }
    if (j >= fromList.length || pair[j] < 0) return proportional(from, to);
    const a = fromList[j], b = toList[pair[j]];
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    if (!ra.height && !rb.height) return proportional(from, to);
    // 덩어리 안에서 얼마나 내려왔는지도 비율로 맞춤
    const into = ra.height ? Math.max(0, Math.min(1, (from.viewTop() - ra.top) / ra.height)) : 0;
    const pointA = ra.top + into * ra.height - from.viewTop();   // 왼쪽 기준점이 화면 위에서 떨어진 거리
    const pointB = rb.top + into * rb.height - to.viewTop();
    const want = pointB - pointA;
    move(to, to.top + want);
  }
  function proportional(from, to) {
    const fm = from.max(), tm = to.max();
    move(to, fm > 0 ? (from.top / fm) * tm : 0);
  }
  function move(sc, v) {
    v = Math.max(0, Math.min(Math.round(v), sc.max()));
    if (Math.abs(v - sc.top) < 1) return;
    lockUntil.set(sc.target, now() + 80);
    // 페이지에 scroll-behavior:smooth 가 있어도 즉시 이동 (미끄러지며 늦게 따라오는 현상 방지)
    const t = sc.target;
    if (t.scrollTo) t.scrollTo({ top: v, behavior: 'instant' }); else sc.top = v;
  }
  function onScroll(from) {
    return () => {
      if (!enabled || now() < pausedUntil) return;
      if ((lockUntil.get(from.target) ?? 0) > now()) return;
      // 스크롤 이벤트는 이미 화면 그리기마다 한 번씩 온다: 바로 맞춰야 반대쪽이 한 박자 늦게 따라오지 않음
      const a = getAnchors();
      if (from === A) sync(A, B, a.left, a.right, a.pairL);
      else sync(B, A, a.right, a.left, a.pairR);
    };
  }
  const ha = onScroll(A), hb = onScroll(B);
  A.target.addEventListener('scroll', ha, { passive: true });
  B.target.addEventListener('scroll', hb, { passive: true });
  return {
    get enabled() { return enabled; },
    set enabled(v) { enabled = !!v; },
    /** 변경 위치로 이동하는 동안은 맞춤을 잠시 끈다 */
    pause(ms = 900) { pausedUntil = now() + ms; },
    destroy() {
      A.target.removeEventListener('scroll', ha);
      B.target.removeEventListener('scroll', hb);
    },
  };
}
