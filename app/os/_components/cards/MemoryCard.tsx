"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import { deleteMemoryItem } from "../../_lib/os-data";
import { ConfirmButton } from "../ui/ConfirmButton";
import { ErrorText } from "../ui/ErrorText";

export function MemoryCard({
  id,
  title,
  path,
  summary,
  tags,
  strength,
  canDelete,
  canWrite,
  client,
  onRefresh,
}: {
  id?: string;
  title: string;
  path: string;
  summary: string;
  tags: string[];
  strength: number;
  canDelete?: boolean;
  canWrite?: boolean;
  client?: SupabaseClient | null;
  onRefresh?: () => Promise<void>;
}) {
  const { run, busy, error } = useAsyncAction(onRefresh);

  const remove = () =>
    run(async () => {
      if (!client || !id) return;
      await deleteMemoryItem(client, id);
    });

  return (
    <article className="os-card p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="text-xs mt-1 break-all" style={{ color: "var(--text-secondary)" }}>
            {path}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-lg font-semibold" style={{ color: "var(--success)" }}>
            {strength}
          </p>
          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            strength
          </p>
        </div>
      </div>
      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
        {summary}
      </p>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="skill-badge text-xs">
              {tag}
            </span>
          ))}
        </div>
        {canDelete && (
          <ConfirmButton
            ariaLabel={`「${title}」を削除`}
            confirmLabel={`「${title}」を削除しますか？`}
            onConfirm={remove}
            busy={busy}
            disabled={!canWrite}
          />
        )}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </article>
  );
}
