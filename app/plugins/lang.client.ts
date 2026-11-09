// 처음 들어왔을 때 언어 주소 맞추기
// - ?lang=ko / ?lang=en 이 있으면 그 언어 주소로 이동 (예전 링크 호환: /?lang=ko → /ko)
// - 없으면, 영어 주소(/ko 가 아닌 주소)로 들어왔을 때만 저장된 선택(sg-lang)을 따른다
//   (/ko 로 직접 들어온 경우는 그 주소를 그대로 존중)
// - 주소 쿼리는 앱이 뜨는 순간 잠깐 비워질 때가 있어서, 시작할 때 한 번 저장해 둔다
export default defineNuxtPlugin({
  name: 'site-lang',
  dependsOn: ['i18n:plugin:ssg-detect'],
  setup(nuxtApp) {
    const initialSearch = useState('initial-search', () => '');
    initialSearch.value = location.search;
    const qs = new URLSearchParams(location.search);
    const isKoPath = /^\/ko(\/|$)/.test(location.pathname);

    let resolve!: () => void;
    const ready = new Promise<void>((r) => { resolve = r; });
    nuxtApp.hook('app:mounted', async () => {
      try {
        const current = (nuxtApp.$i18n as unknown as { locale: Ref<string> }).locale.value;
        const q = qs.get('lang');
        const saved = store.get('sg-lang');
        const target: Lang | null = q ? normLang(q) : !isKoPath && saved ? normLang(saved) : null;
        if (target && target !== current) {
          const router = nuxtApp.$router;
          // 첫 화면의 초기 이동이 끝난 뒤에 옮긴다 (그 전에 옮기면 초기 이동에 취소되어 언어만 바뀌고 주소는 그대로 남음)
          await router.isReady();
          const go = async () => {
            const raw = (nuxtApp.$switchLocalePath as (l: string) => string)(target);
            if (!raw) return true;   // 없는 주소(404 화면): 옮길 다른 언어 페이지가 없으므로 그대로 둔다
            const to = router.resolve(raw);
            const { lang: _drop, ...query } = to.query;
            await router.replace({ path: to.path, query, hash: location.hash });
            return String(router.currentRoute.value.name ?? '').endsWith('___' + target);
          };
          if (!(await go())) {
            await new Promise((r) => setTimeout(r, 50));
            await go();
          }
        }
      } finally {
        resolve();
      }
    });
    return { provide: { langReady: ready } };
  },
});
