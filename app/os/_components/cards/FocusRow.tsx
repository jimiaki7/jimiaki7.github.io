"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import { updateProject } from "../../_lib/os-data";
import type { OsProject } from "../../_lib/schemas";
import { ErrorText } from "../ui/ErrorText";

export function FocusRow({
  project,
  canWrite,
  client,
  onRefresh,
}: {
  project: OsProject;
  canWrite: boolean;
  client: SupabaseClient | null;
  onRefresh: () => Promise<void>;
}) {
  const { run, busy, error } = useAsyncAction(onRefresh);

  const complete = () =>
    run(async () => {
      if (!client) return;
      await updateProject(client, project.id, { status: "completed" });
    });

  return (
    <article className="os-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">{project.name}</h3>
          <p
            className="text-xs mt-1 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {project.next_action ?? "次の行動は未設定"}
          </p>
        </div>
        <button
          type="button"
          onClick={complete}
          className="btn-secondary text-xs py-1.5 px-2.5 shrink-0"
          disabled={!canWrite || busy}
        >
          {busy ? (
            <Loader2 size={14} className="animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 size={14} aria-hidden="true" />
          )}
          完了
        </button>
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </article>
  );
}
