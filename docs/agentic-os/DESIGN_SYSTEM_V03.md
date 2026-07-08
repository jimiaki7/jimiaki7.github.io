# v0.3 契約: デザインシステム / ダークモード / リファクタ

Last updated: 2026-07-08
Author: 統括（Opus 4.8）。実装は下位モデルへ委譲。**この文書が唯一の正典。名前・シグネチャを1文字も変えないこと。**

Jimi の決定: (1) ダークモードは**サイト全体**（公開ポートフォリオ含む） (2) **手動トグル＋OS設定を初期値**、localStorage永続、FOUC防止 (3) リファクタは**UIデザイン刷新まで**。

---

## 0. 一次資料で確定した実装作法（推測禁止・この通りに書く）

- **FOUC防止**: `node_modules/next/dist/docs/01-app/02-guides/preventing-flash-before-hydration.md` の公式パターン。`<html data-theme="light" suppressHydrationWarning>` ＋ `<head>` 内に生の `<script dangerouslySetInnerHTML>`。`next/script` の `beforeInteractive` は**使わない**（同ガイドが生scriptを使用）。
- **Tailwind v4 の dark variant**（tailwind.config は存在しない。CSS-first）: 公式ドキュメント（tailwindlabs/tailwindcss.com `dark-mode.mdx`）より
  ```css
  @custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));
  ```
- static export で `window`/`localStorage` はプリレンダ時に無い。テーマ script はブラウザ実行なので矛盾しない（`static-exports.md` L255）。

## 1. テーマ状態機械

- localStorage キー: `"theme"`。値は `"light" | "dark" | "system"`。未設定＝`"system"`。
- 解決: `resolved = theme === "system" ? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") : theme`
- `document.documentElement.setAttribute("data-theme", resolved)` を**ペイント前**に実行。
- `theme === "system"` のとき matchMedia の `change` を購読して追従する。
- トグルは3状態（Light → Dark → System → Light）。アイコン: Sun / Moon / Monitor（lucide、既存依存）。`aria-label` 必須、現在値を `title` と視覚的に判別可能に。

`app/layout.tsx` の head script（この内容で固定）:
```js
(function(){try{var s=localStorage.getItem("theme")||"system";var d=s==="dark"||(s==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.setAttribute("data-theme",d?"dark":"light")}catch(e){}})()
```

## 2. トークン（globals.css）

**二層構造**: セマンティックトークンを正とし、既存名（`--bg-primary` 等）は**後方互換エイリアスとして残す**（公開サイトのコンポーネントを壊さないため）。

`:root`（ライト。既存のブランド色を維持）と `[data-theme="dark"]` の両方で以下を**必ず全て定義**する。

| トークン | 用途 | light | dark |
|---|---|---|---|
| `--bg-primary` | ページ背景 | `#fbfbfa` | `#0f1113` |
| `--bg-secondary` | 沈んだ面・inset | `#f2f4f3` | `#171a1e` |
| `--bg-card` | カード面 | `#ffffff` | `#1b1f24` |
| `--bg-elevated` | ヘッダー・オーバーレイ面 | `#0d1b2a` | `#22262c` |
| `--text-on-elevated` | 上記の上の文字 | `#f5f6f7` | `#e8eaed` |
| `--text-primary` | 本文 | `#0d1b2a` | `#e8eaed` |
| `--text-secondary` | 補助文 | `#53606f` | `#a7b0ba` |
| `--text-muted` | さらに弱い | `#6b7785` | `#8b949e` |
| `--border` | 通常境界 | `#dde2e4` | `#2b3138` |
| `--border-strong` | 強調境界・フォーカス下地 | `#c3cbd0` | `#3c444d` |
| `--accent` | ブランド金 | `#b7791f` | `#d9a441` |
| `--accent-fg` | accent面の上の文字 | `#ffffff` | `#1a1205` |
| `--accent-soft` | accentの淡い面 | `color-mix(in srgb, var(--accent) 10%, transparent)` | 同左 |
| `--success` | 成功 | `#16784a` | `#3fb27f` |
| `--warning` | 警告 | `#8a5a00` | `#e3b341` |
| `--danger` | エラー | `#b42318` | `#ff7b72`（`#f85149` は danger-soft 地で 4.43:1 と AA 未達のため引き上げ） |
| `--info` | 情報・選択中 | `#1f6feb` | `#58a6ff` |
| `--success-soft` / `--warning-soft` / `--danger-soft` / `--info-soft` | 淡い面 | `color-mix(in srgb, var(--X) 10%, transparent)` | 同左 |
| `--shadow-color` | 影 | `rgba(13,27,42,0.35)` | `rgba(0,0,0,0.6)` |
| `--overlay` | モーダル背景 | `rgba(13,27,42,0.5)` | `rgba(0,0,0,0.65)` |
| `--focus-ring` | フォーカス輪 | `var(--accent)` | `var(--accent)` |

