// 홈이 아닌 페이지용: .reveal 요소가 화면 아래 10% 지점에 들어오면 한 번 나타나게 (홈은 useScrollScenes가 처리)
export function useReveal() {
  let io: IntersectionObserver | null = null;
  onMounted(() => {
    const els = [...document.querySelectorAll<HTMLElement>('main .reveal')];
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) { els.forEach((el) => el.classList.add('is-in')); return; }
    io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        io?.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    els.forEach((el) => io!.observe(el));
  });
  onBeforeUnmount(() => io?.disconnect());
}
