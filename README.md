# SilverGate 홈페이지

실버게이트(SilverGate) 회사 홈페이지. **Nuxt 4 (Vue 3) + TypeScript**로 만들고, 빌드 때 정적 HTML로 미리 만들어 **Firebase Hosting**에 올립니다. 반응형 웹 + PWA라서 모바일에서는 홈 화면에 설치해 앱처럼 쓸 수 있습니다.

## 기술 구성
| 영역 | 기술 |
|---|---|
| 프레임워크 | Nuxt 4, Vue 3 (`<script setup>`, Composition API), TypeScript |
| 한/영 전환 | @nuxtjs/i18n (vue-i18n). 주소는 그대로(`/`), 우선순위 `?lang=` → 저장된 선택 → 영어 |
| 디자인 | `app/assets/css/style.css` 하나 (CSS 변수로 색상·글꼴·여백 관리) |
| PWA | `public/sw.js` (직접 작성한 서비스 워커), `public/manifest.webmanifest` |
| 서버 | Google Apps Script `tools/contact-mailer.gs` (문의 메일·스팸 차단, 챗봇, 방문 기록) |
| 호스팅 | Firebase Hosting (`.output/public`), 도메인 www.silvergate-solutions.com |

## 구조
```
nuxt.config.ts                 # 머리말(메타·폰트), i18n, Apps Script 주소
app/
  pages/index.vue              # 홈 (섹션 조립, 언어·연출·방문 기록 시작)
  components/site/             # Header, Footer, Tabbar, Toast, Icons(SVG 아이콘)
  components/section/          # Intro, Product, Compare, Capability, Strengths, Industries, Faq, References, Company, Closing, Contact
  composables/                 # useScrollScenes(스크롤 연출), useSiteLang, useTheme, useToast, useVisitTracking
  plugins/                     # lang.client(처음 언어), pwa.client(서비스 워커·앱 설치)
  assets/css/style.css         # 디자인 토큰 + 스타일
i18n/locales/en.json, ko.json  # 문구 (영어·한국어)
public/                        # 그대로 복사되는 파일 (아이콘, og-image, sw.js, manifest)
tools/contact-mailer.gs        # Apps Script (script.google.com에 붙여넣어 배포)
```

## 개발
```bash
npm install
npm run dev        # http://localhost:3000 (수정하면 바로 반영)
npm run build      # 정적 사이트 생성 → .output/public
npm run typecheck  # 타입 검사
```
- 문구 수정: `i18n/locales/en.json`, `ko.json` (둘 다 같은 키로). `{ } @ | $` 문자는 `{'@'}`처럼 감싸야 함
- 스크롤 연출 클래스가 붙는 요소(`.reveal`, `.form` 등)에는 `:class` 바인딩을 쓰지 않는다 (연출이 직접 붙인 클래스가 지워짐)
- `public/` 파일(아이콘 등)을 바꾸면 `public/sw.js`의 `CACHE` 버전을 올린다

## 배포
```bash
./deploy.sh --preview        # 임시 미리보기 주소에만 배포 (7일 뒤 자동 삭제)
./deploy.sh "커밋 메시지"     # 커밋 → GitHub 백업 → 빌드 → 운영 배포
```
되돌리기: Firebase 콘솔 → Hosting → 출시 기록 → 이전 버전 롤백

## 방문 기록
- 구글 시트 "SilverGate 방문 기록" (Apps Script 소유 계정 드라이브, 비공개). 쿠키·IP 없이 기록
- 본인 기기 제외: 사이트에 `?notrack=1`로 한 번 접속 (`?notrack=0` 해제)