後方互換エイリアス（削除禁止）: `--accent-green: var(--success);`

**必須の付随処理**:
- `:root { color-scheme: light; }` / `[data-theme="dark"] { color-scheme: dark; }`（ネイティブの select・scrollbar・input を追従させる）
- `.btn-primary`: `--btn-primary-bg` / `--btn-primary-fg` の2トークンで切り替える。
  **ライトは紺地に白文字（`var(--text-primary)` / `#ffffff`、17.4:1）＝公開サイトのブランドを維持**。
  ダークのみ `var(--accent)` 地に `var(--accent-fg)`（8.3:1）。
  ⚠ 当初案の「両テーマとも accent 地に白文字」は、ライトで金地＋白文字＝**3.66:1 で AA 不合格**かつ公開CTAの色が変わるため棄却した。
- `.btn-secondary` の `rgba(255,255,255,0.62)` → `var(--bg-card)`。hover は `background: var(--accent-soft)`。
- `.card` の影 → `box-shadow: 0 18px 45px -38px var(--shadow-color)`。
- `.card` の `translateY(-2px)` hover lift は**公開サイトのみ**。OS 用に `.os-card`（lift無し・`border-color` のみ変化）を追加する。
- `@media (prefers-reduced-motion: reduce)` で transform/transition を無効化。
- `:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }` をグローバルに。

**ハードコード色の置換（全廃）**:
| 現在 | 置換先 |
|---|---|
| `#f85149`（OsApp 20, OsSettingsApp 3） | `var(--danger)` |
| `#d29922`（OsApp 3） | `var(--warning)` |
| `rgba(88,166,255,*)`（OsApp 5） | `var(--info)` / `var(--info-soft)` |
| `rgba(13,17,23,0.86)`（OsApp ヘッダー） | `var(--bg-elevated)` ＋ 文字は `var(--text-on-elevated)` |
| `rgba(248,81,73,*)` / `rgba(22,120,74,*)` バナー | `var(--danger-soft)` / `var(--success-soft)` ＋ border は `color-mix(... 35%, transparent)` |
| `globals.css:66 #ffffff` | `var(--accent-fg)` |
| `globals.css:84 rgba(255,255,255,.62)` | `var(--bg-card)` |
| `globals.css:93 rgba(183,121,31,.08)` | `var(--accent-soft)` |
| `Nav.tsx:14 rgba(250,250,248,0.9)` | `color-mix(in srgb, var(--bg-primary) 90%, transparent)` |

**既存バグ（公開サイト・要修正）**: `app/components/Works.tsx:175` の `` background: `${p.statusColor}18` `` は `p.statusColor` が `var(--accent-green)` 等の CSS 変数参照のため `var(--accent-green)18` という**無効CSS**を生成している。`background: color-mix(in srgb, ${p.statusColor} 10%, transparent)` に修正する。

## 3. 目標ファイル構成（app/os/）

