export const OWNER_EMAIL =
  process.env.NEXT_PUBLIC_OS_OWNER_EMAIL || "jimiaki7@gmail.com";

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const DEFAULT_BRIDGE_URL =
  process.env.NEXT_PUBLIC_OS_BRIDGE_URL || "http://127.0.0.1:3737";

export function hasSupabaseConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

export function getAuthRedirectUrl() {
  if (typeof window === "undefined") {
    return "/os/auth/callback";
  }

  return `${window.location.origin}/os/auth/callback`;
}

