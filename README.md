# 📚 BOOK GRID

Kakao Books API를 연동한 도서 검색 및 쇼핑몰 UI 프로젝트입니다.

## 🔗 Demo
👉 [ponyo911.github.io/BOOKGRID](https://ponyo911.github.io/BOOKGRID)

## 📌 주요 기능

- **도서 검색** — Kakao Books API 연동, 키워드 검색 후 결과 그리드 표시
- **카테고리별 도서 목록** — 베스트셀러 / 신간 / 경제경영 / 문학·소설
- **히어로 슬라이더** — 자동재생, 정지, 이전/다음 컨트롤
- **추천 도서 탭 캐러셀** — 종합/국내소설/외국소설/에세이 등 카테고리별 탭 전환
- **도서 상세 페이지** — `detail.html`로 이동, 상세 정보 표시
- **메가 메뉴** — 카테고리 네비게이션 드롭다운

## 🛠 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | HTML, CSS, JavaScript (Vanilla) |
| API | Kakao Books API |
| 배포 | GitHub Pages |

## 📁 프로젝트 구조

\`\`\`
BOOKGRID/
├── index.html       # 메인 페이지
├── detail.html      # 도서 상세 페이지
├── css/
│   └── main.css     # 전체 스타일
├── js/
│   └── app.js       # API 연동 및 동작 로직
└── img/             # 이미지 리소스
\`\`\`

## 🚀 실행 방법

\`\`\`bash
# 별도 설치 없이 index.html을 브라우저에서 열거나
# GitHub Pages 주소로 바로 접속 가능합니다
\`\`\`

> Kakao Books API 키가 필요합니다. `js/app.js` 내 API 키 설정 후 실행하세요.
