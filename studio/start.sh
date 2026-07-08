#!/usr/bin/env bash
# MulmoClaude 起動ラッパ。詳細は studio/README.md 参照。
# 実インストール・実起動は Jimi の手動操作前提（fable-guard: 外向き/ローカル実行は無人実行しない）。
set -euo pipefail

if [ -z "${GEMINI_API_KEY:-}" ]; then
  echo "[warn] GEMINI_API_KEY が未設定です。画像生成・編集機能は使えません。続行します。" >&2
fi

# ponytail: MulmoClaude が PORT env を実際に読むかは未確認（README参照）。
# 一般的なNode/Vite慣習に沿ってexportするだけで、独自のポート解決ロジックは書かない。
if [ -z "${PORT:-}" ]; then
  echo "[info] PORT が未設定のため既定値 3001 を使用します。" >&2
else
  export PORT
fi

exec npx mulmoclaude@latest