```
_lib/            (既存。中身のみ修正)
  config.ts  supabase.ts  schemas.ts  seed.ts  format.ts  bridge.ts  os-data.ts
_hooks/          (新設)
  useOsSession.ts   useOsData.ts   useBridge.ts   useAsyncAction.ts
_components/
  OsApp.tsx                      ← シェル＋ルーティングのみ。300行以内。
  auth/AuthFrame.tsx  auth/LoginState.tsx  auth/SetupState.tsx  auth/UnauthorizedState.tsx
  ui/SectionHeader.tsx  ui/MetricCard.tsx  ui/StatusBadge.tsx  ui/ConnectionPill.tsx
  ui/SystemTile.tsx  ui/CompactItem.tsx  ui/Notice.tsx  ui/ErrorText.tsx
  ui/Field.tsx  ui/Select.tsx  ui/EmptyState.tsx  ui/ThemeToggle.tsx(再export)
  cards/FocusRow.tsx  cards/ApprovalCard.tsx  cards/ProjectCard.tsx
  cards/ToolCard.tsx  cards/MemoryCard.tsx  cards/InsightCard.tsx
  views/MissionControl.tsx  views/MemoryGalaxy.tsx  views/ProjectHub.tsx
  views/ToolRegistry.tsx  views/VaultDb.tsx  views/Studio.tsx
  views/DreamInbox.tsx  views/AgentRuns.tsx
```
共有トグル本体は `app/components/ThemeToggle.tsx`（公開 Nav と OS ヘッダーの両方から使う。`"use client"`）。

## 4. フック契約（シグネチャ厳守）

```ts
// _hooks/useAsyncAction.ts — 8箇所の try/catch/busy/error 重複を置換
type AsyncAction = { run: (fn: () => Promise<void>) => Promise<void>; busy: boolean; error: string | null; clearError: () => void };
export function useAsyncAction(onSuccess?: () => void | Promise<void>): AsyncAction;
// run(): busy=true → fn() → 成功なら error=null と onSuccess() → 失敗なら error=toErrorMessage(e) → finally busy=false

// _hooks/useOsSession.ts — 認証・クライアント・ユーザー
type OsSession = { phase: "checking" | "setup" | "signedOut" | "unauthorized" | "ready"; client: SupabaseClient | null; user: User | null; email: string | null; signOut: () => Promise<void> };
export function useOsSession(): OsSession;

// _hooks/useOsData.ts
type OsDataState = { data: OsData; loading: boolean; refresh: () => Promise<void> };
export function useOsData(client: SupabaseClient | null, enabled: boolean): OsDataState;

// _hooks/useBridge.ts — ヘルスポーリングを一元化（ToolCard の独立ポーリングを廃止）
type BridgeState = { settings: BridgeSettings; health: BridgeHealth; mulmo: MulmoHealth | null; recheck: () => Promise<void> };
export function useBridge(): BridgeState;

// _lib/format.ts に追加
export function toErrorMessage(error: unknown, fallback?: string): string;
```

`setTimeout(fn, 0)` の lint 回避ハックは**全廃**する。React の推奨に従い、effect 内では直接 setState せず、`useEffect` 内の非同期関数の完了時に setState する（マウントフラグで解除）。lint ルール `react-hooks/set-state-in-effect` を無効化コメントで黙らせることは**禁止**。

## 5. データ層の修正（app/os/_lib/）

1. **`loadOsData` の致命的な誤り（最優先）**: 現在は診断メッセージが1件でもあると**全体をシードのダミーデータに差し替える**。修正後の仕様:
   - Supabase に接続していて認証済みなら、**決してシードへフォールバックしない**。取得できたテーブルは実データ、失敗したテーブルは空配列とし、`diagnostics` に理由を積んで `source: "supabase"` を維持する。UI は診断があれば警告バナーを出す（`ui/Notice.tsx`）。
   - `createSeedData` は「Supabase 未設定のプレビュー」専用（`hasSupabaseConfig() === false`）。
