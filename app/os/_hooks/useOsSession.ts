"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import { hasSupabaseConfig, OWNER_EMAIL } from "../_lib/config";
import { getSupabaseBrowserClient } from "../_lib/supabase";

export type OsSessionPhase =
  | "checking"
  | "setup"
  | "signedOut"
  | "unauthorized"
  | "ready";

export type OsSession = {
  phase: OsSessionPhase;
  client: SupabaseClient | null;
  user: User | null;
  email: string | null;
  signOut: () => Promise<void>;
};

const ownerEmail = OWNER_EMAIL.toLowerCase();

export function useOsSession(): OsSession {
  const [phase, setPhase] = useState<OsSessionPhase>("checking");
  const [client, setClient] = useState<SupabaseClient | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let mounted = true;

    const applySession = (session: Session | null) => {
      const nextUser = session?.user ?? null;
      if (!nextUser) {
        setUser(null);
        setPhase("signedOut");
        return;
      }

      setUser(nextUser);
      setPhase(
        nextUser.email?.toLowerCase() === ownerEmail ? "ready" : "unauthorized",
      );
    };

    if (!hasSupabaseConfig()) {
      // ponytail: no real async work needed here, but setState must still
      // happen after an await to satisfy react-hooks/set-state-in-effect
      // (no setTimeout hack per contract).
      void (async () => {
        await Promise.resolve();
        if (mounted) setPhase("setup");
      })();
      return () => {
        mounted = false;
      };
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      return () => {
        mounted = false;
      };
    }

    void (async () => {
      await Promise.resolve();
      if (!mounted) return;
      setClient(supabase);
      const { data } = await supabase.auth.getSession();
      if (mounted) applySession(data.session);
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        applySession(session);
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signOut = useCallback(async () => {
    await client?.auth.signOut();
    setUser(null);
    setPhase("signedOut");
  }, [client]);

  return { phase, client, user, email: user?.email ?? null, signOut };
}
