# SilverGate 홈페이지 정리

> 지금까지 만든 홈페이지의 정보를 한곳에 모은 문서입니다 (2026-11-20 기준).
> 다른 PC나 Claude 앱에서 이어서 작업할 때 이 파일을 먼저 보세요.

---

## 1. 기본 정보

| 항목 | 내용 |
|---|---|
| 사이트 주소 | https://www.silvergate-solutions.com (영어) / https://www.silvergate-solutions.com/ko (한국어) |
| Firebase 기본 주소 | https://silvergate-web.web.app |
| 작업 폴더 | `C:\project\silvergate` |
| GitHub 저장소 | https://github.com/masonDrivethru/silvergate-homepage |
| Firebase 프로젝트 | `silvergate-web` |
| 공개 범위 | **지금은 홈 + Compare 직접 해 보기(/compare)만 공개** (다른 세부 페이지는 만들어 두었지만 숨김) |

---

## 2. 회사 정보 (사이트에 표시되는 내용)

| 항목 | 내용 |
|---|---|
| 회사명 | 주식회사 실버게이트 (SilverGate Co., Ltd.) |
| 대표이사 | Changkeun Lee |
| 설립 | 2021년 (팀은 2008년부터 기업 시스템 구축) |
| 사업자등록번호 | 721-86-03864 |
| 주소 | 인천광역시 연수구 컨벤시아대로 165, 포스코타워-송도 26층 V584 |
| 전화 | +82 10-9690-0006 |
| 이메일 | masonlee@silvergate-solutions.com |
| 미팅 예약 (Google Meet 30분) | https://calendar.app.google/wLYapJcPyoxVQvN78 |

**주력 분야:** 제약·바이오 제조용 MES·EBR·MBR 솔루션, 보험·금융·공공 기업 시스템

---

## 3. 제품

### SilverBio Author
마스터 배치 기록서(MBR)의 작성 → 검토 → 승인을 한 시스템에서 처리.
- 단계별 기록 (칭량, 시간, 공정 중 검사를 기준값과 함께)
- 검토·승인 (작성자 → 검토자 → 승인자, 단계별 의견)
- 전자서명 (아이디·비밀번호 본인 확인, 서명 의미·서버 시각 기록, 기록과 결합)
- 감사 추적 (수정·의견·서명·승인이 모두 남고, 수정·삭제 불가)

### SilverBio Compare
문서 두 버전을 나란히 놓고 값 변경·추가·삭제를 표시. 배치 기록서, 세척 SOP, 품질 규격 템플릿에 사용.
홈에 직접 눌러 볼 수 있는 샘플 데모가 있음 (템플릿 탭 3개: 완충액 조제 MBR / 설비 세척 SOP / 정제 출하 규격서).
상세 설계는 `compare-demo-spec.md` 참고.

**직접 해 보기 데모 (사양서 1~3단계 완료)** — 전용 페이지 `/compare` (`app/pages/compare.vue` → `SectionCompareDemo`). 홈 Compare 연출의 탭 버튼에서 들어감
- 화면: 실제 문서관리 시스템 비교 화면처럼 흰 A4 두 장을 나란히 (머리말 문서 정보표, 단계 표, 수행자·확인자 칸, 쪽 번호). 변경은 바탕색으로만 표시 (추가 초록, 수정 노랑, 삭제 빨강 취소선, 변경 막대 없음), 지시문은 바뀐 글자만 표시
- 조작: 샘플 선택(짧은 문서 / 대용량 약 300쪽), 버전 고르기·바꾸기, 스텝/파라미터 기준 집계, 변경된 것만 보기, 변경 목록 누르면 그 위치로 이동. 휴대폰은 이전/새 버전 탭
- 엔진: `app/compare/engine.js` 순수 JS (DOM·Vue 모름). `compare(이전, 새버전, { countBy })` → 집계·변경 목록·좌우 정렬 트리. 화면 문구는 만들지 않음 (`field` 값으로 ko/en 문구를 고름)
- 데이터: `types.js` 형식, `sample-data.js`(한국어)·`sample-data-en.js`(영어) 가상 SGB-101 v1.0/v1.1, `sample-large.js` 규칙으로 만드는 대용량 가상 문서 (같은 seed면 같은 문서)
- 화면: `components/compare/` ComparePanel(A4 문서·쪽 나누기), ChangeList, StatsBar. 비교 계산은 하지 않고 엔진 결과만 그림
- 성능: 300쪽(스텝 1,050개·파라미터 3,100개) 비교 약 4~12ms. 대용량 샘플은 고를 때만 만들어서 홈 첫 화면은 그대로 가벼움, 화면 밖 쪽은 그리지 않음(`content-visibility`)
- 콘솔 확인: `node app/compare/check.mjs`. 사용 패키지: `diff-match-patch`

