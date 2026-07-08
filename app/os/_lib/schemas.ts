import { z } from "zod";

const text = z.string().trim();
const nullableText = z.string().nullable().optional();
const numberLike = z.number().nullable().optional();

export const projectSchema = z.object({
  id: z.string(),
  name: text,
  domain: z.enum(["pastoral", "development", "business", "personal"]),
  status: z.enum(["active", "waiting", "paused", "completed"]),
  priority: z.enum(["high", "medium", "low"]),
  description: nullableText,
  next_action: nullableText,
  due_date: nullableText,
  updated_at: nullableText,
});

export const toolSchema = z.object({
  id: z.string(),
  name: text,
  category: z.enum(["ai", "memory", "project", "automation", "infra"]),
  status: z.enum(["connected", "manual", "offline", "planned"]),
  provider: nullableText,
  launch_url: nullableText,
  notes: nullableText,
  last_checked_at: nullableText,
});

export const memoryItemSchema = z.object({
  id: z.string(),
  title: text,
  source_type: z.enum(["vault", "ai_chat", "artifact", "manual"]),
  source_path: nullableText,
  summary: nullableText,
  tags: z.array(z.string()).nullable().optional(),
  strength: z.number().min(0).max(100).nullable().optional(),
  updated_at: nullableText,
});

export const insightSchema = z.object({
  id: z.string(),
  title: text,
  category: z.enum(["memory", "cost", "workflow", "opportunity", "risk"]),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["open", "approved", "dismissed", "done"]),
  rationale: nullableText,
  recommendation: nullableText,
  created_at: nullableText,
});

export const approvalRequestSchema = z.object({
  id: z.string(),
  title: text,
  action_type: z.enum(["vault_write", "external_action", "agent_run", "deploy"]),
  status: z.enum(["pending", "approved", "rejected", "completed"]),
  risk_level: z.enum(["low", "medium", "high"]),
  requested_by: nullableText,
  created_at: nullableText,
});

export const agentRunSchema = z.object({
  id: z.string(),
  title: text,
  status: z.enum(["queued", "running", "waiting_approval", "completed", "failed"]),
  builder_model: nullableText,
  judge_model: nullableText,
  score: numberLike,
  created_at: nullableText,
});

export const costEventSchema = z.object({
  id: z.string(),
  provider: text,
  model: nullableText,
  amount_usd: z.number().nullable().optional(),
  tokens_input: numberLike,
  tokens_output: numberLike,
  created_at: nullableText,
});

export type OsProject = z.infer<typeof projectSchema>;
export type OsTool = z.infer<typeof toolSchema>;
export type OsMemoryItem = z.infer<typeof memoryItemSchema>;
export type OsInsight = z.infer<typeof insightSchema>;
export type OsApprovalRequest = z.infer<typeof approvalRequestSchema>;
export type OsAgentRun = z.infer<typeof agentRunSchema>;
export type OsCostEvent = z.infer<typeof costEventSchema>;

export type OsData = {
  projects: OsProject[];
  tools: OsTool[];
  memoryItems: OsMemoryItem[];
  insights: OsInsight[];
  approvals: OsApprovalRequest[];
  agentRuns: OsAgentRun[];
  costEvents: OsCostEvent[];
  diagnostics: string[];
  source: "supabase" | "seed";
};
