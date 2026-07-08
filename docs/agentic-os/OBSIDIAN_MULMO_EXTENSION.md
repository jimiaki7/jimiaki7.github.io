# Extension Design: Vault DB (Obsidian Bases) + MulmoClaude Studio

Last updated: 2026-07-08
Author: Fable 5 (統括設計)。実装は下位モデルへ委譲。

## Goal

既存の Agentic OS（/os + Supabase + Local Bridge）に次の2系統を追加する。

1. **Vault DB** — Obsidian を基盤に Notion のデータベース機能を実現する。
   - Vault 内: Obsidian ネイティブの **Bases コアプラグイン**（JimiVault で有効化済み・.base ファイル0件）を使い、frontmatter をプロパティとする Notion 型テーブル/カードビューを定義する。
   - /os 内: Local Bridge に frontmatter ベースの構造化クエリ endpoint を追加し、Command Center から同じ「データベース」を閲覧できるようにする。
2. **MulmoClaude Studio** — receptron/mulmoclaude（ローカル AI アプリ基盤、`npx mulmoclaude@latest` → localhost:3001、データはプレーンファイル）を Tool Registry と Studio ビューに統合する。説教・奨励ノート → 動画/スライド生成のパイプラインの入り口。

## Principles（既存設計文書を継承）

- static export 安全（Server Actions / middleware / cookies 禁止）。
- Vault への直接書込はしない。Bases 定義は**リポジトリ内に提案物として staged** し、Jimi が承認・コピーして導入する（CLAUDE.md §9）。
- Bridge は 127.0.0.1 のみ・Bearer token 必須・除外パターン（重要データ.md 等）を全 endpoint で強制。
- MulmoClaude の実行・生成はローカルの Jimi 操作。OS は状態表示と導線のみ（MVP は proposal-only 原則を維持）。

## 1. Bridge API 契約（bridge/jimi-os-bridge.mjs に追加）

### POST /vault/db/query

frontmatter を Notion DB のプロパティとして扱う構造化クエリ。

Request:

```json
{
  "folder": "01_Project/説教/日曜説教",
  "recursive": true,
  "where": [{ "field": "tags", "op": "contains", "value": "説教" }],
  "sort": { "field": "modifiedAt", "order": "desc" },
  "limit": 50
}
```

- `folder`: vault 相対パスの前方一致フィルタ。省略時は vault 全体。パストラバーサル（`..`）拒否。
- `where[].op`: `eq` | `neq` | `contains` | `exists`。`contains` は配列プロパティ（tags 等）は要素一致、文字列は部分一致。
- `sort.field`: プロパティ名または `modifiedAt` / `name`。省略時 `modifiedAt` desc。
- `limit`: 既定 50、最大 200。

Response:

```json
{
  "rows": [
    {
      "path": "01_Project/説教/日曜説教/2026/06-08_詩篇44篇.md",
      "name": "06-08_詩篇44篇",
      "modifiedAt": "2026-06-07T…",
      "properties": { "title": ["詩篇44篇"], "tags": ["resource", "説教・日曜説教"], "creation date": ["2026-06-01"] }
    }
  ],
  "total": 113
}
```

実装規約:

- 既存の `excludedFragments` / 除外判定を**必ず**通す（重要データ.md 等は rows に決して含めない）。
- frontmatter パースは依存追加なしのミニパーサで良い（対象は Jimi の frontmatter 形式: `key:` + スカラー / インライン配列 / `- 値` のブロックリスト。ネストした map は無視して可）。`// ponytail:` コメントで上限（full YAML 非対応）を明記。
- `.md` のみ対象。読むのは frontmatter 部分（先頭の `---` … `---`）だけで本文は返さない。
- Bearer token 必須（既存の認可関数を再利用）。

### GET /mulmo/health

MulmoClaude ローカルサーバーへの proxy ヘルスチェック。

