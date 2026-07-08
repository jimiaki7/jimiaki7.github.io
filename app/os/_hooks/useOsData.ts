"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { loadOsData } from "../_lib/os-data";
import type { OsData } from "../_lib/schemas";
import { createSeedData } from "../_lib/seed";

export type OsDataState = {
  data: OsData;
  loading: boolean;
  refresh: () => Promise<void>;
};

export function useOsData(
  client: SupabaseClient | null,
  enabled: boolean,
): OsDataState {
  const [data, setData] = useState<OsData>(() => createSeedData());
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!client || !enabled) return;
    setLoading(true);
    try {
      setData(await loadOsData(client));
    } finally {
      setLoading(false);
    }
  }, [client, enabled]);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      // ponytail: await before touching state/refresh so the initial load
      // never sets state synchronously inside the effect body.
      await Promise.resolve();
      if (!mounted) return;
      await refresh();
    })();

    return () => {
      mounted = false;
    };
  }, [refresh]);

  return { data, loading, refresh };
}