**재사용 모듈 (`packages/`, 브랜치 feat/compare-modules-brxjqe)** — 다른 프로젝트(JSP·Vue·React 어디든)에 가져가는 화면 비교 모듈.
- **샘플 버전 4개** (`app/compare/sample-more.js`): v1.0 · v1.1 · v1.2(수정·순서 바뀜·원자재 추가) · v2.0(원자재 표 머리글 2단·단계별 묶음·공급사 열, 파라미터 표 CPP 열, 구간 신설·단계 삭제/추가). 두 버전은 `app/compare/plan.js` 로 같은 쪽 나누기 → 모듈이 빈 칸을 넣어 좌우 높이가 늘 맞음
- **소스 보안**: `nuxt.config.ts` 에 `sourcemap: false` (운영 사이트에 원본 소스 안 나감). **GitHub 저장소는 반드시 비공개(private)로** — 공개면 소스 전체가 노출됨
- **`/compare` 페이지는 이 모듈로 바뀜**: `app/pages/compare.vue` → `SectionCompareLive` (두 버전을 `CompareMbrSheets` 로 그냥 그리고, 모듈이 그려진 화면끼리 비교). 영어 기본, `/ko/compare` 한국어. 예전 화면(`SectionCompareDemo`, `components/compare/ComparePanel` 등, `app/compare/engine.js`)은 파일만 남겨 둠 — 되돌리려면 compare.vue 한 줄만 바꾸면 됨
- `compare-core`: 어떤 JSON이든 비교하는 엔진 (키 기반 짝 맞춤, 비슷한 것끼리 짝, 해시로 같은 부분 건너뛰기). `node --test` 21개
- `compare-dom`: **브라우저에 그려진 화면 두 개**를 원본 그대로 두고 바뀐 곳만 표시 (CSS Highlight API + 속성 하나). Worker 비교, 나눠 읽기, 쪽 단위 스크롤 맞춤, 한 장 보기, 변경 목록. `dist/sg-compare.min.js` 한 파일이면 JSP 에서 바로 사용. 자세한 것은 `packages/compare-dom/README.md`
- `compare-vue` / `compare-react`: compare-dom 을 감싼 부품 (`<SgCompare>`, 문서 컴포넌트를 그대로 두 번 그림)
- 테스트 페이지: `packages/compare-dom/demo/index.html` (HTML·Vue·React·대용량 탭), 속도 측정 `demo/bench.html`, 어댑터 확인 `demo/adapters.html`
- 측정 (3,000쪽 양쪽, 헤드리스 Chromium): 비교 약 2.5초, 그동안 화면 멈춤 0ms (최적화 CSS 있는 문서) / 70ms (없는 문서), 스크롤 좌우 어긋남 0px

### 단계별 지원 기능 (MBR · EBR · MES)
- **MBR:** 마스터 레시피 작성, 검토·승인 워크플로, 전자서명, 감사 추적
- **EBR:** + 단계별 작업 기록, 예외 기반 검토
- **MES:** + 설비·자재 추적, ERP·LIMS 연동

