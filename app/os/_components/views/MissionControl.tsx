"use client";

import {
  Activity,
  BrainCircuit,
  CircleDollarSign,
  Layers3,
  Loader2,
  ShieldCheck,
  Sparkles,
  Terminal,
} from "lucide-react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import { seedInitialData } from "../../_lib/os-data";
import { formatUsd } from "../../_lib/format";
import type { BridgeHealth } from "../../_lib/bridge";
import type { OsData } from "../../_lib/schemas";
import { MetricCard } from "../ui/MetricCard";
import { SectionHeader } from "../ui/SectionHeader";
import { CompactItem } from "../ui/CompactItem";
import { SystemTile } from "../ui/SystemTile";
import { ErrorText } from "../ui/ErrorText";
import { FocusRow } from "../cards/FocusRow";
import { ApprovalCard } from "../cards/ApprovalCard";

export function MissionControl({
  data,
  bridgeHealth,
  client,
  user,
  canWrite,
  onRefresh,
}: {
  data: OsData;
  bridgeHealth: BridgeHealth;
  client: SupabaseClient | null;
  user: User | null;
  canWrite: boolean;
  onRefresh: () => Promise<void>;
}) {
  const activeProjects = data.projects.filter((project) => project.status === "active");
  const pendingApprovals = data.approvals.filter(
    (approval) => approval.status === "pending",
  );
  const openInsights = data.insights.filter((insight) => insight.status === "open");
  const cost = data.costEvents.reduce(
    (sum, event) => sum + (event.amount_usd ?? 0),
    0,
  );
  const memoryStrength =
    data.memoryItems.length === 0
      ? 0
      : Math.round(
          data.memoryItems.reduce((sum, item) => sum + (item.strength ?? 0), 0) /
            data.memoryItems.length,
        );
  const isEmpty =
    data.projects.length === 0 && data.tools.length === 0 && data.insights.length === 0;

  const seed = useAsyncAction(onRefresh);
  const runSeed = () => {
    if (!client || !user) return;
    void seed.run(() => seedInitialData(client, user.id));
  };

  return (
    <div className="space-y-8">
      {/* 読み取り専用 / diagnostics の警告は OsApp が <main> 直下で全ビュー共通に描画する */}

      {isEmpty && data.source === "supabase" && (
        <div
          className="rounded-lg p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
          style={{ background: "var(--success-soft)", border: "1px solid var(--success)" }}
        >
          <div>
            <p className="text-sm font-semibold">まだデータがありません</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
              初期データ（プロジェクト・ツール・インサイト）を投入して始めます。
            </p>
          </div>
          <button
            type="button"
            onClick={runSeed}
            className="btn-primary text-sm py-2 px-3"
            disabled={!canWrite || seed.busy}
          >
            {seed.busy ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            初期データを投入
          </button>
        </div>
      )}
      {seed.error && <ErrorText>{seed.error}</ErrorText>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          icon={Layers3}
          label="Active Projects"
          value={activeProjects.length.toString()}
          detail="牧会・開発・副業"
        />
        <MetricCard
          icon={BrainCircuit}
          label="Memory Health"
          value={`${memoryStrength}%`}
          detail={`${data.memoryItems.length} indexed memories`}
        />
        <MetricCard
          icon={ShieldCheck}
          label="Pending Approvals"
          value={pendingApprovals.length.toString()}
          detail="human-in-the-loop"
        />
        <MetricCard
          icon={CircleDollarSign}
          label="Tracked Cost"
          value={formatUsd(cost)}
          detail="MVP estimate"
        />
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-6">
        <div>
          <SectionHeader
            icon={Activity}
            title="今日のフォーカス"
            subtitle="アクティブなプロジェクトの次の行動。完了したら片付ける。"
          />
          <div className="space-y-3">
            {activeProjects.map((project) => (
              <FocusRow
                key={project.id}
                project={project}
                canWrite={canWrite}
                client={client}
                onRefresh={onRefresh}
              />
            ))}
            {activeProjects.length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                アクティブなプロジェクトはありません。
              </p>
            )}
          </div>
        </div>

        <div>
          <SectionHeader
            icon={Sparkles}
            title="Dream Signals"
            subtitle="OSが次に見るべき改善候補。"
          />
          <div className="space-y-3">
            {openInsights.slice(0, 3).map((insight) => (
              <CompactItem
                key={insight.id}
                title={insight.title}
                detail={insight.recommendation ?? insight.rationale ?? ""}
                tone={insight.priority}
              />
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeader
          icon={ShieldCheck}
          title="承認キュー"
          subtitle="外部アクション前の承認待ち。"
        />
        <div className="space-y-3">
          {pendingApprovals.map((approval) => (
            <ApprovalCard
              key={approval.id}
              approval={approval}
              canWrite={canWrite}
              client={client}
              onRefresh={onRefresh}
            />
          ))}
          {pendingApprovals.length === 0 && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              承認待ちの項目はありません。
            </p>
          )}
        </div>
      </section>

      <section>
        <SectionHeader
          icon={Terminal}
          title="System Status"
          subtitle="静的サイト、Supabase、Local Bridge、承認制の境界。"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SystemTile
            title="Static Portfolio"
            status="healthy"
            body="GitHub Pages exportを維持。公開サイトは営業用としてそのまま稼働。"
          />
          <SystemTile
            title="Supabase RLS"
            status={data.source === "supabase" ? "healthy" : "manual"}
            body={
              data.source === "supabase"
                ? "owner_idで保護されたライブデータを表示中。"
                : "マイグレーション適用前のためシード表示中。"
            }
          />
          <SystemTile
            title="Local Bridge"
            status={bridgeHealth.ok ? "healthy" : "offline"}
            body={
              bridgeHealth.ok
                ? "JimiVaultへのローカル読み取り接続が利用可能。"
                : bridgeHealth.error ?? "Bridge is offline."
            }
          />
        </div>
      </section>
    </div>
  );
}
