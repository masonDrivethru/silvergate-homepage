# 2. API

전체 타입은 `dist/sg-compare.d.ts`.

## createCompare(options) → controller

| 옵션 | 기본 | 설명 |
|---|---|---|
| `left`, `right` | (필수) | 비교할 화면: 요소 · document · 같은 도메인 iframe |
| `leftScroller`, `rightScroller` | 가까운 스크롤 조상 | 둘을 **같은 요소**로 주면 한 스크롤 영역(권장) |
| `page` | `null` | 쪽 요소 선택자(예 `'.page'`). 변경 목록에 "n쪽", 보이는 쪽만 높이 맞춤 → 대용량에 필수 |
| `flatten` | = `page` | 건너뛸 감싸개. 쪽 나누기가 버전마다 달라도 내용끼리 비교 |
| `align` | `true` | 추가·삭제 자리에 빈 칸, 수정으로 높이가 달라지면 여백 → 좌우 높이 일치 |
| `watch` | `false` | 화면이 다시 그려지면 자동 재비교 |
| `debounce` | `300` | watch 대기(ms) |
| `attrs` | `['src','href','alt','colspan','rowspan','type']` | 비교할 속성 (입력칸 값은 항상) |
| `ignore` | – | 비교에서 뺄 선택자 (`data-sgc-ignore` 도 빠짐) |
| `keyAttrs` | `['data-sgc-key','data-key']` | 반복 항목 짝 맞춤 키 |
| `worker` | `'auto'` | Web Worker 사용 (큰 문서만). 막히면 자동으로 메인 스레드 |
| `locale` | `'ko'` | `'ko'` · `'en'` |
| `frames` | `true` | 문서 안에 든 iframe(같은 도메인)의 안쪽 내용도 비교 |
| `visibleOnly` | `false` | 눈에 안 보이는(display:none) 요소는 빼기 — 접힌 탭·숨긴 영역 |
| `virtualize` | `false` | 쪽 건너뛰기를 모듈이 걸어 줌. 쪽이 무거운 수천 쪽 문서에서 스크롤이 끊길 때만 (`04` 참고) |
| `nonce` | – | CSP nonce (`03-보안-CSP.md`) |
| `auto` | `true` | 만들자마자 비교 |

### controller

| 멤버 | 설명 |
|---|---|
| `changes` | 변경 목록 `ChangeItem[]` (`type`: added·modified·deleted·moved, `page`, `left`/`right` 노드, `diffs`) |
| `stats` | 종류별 개수 |
| `timing` | 걸린 시간(ms)·노드 수·worker 여부 |
| `goTo(i)` · `next()` · `prev()` | 변경점으로 흘러가듯 이동(0.4 ~ 0.8초, 수천 쪽 떨어져도 같음) + 도착하면 반짝. `goTo(i, { smooth: false })` 는 바로 이동. 사용자가 휠·터치·키를 쓰면 멈춤. OS 의 '움직임 줄이기' 설정이면 바로 이동 |
| `setFilter(type\|null)` | 목록·이동을 한 종류로 |
| `run()` | 다시 비교 |
| `renderRedline(el)` | 한 장 보기(삭제까지 겹친 새 버전 복사본) |
| `on(ev, f)` | `start` · `update` · `focus` · `filter` · `error` |
| `clear()` · `destroy()` | 표시 지우기 · 전부 정리 |

## mountViewer(host, options)

`left`/`right` 에 `{ url, label }` 또는 `{ html, label }`. `scripts: false` 면 화면 안의 스크립트를 실행하지 않습니다 (받은 파일·붙여 넣은 HTML 을 열 때). 나머지는 createCompare 옵션 + `height`, `layout`(`'shared'` 기본 / `'split'`).
반환 `{ ready: Promise<controller>, controller, setMode('side'|'redline'), destroy() }`.

- `shared`: 두 iframe 을 내용 높이만큼 늘려 한 스크롤 영역에 → 가장 자연스러움
- `split`: iframe 마다 스크롤 + 스크롤 맞춤. 수천 쪽짜리 서버 화면처럼 아주 큰 경우 이쪽이 가벼움

## mountLayout(host, options)

비교 화면 뼈대(도구 막대 · 두 문서가 나란히 든 한 스크롤 영역 · 변경 목록)만 만듭니다. 문서는 `left` / `right` 안에 직접 그립니다.

```js
const lay = SgCompare.mountLayout(host, { leftLabel: 'v1.0', rightLabel: 'v1.1', height: '80vh' });
lay.left.append(이전문서); lay.right.append(새문서);
const ctrl = SgCompare.createCompare({ left: lay.left, right: lay.right, leftScroller: lay.desk, rightScroller: lay.desk });
lay.attach(ctrl);   // 도구 막대·변경 목록·한 장 보기 연결
```

반환 `{ root, left, right, desk, bar, list, redline, attach(ctrl), setMode(), destroy() }`. 옵션 `toolbar: false`, `list: false` 로 일부만.

## mountToolbar · mountChangeList

기본 도구 막대(개수·이전/다음·종류 거르기)와 변경 목록. `{ locale, labels, nonce }`.
단축키 F7 / Shift+F7 = 다음 / 이전 변경 (한 화면에 비교 창이 여러 개면 초점이 든 창만).

## exportReport(ctrl, options) · downloadReport(ctrl, options)

비교 결과를 그 자체로 열리는 HTML 보고서 한 장으로 만듭니다 (변경관리 첨부·인쇄·PDF 저장).
번호·종류·쪽·이전·이후, 변경 합계, 작성/검토/승인 서명칸이 들어갑니다. 문서 내용은 글자로만 넣습니다.

```js
const html = SgCompare.exportReport(ctrl, { leftLabel: 'v1.0', rightLabel: 'v1.1', locale: 'ko', author: '홍길동' });
SgCompare.downloadReport(ctrl, { leftLabel: 'v1.0', rightLabel: 'v1.1' });   // 파일로 바로 내려받기
```

## 색 바꾸기 (CSS 변수)

```css
:root {
  --sgc-add-fg: #15803d; --sgc-add-bg: rgba(22,163,74,.1);   /* 추가 */
  --sgc-ins-fg: #1d4ed8; --sgc-ins-bg: rgba(37,99,235,.08);  /* 수정(새 글자) */
  --sgc-del-fg: #b91c1c; --sgc-del-bg: rgba(220,38,38,.07);  /* 삭제 */
  --sgc-focus-rgb: 250 204 21;                               /* 이동 시 깜빡임 */
}
```

## Vue 3 `<SgCompare>`

props: `left`, `right`, `leftLabel`, `rightLabel`, `mode`, `locale`, `page`, `height`, `options`, `toolbar`, `list`.
슬롯 `#doc="{ data, side }"`. 이벤트 `update`, `focus`. `ref` 로 `controller`, `next()`, `prev()`, `goTo()`.
`useCompare(leftRef, rightRef, options)` 컴포저블도 있습니다.

## React `<SgCompare>`

props 는 Vue 와 같고 `renderDoc(data, side)`, `onUpdate`, `onFocus`. `ref` 로 같은 메서드. `useCompare` 훅도 있습니다.