### 규정 준수
| 규정 | 내용 |
|---|---|
| 21 CFR Part 11 | 감사 추적, 전자서명, 접근 통제 |
| EU GMP Annex 11 | 밸리데이션된 시스템, 백업, 변경 관리 |
| GAMP 5 | URS, FS, IQ/OQ/PQ 산출물 |
| ALCOA+ | 작성자 식별, 시각 기록, 위·변조 방지 |

### 프로젝트 진행 4단계
1. 진단 — URS, 갭 분석
2. 설계 — FS, 위험 평가
3. 구축·밸리데이션 — IQ, OQ, PQ
4. 오픈 — 교육, SOP, 안정화 지원

---


### 자동 배포 (GitHub Actions)
- `.github/workflows/deploy.yml`: **main 에 올라오면** 설치 → compare-core 시험 → `nuxt generate` → Firebase Hosting(silvergate-web) 운영 배포. Actions 탭 → "Deploy to Firebase" → Run workflow 로 직접 실행도 가능
- 필요: 저장소 Settings → Secrets and variables → Actions → `FIREBASE_SERVICE_ACCOUNT` (서비스 계정 키 JSON 전체). 서비스 계정 역할: Firebase Hosting 관리자 + API 키 뷰어
- `./deploy.sh` 는 그대로 써도 됨 (PC 에서 직접 배포)

## 4. 산업 · 실적 · 고객사

### 산업
| 분야 | 내용 |
|---|---|
| 제약·바이오 | MES, MBR·EBR 작성, 바이오 공정 시스템 |
| 보험 | 신계약, 상품, GA 영업지원, 콜센터, 디지털 채널 |
| 은행·증권 | 방카슈랑스, 퇴직연금, 채널 홈페이지 |
| 공공 | 차세대 시스템 구축, EDI 연계, 시설관리 |

### 수행 실적 (진행 중)
| 고객사 | 내용 | 시작 | 파트너 |
|---|---|---|---|
| 삼성바이오로직스 | MES 바이오 (분석, 설계, 개발) | 2025년 2월 | 히든워크 · 쌍무지개 (Double Rainbow) |
| 인천국제공항공사 | IFMS 통합시설관리시스템 (공공 · 공항 시설) | — | 히든워크 · 노즈소프트 (Nozsoft) |

### 고객사 (홈페이지 링크 연결)
삼성바이오로직스, 인천국제공항공사, 국민연금공단, 한화손해보험, KB라이프생명, 라이나생명

### 협력사
히든워크, 쌍무지개 (영문 Double Rainbow), 노즈소프트 (Nozsoft)

---

## 5. 홈 화면 구성 (위에서 아래 순서)

`app/pages/index.vue` 에서 아래 섹션을 차례로 조립합니다. 섹션 파일은 `app/components/section/`.

1. **Intro** — 로고 등장 효과, 스크롤 안내
2. **Product** — "기록부터 승인까지." SilverBio Author 샘플 화면 (작성·검토·승인, 감사 추적, 전자서명)
3. **Compare** — 버전 비교 인터랙티브 데모 (스크롤 연출)
   - 연출 아래 **"직접 비교해 보기 →"** 탭 버튼 → 전용 페이지 `/compare` (한국어 `/ko/compare`)
4. **Capability** — "세 단계, 하나의 플랫폼." MBR·EBR·MES 기능 표
5. **Strengths** — "2008년부터 기업 시스템을 만들어 왔습니다…" (단어별 빛나는 스크롤 연출)
6. **Industries** — 4개 산업
7. **Faq** — 자주 받는 질문 6개
8. **References** — 수행 실적, 고객사, 협력사
9. **Company** — 회사 소개
10. **Closing** — "다음 시스템, 함께 만듭니다." + 문의 버튼
11. **Contact** — 도입 상담 (전화·이메일·미팅 예약 버튼·문의 폼)

