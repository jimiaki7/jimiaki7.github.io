"use client";

import { Clapperboard, ExternalLink, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { checkMulmoHealth, type BridgeHealth, type BridgeSettings, type MulmoHealth } from "../../_lib/bridge";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import { BridgeOfflineNotice } from "../ui/BridgeOfflineNotice";
import { ConnectionPill } from "../ui/ConnectionPill";
import { SectionHeader } from "../ui/SectionHeader";

export function Studio({
  bridgeSettings,
  bridgeHealth,
}: {
  bridgeSettings: BridgeSettings;
  bridgeHealth: BridgeHealth;
}) {
  const [mulmoHealth, setMulmoHealth] = useState<MulmoHealth>({
    ok: false,
    error: "MulmoClaude has not been checked yet.",
  });
  // ponytail: checkMulmoHealth never throws (it catches into {ok:false,error}),
  // so useAsyncAction.error stays unused here — only busy is worth reusing.
  const check = useAsyncAction();

  const refreshMulmoHealth = useCallback(async () => {
    if (!bridgeHealth.ok) return;
    await check.run(async () => {
      setMulmoHealth(await checkMulmoHealth(bridgeSettings));
    });
  }, [check, bridgeSettings, bridgeHealth.ok]);

  useEffect(() => {
    let mounted = true;

    void (async () => {
      await Promise.resolve();
      if (!mounted) return;
      await refreshMulmoHealth();
    })();

    return () => {
      mounted = false;
    };
  }, [refreshMulmoHealth]);

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Clapperboard}
        title="Studio"
        subtitle="Vaultノートから動画/スライドを生成するMulmoClaudeへの導線。"
      />

      <div className="os-card p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ConnectionPill
            label="MulmoClaude"
            ok={mulmoHealth.ok}
            detail={
              !bridgeHealth.ok
                ? "bridge offline"
                : mulmoHealth.ok
                ? "online"
                : mulmoHealth.error ?? "offline"
            }
          />
          <button
            type="button"
            onClick={() => void refreshMulmoHealth()}
            className="btn-secondary text-sm py-2 px-3"
            disabled={!bridgeHealth.ok || check.busy}
          >
            <RefreshCw size={16} className={check.busy ? "animate-spin" : ""} aria-hidden="true" />
            Recheck
          </button>
        </div>

        {!bridgeHealth.ok && <BridgeOfflineNotice />}

        <div>
          <p className="text-sm font-semibold mb-2">起動方法</p>
          <pre
            className="text-xs whitespace-pre-wrap rounded-lg p-3"
            style={{ background: "var(--bg-secondary)", color: "var(--text-primary)" }}
          >
            npx mulmoclaude@latest
          </pre>
        </div>

        <a
          href="http://127.0.0.1:3001"
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary text-sm py-2 px-3"
        >
          <ExternalLink size={15} aria-hidden="true" />
          Open localhost:3001
        </a>
      </div>

      <div className="os-card p-5">
        <p className="text-sm font-semibold mb-2">ワークフロー</p>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          Vaultノート（説教原稿・祈祷会奨励）→ MulmoScript（構成台本）→ MulmoClaudeでの動画/スライド生成、という流れの入口です。生成の実行はJimiがMulmoClaude側で行い、OSはヘルス確認と起動導線のみを提供します（実行機能はここには実装しません）。
        </p>
      </div>
    </div>
  );
}
