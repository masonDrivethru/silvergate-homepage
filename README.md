# SilverGate 홈페이지

실버게이트(SilverGate) 회사 홈페이지. **반응형 웹 + PWA**로 만들어서 PC에서는 웹사이트로, 모바일에서는 홈 화면에 설치해 앱처럼 쓸 수 있습니다.

## 특징
- **웹 · 앱 병행**: PWA(manifest + service worker). 오프라인 지원, 설치 버튼 제공
- **모바일 앱 UI**: 768px 이하에서 하단 탭바, safe-area(노치) 대응
- **디자인 시스템**: `css/style.css` 상단의 CSS 변수(색상·타이포·반경·그림자)로 전체 톤 관리
- **라이트 / 다크 모드**: 시스템 설정을 따르고, 토글 버튼으로 바꿀 수 있음
- **빌드 없음**: 순수 HTML/CSS/JS, 폰트는 Pretendard(CDN)

## 구조
```
index.html             # 페이지
css/style.css          # 디자인 토큰 + 스타일
js/main.js             # 인터랙션, 테마, PWA 설치
manifest.webmanifest   # 앱 정보
sw.js                  # 오프라인 캐시
assets/icons/          # 로고, 앱 아이콘
```

## 로컬 실행
PWA(서비스 워커)는 `http://`에서만 동작하므로 간단한 서버로 실행하세요.
```bash
# Python이 있는 경우
python -m http.server 8080
# 또는 VS Code "Live Server" 확장
```
→ http://localhost:8080

## 배포 (GitHub Pages)
1. GitHub 저장소 → Settings → Pages
2. Source: `Deploy from a branch`, Branch: `main` / `/ (root)`
3. `https://<계정>.github.io/<저장소>/` 로 접속

## 할 일
- [ ] 실제 회사 정보(연락처, 주소, 고객사, 실적 수치)로 교체
- [ ] 문의 폼 접수 연동(`js/main.js`의 TODO: Formspree나 사내 API)
- [ ] 정식 로고/CI 적용(`assets/icons/`)
- [ ] 정적 파일을 수정하면 `sw.js`의 `CACHE` 버전 올리기