**기타 화면 기능**
- 한국어 / 영어 전환 (영어가 기본)
- 다크 모드(기본) / 라이트 모드 전환 (`?theme=light` 로도 가능)
- 스크롤에 맞춘 애니메이션 (홈만. 세부 페이지는 애니메이션 없이 차분하게)
- PWA: 휴대폰 홈 화면에 앱처럼 설치 가능, 오프라인 지원
- 404 페이지 (`app/error.vue`)

### 숨겨 둔 세부 페이지 (만들어 둠)
`/products`, `/products/silverbio-author`, `/industries`, `/references`, `/company`, `/contact`
+ 애플식 펼침 메뉴, 휴대폰 전체 메뉴, 아래 탭바.
지금은 이 주소로 들어오면 홈으로 이동시킵니다.

**다시 열 때 바꿀 곳 (4군데)**
1. `app/composables/useSiteNav.ts` → `HOME_ONLY = false` (`/compare` 는 이미 공개 중)
2. `nuxt.config.ts` → `PAGES` 를 주석에 있는 전체 목록으로
3. `firebase.json` → `redirects` 삭제
4. `public/sitemap.xml` → 세부 페이지 주소 추가

---

## 6. 기술 구성

| 영역 | 기술 |
|---|---|
| 프레임워크 | Nuxt 4 (Vue 3, `<script setup>`) + TypeScript |
| 빌드 방식 | `nuxt generate` → 정적 HTML (`.output/public`) |
| 한/영 | @nuxtjs/i18n. 영어는 `/`, 한국어는 `/ko`. 쿠키 사용 안 함 |
| 문구 | `i18n/locales/ko.json`, `en.json` (두 파일 같은 키로 수정) |
| 디자인 | `app/assets/css/style.css` 하나 (실버 글래스 테마, CSS 변수) |
| 글꼴 | Inter (Google Fonts) + Pretendard (jsDelivr) |
| PWA | `public/sw.js` (직접 작성), `public/manifest.webmanifest` |
| 서버 역할 | Google Apps Script (`tools/contact-mailer.gs`) |
| 호스팅 | Firebase Hosting |

### 주요 색상
| 이름 | 값 | 용도 |
|---|---|---|
| `--bg` | `#050506` | 배경 (거의 검정) |
| `--text` | `#ececee` | 기본 글자 |
| `--silver-hi` | `#f5f6f7` | 밝은 실버 |
| `--silver` | `#c9ccd1` | 실버 |
| 라이트 모드 배경 | `#eceef1` | |

### 폴더 구조
```
nuxt.config.ts            머리말(메타·폰트), i18n, Apps Script 주소, 공개 페이지 목록
app/
  pages/                  index.vue(홈) + 숨긴 세부 페이지들
  components/section/     홈 섹션 11개
  components/site/        Header, Footer, Tabbar, Toast, Icons
  components/page/        세부 페이지용 Hero, Cta
  composables/            스크롤 연출, 언어, 테마, 토스트, 방문 기록, 메뉴, SEO
  plugins/                lang.client(처음 언어), pwa.client(서비스 워커·앱 설치)
  assets/css/style.css    디자인
  compare/                Compare 비교 엔진 (순수 JS, Nuxt 자동 불러오기 대상 아님)
i18n/locales/             ko.json, en.json
public/                   아이콘, og 이미지, sw.js, manifest, sitemap.xml
tools/contact-mailer.gs   Apps Script 원본
deploy.sh                 배포 스크립트
compare-demo-spec.md      Compare 데모 사양서
```

---

## 7. 문의 폼 · 방문 기록 (Google Apps Script)

`tools/contact-mailer.gs` 가 원본이고, script.google.com 의 **"SilverGate Contact Mailer"** 프로젝트에 전체를 붙여넣고 → 배포 관리 → 새 버전으로 배포합니다 (URL은 그대로 유지).
새 권한이 필요하면 편집기에서 해당 함수를 직접 한 번 실행해야 승인 창이 뜹니다.