2. `parseRows` が zod で落とした行数を `diagnostics` に記録する（黙って捨てない）。
3. `upsertVaultMemories`: ユニークインデックスを追加し、`insert` を `upsert(..., { onConflict: "owner_id,source_path", ignoreDuplicates: true })` にする。
   - migration: `202607080001_vault_memory_unique.sql` → **`202607080002_vault_memory_unique_fix.sql` で訂正済み**。
   - ⚠ **確定した教訓**: 当初の設計（`where source_type='vault' and source_path is not null` 付きの**部分**ユニークインデックス）は誤り。
     PostgreSQL の `INSERT ... ON CONFLICT (owner_id, source_path)` は述語付きインデックスを推論できず、PostgREST(supabase-js)から
     conflict_target に WHERE を渡す手段も無い。本番で `42P10 there is no unique or exclusion constraint matching the ON CONFLICT
     specification` となり Vault 同期が常に失敗した（E2Eで検出。ユニットテストでもビルドでも検出不能）。
     正解は**述語なし**の `create unique index ... on public.memory_items (owner_id, source_path);`
     （`source_path IS NULL` の手動メモは Postgres 既定の NULLS DISTINCT により衝突しない）。
   - **本番適用は統括が行う**（dry-run → 適用 → SQL 実体確認）。
4. `bridge.ts`: 4つの fetch 応答を **zod で検証**（`zod` は既存依存）。検証失敗はエラーとして扱う。Bridge はローカルプロセスとはいえ信頼境界の外。
5. 12個のミューテーション関数の `if (error) throw new Error(error.message)` は内部ヘルパ `mustSucceed(result)` に集約。

## 6. UI 刷新の方針（デザイン）

- 情報密度を上げつつ落ち着いた「司令室」。ブランドの金 `--accent` はアクセントに限定（面には `--accent-soft`）。
- ステータスは**色だけに依存しない**（必ずテキストまたはアイコンを伴う）。a11y 監査の HIGH 指摘に対応。
- サイドバー: `<nav>` 内の現在項目に `aria-current="page"`。モバイル `<select>` に可視ラベルか `aria-label`。
- 全ての `<select>` / `<input>` に `<label>`（または `aria-label`）。
- 非同期の成功・失敗メッセージは `role="status"`（成功）/ `role="alert"`（失敗）で `aria-live`。
- アイコンのみのボタンは `aria-label` 必須（例: 削除 → `aria-label="このメモリーを削除"`）。
- `window.confirm()` を廃止し、カード内のインライン確認（「削除しますか？ [削除] [やめる]」）に置換。
- KPI タイル・カード・テーブルは light/dark 双方で**コントラスト比 4.5:1 以上**（本文）、3:1 以上（大文字・UI境界）。

## 7. 回帰テスト（依存追加なし）

`bridge/jimi-os-bridge.mjs` に**名前付き export を追加**し、CLI 実行は維持する（`import.meta.url` と `process.argv[1]` の比較でサーバー起動をガードする。**import しただけでサーバーが起動してはならない**）。

`bridge/jimi-os-bridge.test.mjs` を新設し、`node --test` で実行:
- `isExcluded`: **NFD 正規化された `重要データ.md`（実 macOS のファイル名）を必ず除外する**ケースを含める（2026-07-08 の実バグの再発防止）。NFC 版・NFD 版の両方を assert。
- `parseFrontmatter`: スカラー / インライン配列 / ブロックリスト / frontmatter 無し / 壊れた frontmatter。
- `matchesWhereClause`: `eq`/`neq`/`contains`/`exists` × 配列プロパティ・文字列プロパティ。
- `safeResolve`: `..` によるトラバーサル拒否、vault 外への脱出拒否。
- `sortValueFor` / `unquoteScalar` / `parseInlineArray`。

`package.json` に `"test": "node --test bridge/"` を追加。

## 8. 完了条件（全て満たすこと）

- `npm run lint` exit 0 / `npm run build` exit 0・全ルート Static / `npm test` 全緑
- OsApp.tsx が 300行以内。`grep -c "#f85149\|#d29922\|rgba(88, *166" app/os/_components/*.tsx` が 0
- ライト・ダーク両方のスクリーンショットで、公開トップ・/os 全8ビュー・/os/settings が破綻しない
- 公開ページ（`/`・`/tokushoho`）の**ライト時の見た目が現状と同一**（ブランド維持。Works の無効CSS修正を除く）
- 既存の振る舞い（CRUD・Vault同期・パスワード設定・Bridge健全性）が E2E で全て動作
