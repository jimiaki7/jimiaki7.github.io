"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import { updateApprovalStatus } from "../../_lib/os-data";
import type { OsApprovalRequest } from "../../_lib/schemas";
import { ErrorText } from "../ui/ErrorText";
import { StatusBadge } from "../ui/StatusBadge";

export function ApprovalCard({
  approval,
  canWrite,
  client,
  onRefresh,
}: {
  approval: OsApprovalRequest;
  canWrite: boolean;
  client: SupabaseClient | null;
  onRefresh: () => Promise<void>;
}) {
  const { run, busy, error } = useAsyncAction(onRefresh);

  const decide = (status: "approved" | "rejected") =>
    run(async () => {
      if (!client) return;
      await updateApprovalStatus(client, approval.id, status);
    });

  return (
    <article className="os-card p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <StatusBadge label={approval.risk_level} tone={approval.risk_level} />
            <StatusBadge label={approval.action_type} tone="neutral" />
          </div>
          <h3 className="text-sm font-semibold">{approval.title}</h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {approval.requested_by ?? "unknown"}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => decide("approved")}
            className="btn-secondary text-xs py-1.5 px-2.5"
            disabled={!canWrite || busy}
          >
            承認
          </button>
          <button
            type="button"
            onClick={() => decide("rejected")}
            className="btn-secondary text-xs py-1.5 px-2.5"
            disabled={!canWrite || busy}
          >
            却下
          </button>
        </div>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </article>
  );
}
