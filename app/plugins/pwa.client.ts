// PWA: 서비스 워커(public/sw.js) 등록, 새 버전 자동 적용, 앱 설치 버튼
export default defineNuxtPlugin((nuxtApp) => {
  const canInstall = useState('pwa-can-install', () => false);
  let deferred: (Event & { prompt: () => Promise<void>; userChoice: Promise<unknown> }) | null = null;

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    const register = () => navigator.serviceWorker.register('/sw.js').then((reg) => {
      // 앱을 다시 열거나 화면으로 돌아올 때마다 새 버전이 있는지 확인
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') reg.update().catch(() => {}); });
    }).catch(() => {});
    if (document.readyState === 'complete') register(); else addEventListener('load', register, { once: true });
    // 새 버전이 설치되면 한 번 새로고침해서 바로 적용 (처음 설치 때는 제외)
    const hadController = !!navigator.serviceWorker.controller;
    let reloaded = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloaded) return;
      reloaded = true;
      location.reload();
    });
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
