"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import { formatDate } from "../../_lib/format";
import { updateProject } from "../../_lib/os-data";
import type { OsProject } from "../../_lib/schemas";
import { ErrorText } from "../ui/ErrorText";
import { Field } from "../ui/Field";
import { Select, type SelectOption } from "../ui/Select";

const priorityOptions: Array<SelectOption<OsProject["priority"]>> = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

const statusOptions: Array<SelectOption<OsProject["status"]>> = [
  { value: "active", label: "Active" },
  { value: "waiting", label: "Waiting" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
];

// 「次の行動」の入力欄だけを切り出し、project.next_actionをkeyにする。
// レンダー中にstateを調整するworkaroundの代わりに、上流のnext_actionが
// 変わったときだけこのサブコンポーネントをリマウントして下書きを再同期する
// (他の理由での再レンダーでは下書きは保持される)。
function NextActionEditor({
  initialValue,
  disabled,
  busy,
  onSave,
}: {
  initialValue: string;
  disabled: boolean;
  busy: boolean;
  onSave: (value: string) => void;
}) {
  const [draft, setDraft] = useState(initialValue);

  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="flex-1">
        <Field label="次の行動">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            disabled={disabled}
            placeholder="次の行動"
          />
        </Field>
      </div>
      <button
        type="button"
        onClick={() => onSave(draft)}
        className="btn-secondary text-sm py-2 px-3 shrink-0"
        disabled={disabled}
      >
        {busy && <Loader2 size={16} className="animate-spin" aria-hidden="true" />}
        保存
      </button>
    </div>
  );
}

export function ProjectCard({
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

  const applyPatch = (
    patch: Partial<Pick<OsProject, "status" | "priority" | "next_action">>,
  ) =>
    run(async () => {
      if (!client) return;
      await updateProject(client, project.id, patch);
    });

  return (
    <article className="os-card p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold">{project.name}</h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {project.domain} / {formatDate(project.updated_at)}
          </p>
        </div>
        <Select<OsProject["priority"]>
          ariaLabel={`${project.name}の優先度`}
          value={project.priority}
          onChange={(priority) => applyPatch({ priority })}
          options={priorityOptions}
          disabled={!canWrite || busy}
        />
      </div>
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        {project.description}
      </p>

      <div className="mb-3">
        <Select<OsProject["status"]>
          ariaLabel={`${project.name}のステータス`}
          value={project.status}
          onChange={(status) => applyPatch({ status })}
          options={statusOptions}
          disabled={!canWrite || busy}
        />
      </div>

      <NextActionEditor
        key={project.next_action ?? ""}
        initialValue={project.next_action ?? ""}
        disabled={!canWrite || busy}
        busy={busy}
        onSave={(next_action) => applyPatch({ next_action })}
      />

      <button
        type="button"
        onClick={() => applyPatch({ status: "completed" })}
        className="btn-secondary text-sm py-2 px-3 w-full justify-center"
        disabled={!canWrite || busy || project.status === "completed"}
      >
        {busy ? (
          <Loader2 size={16} className="animate-spin" aria-hidden="true" />
        ) : (
          <CheckCircle2 size={16} aria-hidden="true" />
        )}
        完了
      </button>

      {error && <ErrorText>{error}</ErrorText>}
    </article>
  );
}
