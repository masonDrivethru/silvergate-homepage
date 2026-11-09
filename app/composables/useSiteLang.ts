// 화면 언어: 영어는 주소 그대로(/...), 한국어는 /ko 아래(/ko/...). 버튼으로 고른 언어는 localStorage(sg-lang)에 저장
// 처음 들어올 때의 ?lang= 과 저장된 선택은 app/plugins/lang.client.ts 에서 해당 언어 주소로 옮겨 준다

// 시작할 때 저장해 둔 주소 쿼리 (?lang=, ?notrack=, ?utm_source=)
export const useInitialQuery = () => new URLSearchParams(useState('initial-search', () => '').value);
export type Lang = 'en' | 'ko';
export const normLang = (v: string | null | undefined): Lang => (v === 'ko' ? 'ko' : 'en');

export function useSiteLang() {
  const { locale } = useI18n();
  const switchLocalePath = useSwitchLocalePath();
  const router = useRouter();

  // 같은 페이지의 다른 언어 주소로 이동 (뒤로 가기 기록을 늘리지 않게 replace, #위치는 유지)
  const switchLang = async (code: string) => {
    const target = normLang(code);
    store.set('sg-lang', target);
    if (target === locale.value) return;
    const raw = switchLocalePath(target);
    if (!raw) {
      // 없는 주소(404 화면) 등 다른 언어 페이지가 정해지지 않은 경우: 주소 앞의 /ko 만 바꿔서 다시 연다
      const p = location.pathname.replace(/^\/ko(?=\/|$)/, '') || '/';
      location.href = (target === 'ko' ? '/ko' + (p === '/' ? '' : p) : p) + location.search + location.hash;
      return;
    }
    const to = router.resolve(raw);
    await router.replace({ path: to.path, query: to.query, hash: location.hash });
  };

  return { locale, switchLang };
}
