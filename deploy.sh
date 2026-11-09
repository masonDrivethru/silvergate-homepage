#!/usr/bin/env bash
# 배포 스크립트 (Nuxt 빌드 → Firebase Hosting)
#
#   ./deploy.sh "커밋 메시지"   커밋 → GitHub push(코드 백업) → 빌드 → 운영 사이트 배포
#   ./deploy.sh                 (변경 사항이 없을 때) 빌드 → 운영 사이트 배포
#   ./deploy.sh --preview       빌드 → 임시 미리보기 주소에만 배포 (운영 사이트는 그대로, 7일 뒤 자동 삭제)
#
# 전제: 이 PC에서 Firebase 로그인이 되어 있어야 함 (npx firebase-tools login)
# 되돌리기: Firebase 콘솔 → Hosting → 출시 기록에서 이전 버전 "롤백"
set -euo pipefail
cd "$(dirname "$0")"
export PATH="/c/Program Files/nodejs:$PATH"
FIREBASE="npx -y firebase-tools"
PROJECT="silvergate-web"

build() {
  echo "빌드 중 (nuxt generate)..."
  [ -d node_modules ] || npm ci
  npm run build > /dev/null
  [ -f .output/public/index.html ] || { echo "빌드 실패: .output/public/index.html 없음"; exit 1; }
}

if [ "${1:-}" = "--preview" ]; then
  build
  echo "미리보기 채널에 배포하는 중..."
  $FIREBASE hosting:channel:deploy preview --expires 7d --project "$PROJECT" --non-interactive 2>&1 | grep -aE "Channel URL|expires|Error" || true
  rm -f firebase-debug.log
  exit 0
fi

msg="${1:-}"
if [ -n "$(git status --porcelain)" ]; then
  if [ -z "$msg" ]; then
    echo "변경 사항이 있습니다. 커밋 메시지를 넣어 주세요: ./deploy.sh \"메시지\""
    exit 1
  fi
  git add -A
  git commit -q -m "$msg"
fi

echo "1/3 GitHub에 올리는 중 (코드 백업)..."
git push -q origin "$(git branch --show-current)"

echo "2/3 빌드..."
build

echo "3/3 구글 클라우드(Firebase)에 배포하는 중..."
$FIREBASE deploy --only hosting --project "$PROJECT" --non-interactive 2>&1 | grep -aE "Deploy complete|Hosting URL|Error" || true
rm -f firebase-debug.log

echo "완료: https://www.silvergate-solutions.com  /  https://silvergate-web.web.app"
