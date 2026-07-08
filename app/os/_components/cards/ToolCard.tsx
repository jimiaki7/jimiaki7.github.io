"use client";

import { ExternalLink, Loader2, RefreshCw } from "lucide-react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import type { BridgeSettings } from "../../_lib/bridge";
import { formatDate } from "../../_lib/format";
import { updateTool } from "../../_lib/os-data";
import type { OsTool } from "../../_lib/schemas";
import { ErrorText } from "../ui/ErrorText";
import { Select, type SelectOption } from "../ui/Select";

const statusOptions: Array<SelectOption<OsTool["status"]>> = [
  { value: "connected", label: "Connected" },
  { value: "manual", label: "Manual" },
  { value: "offline", label: "Offline" },
  { value: "planned", label: "Planned" },
];

// bridgeSettings: 現行OsApp.tsxの呼び出しシグネチャ互換のためpropsの型には残すが、
// ヘルスチェック自体はonHealthCheck（useBridgeのrecheckに配線される想定）に一元化した
// ため、このコンポーネント内では参照しない。
export function ToolCard({
  tool,
  canWrite,
  client,
  onRefresh,
  onHealthCheck,
}: {
  tool: OsTool;
  canWrite: boolean;
  client: SupabaseClient | null;
  bridgeSettings: BridgeSettings;
  onRefresh: () => Promise<void>;
  onHealthCheck?: () => Promise<void>;
}) {
  const { run, busy, error } = useAsyncAction(onRefresh);
  const canHealthCheck =
    tool.name.includes("Bridge") || tool.name.includes("MulmoClaude");

  const updateStatus = (status: OsTool["status"]) =>
    run(async () => {
      if (!client) return;
      await updateTool(client, tool.id, { status });
    });

  const runHealthCheck = () => run(async () => onHealthCheck?.());

  return (
    <article className="os-card p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-semibold">{tool.name}</h3>
          <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>
            {tool.provider ?? tool.category}
          </p>
        </div>
        <Select<OsTool["status"]>
          ariaLabel={`${tool.name}のステータス`}
          value={tool.status}
          onChange={updateStatus}
          options={statusOptions}
          disabled={!canWrite || busy}
        />
      </div>
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        {tool.notes}
      </p>
      <div
        className="flex items-center justify-between text-xs mb-4"
        style={{ color: "var(--text-secondary)" }}
      >
        <span>{tool.category}</span>
        <span>{formatDate(tool.last_checked_at)}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {canHealthCheck && onHealthCheck && (
          <button
            type="button"
            onClick={runHealthCheck}
            className="btn-secondary text-sm py-2 px-3"
            disabled={!canWrite || busy}
          >
            {busy ? (
              <Loader2 size={15} className="animate-spin" aria-hidden="true" />
            ) : (
              <RefreshCw size={15} aria-hidden="true" />
            )}
            ヘルスチェック
          </button>
        )}
        {tool.launch_url && (
          <a
            href={tool.launch_url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-sm py-2 px-3"
          >
            <ExternalLink size={15} aria-hidden="true" />
            Open
          </a>
        )}
      </div>
      {error && <ErrorText>{error}</ErrorText>}
    </article>
  );
}
