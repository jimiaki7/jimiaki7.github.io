import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hasSupabaseConfig, SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

let browserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient() {
  if (!hasSupabaseConfig()) {
    return null;
  }

  if (!browserClient) {
    browserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
      },
    });
  }

  return browserClient;
}
