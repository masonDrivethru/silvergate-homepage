# 3. 보안 · CSP

- **외부 통신 없음**: 모듈은 어떤 서버에도 접속하지 않습니다. 문서 내용은 브라우저 밖으로 나가지 않습니다.
- **원본 DOM 불변**: 글자 색은 CSS Custom Highlight API, 덩어리는 `data-sgc*` 속성으로만 표시합니다. 넣는 요소는 빈 칸(`.sgc-spacer`, `data-sgc-ignore`)뿐이며 `destroy()` 로 모두 제거됩니다.
- **eval 없음**: `unsafe-eval` 이 필요 없습니다.

## Content-Security-Policy 설정

| 지시어 | 필요한 값 | 이유 |
|---|---|---|
| `style-src` | `'nonce-…'` (또는 `'unsafe-inline'`) | 모듈이 표시용 `<style>` 을 넣음 → `nonce` 옵션으로 같은 값을 넘기면 됨 |
| `worker-src` | `blob:` | 큰 문서의 비교 계산을 Web Worker 에서. **허용하지 않아도 동작**(자동으로 메인 스레드) |
| `frame-src` | `'self'` | `mountViewer` 로 같은 도메인 화면을 iframe 에 띄울 때 |

```js
SgCompare.mountViewer(el, { left, right, nonce: window.__CSP_NONCE__ });
// 또는 createCompare({ ..., nonce }), mountToolbar(el, ctrl, { nonce })
```

## 소스 보호

배포 파일은 압축(minify)되어 있고 소스맵을 포함하지 않습니다. 파일 머리에 저작권 표기가 있으며 지우지 마세요.
