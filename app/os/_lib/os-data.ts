import type { SupabaseClient } from "@supabase/supabase-js";
import {
  agentRunSchema,
  approvalRequestSchema,
  costEventSchema,
  insightSchema,
  memoryItemSchema,
  type OsData,
  type OsProject,
  projectSchema,
  toolSchema,
} from "./schemas";
import { createSeedData } from "./seed";

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

  for (const row of rows) {
    const result = parser.safeParse(row);
    if (result.success) {
      parsed.push(result.data);
    } else {
      diagnostics.push(`${label}: skipped an invalid row`);
    }
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

  if (diagnostics.length > 0) {
    return createSeedData(diagnostics);
  }

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
  const { error } = await client.from("projects").insert({
    owner_id: ownerId,
    name: project.name,
    domain: project.domain,
    priority: project.priority,
    status: "active",
    description: project.description,
    next_action: "次の具体アクションを設定する。",
  });

  if (error) {
    throw new Error(error.message);
  }
}
