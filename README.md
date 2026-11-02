# SilverGate 홈페이지

실버게이트(SilverGate) 회사 홈페이지. **반응형 웹 + PWA**로 만들어서 PC에서는 웹사이트로, 모바일에서는 홈 화면에 설치해 앱처럼 쓸 수 있습니다.

## 특징
- **웹 · 앱 병행**: PWA(manifest + service worker). 오프라인 지원, 설치 버튼 제공
- **모바일 앱 UI**: 768px 이하에서 하단 탭바, safe-area(노치) 대응
- **디자인 시스템**: `css/style.css` 상단의 CSS 변수(색상·타이포·반경·그림자)로 전체 톤 관리
- **디자인 토큰**: 딥 네이비 + 포인트 컬러 1개(승인 그린, 검증·승인 상태에만 사용), Pretendard 단일 서체, 8px 여백 체계. 아이콘은 Lucide(SVG, `index.html` 상단 symbol)
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
- [x] 실제 회사 정보(연락처, 주소) 반영
- [ ] 공개 가능한 고객사·실적이 생기면 섹션 추가
- [ ] 문의 폼 Formspree 연결: `index.html`의 `<form action="">`에 엔드포인트 입력 (비어 있으면 메일 앱으로 작성)
- [x] 정식 로고/CI 적용(`assets/icons/`)
- [ ] 실제 사진(사옥·팀) 추가
- [ ] 정적 파일을 수정하면 `sw.js`의 `CACHE` 버전 올리기
