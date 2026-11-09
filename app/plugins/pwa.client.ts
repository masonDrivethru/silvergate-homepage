// PWA: 서비스 워커(public/sw.js) 등록, 새 버전 자동 적용, 앱 설치 버튼
export default defineNuxtPlugin((nuxtApp) => {
  const canInstall = useState('pwa-can-install', () => false);
  let deferred: (Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> }) | null = null;

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    // 이 페이지가 이미 (이전 버전의) 서비스 워커 아래에서 열렸는지. 서비스 워커 등록 전에 확인해야 한다
    // - 처음 방문(서비스 워커 없음): false → 새 서비스 워커가 자리를 잡아도 새로고침하지 않는다
    // - 재방문(이전 버전이 있음): true → 새 버전으로 바뀔 때 한 번 새로고침해서 바로 적용
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded) return;
      // 안전장치: 10초 안에 이미 새로고침했으면 다시 하지 않는다 (어떤 경우에도 반복 새로고침 금지)
      try {
        const last = Number(sessionStorage.getItem('sg-sw-reload') || 0);
        if (Date.now() - last < 10000) return;
        sessionStorage.setItem('sg-sw-reload', String(Date.now()));
      } catch { /* 저장 불가 환경: reloaded 플래그만으로 한 번 제한 */ }
      reloaded = true;
      location.reload();
    });

    const register = () => navigator.serviceWorker.register('/sw.js').then((reg) => {
      // 앱을 다시 열거나 화면으로 돌아올 때마다 새 버전이 있는지 확인
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    }).catch(() => {});
    if (document.readyState === 'complete') register(); else addEventListener('load', register, { once: true });
  }

  addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as typeof deferred;
    canInstall.value = true;
  });
  addEventListener('appinstalled', () => {
    const { toast } = useToast();
    toast((nuxtApp.$i18n as { t: (k: string) => string }).t('s.installed'));
  });

  return {
    provide: {
      installApp: async () => {
        if (!deferred) return;
        await deferred.prompt();
        await deferred.userChoice;
        deferred = null;
        canInstall.value = false;
      },
    },
  };
});
