import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireOwner } from "../_shared/auth.ts";

serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const title = String(body.title ?? "Untitled agent run").trim();
  const prompt = String(body.prompt ?? "").trim();

  const { data: run, error: runError } = await auth.client
    .from("agent_runs")
    .insert({
      owner_id: auth.user.id,
      title,
      prompt,
      status: "waiting_approval",
      builder_model: body.builder_model ?? "unset",
      judge_model: body.judge_model ?? "human",
      result_summary:
        "Created as proposal-only. External execution requires approval.",
    })
    .select("id,title,status")
    .single();

  if (runError) {
    return jsonResponse({ error: runError.message }, { status: 500 });
  }

  const { error: approvalError } = await auth.client
    .from("approval_requests")
    .insert({
      owner_id: auth.user.id,
      agent_run_id: run.id,
      title: `Approve agent run: ${title}`,
      action_type: "agent_run",
      risk_level: "medium",
      requested_by: "agent-run",
      request_payload: body,
    });

  if (approvalError) {
    return jsonResponse({ error: approvalError.message }, { status: 500 });
  }

  return jsonResponse({ run });
});
