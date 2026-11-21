// <script> 한 줄로 쓰는 묶음 (JSP·일반 HTML용): dist/sg-compare.js → window.SgCompare
// Worker 코드는 글자로 넣어 두고 blob 주소로 띄운다 (파일 하나만 올리면 됨)
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { copyFileSync, readFileSync } from 'node:fs';

const here = path.dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(path.join(here, '../package.json'), 'utf8'));
const BANNER = `/*! SilverBio Compare SDK v${pkg.version} | (c) SilverGate Co., Ltd. ((주)실버게이트). All rights reserved. | Includes diff-match-patch (Apache-2.0, (c) Google) */`;
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
    banner: { js: BANNER },
  });
}
await build({
  entryPoints: [path.join(src, 'index.js')], bundle: true, format: 'esm', minify: true,
  outfile: path.join(out, 'sg-compare.esm.js'), target: 'es2020', plugins: [blobSpawn], legalComments: 'none',
  banner: { js: BANNER },
});
// 타입 정의도 dist 에 (npm 으로 설치했을 때 타입스크립트 자동 완성)
copyFileSync(path.join(src, 'index.d.ts'), path.join(out, 'sg-compare.d.ts'));
console.log('built dist/sg-compare.js, sg-compare.min.js, sg-compare.esm.js (worker', (workerCode.length / 1024).toFixed(1), 'KB)');
