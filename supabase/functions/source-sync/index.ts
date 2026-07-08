import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireOwner } from "../_shared/auth.ts";

type SyncItem = {
  title?: string;
  source_path?: string;
  summary?: string;
  tags?: string[];
  strength?: number;
};

serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const items = Array.isArray(body.items) ? (body.items as SyncItem[]) : [];

  if (items.length === 0) {
    return jsonResponse({ inserted: 0 });
  }

  const rows = items.slice(0, 100).map((item) => ({
    owner_id: auth.user.id,
    title: item.title ?? item.source_path ?? "Untitled memory",
    source_type: "vault",
    source_path: item.source_path ?? null,
    summary: item.summary ?? null,
    tags: item.tags ?? [],
    strength: item.strength ?? 50,
  }));

  const { data, error } = await auth.client
    .from("memory_items")
    .insert(rows)
    .select("id,title,source_path");

  if (error) {
    return jsonResponse({ error: error.message }, { status: 500 });
  }

  return jsonResponse({ inserted: data?.length ?? 0, items: data ?? [] });
});
