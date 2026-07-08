"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import { updateInsightStatus } from "../../_lib/os-data";
import type { OsInsight } from "../../_lib/schemas";
import { ErrorText } from "../ui/ErrorText";
import { StatusBadge } from "../ui/StatusBadge";

export function InsightCard({
  insight,
  canWrite,
  client,
  onRefresh,
}: {
  insight: OsInsight;
  canWrite: boolean;
  client: SupabaseClient | null;
  onRefresh: () => Promise<void>;
}) {
  const { run, busy, error } = useAsyncAction(onRefresh);

  const setInsightStatus = (status: OsInsight["status"]) =>
    run(async () => {
      if (!client) return;
      await updateInsightStatus(client, insight.id, status);
    });

  return (
    <article className="os-card p-5">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <StatusBadge label={insight.priority} tone={insight.priority} />
            <StatusBadge label={insight.category} tone="neutral" />
            <StatusBadge label={insight.status} tone="neutral" />
          </div>
          <h3 className="text-lg font-semibold">{insight.title}</h3>
          <p
            className="text-sm mt-2 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {insight.rationale}
          </p>
          <p
            className="text-sm mt-3 leading-relaxed"
            style={{ color: "var(--text-primary)" }}
          >
            {insight.recommendation}
          </p>
        </div>
        {insight.status === "open" && (
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setInsightStatus("approved")}
              className="btn-secondary text-sm py-2 px-3"
              disabled={!canWrite || busy}
            >
              承認
            </button>
            <button
              type="button"
              onClick={() => setInsightStatus("dismissed")}
              className="btn-secondary text-sm py-2 px-3"
              disabled={!canWrite || busy}
            >
              却下
            </button>
            <button
              type="button"
              onClick={() => setInsightStatus("done")}
              className="btn-secondary text-sm py-2 px-3"
              disabled={!canWrite || busy}
            >
              完了
            </button>
          </div>
        )}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </article>
  );
}
