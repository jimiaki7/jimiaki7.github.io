import { createClient } from "https://esm.sh/@supabase/supabase-js@2.108.2";
import { jsonResponse } from "./cors.ts";

export async function requireOwner(request: Request) {
  const authHeader = request.headers.get("Authorization") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const ownerEmail = (
    Deno.env.get("OS_OWNER_EMAIL") ?? "jimiaki7@gmail.com"
  ).toLowerCase();

  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      error: jsonResponse(
        { error: "Supabase function environment is not configured." },
        { status: 500 },
      ),
    };
  }

  if (!authHeader.startsWith("Bearer ")) {
    return {
      error: jsonResponse({ error: "Missing bearer token." }, { status: 401 }),
    };
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const token = authHeader.replace("Bearer ", "");
  const { data, error } = await client.auth.getUser(token);

  if (error || !data.user) {
    return {
      error: jsonResponse({ error: "Invalid session." }, { status: 401 }),
    };
  }

  if (data.user.email?.toLowerCase() !== ownerEmail) {
    return {
      error: jsonResponse({ error: "Owner account required." }, { status: 403 }),
    };
  }

  return { client, user: data.user };
}
