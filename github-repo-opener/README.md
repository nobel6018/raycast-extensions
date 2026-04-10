# GitHub Repo Opener

> [English](./README_EN.md)

Raycast에서 GitHub 레포지토리를 검색하고 브라우저에서 바로 여는 확장입니다.

## 스크린샷

| 레포 목록 | 액션 패널 |
|-----------|-----------|
| ![List](../docs/github-list.png) | ![Actions](../docs/github-actions.png) |

## 기능

- 접근 가능한 모든 레포 조회 (소유, 협업, 조직)
- **즐겨찾기** — 자주 쓰는 레포를 상단에 고정 (`Cmd+F`)
- 섹션 구분: Favorites > My Repos > Organizations & Contributed
- 언어별 컬러 태그
- Code, PRs, Actions, Issues, Branches, Releases, Settings 바로가기
- 30일 캐시 + 수동 새로고침 (`Cmd+R`)

## 설치

### 1. GitHub 토큰 발급

```bash
# gh CLI가 설치되어 있다면:
gh auth token
```

또는 **GitHub Settings > Developer settings > Personal access tokens**에서 발급하세요.

### 2. 확장 설치

```bash
cd github-repo-opener
npm install
npm run dev
```

### 3. 토큰 설정

첫 실행 시 Raycast가 토큰 입력을 요청합니다. `ghp_...` 또는 `gho_...` 토큰을 붙여넣으세요.

## 단축키

| 단축키 | 동작 |
|--------|------|
| `Enter` | 레포 열기 (Code) |
| `Cmd+O` | 레포 열기 (Code) |
| `Cmd+Shift+P` | Pull Requests |
| `Cmd+Shift+A` | Actions |
| `Cmd+I` | Issues |
| `Cmd+B` | Branches |
| `Cmd+L` | Releases |
| `Cmd+Shift+,` | Settings |
| `Cmd+F` | 즐겨찾기 토글 |
| `Cmd+R` | 레포 목록 새로고침 |