| 기능 | 내용 |
|---|---|
| 문의 폼 | 내용을 masonlee@silvergate-solutions.com 으로 Gmail 전송. 실패하면 메일 앱으로 보내기 안내 |
| 스팸 방어 | 숨은 입력칸(허니팟), 3초 안 제출 차단, 언어 값 검증(ko/en 외 차단), 사이트 전체 시간당 20건, 같은 이메일 10분에 2건, Cloudflare Turnstile(지금은 키 비어 있어 꺼짐) |
| 방문 기록 | 쿠키·IP 없이 구글 시트 "SilverGate 방문 기록"에 저장 (탭: `방문`, `요약`) |
| 본인 제외 | 사이트에 `?notrack=1` 로 한 번 접속 (`?notrack=0` 은 해제) |
| AI 챗봇 | 코드(`action=chat`, Claude API)는 있지만 **현재 사이트 화면에는 연결 안 됨** |

- 방문 기록 시트: https://docs.google.com/spreadsheets/d/199WWnSjBrcFimEL56oD2rdb7i9axhSgnTNHps5kspRE/edit
- 스크립트 속성: `ANTHROPIC_API_KEY`(챗봇), `TURNSTILE_SECRET`, `VISIT_SHEET_ID` — 키 값은 코드나 채팅에 절대 붙여넣지 않기

> 참고: 챗봇 안내문(SYSTEM_PROMPT)의 인천공항 파트너가 아직 "Hiddenwork"만 있어요. 챗봇을 켤 때 노즈소프트도 넣어야 합니다.

---

### Compare 비밀번호 (`/compare` 는 비공개)
- `/compare`, `/ko/compare` 는 비밀번호를 넣어야 열림 (`app/components/compare/Gate.vue`). 홈의 "직접 비교해 보기" 버튼은 그대로 (`COMPARE_PUBLIC = true`, 누르면 비밀번호 화면), 검색엔진 노출 차단(noindex), 사이트맵에서 뺌
- **비밀번호 정하기/바꾸기**: `node scripts/set-compare-password.mjs` → `.env` 에 지문만 저장 (비밀번호 자체는 어디에도 없음, `.env` 는 GitHub 에 안 올라감) → `./deploy.sh`
- **닫기**: `node scripts/set-compare-password.mjs --off` → 배포하면 아무도 못 여는 "비공개" 화면
- 기본 비밀번호 지문은 `nuxt.config.ts` 의 `compareLock` 에 들어 있음 (대표님이 정한 6자리 숫자). `.env` 가 있으면 그 값이 우선. 비우면 "비공개" 화면
- 한계: 정적 사이트라 화면을 가리는 수준의 잠금. 비밀번호를 모르면 화면과 비교 모듈 파일을 받지 않지만, 사이트 파일을 뒤지면 모듈 파일 주소를 찾아낼 수는 있음. 완전히 막으려면 서버 쪽 로그인(Firebase 인증 또는 Cloudflare Access)이 필요

## 8. 개발 · 배포 방법

```bash
npm install
npm run dev          # http://localhost:3000 에서 미리 보기 (수정하면 바로 반영)
npm run build        # 정적 사이트 생성 → .output/public
npm run typecheck    # 타입 검사

./deploy.sh --preview        # 임시 미리보기 주소에만 배포 (7일 뒤 자동 삭제)
./deploy.sh "커밋 메시지"     # 커밋 → GitHub 백업 → 빌드 → 운영 사이트 배포
```

- 배포 전제: 이 PC에서 Firebase 로그인 (`npx firebase-tools login`)
- 되돌리기: Firebase 콘솔 → Hosting → 출시 기록 → 이전 버전 롤백

