import type { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import type { VaultDbRow } from "./bridge";
import { toErrorMessage } from "./format";
import {
  agentRunSchema,
  approvalRequestSchema,
  costEventSchema,
  insightSchema,
  memoryItemSchema,
  type OsData,
  type OsInsight,
  type OsMemoryItem,
  type OsProject,
  type OsTool,
  projectSchema,
  toolSchema,
} from "./schemas";
import { seedInsights } from "./seed";

// 12箇所の `if (error) throw new Error(error.message)` 重複の集約先。
function mustSucceed({ error }: { error: PostgrestError | null }): void {
  if (error) {
    throw new Error(toErrorMessage(error));
  }
}

type TableName =
  | "projects"
  | "tools"
  | "memory_items"
  | "insights"
  | "approval_requests"
  | "agent_runs"
  | "cost_events";

const tableSelects: Record<TableName, string> = {
  projects:
    "id,name,domain,status,priority,description,next_action,due_date,updated_at",
  tools: "id,name,category,status,provider,launch_url,notes,last_checked_at",
  memory_items:
    "id,title,source_type,source_path,summary,tags,strength,updated_at",
  insights:
    "id,title,category,priority,status,rationale,recommendation,created_at",
  approval_requests:
    "id,title,action_type,status,risk_level,requested_by,created_at",
  agent_runs:
    "id,title,status,builder_model,judge_model,score,created_at",
  cost_events:
    "id,provider,model,amount_usd,tokens_input,tokens_output,created_at",
};

const tableOrderColumns: Record<TableName, string> = {
  projects: "updated_at",
  tools: "last_checked_at",
  memory_items: "updated_at",
  insights: "created_at",
  approval_requests: "created_at",
  agent_runs: "created_at",
  cost_events: "created_at",
};

async function readTable(
  client: SupabaseClient,
  table: TableName,
  diagnostics: string[],
) {
  const { data, error } = await client
    .from(table)
    .select(tableSelects[table])
    .order(tableOrderColumns[table], { ascending: false, nullsFirst: false });

  if (error) {
    diagnostics.push(`${table}: ${error.message}`);
    return [];
  }

  return data ?? [];
}

function parseRows<T>(
  rows: unknown[],
  parser: { safeParse: (value: unknown) => { success: true; data: T } | { success: false } },
  diagnostics: string[],
  label: string,
) {
  const parsed: T[] = [];
  let invalidCount = 0;

  for (const row of rows) {
    const result = parser.safeParse(row);
    if (result.success) {
      parsed.push(result.data);
    } else {
      invalidCount += 1;
    }
  }

  if (invalidCount > 0) {
    diagnostics.push(`${label}: skipped ${invalidCount} invalid row(s)`);
  }

  return parsed;
}

export async function loadOsData(client: SupabaseClient): Promise<OsData> {
  const diagnostics: string[] = [];
  const [
    projects,
    tools,
    memoryItems,
    insights,
    approvals,
    agentRuns,
    costEvents,
  ] = await Promise.all([
    readTable(client, "projects", diagnostics),
    readTable(client, "tools", diagnostics),
    readTable(client, "memory_items", diagnostics),
    readTable(client, "insights", diagnostics),
    readTable(client, "approval_requests", diagnostics),
    readTable(client, "agent_runs", diagnostics),
    readTable(client, "cost_events", diagnostics),
  ]);

  // ponytail: no fallback to seed data here. Supabase接続時は決してシードに
  // 落ちない。読み込みに失敗したテーブルは readTable が空配列を返し
  // diagnostics に理由を積んでいるので、そのまま実データとして返す。
  // createSeedData は hasSupabaseConfig()===false の呼び出し側（OsApp）専用。
  return {
    projects: parseRows(projects, projectSchema, diagnostics, "projects"),
    tools: parseRows(tools, toolSchema, diagnostics, "tools"),
    memoryItems: parseRows(
      memoryItems,
      memoryItemSchema,
      diagnostics,
      "memory_items",
    ),
    insights: parseRows(insights, insightSchema, diagnostics, "insights"),
    approvals: parseRows(
      approvals,
      approvalRequestSchema,
      diagnostics,
      "approval_requests",
    ),
    agentRuns: parseRows(agentRuns, agentRunSchema, diagnostics, "agent_runs"),
    costEvents: parseRows(
      costEvents,
      costEventSchema,
      diagnostics,
      "cost_events",
    ),
    diagnostics,
    source: "supabase",
  };
}

export async function createProject(
  client: SupabaseClient,
  ownerId: string,
  project: Pick<OsProject, "name" | "domain" | "priority" | "description">,
) {
  mustSucceed(
    await client.from("projects").insert({
      owner_id: ownerId,
      name: project.name,
      domain: project.domain,
      priority: project.priority,
      status: "active",
      description: project.description,
      next_action: "次の具体アクションを設定する。",
    }),
  );
}

export async function updateProject(
  client: SupabaseClient,
  id: string,
  patch: Partial<
    Pick<
      OsProject,
      | "name"
      | "domain"
      | "status"
      | "priority"
      | "description"
      | "next_action"
      | "due_date"
    >
  >,
): Promise<void> {
  mustSucceed(await client.from("projects").update(patch).eq("id", id));
}

export async function createTool(
  client: SupabaseClient,
  ownerId: string,
  tool: Pick<
    OsTool,
    "name" | "category" | "status" | "provider" | "launch_url" | "notes"
  >,
): Promise<void> {
  mustSucceed(
    await client.from("tools").insert({ owner_id: ownerId, ...tool }),
  );
}

export async function updateTool(
  client: SupabaseClient,
  id: string,
  patch: Partial<
    Pick<
      OsTool,
      | "name"
      | "category"
      | "status"
      | "provider"
      | "launch_url"
      | "notes"
      | "last_checked_at"
    >
  >,
): Promise<void> {
  mustSucceed(await client.from("tools").update(patch).eq("id", id));
}

export async function createInsight(
  client: SupabaseClient,
  ownerId: string,
  insight: Pick<
    OsInsight,
    "title" | "category" | "priority" | "rationale" | "recommendation"
  >,
): Promise<void> {
  mustSucceed(
    await client.from("insights").insert({ owner_id: ownerId, ...insight }),
  );
}

export async function updateInsightStatus(
  client: SupabaseClient,
  id: string,
  status: OsInsight["status"],
): Promise<void> {
  mustSucceed(
    await client.from("insights").update({ status }).eq("id", id),
  );
}

export async function updateApprovalStatus(
  client: SupabaseClient,
  id: string,
  status: "approved" | "rejected",
  note?: string,
): Promise<void> {
  mustSucceed(
    await client
      .from("approval_requests")
      .update({
        status,
        decision_note: note ?? null,
        decided_at: new Date().toISOString(),
      })
      .eq("id", id),
  );
}

export async function createMemoryItem(
  client: SupabaseClient,
  ownerId: string,
  item: Pick<
    OsMemoryItem,
    "title" | "source_type" | "source_path" | "summary" | "tags"
  >,
): Promise<void> {
  mustSucceed(
    await client.from("memory_items").insert({ owner_id: ownerId, ...item }),
  );
}

export async function deleteMemoryItem(
  client: SupabaseClient,
  id: string,
): Promise<void> {
  mustSucceed(await client.from("memory_items").delete().eq("id", id));
}

// ponytail: frontmatter values follow Jimi's convention of single-element
// arrays (e.g. `title: ["詩篇44篇"]`); take the first string, ignore nested maps.
function firstVaultString(value: unknown): string | undefined {
  if (Array.isArray(value)) {
    const first = value[0];
    return typeof first === "string" ? first : undefined;
  }
  return typeof value === "string" ? value : undefined;
}

function normalizeVaultTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((tag): tag is string => typeof tag === "string");
  }
  return typeof value === "string" ? [value] : [];
}

