# Angular 연동 예제

어댑터 없이 기본 API(`@silvergate/compare-dom`)를 그대로 씁니다.

```bash
npm install ./packages/silvergate-compare-dom-1.0.0.tgz
```

`src/app/doc-compare.component.ts` 참고. 문서 화면이 그려진 뒤(`ngAfterViewInit`) 비교를 만들고,
`watch: true` 로 이후 변경도 자동 반영합니다. 컴포넌트가 사라질 때 `destroy()` 를 꼭 호출하세요.