### 작업할 때 주의할 점
- 문구는 `ko.json`, `en.json` 둘 다 같은 키로 고친다. `{ } @ | $` 문자는 `{'@'}` 처럼 감싼다
- 스크롤 연출 클래스가 붙는 요소(`.reveal`, `.form` 등)에는 `:class` 바인딩을 쓰지 않는다
- `public/` 안 파일(아이콘 등)을 바꾸면 `public/sw.js` 의 `CACHE` 버전을 올린다 (지금 `sg-v46`)
- `firebase.json` 은 모든 주소를 `no-cache` 로 보낸다 (`/`, `/ko` 같은 확장자 없는 주소가 1시간 캐시돼 휴대폰에 옛 화면이 보이던 문제 수정). `_nuxt/`·이미지는 따로 오래 캐시
- Compare 데모 샘플에는 실제 고객사 제품명·파라미터를 쓰지 않는다 (전부 가상 데이터)

---

## 9. 지금까지 작업 기록 (오래된 순)

1. 홈페이지 초기 구성 (반응형 웹 + PWA)
2. 명함 CI에 맞춘 디자인 → 실버 글래스 테마로 전면 개편
3. Firebase Hosting 배포 설정, 한 번에 배포하는 스크립트, 대표 주소 www.silvergate-solutions.com
4. 제품·비교 샘플 확장, 섹션 애니메이션, 고객사 링크, 라이트/다크 모드
5. 숫자 벤토·마무리 장면, KB라이프생명 이름 변경 → 이후 숫자 카드 제거, 빛·깊이 효과
6. 문의 폼을 Gmail(Apps Script)로 연결
7. PWA 새 버전 바로 적용, 홈 버튼 누르면 맨 위로
8. 인터랙티브 데모 (템플릿 탭·슬라이드 점·변경점 클릭), 미팅 예약 버튼, FAQ
9. 문의 폼 스팸 방어 (허니팟, 3초 체크, Turnstile, 반복 제출 제한, 언어 검증)
10. 방문 기록 (쿠키·IP 없이 구글 시트, `?notrack=1`)
11. 순수 HTML/JS → **Nuxt 4 (Vue 3 + TypeScript)로 전환** (화면·동작은 그대로)
12. 제품 상세 페이지 (`/products/silverbio-author`), 공통 레이아웃
13. sitemap.xml, 서비스 워커 새로고침 문제 수정
14. 한국어 주소 `/ko` 분리, 페이지별 메타·OG 이미지, 404 페이지
15. 삼성바이오로직스 실적에 파트너(히든워크, 쌍무지개) 추가
16. 애플식 사이트 메뉴, 제품·산업·실적·회사·문의 페이지
17. 세부 페이지는 애니메이션 없이 차분하게
18. **홈 한 페이지만 공개** (메뉴·탭·세부 페이지 숨김), 쌍무지개 영문 표기 Double Rainbow
19. 인천공항 프로젝트 파트너에 노즈소프트(Nozsoft) 추가
20. **SilverBio Compare 직접 해 보기**: 비교 엔진 + A4 문서 비교 화면, 대용량(약 300쪽) 샘플, 전용 페이지 `/compare` + 홈 탭 버튼. 페이지 캐시 문제 수정

---

## 10. 남은 일 · 확인할 것

- [ ] 세부 페이지 공개 여부 결정 (위 5장 "다시 열 때 바꿀 곳" 참고)
- [ ] Cloudflare Turnstile 켜기 (사이트 키를 `nuxt.config.ts`, 비밀 키를 Apps Script 속성에)
- [ ] AI 챗봇을 화면에 붙일지 결정 (붙이면 안내문에 노즈소프트 반영)
- [x] SilverBio Compare 직접 해 보기 데모: `/compare` 페이지로 운영 공개 (2026-11-20)
- [ ] git에 안 올린 파일 정리: `app/보고서(전기).sql`, `app/화면.jsp` (홈페이지와 관계없어 보임)
