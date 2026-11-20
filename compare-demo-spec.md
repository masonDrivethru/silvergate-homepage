# SilverBio Compare — 홈페이지 데모 사양서

> Claude Code에 그대로 붙여넣어 사용하는 작업 지시서.
> 목적: 실버게이트 홈페이지에 "문서 버전 자동 비교" 제품 데모를 넣는다.

---

## 0. 전제 (중요)

- 기존 고객사 코드나 구조를 참조하지 않는다. 공개 표준(ISA-88)과 일반적인
  배치 기록 구조만 근거로 백지에서 설계한다.
- 샘플 데이터는 전부 가상 제품/가상 공정으로 만든다. 실제 고객사 제품명,
  테이블명, 파라미터를 쓰지 않는다.
- 비교 엔진은 프레임워크에 의존하지 않는 순수 JavaScript로 작성한다.
  UI 레이어만 홈페이지 스택에 맞춘다.

---

## 1. 무엇을 보여주는 데모인가

제약·바이오의 배치 기록(MBR/EBR)은 버전이 자주 바뀐다.
규제상 "무엇이 언제 왜 바뀌었는지"를 증명해야 하는데,
현재는 사람이 두 문서를 눈으로 대조한다.

이 데모는 두 버전을 넣으면 **추가 / 수정 / 삭제를 자동으로 집계하고
해당 위치로 바로 이동**시켜 주는 화면을 보여준다.

방문자가 홈페이지에서 바로 조작해 볼 수 있어야 한다. (서버 불필요)

---

## 2. 아키텍처

```
src/compare/
├── engine.js          ← 순수 JS, 프레임워크 무관, 이식 가능
│   ├── compare(left, right) → ChangeSet
│   ├── matchGroups()        그룹 매칭
│   ├── diffStep()           스텝 단위 비교
│   ├── diffParams()         파라미터 단위 비교
│   └── rollup()             상위 그룹으로 변경 집계
│
├── types.js           ← 타입/스키마 정의 (JSDoc 또는 .d.ts)
└── sample-data.js     ← 가상 MBR v1.0 / v1.1

src/ui/
├── ComparePanel       좌우 2단 렌더
├── ChangeList         변경 목록 + 클릭 시 해당 위치 이동
└── StatsBar           추가/수정/삭제 카운트
```

**핵심 원칙**: `engine.js`는 DOM을 전혀 모른다.
입력 JSON 두 개를 받아 결과 객체만 반환한다.
이래야 나중에 다른 제품·다른 프레임워크에 그대로 재사용된다.

---

## 3. 데이터 모델

### 입력 (MBR 문서 한 버전)

```js
{
  version: "1.0",
  productName: "SGB-101 Monoclonal Antibody",   // 가상
  effectiveDate: "2026-03-01",
  groups: [
    {
      groupId: "G1",
      title: "Cell Culture",
      steps: [
        {
          stepId: "1.1",
          title: "배지 투입",
          instruction: "멸균 배지를 바이오리액터에 투입한다.",
          params: [
            {
              key: "volume",
              label: "투입량",
              value: "450",
              unit: "L",
              spec: { lcl: 440, ucl: 460 }
            }
          ]
        }
      ]
    }
  ]
}
```

### 출력 (ChangeSet)

```js
{
  stats: { added: 2, modified: 4, deleted: 1 },

  changes: [
    {
      type: "modified",            // added | modified | deleted
      level: "param",              // group | step | param
      groupId: "G1",
      groupTitle: "Cell Culture",
      stepId: "1.2",
      stepTitle: "배양 온도 설정",
      paramKey: "temperature",
      label: "설정 온도",
      left:  "36.5",
      right: "37.0",
      diffs: [ [0,"3"], [-1,"6.5"], [1,"7.0"] ],   // diff-match-patch 형식
      anchorId: "G1-1.2-temperature"               // 스크롤 대상 DOM id
    }
  ],

  // 상위 롤업: 하위에 변경이 있으면 그룹도 표시
  groupFlags: {
    "G1": "modified",
    "G2": "added"
  }
}
```

---

## 4. 비교 규칙

### 매칭 키
- 그룹: `groupId` 우선, 없으면 `title`
- 스텝: `stepId` 우선, 없으면 `title`
- 파라미터: `key`

### 판정
```
왼쪽에만 있음        → deleted
오른쪽에만 있음      → added
양쪽에 있고 값 다름  → modified
양쪽에 있고 값 같음  → unchanged (출력에 포함하지 않음)
```

### 롤업
하위에 변경이 하나라도 있으면 상위(스텝→그룹)에 표시한다.
단 **집계 카운트는 중복하지 않는다.** 파라미터 3개가 바뀌어도
그 스텝은 "수정 1건"으로 센다. 어느 단위로 셀지는 옵션으로 둔다.

```js
compare(left, right, { countBy: "step" })   // 기본
compare(left, right, { countBy: "param" })
```

### 텍스트 diff
값이 긴 문자열(instruction 등)이면 `diff-match-patch`로
문자 단위 diff를 계산해 `diffs`에 담는다.
짧은 값은 before/after만 보여줘도 된다.

---

## 5. 화면 요구사항

**레이아웃**
- 상단: 버전 선택 (v1.0 ↔ v1.1), 집계 바
- 본문: 좌우 2단. 좌=이전 버전, 우=새 버전
- 우측 또는 하단: 변경 목록 패널

**표시**
```
추가   초록 배경 + 좌측 테두리
수정   노랑 배경, 값은 취소선(이전) + 신규값
삭제   빨강 배경 + 취소선 (좌측 패널에만)
```

**인터랙션**
- 변경 목록 항목 클릭 → 해당 위치로 스크롤 + 하이라이트
- "변경된 것만 보기" 토글
- 좌우 스크롤 동기화

**반응형**: 모바일에서는 2단 대신 탭 전환 또는 세로 스택.

---

## 6. 샘플 데이터

가상 제품 `SGB-101` 기준으로 v1.0 / v1.1 두 벌을 만든다.
아래 변경이 모두 보이도록 구성할 것:

| 변경 | 내용 |
|---|---|
| 수정 | 배양 온도 36.5 → 37.0 |
| 수정 | 지시문 문장 일부 변경 (텍스트 diff 시연용) |
| 수정 | 스펙 범위 변경 (440~460 → 445~455) |
| 추가 | 새 스텝 "중간 샘플링" 추가 |
| 추가 | 기존 스텝에 파라미터 하나 추가 |
| 삭제 | 스텝 하나 삭제 |
| 변경없음 | 최소 3개 스텝은 그대로 (대비용) |

---

## 7. 구현 순서

1. `types.js` + `sample-data.js` 먼저 만든다
2. `engine.js`의 `compare()`를 만들고 **콘솔에서 ChangeSet이 제대로 나오는지 확인**
3. 그다음에 UI를 붙인다
4. UI는 engine 결과만 받아 그린다. UI 안에서 비교 로직을 계산하지 않는다

2단계까지 끝나고 결과를 보여준 다음 3단계로 넘어갈 것.

---

## 8. 하지 말 것

- engine.js 안에서 DOM 조작
- UI 컴포넌트 안에서 비교 로직 계산
- 실제 고객사 제품명·파라미터·테이블명 사용
- 한 파일에 500줄 넘기기 (넘으면 분리)
