# Vault DB（Obsidian Bases 提案物）

JimiVault の frontmatter を Notion 風データベース（テーブルビュー）として表示するための
`.base` ファイル。**このディレクトリの内容は Vault にはまだ反映されていない。**
Vault への直接書込は禁止されているため、Jimi が手動でコピーして導入する。

## 導入手順

1. Obsidian のコアプラグイン「Bases」を有効化する（JimiVault では有効化済み・
   `.base` ファイル0件を確認済み＝今回が最初の導入）。
2. Vault 内に `00_Home/DB/` フォルダを作成する（未作成。Jimi の操作）。
3. このディレクトリの4つの `.base` ファイルを `00_Home/DB/` にコピーする。
4. Obsidian でコピーした `.base` ファイルを開く（Bases ビューとして描画される）。

コピー元はこのリポジトリ、コピー先は
`~/Library/Mobile Documents/iCloud~md~obsidian/Documents/JimiVault/00_Home/DB/`。

## 各 .base の説明

| ファイル | 対象フォルダ（`file.inFolder()`） |
|---|---|
| `日曜説教.base` | `01_Project/説教/日曜説教` |
| `祈祷会奨励.base` | `01_Project/説教/祈祷会奨励` |
| `釈義ノート.base` | `03_Resource/釈義ノート` |
| `プロジェクト.base` | `01_Project`（サブフォルダを含む。説教関連ノートも含まれる） |

各 `.base` は以下を持つ：

- フォルダフィルタ：`filters.and` に `file.inFolder("...")` を1件。
- テーブルビュー1つ：列は `file.name` / `note.title` / `note.tags` /
  `note["creation date"]`（この順）。
- `sort: [{ property: file.mtime, direction: DESC }]` による更新日降順ソート。

### ソートキーについて（file.mtime を選んだ理由）

views 内の `sort` キー（`sort: [{property, direction}]`）は公式構文ページの例には
載っていないが、Obsidian 本体が Sort メニューの設定を .base に永続化する際に使う
実在の構文（obsidian-help リポジトリ・コミュニティガイドで確認済み）。
`groupBy` はグループヘッダ行を作る別機能のため、純粋な降順ソートには `sort` を使う。
もし手元の Obsidian バージョンで効かない場合は、テーブルの Sort メニューから一度
並び替えれば正しい構文が自動で書き込まれる。
`note["last modif date"]`（frontmatter の手動入力）ではなく `file.mtime`
（ファイルシステムの実際の更新時刻・自動更新）を選んだのは、「更新日」の実体に忠実で
かつ入力し忘れの影響を受けないため。Obsidian の Bases UI 上でも列ヘッダをクリックして
対話的にソートし直せる（この場合ファイルの内容は変わらない）。

## プロパティ規約（CLAUDE.md §5 準拠）

実 Vault のサンプルファイルで確認した frontmatter プロパティ名（詳細は本タスクの完了報告を参照）：

- `title`（リスト。例: `title:\n  - 詩篇32篇`）
- `creation date`（リスト、`YYYY-MM-DD` または `YYYY-MM-DD HH:mm`）
- `last modif date`（リスト。同上形式）
- `aliases`（リスト。ごく一部の古い Scrivener 取り込みノートは単数形 `alias` や `topic` を使うが、
  CLAUDE.md §5 の標準形式は `aliases`）
- `tags`（リスト）

`.base` からプロパティ名にスペースを含むものを参照するときは、公式構文の
ブラケット記法 `note["creation date"]` を使う（`note.creation date` は不可）。

## 参考（公式ドキュメント）

- 構文リファレンス: https://help.obsidian.md/bases/syntax
- 関数リファレンス: https://help.obsidian.md/bases/functions
