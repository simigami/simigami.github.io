# simigami.github.io

My Study Wikidocs — [MkDocs](https://www.mkdocs.org/) 기반 GitHub Pages 사이트입니다.

## 로컬 개발 환경

```powershell
# 가상환경 생성 (최초 1회)
python -m venv venv

# 가상환경 활성화
.\venv\Scripts\Activate.ps1

# 의존성 설치
pip install -r requirements.txt

# 로컬 미리보기
mkdocs serve
```

## 배포

`main` 브랜치에 push하면 GitHub Actions가 자동으로 [https://simigami.github.io](https://simigami.github.io)에 배포합니다.

수동 배포:

```powershell
mkdocs gh-deploy
```