- 設定: `JIMI_OS_MULMO_URL`（既定 `http://127.0.0.1:3001`）。
- 1.5s タイムアウトで fetch し、HTTP 応答があれば `{ "ok": true, "url": "...", "status": 200 }`、なければ `{ "ok": false, "url": "...", "error": "offline" }`。
- Bearer token 必須。

## 2. /os UI 契約（app/os/ に追加）

- `app/os/_lib/bridge.ts`: `queryVaultDb(settings, query)` と `checkMulmoHealth(settings)` を追加（既存 `searchVault` と同じ呼び出しパターン・エラー処理）。
- `OsApp.tsx`: ViewId / navItems に **`vault-db`（Vault DB）** と **`studio`（Studio）** を追加。
  - **Vault DB ビュー**: プリセットDB切替タブ（日曜説教 / 祈祷会奨励 / 釈義ノート / 最近のノート）。各プリセットは `folder` を固定した db/query（最近のノートは folder なし・limit 30）。Notion 風テーブル（列: 名前 / tags / creation date / 更新日時）、クライアント側の絞り込みテキストボックス付き。Bridge offline 時は既存のオフライン表示パターンを踏襲。
  - **Studio ビュー**: MulmoClaude のヘルスピル（/mulmo/health 経由）、`npx mulmoclaude@latest` の起動ガイド、localhost:3001 を開くリンク、「Vault ノート → MulmoScript → 動画」ワークフローの説明（実行は提案止まり）。
- `seed.ts` の tools シードに `MulmoClaude`（category: app, launch_url: http://127.0.0.1:3001）と `Obsidian Bases`（category: system）を追加。
- static export 安全を維持。`npm run lint` と `npm run build` 合格が完了条件。

## 3. Obsidian Bases 提案物（vault-bases/ 新設）

Vault へは書き込まず、リポジトリに staged する。導入先の推奨は `JimiVault/00_Home/DB/`（Jimi がコピー）。

- `日曜説教.base` — folder: `01_Project/説教/日曜説教`
- `祈祷会奨励.base` — folder: `01_Project/説教/祈祷会奨励`
- `釈義ノート.base` — folder: `03_Resource/釈義ノート`
- `プロジェクト.base` — folder: `01_Project`
- `README.md` — 導入手順・プロパティ規約（CLAUDE.md §5 の frontmatter 形式に基づく）

構文は必ず公式ドキュメント（https://help.obsidian.md/bases/syntax）を取得して照合すること。記憶からの構文生成は禁止。

## 4. Studio 構成（studio/ 新設）

- `studio/README.md`: MulmoClaude の前提（Node 20+ / Claude Code CLI / ffmpeg、画像生成は GEMINI_API_KEY、Docker 任意）、起動方法、/os Tool Registry との関係、生成物 → OS artifacts / Vault `03_Resource/Studio/` への還流手順（Jimi の手動操作）。
- `studio/start.sh`: `npx mulmoclaude@latest` の起動ラッパ（PORT / GEMINI_API_KEY を env から）。
- サーバーの実起動・API キー投入は Jimi の承認後（fable-guard）。

## Out of scope（今回やらない）

- MulmoScript の自動生成・動画の自動実行（Phase 5 の builder/judge ループに接続する将来課題）。
- Supabase リモートプロジェクトへの migration 適用（適用は Jimi 承認後に supabase-project-ops で実施）。
- Vault への .base 直接書込。

---

# v0.2: 機能化イテレーション（2026-07-08 Jimiフィードバック対応）

フィードバック:「マジックリンクではなくパスワードを設定させたい」「OSの中身が全く機能的でない」。
v0.1 は表示専用（書込は createProject のみ）だった。v0.2 はすべての主要モジュールに CRUD と実データ導線を入れる。

## A. データ層契約（app/os/_lib/os-data.ts に追加。シグネチャ厳守）

