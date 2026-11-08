// 테마: 다크(기본) ↔ 라이트. 처음 적용은 nuxt.config.ts의 head 스크립트가 화면 그리기 전에 한다
export function useTheme() {
  const isLight = useState('theme-light', () => false);

  const apply = (t: 'light' | 'dark') => {
    const root = document.documentElement;
    if (t === 'light') root.dataset.theme = 'light';
    else delete root.dataset.theme;
    isLight.value = t === 'light';
  };

  // head 스크립트가 적용한 상태를 화면 상태로 가져온다
  const syncFromDom = () => { isLight.value = document.documentElement.dataset.theme === 'light'; };

  const toggle = () => {
    const next = isLight.value ? 'dark' : 'light';
    apply(next);
    store.set('sg-theme', next);
  };

  return { isLight, syncFromDom, toggle };
}
