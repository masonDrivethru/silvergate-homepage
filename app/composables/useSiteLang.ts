// 화면 언어: 영어 기본, 한국어 전환. 주소는 그대로(/)이고 선택은 localStorage(sg-lang)에 저장
// 처음 적용은 app/plugins/lang.client.ts 에서 (i18n 모듈이 초기 언어를 정한 뒤에 해야 덮어쓰이지 않음)
// 시작할 때 저장해 둔 주소 쿼리 (?lang=, ?notrack=, ?utm_source=)
export const useInitialQuery = () => new URLSearchParams(useState('initial-search', () => '').value);
export type Lang = 'en' | 'ko';
export const normLang = (v: string | null | undefined): Lang => (v === 'ko' ? 'ko' : 'en');

type Composer = {
  locale: Ref<string>;
  setLocale: (code: Lang) => Promise<void>;
  loadLocaleMessages: (code: Lang) => Promise<void>;
};

// 번역 파일을 먼저 받은 뒤 언어를 바꾼다
export async function applyLang(i18n: Composer, code: Lang) {
  await i18n.loadLocaleMessages(code);
  await i18n.setLocale(code);
}

// 우선순위: 주소의 ?lang= → 저장된 선택 → 영어
export const initialLang = (qs: URLSearchParams): Lang => normLang(qs.get('lang') || store.get('sg-lang') || 'en');

export function useSiteLang() {
  const i18n = useNuxtApp().$i18n as unknown as Composer;
  const switchLang = async (code: string) => {
    await applyLang(i18n, normLang(code));
    store.set('sg-lang', i18n.locale.value);
  };
  return { locale: i18n.locale, switchLang };
}
