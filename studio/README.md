# Studio（MulmoClaude 統合の入口）

説教・祈祷会奨励のノートから動画/スライドを生成するパイプラインの入口として、
receptron/mulmoclaude をローカルで動かすためのメモとラッパースクリプト。

**このディレクトリは MulmoClaude 本体を含まない。実インストール・実起動・API キーの
取得は行っていない。すべて Jimi の手動操作。**

## MulmoClaude とは

`receptron/mulmoclaude`（GitHub: https://github.com/receptron/mulmoclaude）は、
ローカルで動く AI アプリ基盤。データはプレーンファイルとして
`~/mulmoclaude/`（config / conversations / data / artifacts）に保存され、
クラウドの状態を持たない。

## 前提条件

- Node.js 20+
- Claude Code CLI（インストール・認証済み）
- ffmpeg（任意。動画生成に使う）
- Docker Desktop（任意。サンドボックス実行を推奨する場合）
- 画像生成・編集には `GEMINI_API_KEY` が必要

## 起動方法

```bash
./studio/start.sh
```

内部では `npx mulmoclaude@latest` を実行する。既定では `http://localhost:3001` で
開く（`yarn dev` によるソースからの開発起動は `http://localhost:5173`。今回は
`npx` 経由の起動のみを対象とする）。`PORT` / `GEMINI_API_KEY` を環境変数で
渡せるが、MulmoClaude が読むと公式に確認できているのは `GEMINI_API_KEY` のみ
（`PORT` は一般的な Node/Vite の慣習に沿った渡し方であり、MulmoClaude 側が
実際に読むかは未確認）。詳細は `start.sh` 内のコメントを参照。

## /os Tool Registry との関係

- `/os` の Tool Registry シード（`app/os/_lib/seed.ts`）に、category: app として
  `MulmoClaude`（launch_url: `http://127.0.0.1:3001`）を登録する契約になっている
  （`docs/agentic-os/OBSIDIAN_MULMO_EXTENSION.md` セクション2・4）。
- Local Bridge（`bridge/jimi-os-bridge.mjs`）に `GET /mulmo/health` を追加し、
  `/os` の Studio ビューがヘルスピルとして「起動しているか」を表示する契約
  （同ドキュメント セクション1）。
- このディレクトリ（`studio/`）はその契約の前提となる、Jimi がローカルで
  MulmoClaude を実際に起動するための手順書とラッパーのみを提供する。
  `/os` 側のコード変更（seed.ts・bridge・OsApp.tsx への追加）は本タスクの
  対象外（別タスク）。

## 生成物の還流手順（Jimi の手動操作）

MulmoClaude はクラウドに保存しないため、生成した動画・スライド・音声などの
成果物を後で使うには、Jimi が手動で以下のどちらかへコピーする。

1. **OS artifacts へ**: `/os` 側に artifacts 管理の仕組みがある場合はそこへ
   アップロード（本タスクでは `/os` 側の実装は行っていないため、現状は手元保存のみ）。
2. **Vault へ**: `~/mulmoclaude/artifacts/` から必要なファイルを
   `JimiVault/03_Resource/Studio/` へコピーする（このフォルダは Vault にまだ
   存在しない。初回コピー時に Jimi が作成する）。動画ファイルなど大きい
   バイナリを iCloud 同期の Vault に置く場合は、同期容量に注意する。

いずれも Claude Code がノートの中身から自動でパイプラインを起動する運用ではなく、
Jimi が MulmoClaude の画面上でノートを読み込み・生成し、生成物を確認してから
上記のいずれかへコピーする、という手動フローを前提にしている
（`docs/agentic-os/OBSIDIAN_MULMO_EXTENSION.md` の proposal-only 原則）。

## 参考

- MulmoClaude: https://github.com/receptron/mulmoclaude
- 契約文書: `docs/agentic-os/OBSIDIAN_MULMO_EXTENSION.md`（セクション2・4）
