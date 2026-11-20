# @silvergate/compare-react

React 17+ 에서 쓰는 화면 비교 부품. 실제 비교·표시는 `@silvergate/compare-dom` 이 하고, 이 패키지는 감싸기만 합니다.
**기존 문서 컴포넌트는 고치지 않습니다.**

```jsx
import { SgCompare } from '@silvergate/compare-react';

<SgCompare
  left={v1} right={v2} leftLabel="v1.0" rightLabel="v1.1" page=".page" height="85vh"
  renderDoc={(data) => <MbrDocument doc={data} />}
/>
```

- 데이터가 바뀌어 다시 그려지면 자동으로 다시 비교합니다. 표시는 화면 구조를 바꾸지 않아 React 와 충돌하지 않습니다.
- props: `left`, `right`, `renderDoc`, `leftLabel`, `rightLabel`, `mode`, `locale`, `labels`, `page`, `height`, `options`, `toolbar`, `list`, `onUpdate`, `onFocus`
- ref 로 `next()`, `prev()`, `goTo(i)`, `controller` 사용
- 레이아웃을 직접 만들 때: `const ctrl = useCompare(leftRef, rightRef, { page: '.page' })`
- Next.js 는 클라이언트 컴포넌트(`'use client'`)에서 사용하세요.
