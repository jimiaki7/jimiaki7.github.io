import type {
  OsAgentRun,
  OsApprovalRequest,
  OsCostEvent,
  OsData,
  OsInsight,
  OsMemoryItem,
  OsProject,
  OsTool,
} from "./schemas";

export const seedProjects: OsProject[] = [
  {
    id: "seed-sermon",
    name: "説教準備 / Exegesis Flow",
    domain: "pastoral",
    status: "active",
    priority: "high",
    description: "釈義、骨子、原稿、祈祷会奨励をVaultとKeryxに接続する中核ワークフロー。",
    next_action: "次の講解テキストに紐づく釈義ノートをMemory Galaxyへ同期する。",
    due_date: null,
    updated_at: "2026-06-29",
  },
  {
    id: "seed-keryx",
    name: "Keryx Next",
    domain: "development",
    status: "active",
    priority: "high",
    description: "牧師向け説教管理SaaS。AI提案は承認制で扱う。",
    next_action: "Gate Bの実利用観察からOSに取り込む指標を定義する。",
    due_date: null,
    updated_at: "2026-06-13",
  },
  {
    id: "seed-aster",
    name: "Aster Works",
    domain: "business",
    status: "waiting",
    priority: "medium",
    description: "副業プロダクト群。AsterGuardMCPとBusiness Naviを収益導線へ接続する。",
    next_action: "実験プロダクトごとの次アクションをOSで一画面化する。",
    due_date: null,
    updated_at: "2026-06-13",
  },
];

export const seedTools: OsTool[] = [
  {
    id: "seed-claude",
    name: "Claude Code",
    category: "ai",
    status: "manual",
    provider: "Anthropic",
    launch_url: null,
    notes: "釈義、実装、Vault文脈の主担当。外部実行は承認制。",
    last_checked_at: null,
  },
  {
    id: "seed-codex",
    name: "Codex",
    category: "ai",
    status: "connected",
    provider: "OpenAI",
    launch_url: null,
    notes: "このポートフォリオ実装と検証を担当。",
    last_checked_at: "2026-06-29",
  },
  {
    id: "seed-vault",
    name: "JimiVault Local Bridge",
    category: "memory",
    status: "planned",
    provider: "Obsidian",
    launch_url: null,
    notes: "JimiVaultをローカル読み取りで接続。重要データは除外。",
    last_checked_at: null,
  },
  {
    id: "seed-llm",
    name: "AI CLI via llm",
    category: "ai",
    status: "manual",
    provider: "OpenAI / Gemini",
    launch_url: null,
    notes: "Vault同期されたllm設定を通じてChatGPT/Geminiを呼び分ける。",
    last_checked_at: null,
  },
  {
    id: "seed-mulmoclaude",
    name: "MulmoClaude",
    category: "automation",
    status: "planned",
    provider: "receptron",
    launch_url: "http://127.0.0.1:3001",
    notes: "説教・奨励ノートをMulmoScript経由で動画/スライド化するローカルStudio。",
    last_checked_at: null,
  },
  {
    id: "seed-obsidian-bases",
    name: "Obsidian Bases",
    category: "infra",
    status: "planned",
    provider: "Obsidian",
    launch_url: null,
    notes: "frontmatterをNotion型DBとして扱うVaultネイティブ機能。提案物はvault-bases/に配置。",
    last_checked_at: null,
  },
];

export const seedMemoryItems: OsMemoryItem[] = [
  {
    id: "seed-home",
    title: "00 Home / PARA",
    source_type: "vault",
    source_path: "00_Home/00 Home.md",
    summary: "JimiVaultはPARAで管理。説教、PKM、開発、Aster Worksへの入口。",
    tags: ["PARA", "PKM", "Vault"],
    strength: 94,
    updated_at: "2026-06-01",
  },
  {
    id: "seed-keryx-memory",
    title: "Keryx アプリ構造と仕様",
    source_type: "vault",
    source_path: "03_Resource/開発/Keryx/Keryx_アプリ構造と仕様.md",
    summary: "Keryx Nextのプロダクト原則、Supabase構成、AI承認制の土台。",
    tags: ["Keryx", "Supabase", "SaaS"],
    strength: 90,
    updated_at: "2026-06-13",
  },
  {
    id: "seed-asterguard-memory",
    title: "Aster Guard MCP",
    source_type: "vault",
    source_path: "03_Resource/開発/AsterGuardMCP.md",
    summary: "MCP接続前の安全診断ツール。OSのセキュリティ思想にも接続。",
    tags: ["MCP", "Security", "Aster Works"],
    strength: 88,
    updated_at: "2026-06-13",
  },
];

export const seedInsights: OsInsight[] = [
  {
    id: "seed-dream-1",
    title: "Vault検索をOSの最初の実用価値にする",
    category: "opportunity",
    priority: "high",
    status: "open",
    rationale: "動画3本とも、共有メモリーがAgentic OSの核として扱われていた。",
    recommendation: "Local Bridgeを先に完成させ、JimiVaultの検索・要約・同期を日常導線に置く。",
    created_at: "2026-06-29",
  },
  {
    id: "seed-dream-2",
    title: "AI実行は承認制のまま始める",
    category: "risk",
    priority: "medium",
    status: "open",
    rationale: "説教、Vault、外部投稿は誤実行の損害が大きい。",
    recommendation: "Phase 5までは提案と記録を中心にし、外部アクションはapproval_requestsを必須にする。",
    created_at: "2026-06-29",
  },
];

export const seedApprovals: OsApprovalRequest[] = [
  {
    id: "seed-approval-1",
    title: "Vaultへの自動書き込みを有効化する前の承認",
    action_type: "vault_write",
    status: "pending",
    risk_level: "high",
    requested_by: "Local Bridge",
    created_at: "2026-06-29",
  },
];

export const seedAgentRuns: OsAgentRun[] = [
  {
    id: "seed-run-1",
    title: "Agentic OS initial planning pass",
    status: "completed",
    builder_model: "Codex",
    judge_model: "Human approval",
    score: 92,
    created_at: "2026-06-29",
  },
];

export const seedCostEvents: OsCostEvent[] = [
  {
    id: "seed-cost-1",
    provider: "manual",
    model: "subscription estimate",
    amount_usd: 0,
    tokens_input: 0,
    tokens_output: 0,
    created_at: "2026-06-29",
  },
];

export function createSeedData(diagnostics: string[] = []): OsData {
  return {
    projects: seedProjects,
    tools: seedTools,
    memoryItems: seedMemoryItems,
    insights: seedInsights,
    approvals: seedApprovals,
    agentRuns: seedAgentRuns,
    costEvents: seedCostEvents,
    diagnostics,
    source: "seed",
  };
}
