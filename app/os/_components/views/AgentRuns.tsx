import { GitBranch, ShieldCheck } from "lucide-react";
import { formatDate } from "../../_lib/format";
import type { OsData } from "../../_lib/schemas";
import { SectionHeader } from "../ui/SectionHeader";
import { StatusBadge } from "../ui/StatusBadge";
import { CompactItem } from "../ui/CompactItem";

export function AgentRuns({ data }: { data: OsData }) {
  return (
    <div className="space-y-8">
      <SectionHeader
        icon={GitBranch}
        title="Agent Runs"
        subtitle="builder / judge / human approval loop の実行履歴と成果物。"
      />
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_0.8fr] gap-6">
        <div className="space-y-4">
          {data.agentRuns.map((run) => (
            <article key={run.id} className="os-card p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold">{run.title}</h3>
                  <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
                    Builder: {run.builder_model ?? "unset"} / Judge:{" "}
                    {run.judge_model ?? "unset"}
                  </p>
                </div>
                <StatusBadge label={run.status} tone="neutral" />
              </div>
              <div className="mt-5 flex items-center gap-4 text-sm" style={{ color: "var(--text-secondary)" }}>
                <span>Score: {run.score ?? "N/A"}</span>
                <span>{formatDate(run.created_at)}</span>
              </div>
            </article>
          ))}
          {data.agentRuns.length === 0 && (
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              エージェント実行の履歴はまだありません。
            </p>
          )}
        </div>
        <div>
          <SectionHeader
            icon={ShieldCheck}
            title="Approval Queue"
            subtitle="外部アクション前の人間承認。"
          />
          <div className="space-y-3">
            {data.approvals.map((approval) => (
              <CompactItem
                key={approval.id}
                title={approval.title}
                detail={`${approval.action_type} / ${approval.requested_by ?? "unknown"}`}
                tone={approval.risk_level}
              />
            ))}
            {data.approvals.length === 0 && (
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                承認待ちの項目はありません。
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
