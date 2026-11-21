# JSP (Spring MVC · 전자정부프레임워크 등) 연동 예제

서버가 그린 화면 두 개를 **그대로** 비교합니다. 서버 코드는 바꿀 필요가 없습니다.

1. `dist/sg-compare.min.js` 를 웹 정적 폴더에 복사합니다 (예: `src/main/webapp/static/sg-compare/`).
2. 비교 화면 JSP 하나를 추가합니다 → `WEB-INF/jsp/compare.jsp`
3. 컨트롤러에서 이전/새 버전 화면 주소를 넘깁니다.

```java
@GetMapping("/doc/compare")
public String compare(@RequestParam String docId, @RequestParam String from, @RequestParam String to, Model model) {
    model.addAttribute("leftUrl",  "/doc/view?docId=" + docId + "&ver=" + from + "&print=Y");
    model.addAttribute("rightUrl", "/doc/view?docId=" + docId + "&ver=" + to   + "&print=Y");
    model.addAttribute("leftLabel", "v" + from);
    model.addAttribute("rightLabel", "v" + to);
    return "compare";
}
```

- 두 화면은 **같은 도메인**이어야 합니다 (브라우저 보안 규칙). 다른 서버라면 리버스 프록시로 같은 도메인 아래에 두세요.
- 반복 항목(행·단계)에 `data-sgc-key="고유ID"` 를 달면 순서가 바뀌거나 중간에 끼어도 정확히 짝이 맞습니다.
- 날짜·출력자처럼 매번 바뀌는 칸은 `data-sgc-ignore` 로 비교에서 뺍니다.
- CSP 를 쓰면 `nonce` 옵션에 서버 nonce 를 넘기세요 (`docs/03-보안-CSP.md`).
