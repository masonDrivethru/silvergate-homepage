# SilverBio Compare SDK 1.0.0

브라우저에 그려지는 **모든 문서 화면**(JSP·서버 화면, Vue 3, React, Angular, 일반 HTML)을
이전/새 버전 좌우로 놓고 **원본 그대로** 바뀐 곳만 표시하는 화면 비교 모듈입니다.

- 추가 = 초록 · 수정 = 파랑 · 삭제 = 빨강 (Git 과 같은 색)
- 한쪽에만 있는 내용은 반대쪽에 같은 높이의 빈 칸 → 좌우 높이가 늘 맞음
- 두 문서가 한 스크롤 영역에서 함께 움직임, 변경 목록 클릭 한 번에 정확히 이동 (부드러운 스크롤 + 깜빡임)
- 표 병합(rowspan/colspan)·열 추가·구조 변경·행 이동 처리
- 수천 쪽도 가볍게: 비교 계산은 Web Worker, 높이 맞춤은 보이는 쪽만
- 외부 접속·추가 설치 없음 (파일 하나, 의존성 0) → 폐쇄망 반입 가능

## 가장 빨리 써 보기 (설치 없음)

`SilverBio-Compare.html` 을 더블클릭해 브라우저(Chrome·Edge)로 엽니다.
1. 왼쪽 칸에 이전 버전, 오른쪽 칸에 새 버전을 붙여 넣습니다 (Ctrl+V). 화면에서 복사한 내용도, HTML 코드도 됩니다.
2. 원래 사이트 주소를 적으면 그 사이트의 CSS·그림까지 원래 모양 그대로 보입니다.
3. **비교하기** → 바뀐 곳에 색, 변경 목록을 누르면 그 위치로 이동. **보고서 저장**으로 변경 보고서(인쇄·PDF 가능)를 남깁니다.

## 들어 있는 것

| 경로 | 내용 |
|---|---|
| `SilverBio-Compare.html` | 설치 없이 바로 쓰는 비교 화면 (HTML 두 개를 붙여 넣으면 비교, 보고서 저장) |
| `검증보고서.html` | 브라우저 자동 테스트 결과 (시험 항목·기대 결과·실제 값·판정). 고객사 검증 자료 |
| `dist/sg-compare.min.js` | `<script>` 로 바로 쓰는 파일 (전역 `SgCompare`) |
| `dist/sg-compare.esm.js` | 번들러(Vite·Webpack·Angular CLI)용 ES 모듈 |
| `dist/sg-compare.d.ts` | TypeScript 타입 |
| `packages/*.tgz` | npm 패키지 (오프라인 설치용): compare-dom(본체) · compare-vue · compare-react |
| `examples/` | plain-html(기본 · 주소 두 개 · JSON 으로 표를 그리는 컴포넌트) · jsp · vue3 · react · angular 연동 예제 |
| `docs/` | 설치·연동, API, 보안(CSP), 문서 작성 요령, 제약 사항 |
| `LICENSE` · `THIRD_PARTY_NOTICES.md` · `CHANGELOG.md` | 라이선스·고지·변경 이력 |

## 3분 시작

**A. script 태그 (JSP·일반 HTML)**

```html
<script src="/static/sg-compare/sg-compare.min.js"></script>
<div id="viewer"></div>
<script>
  SgCompare.mountViewer(document.getElementById('viewer'), {
    left:  { url: '/doc/view?ver=1.0', label: 'v1.0' },
    right: { url: '/doc/view?ver=1.1', label: 'v1.1' },
    page: '.page', locale: 'ko'
  });
</script>
```

**B. npm (오프라인 설치)**

```bash
npm install ./packages/silvergate-compare-dom-1.0.0.tgz
# Vue 3 면 + ./packages/silvergate-compare-vue-1.0.0.tgz
# React 면 + ./packages/silvergate-compare-react-1.0.0.tgz
```

```js
import { createCompare } from '@silvergate/compare-dom';
const ctrl = createCompare({ left: leftEl, right: rightEl, leftScroller: desk, rightScroller: desk, watch: true });
```

자세한 내용은 `docs/01-설치와-연동.md` 부터 보세요. 예제는 `examples/plain-html/index.html` 을 브라우저로 바로 열면 됩니다
(`viewer.html` 은 iframe 주소를 쓰므로 `npx serve .` 같은 로컬 서버로 여세요).

## 지원 브라우저

Chrome·Edge 105+, Safari 17.2+, Firefox 140+ (글자 단위 색 표시에 CSS Custom Highlight API 사용).
그보다 오래된 브라우저에서도 비교·덩어리 표시·빈 칸·이동은 동작하고, 글자 단위 색만 빠집니다.

© SilverGate Co., Ltd. ((주)실버게이트). All rights reserved.