export async function upsertVaultMemories(
  client: SupabaseClient,
  ownerId: string,
  rows: VaultDbRow[],
): Promise<number> {
  if (rows.length === 0) {
    return 0;
  }

  // ponytail: let the DB's own unique index decide duplicates (rung 4 —
  // native constraint over app-side select+filter). Requires the NON-partial
  // unique index from 202607080002_vault_memory_unique_fix.sql: a partial index
  // cannot be inferred by ON CONFLICT (owner_id, source_path).
  const result = await client.from("memory_items").upsert(
    rows.map((row) => ({
      owner_id: ownerId,
      title: firstVaultString(row.properties.title) ?? row.name,
      source_type: "vault" as const,
      source_path: row.path,
      summary: null,
      tags: normalizeVaultTags(row.properties.tags),
      strength: 60, // ponytail: fixed default, replace with recency/relevance scoring if it matters later
    })),
    { onConflict: "owner_id,source_path", ignoreDuplicates: true, count: "exact" },
  );

  mustSucceed(result);

  return result.count ?? 0;
}

async function isTableEmpty(
  client: SupabaseClient,
  table: "projects" | "tools" | "insights",
): Promise<boolean> {
  const result = await client
    .from(table)
    .select("id", { count: "exact", head: true });

  mustSucceed(result);

  return (result.count ?? 0) === 0;
}

