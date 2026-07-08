import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireOwner } from "../_shared/auth.ts";

serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  const suggestions = [
    {
      owner_id: auth.user.id,
      title: "Review memory items with low strength",
      category: "memory",
      priority: "medium",
      rationale: "Low-strength memories are often stale, duplicate, or disconnected.",
      recommendation:
        "Open Memory Galaxy and either link, summarize, or archive weak memory records.",
    },
    {
      owner_id: auth.user.id,
      title: "Keep external actions approval-first",
      category: "risk",
      priority: "high",
      rationale: "The OS is still in MVP and runs from a public static frontend.",
      recommendation:
        "Require approval_requests before any Vault write, deploy, email, or payment action.",
    },
  ];

  const { data, error } = await auth.client
    .from("insights")
    .insert(suggestions)
    .select("id,title,priority,status");

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  return jsonResponse({ inserted: data ?? [] });
});
