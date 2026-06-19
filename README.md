# simigami.github.io

My Study Wikidocs — HTML + JavaScript 기반 GitHub Pages 사이트입니다.

## 구조

```
├── index.html          # 메인 페이지
├── pages/              # 위키 문서 (HTML)
├── assets/
│   ├── css/theme.css   # 디자인 시스템
│   └── js/app.js       # 인터랙션
└── .github/workflows/  # 자동 배포
```

## 로컬 미리보기

```powershell
python -m http.server 8000
```

브라우저에서 [http://127.0.0.1:8000](http://127.0.0.1:8000)으로 접속합니다.

## 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 [https://simigami.github.io](https://simigami.github.io)에 배포합니다.

## 디자인

Midnight & Gold 팔레트 기반의 Luxury Minimalism 스타일입니다.

- **Colors:** `#16130b` (배경), `#f2ca50` / `#d4af37` (금색), `#eae1d4` (텍스트)
- **Typography:** Playfair Display, Inter, JetBrains Mono