const initialProjects: Array<
  Pick<
    OsProject,
    "name" | "domain" | "status" | "priority" | "description" | "next_action"
  >
> = [
  {
    name: "説教準備 / Exegesis Flow",
    domain: "pastoral",
    status: "active",
    priority: "high",
    description:
      "釈義→骨子→原稿→推敲の説教準備フロー。JimiVaultと連動する中核ワークフロー。",
    next_action: "次の講解テキストの釈義ノートを作成する。",
  },
  {
    name: "Keryx Next",
    domain: "development",
    status: "active",
    priority: "high",
    description: "説教管理SaaS。5段階ステージの準備管理。",
    next_action: "Gate Bの実利用フィードバックをプロダクトへ反映する。",
  },
  {
    name: "Semeron",
    domain: "development",
    status: "active",
    priority: "medium",
    description: "教会専用デボーション・祈りリズムPWA。",
    next_action: "デボーション配信フローの実運用テストを行う。",
  },
  {
    name: "Synaxis",
    domain: "development",
    status: "active",
    priority: "medium",
    description: "教会礼拝出席・昼食管理のマルチテナントSaaS。",
    next_action: "テナント分離のRLS監査を完了する。",
  },
  {
    name: "Aster Support Navi",
    domain: "business",
    status: "active",
    priority: "medium",
    description: "支援制度検索SaaS（SEO-first）。副業プロダクト群の一つ。",
    next_action: "検索流入の初期指標を計測する。",
  },
  {
    name: "Agentic OS",
    domain: "personal",
    status: "active",
    priority: "medium",
    description:
      "この統括OS自身。Command Centerとして各プロジェクト・記憶・承認を一画面に集約する。",
    next_action: "Vault DBとMulmoClaude Studioの統合を完成させる。",
  },
];

const initialTools: Array<
  Pick<
    OsTool,
    "name" | "category" | "status" | "provider" | "launch_url" | "notes"
  >
> = [
  {
    name: "Claude Code",
    category: "ai",
    status: "manual",
    provider: "Anthropic",
    launch_url: null,
    notes: "釈義・実装・Vault文脈の主担当。外部実行は承認制。",
  },
  {
    name: "Codex",
    category: "ai",
    status: "connected",
    provider: "OpenAI",
    launch_url: null,
    notes: "第二の視点・独立レビュー担当。",
  },
  {
    name: "JimiVault Bridge",
    category: "memory",
    status: "planned",
    provider: "Obsidian",
    launch_url: null,
    notes: "JimiVaultをローカル読み取りで接続。重要データは除外。",
  },
  {
    name: "MulmoClaude",
    category: "automation",
    status: "planned",
    provider: "receptron",
    launch_url: "http://127.0.0.1:3001",
    notes: "説教・奨励ノートを動画/スライド化するローカルStudio。",
  },
  {
    name: "Obsidian Bases",
    category: "infra",
    status: "planned",
    provider: "Obsidian",
    launch_url: null,
    notes: "frontmatterをNotion型DBとして扱うVaultネイティブ機能。",
  },
  {
    name: "Supabase",
    category: "infra",
    status: "connected",
    provider: "Supabase",
    launch_url: "https://supabase.com/dashboard",
    notes: "Agentic OSのデータ基盤。",
  },
  {
    name: "Vercel",
    category: "infra",
    status: "connected",
    provider: "Vercel",
    launch_url: "https://vercel.com/dashboard",
    notes: "ポートフォリオ・各プロダクトのホスティング。",
  },
  {
    name: "GitHub",
    category: "infra",
    status: "connected",
    provider: "GitHub",
    launch_url: "https://github.com",
    notes: "ソース管理とCI。",
  },
];

export async function seedInitialData(
  client: SupabaseClient,
  ownerId: string,
): Promise<void> {
  if (await isTableEmpty(client, "projects")) {
    mustSucceed(
      await client
        .from("projects")
        .insert(
          initialProjects.map((project) => ({ owner_id: ownerId, ...project })),
        ),
    );
  }

  if (await isTableEmpty(client, "tools")) {
    mustSucceed(
      await client
        .from("tools")
        .insert(initialTools.map((tool) => ({ owner_id: ownerId, ...tool }))),
    );
  }

  if (await isTableEmpty(client, "insights")) {
    mustSucceed(
      await client.from("insights").insert(
        seedInsights.map((insight) => ({
          owner_id: ownerId,
          title: insight.title,
          category: insight.category,
          priority: insight.priority,
          status: insight.status,
          rationale: insight.rationale,
          recommendation: insight.recommendation,
        })),
      ),
    );
  }
}
