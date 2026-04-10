# Raycast Extensions

A collection of custom Raycast extensions for daily productivity.

| Extension | Type | Description |
|-----------|------|-------------|
| [Slack Channel Opener](./slack-channel-opener) | Extension | Search and open Slack channels by name |
| [GitHub Repo Opener](./github-repo-opener) | Extension | Search and open GitHub repos with sub-page shortcuts |
| [Snowflake ID Generator](./snowflake-id-generator) | Script Command | Generate Snowflake IDs (Crockford Base32) |

## Quick Start

### Extensions (Slack / GitHub)

```bash
cd slack-channel-opener  # or github-repo-opener
npm install
npm run dev
```

Raycast will auto-detect the extension. Enter your API token on first launch.

### Script Command (Snowflake)

1. Open Raycast Settings > Extensions > Script Commands
2. Add the `snowflake-id-generator` directory
3. Done — search "Generate Snowflake IDs" in Raycast

## Token Setup

### Slack User Token

1. Go to https://api.slack.com/apps > Create New App > From scratch
2. OAuth & Permissions > **User Token Scopes** > Add `channels:read`, `groups:read`
3. Install to Workspace > Copy **User OAuth Token** (`xoxp-...`)

### GitHub Token

```bash
gh auth token
```

Or create a Personal Access Token at GitHub Settings > Developer settings > Tokens.