```ts
updateProject(client, id: string, patch: Partial<Pick<OsProject,"name"|"domain"|"status"|"priority"|"description"|"next_action"|"due_date">>): Promise<void>
createTool(client, ownerId: string, tool: Pick<OsTool,"name"|"category"|"status"|"provider"|"launch_url"|"notes">): Promise<void>
updateTool(client, id: string, patch: Partial<Pick<OsTool,"name"|"category"|"status"|"provider"|"launch_url"|"notes"|"last_checked_at">>): Promise<void>
createInsight(client, ownerId: string, insight: Pick<OsInsight,"title"|"category"|"priority"|"rationale"|"recommendation">): Promise<void>
updateInsightStatus(client, id: string, status: OsInsight["status"]): Promise<void>
updateApprovalStatus(client, id: string, status: "approved"|"rejected", note?: string): Promise<void> // decided_at=now も設定
createMemoryItem(client, ownerId: string, item: Pick<OsMemoryItem,"title"|"source_type"|"source_path"|"summary"|"tags">): Promise<void>
deleteMemoryItem(client, id: string): Promise<void>
upsertVaultMemories(client, ownerId: string, rows: VaultDbRow[]): Promise<number> // source_path で重複スキップ、挿入件数を返す
seedInitialData(client, ownerId: string): Promise<void> // 各テーブルが空のときだけ現実の初期データを投入
```

- エラーは throw（呼び出し側が表示）。全 insert に owner_id を付ける（RLS の with check と一致）。
- seedInitialData の実データ: プロジェクト=説教準備フロー/Keryx/Semeron/Synaxis/Aster Support Navi/Agentic OS 自身、
  ツール=Claude Code/Codex/JimiVault Bridge/MulmoClaude/Obsidian Bases/Supabase/Vercel/GitHub、
  インサイト=seed.ts の2件を流用。`updated_at` 等は DB 側 default に任せる。

## B. 設定画面（OsSettingsApp.tsx）

- 「アカウント」カード追加: 新パスワード+確認入力 → `client.auth.updateUser({ password })`。
  8文字未満は送信前に弾く。成功/失敗メッセージ表示。以後は /os のパスワード欄でログイン可能になる旨を表示。

## C. OsApp.tsx の機能化（契約Aの関数を使う）

- **MissionControl**: activeプロジェクトの next_action 一覧に「完了」ボタン（status=completed）。
  全テーブル空のとき「初期データを投入」ボタン（seedInitialData→refreshData）。pending承認・openインサイト数はビュー遷移リンク。
- **ProjectHub**: 各カードに status/priority のインライン select、next_action の編集、完了ボタン。既存の新規作成は維持。
- **ToolRegistry**: ツール追加フォーム。各ツールに status select。Bridge/MulmoClaude 系ツールには「ヘルスチェック」
  ボタン（checkBridgeHealth/checkMulmoHealth の結果で status を connected/offline に更新し last_checked_at=now）。
  launch_url があれば「開く」リンク。
- **DreamInbox**: open なインサイトに 承認/却下/完了 ボタン。手動インサイト追加フォーム。
- **承認キュー**: pending の approval_requests に 承認/却下 ボタン（MissionControl 内の承認カードに配置）。
- **MemoryGalaxy**: 手動メモリー追加フォーム（title/summary/tags カンマ区切り）、manual 項目の削除ボタン、
  「Vaultから同期」ボタン（Bridge db/query 最新50件 → upsertVaultMemories → 挿入件数を表示 → refreshData）。
- seed フォールバック表示（source: "seed"）のときは書込ボタンを無効化し「Supabase未接続」を明示。
- 文体・スタイルは既存踏襲。static export 安全維持。lint+build 合格。

## 検証（E2E・実運転）

テストユーザーを admin API で作成し、ローカル dev（NEXT_PUBLIC_OS_OWNER_EMAIL=テストユーザー）で
パスワードログイン → 初期データ投入 → 各CRUD → Vault同期 → パスワード変更 を実ブラウザで通す。
検証後テストユーザーは削除（cascade で行も消える）。Jimi の本番データには触れない。
