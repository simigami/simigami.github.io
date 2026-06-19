# simigami Study Wiki

학습 내용을 정리하는 위키 문서입니다.

## 시작하기

`docs/` 폴더에 Markdown 파일을 추가하고 `mkdocs.yml`의 `nav` 섹션에 등록하세요.

### 로컬 미리보기

```bash
# 가상환경 활성화 (Windows)
.\venv\Scripts\Activate.ps1

# 개발 서버 실행
mkdocs serve
```

브라우저에서 [http://127.0.0.1:8000](http://127.0.0.1:8000)으로 접속합니다.

### GitHub Pages 배포

```bash
mkdocs gh-deploy
```

또는 `main` 브랜치에 push하면 GitHub Actions가 자동으로 배포합니다.
