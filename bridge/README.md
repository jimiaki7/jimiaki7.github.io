# Jimi OS Local Bridge

The Local Bridge gives `/os` read-only access to JimiVault from the browser while keeping the Vault on the local machine.

## Run

```bash
npm run bridge:os
```

The bridge prints a local bearer token. Paste that token into `/os/settings`.

## Environment

```bash
JIMI_OS_BRIDGE_PORT=3737
JIMI_OS_BRIDGE_TOKEN=replace-with-long-random-token
JIMI_OS_VAULT_ROOT="$HOME/Library/Mobile Documents/iCloud~md~obsidian/Documents/JimiVault"
JIMI_OS_ALLOWED_ORIGINS="https://jimiaki7.github.io,http://localhost:3000"
JIMI_OS_MULMO_URL="http://127.0.0.1:3001"
```

## Endpoints

- `GET /health`
- `POST /vault/search`
- `POST /vault/read`
- `POST /vault/sync`
- `POST /vault/db/query` — frontmatter を Notion 風プロパティとして扱う構造化クエリ（`folder` / `where` / `sort` / `limit`）。詳細は `docs/agentic-os/OBSIDIAN_MULMO_EXTENSION.md`。
- `GET /mulmo/health` — MulmoClaude ローカルサーバー（既定 `http://127.0.0.1:3001`、`JIMI_OS_MULMO_URL` で変更可）への 1.5s タイムアウト付き proxy ヘルスチェック。
- `POST /proposal/write-note`

All endpoints require:

```http
Authorization: Bearer <token>
```

## Safety Defaults

- Binds to `127.0.0.1`.
- Requires a bearer token.
- Excludes `重要データ.md`, `keys.json`, `.env*`, and paths containing `secret` or `credential`.
- Does not write to the Vault. Write requests return proposals only.
