// 번들러(Vite·webpack 등)가 worker.js 를 따로 묶어 준다. <script> 한 줄용 dist 빌드에서는 이 파일이 blob 버전으로 바뀐다.
export function spawnWorker() {
  return new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
}
