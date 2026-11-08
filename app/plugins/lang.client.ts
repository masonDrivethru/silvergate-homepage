// 처음 화면 언어 적용 (?lang= → 저장된 선택 → 영어)
// - 주소의 쿼리(?lang=, ?notrack=, ?utm_source=)는 앱이 뜨는 순간 잠깐 비워질 때가 있어서, 시작할 때 한 번 저장해 둔다
// - 화면이 서버에서 만든 HTML(영어)과 맞춰진 뒤(app:mounted)에 바꿔야 화면이 깨지지 않는다
export default defineNuxtPlugin({
  name: 'site-lang',
  dependsOn: ['i18n:plugin:route-locale-detect'],
  setup(nuxtApp) {
    const initialSearch = useState('initial-search', () => '');
    initialSearch.value = location.search;
    const lang = initialLang(new URLSearchParams(initialSearch.value));

    let resolve!: () => void;
    const ready = new Promise<void>((r) => { resolve = r; });
    nuxtApp.hook('app:mounted', async () => {
      try {
        await applyLang(nuxtApp.$i18n as unknown as Parameters<typeof applyLang>[0], lang);
      } finally {
        resolve();
      }
    });
    return { provide: { langReady: ready } };
  },
});
