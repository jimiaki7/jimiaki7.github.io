"use client";

import { useCallback, useEffect, useState } from "react";
import {
  checkBridgeHealth,
  checkMulmoHealth,
  getBridgeSettings,
  type BridgeHealth,
  type BridgeSettings,
  type MulmoHealth,
} from "../_lib/bridge";

export type BridgeState = {
  settings: BridgeSettings;
  health: BridgeHealth;
  mulmo: MulmoHealth | null;
  recheck: () => Promise<void>;
};

// Bridge/MulmoClaudeのヘルスポーリングを一元化する。ToolCard・Studioが
// 個別にポーリングしていた分はこのフックのrecheck()に置き換える。
export function useBridge(): BridgeState {
  const [settings, setSettings] = useState<BridgeSettings>(() =>
    getBridgeSettings(),
  );
  const [health, setHealth] = useState<BridgeHealth>({
    ok: false,
    error: "Bridge has not been checked yet.",
  });
  const [mulmo, setMulmo] = useState<MulmoHealth | null>(null);

  const recheck = useCallback(async () => {
    const nextSettings = getBridgeSettings();
    setSettings(nextSettings);
    const nextHealth = await checkBridgeHealth(nextSettings);
    setHealth(nextHealth);
    setMulmo(nextHealth.ok ? await checkMulmoHealth(nextSettings) : null);
  }, []);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      await Promise.resolve();
      if (!mounted) return;
      await recheck();
    })();

    return () => {
      mounted = false;
    };
  }, [recheck]);

  return { settings, health, mulmo, recheck };
}
