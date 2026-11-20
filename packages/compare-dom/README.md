# @silvergate/compare-dom

브라우저에 **이미 그려진 화면 두 개**(이전 버전 / 새 버전)를 비교해서, 원본 화면은 그대로 둔 채 바뀐 곳에만 색을 입힙니다.
화면을 누가 그렸는지는 상관없습니다: **JSP · ASP · PHP · 일반 HTML · Vue · React · Angular · 웹 컴포넌트** 모두 같은 방식으로 동작합니다.

- 원본 구조를 바꾸지 않습니다. 글자 단위 표시는 브라우저 기본 기능(CSS Custom Highlight API)으로 색만 입히고, 덩어리 단위는 `data-sgc` 속성 하나만 붙입니다. React·Vue가 화면을 다시 그려도 충돌하지 않습니다.
- 수천 쪽 문서도 가볍게 움직이도록 만들었습니다 (아래 "속도" 참고).
- 나란히 보기(좌우 스크롤 맞춤), 한 장 보기(삭제된 내용까지 한 문서에 겹침), 변경 목록, 이전/다음 이동(F7 / Shift+F7)을 제공합니다.

## 1. JSP·서버 화면: 파일 하나 + 주소 두 개

```html
<link rel="preload" href="/static/sg-compare.min.js" as="script">
<div id="cmp" style="height:85vh"></div>
<script src="/static/sg-compare.min.js"></script>
<script>
  SgCompare.mountViewer(document.getElementById('cmp'), {
    left:  { url: '/sop/view.jsp?id=14&ver=3', label: 'SOP-EQ-014 v3' },
    right: { url: '/sop/view.jsp?id=14&ver=4', label: 'SOP-EQ-014 v4' },
    page: '.page',          // 쪽 요소 (있으면 "n쪽" 표시 + 스크롤을 쪽 단위로 가볍게 맞춤)
    locale: 'ko',
  });
</script>
```

- `dist/sg-compare.min.js` 하나만 서버에 올리면 됩니다 (비교 계산용 Web Worker 도 안에 들어 있음).
- 주소는 **같은 도메인**이어야 합니다 (브라우저 보안상 다른 도메인 iframe 안은 읽을 수 없음).
- 이미 한 페이지 안에 두 버전을 그려 두었다면 `createCompare({ left: 요소, right: 요소 })` 를 쓰세요.

## 2. 이미 그려진 두 요소 (어떤 프레임워크든)

```js
import { createCompare, mountToolbar, mountChangeList } from '@silvergate/compare-dom';

const ctrl = createCompare({
  left: document.querySelector('#v3'),
  right: document.querySelector('#v4'),
  leftScroller: document.querySelector('#v3-scroll'),   // 스크롤 영역 (없으면 자동으로 찾음)
  rightScroller: document.querySelector('#v4-scroll'),
  page: '.page',
  watch: true,          // 화면이 다시 그려지면 자동으로 다시 비교
});
mountToolbar(document.querySelector('#bar'), ctrl, { locale: 'ko', modes: true });
mountChangeList(document.querySelector('#list'), ctrl, { locale: 'ko' });
```

Vue 3 는 `@silvergate/compare-vue`, React 는 `@silvergate/compare-react` 가 위 코드를 감싼 부품을 제공합니다 (문서 컴포넌트는 고치지 않고 그대로 두 번 그림).

## 3. 정확도를 높이는 방법 (선택)

반복되는 항목(표의 줄, 스텝, 목록)에 **바뀌지 않는 ID**를 속성으로 달아 두면, 가운데에 항목이 끼어들거나 순서가 바뀌어도 정확히 짝을 맞춥니다.

```html
<tr data-sgc-key="step-1.2">…</tr>
```

ID가 없어도 동작합니다: 똑같은 덩어리를 기준점으로 잡고, 그 사이는 글자가 비슷한 것끼리 짝짓습니다. 다만 순서 바뀜(이동)은 ID가 있어야 알아냅니다.

비교에서 빼고 싶은 곳(인쇄 시각, 조회한 사람 등)에는 `data-sgc-ignore` 를 달거나 `ignore: '.print-time'` 옵션을 씁니다.

## 4. 좌우 높이 맞추기 (`align`, 기본 켜짐)

비교는 같은 내용이 같은 높이에 있어야 의미가 있습니다. 바뀌지 않은 덩어리는 내용이 같으니 높이도 같으므로, **바뀐 곳만** 맞춥니다.

| 경우 | 맞추는 방법 |
| --- | --- |
| 한쪽에만 추가 / 한쪽에서 삭제 | 반대쪽 같은 자리(쪽 문서면 같은 쪽)에 같은 높이의 빗금 빈 칸 ("새 버전에서 추가됨/삭제됨") |
| 수정으로 줄 수가 달라짐 | 짧은 쪽 아래 여백을 늘려 같은 높이 (표 줄은 줄 높이) |
| 글꼴이 늦게 내려오거나 칸 폭이 바뀜 | 높이만 다시 맞춤 (다시 비교하지 않음) |

- 빈 칸은 `data-sgc-ignore` 라 비교에서 빠지고, 다시 비교할 때 지웠다가 새로 넣습니다. 모듈이 넣은 빈 칸 때문에 다시 비교가 반복되지 않습니다.
- **쪽 문서(`page`)는 화면에 보이는 쪽과 앞뒤 몇 장만 맞추고, 스크롤로 다가오는 쪽을 그때 맞춥니다.** 3,000쪽에서도 비교 전체 약 3초, 화면 멈춤 0ms (전부 한 번에 맞추면 50초 이상).
- 쪽 문서는 두 버전이 **같은 쪽 나누기**를 쓰게 그리는 것이 좋습니다 (같은 쪽 번호에 같은 항목). 홈페이지 `/compare` 는 `app/compare/plan.js` 로 두 버전의 항목을 합쳐 쪽을 나눕니다.
- `page` 를 주면 쪽 요소는 비교에서 없는 것처럼 건너뜁니다(`flatten`). 쪽 경계가 버전마다 달라도 내용끼리 비교됩니다.

