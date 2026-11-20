// <script> 한 줄로 쓰는 묶음 (JSP·일반 HTML용): dist/sg-compare.js → window.SgCompare
// Worker 코드는 글자로 넣어 두고 blob 주소로 띄운다 (파일 하나만 올리면 됨)
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const src = path.join(here, '../src');
const out = path.join(here, '../dist');

const worker = await build({
  entryPoints: [path.join(src, 'worker.js')], bundle: true, format: 'iife', minify: true, write: false, target: 'es2019',
});
const workerCode = worker.outputFiles[0].text;

const blobSpawn = {
  name: 'blob-worker',
  setup(b) {
    b.onResolve({ filter: /\/spawn\.js$/ }, (a) => ({ path: path.join(a.resolveDir, a.path), namespace: 'blob-spawn' }));
    b.onLoad({ filter: /.*/, namespace: 'blob-spawn' }, () => ({
      contents: `const code = ${JSON.stringify(workerCode)};
let url = null;
export function spawnWorker() {
  if (!url) url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
  return new Worker(url);
}`,
      loader: 'js',
    }));
  },
};

for (const [file, minify] of [['sg-compare.js', false], ['sg-compare.min.js', true]]) {
  await build({
    entryPoints: [path.join(src, 'index.js')], bundle: true, format: 'iife', globalName: 'SgCompare',
    outfile: path.join(out, file), minify, target: 'es2019', plugins: [blobSpawn], legalComments: 'none',
    banner: { js: '/*! @silvergate/compare-dom — 화면 비교 (c) SilverGate */' },
  });
}
await build({
  entryPoints: [path.join(src, 'index.js')], bundle: true, format: 'esm',
  outfile: path.join(out, 'sg-compare.esm.js'), target: 'es2020', plugins: [blobSpawn], legalComments: 'none',
});
console.log('built dist/sg-compare.js, sg-compare.min.js, sg-compare.esm.js (worker', (workerCode.length / 1024).toFixed(1), 'KB)');
