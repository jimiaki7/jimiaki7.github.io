import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireOwner } from "../_shared/auth.ts";

serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const query = String(body.query ?? "").trim();

  if (!query) {
    return jsonResponse({ results: [] });
  }

  const { data, error } = await auth.client
    .from("memory_items")
    .select("id,title,source_type,source_path,summary,tags,strength,updated_at")
    .or(`title.ilike.%${query}%,summary.ilike.%${query}%,source_path.ilike.%${query}%`)
    .limit(12);

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  return jsonResponse({ results: data ?? [] });
});
