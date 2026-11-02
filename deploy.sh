#!/usr/bin/env bash
# 한 번에 배포: 커밋 → GitHub push(GitHub Pages 자동 갱신) → 구글 클라우드(Firebase Hosting) 배포
# 사용법: ./deploy.sh "커밋 메시지"   (변경 사항이 없으면 메시지 없이 ./deploy.sh 만 실행해도 됨)
# 전제: 이 PC에서 Firebase 로그인이 되어 있어야 함 (npx firebase-tools login)
set -euo pipefail
cd "$(dirname "$0")"
export PATH="/c/Program Files/nodejs:$PATH"

msg="${1:-}"
if [ -n "$(git status --porcelain)" ]; then
  if [ -z "$msg" ]; then
    echo "변경 사항이 있습니다. 커밋 메시지를 넣어 주세요: ./deploy.sh \"메시지\""
    exit 1
  fi
  git add -A
  git commit -q -m "$msg"
fi

echo "1/2 GitHub에 올리는 중..."
git push -q origin main

echo "2/2 구글 클라우드(Firebase)에 배포하는 중..."
npx -y firebase-tools deploy --only hosting --project silvergate-web --non-interactive 2>&1 | grep -E "Deploy complete|Hosting URL|Error" || true
rm -f firebase-debug.log

echo "완료: https://www.silvergate-solutions.com  /  https://silvergate-web.web.app"