## 5. 어려운 경우는 이렇게 표시합니다

| 경우 | 표시 |
| --- | --- |
| 표에 열이 생기거나 없어짐 | 칸마다 색을 칠하고, 변경 목록에는 "표 열 N칸" 한 건 |
| 칸 병합 (colspan·rowspan) | 합쳐진 칸은 "수정: 가로/세로 병합 1 → 3", 없어진 칸은 "삭제" |
| 표 줄·문단 순서만 바뀜 | 내용이 똑같으면 "이동" (ID 가 없어도) |
| 구조가 완전히 바뀜 (표 → 목록 등) | 이전 덩어리 "삭제" + 새 덩어리 "추가" |
| 화면이 연속으로 여러 번 다시 그려짐 (`watch: true`) | 0.3초 조용해질 때까지 기다렸다가 한 번만 비교. 비교 중에 또 바뀌면 하던 비교는 버리고 새로 |
| 보이는 줄만 그리는 화면 (가상 스크롤) | 화면에 없는 부분은 비교할 수 없음 → 이런 화면은 데이터끼리 비교(`@silvergate/compare-core`) |

확인 페이지: `demo/cases.html`

**가장 자연스러운 스크롤 (권장):** 두 문서를 **한 스크롤 영역 안에 나란히** 두고 `leftScroller` 와 `rightScroller` 에 같은 요소를 주세요. 높이 맞추기 덕분에 좌우 높이가 같으므로, 브라우저가 한 장처럼 함께 움직여 늦거나 떨리지 않습니다 (스크롤바도 하나, 스크롤 맞춤 버튼은 자동으로 숨김). 홈페이지 `/compare` 가 이 방식입니다. 두 iframe(JSP 주소) 처럼 영역을 나눌 수 없을 때만 아래 스크롤 맞춤을 씁니다.

**스크롤바:** 스크롤 맞춤이 켜져 있으면 오른쪽 스크롤바 하나만 보입니다 (왼쪽은 숨김, 휠·터치는 그대로 됨). 맞춤을 끄면 양쪽 다 보입니다. 늘 양쪽 다 보이게 하려면 `scrollbars: 'both'`.

## 6. 속도: 수천 쪽에서도 가볍게

| 무엇이 | 어떻게 가볍게 |
| --- | --- |
| 화면 읽기 | 8ms씩 나눠 읽고 브라우저에 차례를 넘김 → 읽는 동안에도 스크롤·입력이 멈추지 않음 |
| 비교 계산 | Web Worker(백그라운드)에서. 똑같은 덩어리는 지문(해시)이 같으면 안쪽을 보지 않고 건너뜀 |
| 표시 | 바뀐 곳에만. 글자는 Highlight API(레이아웃 계산 없음), 덩어리는 속성 하나 |
| 백그라운드로 넘기기 | 문서를 1만5천 개씩 나눠 보냄 → 한꺼번에 복사하며 멈추는 일 없음 |
| 스크롤 맞춤 | 스크롤 이벤트에서 즉시(한 박자 늦지 않음). `page` 를 주면 같은 쪽끼리 쪽 상자 위치만으로 맞춤 → 화면 밖 쪽 안쪽을 건드리지 않음 |
| 변경 목록 | 300건씩 그림 ("더 보기") |

### 고객사 화면에 넣을 CSS 한 줄 (수천 쪽이면 꼭)

문서 화면(JSP 등)의 CSS 에 아래 한 줄을 **처음부터** 넣어 두면, 화면 밖 쪽은 브라우저가 그리지 않아 3,000쪽 기준 첫 그리기가 약 4초 → 0.5초로 줄어듭니다. 모양은 그대로입니다 (1123px 은 A4 한 쪽 높이, 실제 쪽 높이에 맞추세요).

```css
.page { content-visibility: auto; contain-intrinsic-size: auto 794px auto 1123px; }
```

이미 다 그려진 화면에 나중에 이 CSS 를 넣으면 브라우저가 전체를 한 번 다시 계산하느라 오히려 오래 걸리므로(3,000쪽 약 10초), 모듈이 대신 넣지 않습니다.

측정 페이지: `demo/bench.html?pages=3000&cv=1` (저장소에서 `npx serve packages/compare-dom` 후 열기).

## 7. 옵션 요약

`left`, `right`, `leftScroller`, `rightScroller`, `page`, `attrs`(비교할 속성, 기본 src·href·alt·colspan·rowspan·type + 입력칸 값), `ignore`, `keyAttrs`, `worker`('auto'), `watch`, `debounce`, `syncScroll`, `scrollbars`('one' | 'both'), `align`(true), `flatten`(= page), `locale`('ko' | 'en', 빈 칸 문구), `auto`. 자세한 타입은 `src/index.d.ts`.

색은 CSS 변수로 바꿀 수 있습니다: `--sgc-ins-bg`, `--sgc-del-bg`, `--sgc-ins-line`, `--sgc-del-line`, `--sgc-mod-line`, `--sgc-focus` 등.

## 8. 브라우저

Chrome·Edge 105+, Safari 17.2+, Firefox 140+ 에서 글자 단위 표시까지 됩니다. 그보다 오래된 브라우저에서는 글자 대신 바뀐 문단 전체에 색이 들어갑니다.

## 9. 개발

```
npm test            # 엔진 단위 테스트 (packages/compare-core)
npm run build       # dist/ 묶음 만들기
node demo/build-demo.mjs   # 테스트 페이지 demo/index.html
```
