import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { handleOptions, jsonResponse } from "../_shared/cors.ts";
import { requireOwner } from "../_shared/auth.ts";

serve(async (request) => {
  const options = handleOptions(request);
  if (options) return options;

  const auth = await requireOwner(request);
  if (auth.error) return auth.error;

  const body = await request.json().catch(() => ({}));
  const prompt = String(body.prompt ?? "").trim();

  if (!prompt) {
    return jsonResponse({ error: "prompt is required" }, { status: 400 });
  }

  return jsonResponse({
    mode: "proposal-only",
    message:
      "os-chat is wired as an authenticated owner-only function. Add provider calls here after secrets are configured.",
    prompt,
  });
});
