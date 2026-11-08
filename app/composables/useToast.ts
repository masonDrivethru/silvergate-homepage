// 화면 아래 알림 (3.2초 뒤 사라짐)
let timer: ReturnType<typeof setTimeout> | undefined;

export function useToast() {
  const state = useState('toast', () => ({ msg: '', show: false }));
  const toast = (msg: string) => {
    state.value = { msg, show: true };
    clearTimeout(timer);
    timer = setTimeout(() => { state.value = { ...state.value, show: false }; }, 3200);
  };
  return { state, toast };
}
