// 테스트 페이지 만들기
//  demo/index.html      : 저장소에서 바로 여는 페이지 (dist/sg-compare.js, docs.js 를 파일로 불러옴)
//  <out>/compare-test.html : 파일 하나짜리 (스크립트를 안에 넣음) — 공유용
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const page = readFileSync(path.join(here, 'page.html'), 'utf8');
const CDN = [
  'https://cdnjs.cloudflare.com/ajax/libs/vue/3.5.13/vue.global.prod.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.3.1/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.3.1/umd/react-dom.production.min.js',
].map((u) => `<script src="${u}"></script>`).join('\n');

const local = `<!doctype html>\n<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n<style>body{margin:0}[hidden]{display:none!important}</style>\n` +
  page.replace('<!--SCRIPTS-->', `${CDN}\n<script src="../dist/sg-compare.js"></script>\n<script src="docs.js"></script>`).replace(/^(<title>[\s\S]*?<\/style>)/, '$1\n</head><body>') + '\n</body></html>\n';
writeFileSync(path.join(here, 'index.html'), local);

const out = process.argv[2];
if (out) {
  const lib = readFileSync(path.join(here, '../dist/sg-compare.min.js'), 'utf8');
  const docs = readFileSync(path.join(here, 'docs.js'), 'utf8');
  const safe = (s) => s.replace(/<\/script/gi, '<\\/script');
  const single = page.replace('<!--SCRIPTS-->', `${CDN}\n<script>${safe(lib)}</script>\n<script>${safe(docs)}</script>`);
  writeFileSync(out, single);
  console.log('wrote', out, (single.length / 1024).toFixed(0) + 'KB');
}
console.log('wrote demo/index.html');
