// 납품 묶음 만들기: node product/scripts/release.mjs
//  1) 본체 빌드 + 테스트  2) 패키지별 납품용 사본(압축·소스맵 없음)  3) npm pack  4) 문서·예제와 함께 zip
import { execSync } from 'node:child_process';
import { cpSync, mkdirSync, rmSync, readFileSync, writeFileSync, copyFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const prod = path.join(root, 'product');
const pk = (n) => path.join(root, 'packages', n);
const domPkg = JSON.parse(readFileSync(path.join(pk('compare-dom'), 'package.json'), 'utf8'));
const V = domPkg.version;
const name = `silverbio-compare-${V}`;
const out = path.join(root, 'release', name);
const stage = path.join(root, 'release', '.stage');
const sh = (c, cwd = root) => execSync(c, { cwd, stdio: 'inherit' });
const BANNER = `/*! SilverBio Compare SDK v${V} | (c) SilverGate Co., Ltd. ((주)실버게이트). All rights reserved. */`;

console.log(`▶ SilverBio Compare ${V}`);
sh('npm run build -w @silvergate/compare-dom');
sh('npm test -w @silvergate/compare-core');

rmSync(path.join(root, 'release', name), { recursive: true, force: true });
rmSync(stage, { recursive: true, force: true });
mkdirSync(path.join(out, 'packages'), { recursive: true });

const common = (dir) => {
  copyFileSync(path.join(prod, 'LICENSE'), path.join(dir, 'LICENSE'));
  copyFileSync(path.join(prod, 'THIRD_PARTY_NOTICES.md'), path.join(dir, 'THIRD_PARTY_NOTICES.md'));
};
const manifest = (src, over) => {
  const p = JSON.parse(readFileSync(path.join(src, 'package.json'), 'utf8'));
  delete p.private; delete p.scripts; delete p.devDependencies;
  return { ...p, ...over, license: 'SEE LICENSE IN LICENSE', author: 'SilverGate Co., Ltd.' };
};
const DIST_FILES = ['sg-compare.esm.js', 'sg-compare.min.js', 'sg-compare.d.ts'];   // 압축본만 (풀어 쓴 sg-compare.js 는 내부용)

// compare-dom: 의존성 0, 압축된 dist 만
{
  const d = path.join(stage, 'compare-dom');
  mkdirSync(path.join(d, 'dist'), { recursive: true });
  for (const f of DIST_FILES) copyFileSync(path.join(pk('compare-dom'), 'dist', f), path.join(d, 'dist', f));
  copyFileSync(path.join(prod, 'README.md'), path.join(d, 'README.md'));
  common(d);
  writeFileSync(path.join(d, 'package.json'), JSON.stringify(manifest(pk('compare-dom'), {
    files: ['dist', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md'],
  }), null, 2));
}
// vue · react 어댑터: 압축해서 dist/index.js
for (const [n, ext] of [['compare-vue', ['vue']], ['compare-react', ['react']]]) {
  const d = path.join(stage, n);
  mkdirSync(path.join(d, 'dist'), { recursive: true });
  await build({
    entryPoints: [path.join(pk(n), 'src/index.js')], bundle: true, format: 'esm', minify: true, target: 'es2019',
    external: [...ext, '@silvergate/compare-dom'], banner: { js: BANNER }, outfile: path.join(d, 'dist/index.js'), legalComments: 'none',
  });
  writeFileSync(path.join(d, 'dist/index.d.ts'), n === 'compare-vue'
    ? `export * from '@silvergate/compare-dom';\nimport type { DefineComponent } from 'vue';\nexport declare const SgCompare: DefineComponent<any, any, any>;\nexport declare function useCompare(left: any, right: any, options?: Record<string, unknown>): any;\n`
    : `export * from '@silvergate/compare-dom';\nimport type { ForwardRefExoticComponent, RefAttributes } from 'react';\nexport declare const SgCompare: ForwardRefExoticComponent<Record<string, any> & RefAttributes<any>>;\nexport declare function useCompare(left: any, right: any, options?: Record<string, unknown>): any;\n`);
  writeFileSync(path.join(d, 'README.md'), `# @silvergate/${n}\n\nSilverBio Compare SDK ${V} 의 ${ext[0] === 'vue' ? 'Vue 3' : 'React'} 어댑터. 사용법은 납품 폴더의 docs/02-API.md, examples/ 참고.\n`);
  common(d);
  writeFileSync(path.join(d, 'package.json'), JSON.stringify(manifest(pk(n), {
    main: './dist/index.js', module: './dist/index.js', types: './dist/index.d.ts',
    exports: { '.': { types: './dist/index.d.ts', import: './dist/index.js', default: './dist/index.js' } },
    files: ['dist', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md'],
  }), null, 2));
}
for (const n of ['compare-dom', 'compare-vue', 'compare-react']) sh(`npm pack --pack-destination "${path.join(out, 'packages')}"`, path.join(stage, n));

// 문서·예제·script 태그용 파일
mkdirSync(path.join(out, 'dist'), { recursive: true });
for (const f of DIST_FILES) copyFileSync(path.join(pk('compare-dom'), 'dist', f), path.join(out, 'dist', f));
for (const x of ['README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'CHANGELOG.md']) copyFileSync(path.join(prod, x), path.join(out, x));
cpSync(path.join(prod, 'docs'), path.join(out, 'docs'), { recursive: true });
cpSync(path.join(prod, 'examples'), path.join(out, 'examples'), { recursive: true });
// 바로 쓰는 비교 화면: 파일 하나 (모듈을 안에 넣음). 더블클릭으로 열고 HTML 두 개를 붙여 넣으면 비교
{
  const app = readFileSync(path.join(prod, 'app/index.html'), 'utf8');
  const js = readFileSync(path.join(pk('compare-dom'), 'dist/sg-compare.min.js'), 'utf8').replace(/<\/script/gi, '<\\/script');
  const [a, b] = app.split('<!--SGC-->');
  if (b === undefined) throw new Error('product/app/index.html 에 <!--SGC--> 자리가 없습니다');
  writeFileSync(path.join(out, 'SilverBio-Compare.html'), `${a}<script>${js}</script>${b}`);
}
// 검증 보고서 (브라우저 자동 테스트 결과). playwright 가 없으면 건너뜀
try {
  execSync(`node "${path.join(here, 'validation-report.mjs')}" "${path.join(out, '검증보고서.html')}"`, { cwd: root, stdio: 'inherit' });
} catch (e) {
  if (e.status === 2) console.warn('⚠ playwright 가 없어 검증 보고서를 건너뜁니다 (npm i -D playwright)');
  else throw new Error('브라우저 자동 테스트 실패 — 납품 묶음을 만들지 않습니다');
}
rmSync(stage, { recursive: true, force: true });

// 소스맵·풀어 쓴 소스가 섞이지 않았는지 확인
const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const bad = walk(out).filter((f) => /\.map$|sg-compare\.js$/.test(f));
if (bad.length) throw new Error('납품에 들어가면 안 되는 파일: ' + bad.join(', '));

// zip
sh(`python3 -c "import shutil; shutil.make_archive('${name}', 'zip', '.', '${name}')"`, path.join(root, 'release'));
console.log(`\n✔ release/${name}.zip`);
console.log(walk(out).map((f) => '  ' + path.relative(out, f)).join('\n'));
