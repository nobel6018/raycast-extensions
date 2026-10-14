# Raycast Extensions

> [English](./README_EN.md)

일상 생산성을 위한 커스텀 Raycast 확장 모음입니다.

![Overview](./docs/overview.png)

| 확장 | 타입 | 설명 |
|------|------|------|
| [Slack Channel Opener](./slack-channel-opener) | Extension | Slack 채널을 이름으로 검색하고 바로 열기 |
| [GitHub Repo Opener](./github-repo-opener) | Extension | GitHub 레포를 검색하고 Code/PR/Actions 등 바로 열기 |
| [Snowflake ID Generator](./snowflake-id-generator) | Extension | Snowflake ID 생성 (Crockford Base32) |
| [Toggle Caffeinate](./toggle-caffeinate) | Extension | 시스템 슬립 방지 토글 (화면은 꺼짐) |

## 빠른 시작

모든 항목이 Raycast 확장이라 Script Directory를 손으로 추가할 필요가 없습니다.

```bash
./install.sh                         # 전부 등록
./install.sh snowflake-id-generator  # 일부만 등록
```

Slack, GitHub 확장은 첫 실행 시 API 토큰을 입력하세요.

## 토큰 발급

### Slack User Token

1. https://api.slack.com/apps > **Create New App** > From scratch
2. OAuth & Permissions > **User Token Scopes** > `channels:read`, `groups:read` 추가
3. Install to Workspace > **User OAuth Token** (`xoxp-...`) 복사

> **주의**: Bot Token Scopes가 아닌 **User Token Scopes**에 추가해야 합니다. Bot 토큰은 봇이 참여한 채널만 조회 가능합니다.

### GitHub Token

```bash
# gh CLI가 설치되어 있다면:
gh auth token
```

또는 GitHub Settings > Developer settings > Personal access tokens에서 발급하세요.
