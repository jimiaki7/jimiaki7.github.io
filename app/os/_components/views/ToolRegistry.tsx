"use client";

import { Command, Loader2, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import { createTool, updateTool } from "../../_lib/os-data";
import {
  type BridgeSettings,
  checkBridgeHealth,
  checkMulmoHealth,
} from "../../_lib/bridge";
import type { OsTool } from "../../_lib/schemas";
import { SectionHeader } from "../ui/SectionHeader";
import { Field } from "../ui/Field";
import { Select, type SelectOption } from "../ui/Select";
import { ErrorText } from "../ui/ErrorText";
import { ToolCard } from "../cards/ToolCard";

const categoryOptions: SelectOption<OsTool["category"]>[] = [
  { value: "ai", label: "AI" },
  { value: "memory", label: "Memory" },
  { value: "project", label: "Project" },
  { value: "automation", label: "Automation" },
  { value: "infra", label: "Infra" },
];

export function ToolRegistry({
  tools,
  client,
  user,
  canWrite,
  bridgeSettings,
  onRefresh,
}: {
  tools: OsTool[];
  client: SupabaseClient | null;
  user: User | null;
  canWrite: boolean;
  bridgeSettings: BridgeSettings;
  onRefresh: () => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<OsTool["category"]>("ai");
  const [provider, setProvider] = useState("");
  const [launchUrl, setLaunchUrl] = useState("");
  const [notes, setNotes] = useState("");

  const create = useAsyncAction(onRefresh);

  // Bridge / MulmoClaude ツールのヘルスチェック。ToolCard は自前でポーリングせず、
  // ここで作った per-tool のクロージャを受け取る（ToolCard 側で useAsyncAction が
  // busy/error/onRefresh を面倒みる）。v0.2 と同じく status と last_checked_at を更新する。
  const healthCheckFor = (tool: OsTool) => async () => {
    if (!client) return;
    const health = tool.name.includes("MulmoClaude")
      ? await checkMulmoHealth(bridgeSettings)
      : await checkBridgeHealth(bridgeSettings);
    await updateTool(client, tool.id, {
      status: health.ok ? "connected" : "offline",
      last_checked_at: new Date().toISOString(),
    });
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client || !user || !name.trim()) return;

    void create.run(async () => {
      await createTool(client, user.id, {
        name,
        category,
        status: "planned",
        provider: provider || null,
        launch_url: launchUrl || null,
        notes: notes || null,
      });
      setName("");
      setProvider("");
      setLaunchUrl("");
      setNotes("");
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Command}
        title="Tool Registry"
        subtitle="AI、記憶、プロジェクト、インフラをモデル非依存で管理。"
      />

      <form
        onSubmit={submit}
        className="rounded-xl p-5 grid grid-cols-1 lg:grid-cols-[1fr_140px_1fr_1fr_auto] gap-4 items-end"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
      >
        <Field label="New tool" id="tool-name">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Tool name"
            disabled={!canWrite}
          />
        </Field>
        <Select
          label="Category"
          id="tool-category"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          disabled={!canWrite}
          size="md"
          />
        <Field label="Provider" id="tool-provider">
          <input
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            placeholder="Provider"
            disabled={!canWrite}
          />
        </Field>
        <Field label="Launch URL" id="tool-launch-url">
          <input
            value={launchUrl}
            onChange={(event) => setLaunchUrl(event.target.value)}
            placeholder="https://..."
            disabled={!canWrite}
          />
        </Field>
        <button
          type="submit"
          className="btn-primary h-12 justify-center"
          disabled={!canWrite || create.busy}
        >
          {create.busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add
        </button>
        <div className="lg:col-span-5">
          <Field label="Notes" id="tool-notes">
            <textarea
              rows={2}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="このツールの役割"
              disabled={!canWrite}
            />
          </Field>
        </div>
      </form>

      {create.error && <ErrorText>{create.error}</ErrorText>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            canWrite={canWrite}
            client={client}
            onRefresh={onRefresh}
            onHealthCheck={healthCheckFor(tool)}
          />
        ))}
      </div>
    </div>
  );
}
