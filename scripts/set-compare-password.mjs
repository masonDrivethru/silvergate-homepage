// /compare(직접 비교해 보기) 비밀번호 정하기:  node scripts/set-compare-password.mjs
// 비밀번호 자체는 어디에도 저장하지 않는다. 느리게 계산한 지문(PBKDF2-SHA256, 30만 번)만 .env 에 적는다.
// .env 는 GitHub 에 올라가지 않는다(.gitignore). 빌드(./deploy.sh) 때 이 값이 사이트에 들어간다.
import { createInterface } from 'node:readline';
import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const ITER = 300000;
const ask = (q) => new Promise((res) => {
  const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
  // 입력한 글자가 화면에 보이지 않게
  rl._writeToOutput = (s) => { if (s.includes(q)) rl.output.write(s); else rl.output.write(s.replace(/[^\r\n]/g, '*')); };
  rl.question(q, (a) => { rl.close(); process.stdout.write('\n'); res(a); });
});

const off = process.argv.includes('--off');
let line;
if (off) {
  line = 'NUXT_PUBLIC_COMPARE_LOCK=';
  console.log('비밀번호를 지웁니다 → /compare 는 아무도 열 수 없는 "비공개" 화면이 됩니다.');
} else {
  const a = await ask('새 비밀번호 (6자 이상, 10자 이상 권장): ');
  const b = await ask('한 번 더: ');
  if (!a || a !== b) { console.error('두 번 입력한 비밀번호가 다릅니다.'); process.exit(1); }
  if (a.length < 6) { console.error('6자 이상으로 정해 주세요.'); process.exit(1); }
  if (a.length < 10 || /^\d+$/.test(a)) console.log('주의: 짧거나 숫자만인 비밀번호는 사이트 파일을 가져가 대입해 보면 풀릴 수 있습니다 (화면을 가리는 용도로만).');
  const salt = randomBytes(16);
  const hash = pbkdf2Sync(a.normalize('NFC'), salt, ITER, 32, 'sha256');
  line = `NUXT_PUBLIC_COMPARE_LOCK=v1:${ITER}:${salt.toString('base64')}:${hash.toString('base64')}`;
}
const env = existsSync('.env') ? readFileSync('.env', 'utf8').split(/\r?\n/).filter((l) => l && !l.startsWith('NUXT_PUBLIC_COMPARE_LOCK=')) : [];
env.push(line);
writeFileSync('.env', env.join('\n') + '\n');
console.log('.env 에 저장했습니다. 이제 ./deploy.sh 로 배포하면 적용됩니다.');
