"use client";

import { Plus, Loader2, Sparkles } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { InsightCard } from "../cards/InsightCard";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import { createInsight } from "../../_lib/os-data";
import type { OsData, OsInsight } from "../../_lib/schemas";
import { ErrorText } from "../ui/ErrorText";
import { Field } from "../ui/Field";
import { SectionHeader } from "../ui/SectionHeader";
import { Select } from "../ui/Select";

const categoryOptions: Array<{ value: OsInsight["category"]; label: string }> = [
  { value: "memory", label: "Memory" },
  { value: "cost", label: "Cost" },
  { value: "workflow", label: "Workflow" },
  { value: "opportunity", label: "Opportunity" },
  { value: "risk", label: "Risk" },
];

const priorityOptions: Array<{ value: OsInsight["priority"]; label: string }> = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function DreamInbox({
  data,
  client,
  user,
  canWrite,
  onRefresh,
}: {
  data: OsData;
  client: SupabaseClient | null;
  user: User | null;
  canWrite: boolean;
  onRefresh: () => Promise<void>;
}) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<OsInsight["category"]>("workflow");
  const [priority, setPriority] = useState<OsInsight["priority"]>("medium");
  const [recommendation, setRecommendation] = useState("");
  const addInsight = useAsyncAction(() => {
    setTitle("");
    setRecommendation("");
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client || !user || !title.trim()) return;
    void addInsight.run(async () => {
      await createInsight(client, user.id, {
        title,
        category,
        priority,
        rationale: null,
        recommendation: recommendation || null,
      });
      await onRefresh();
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Sparkles}
        title="Insight / Dream Inbox"
        subtitle="OSが毎日見るべき改善、重複、記憶の健康、機会を承認待ちにする。"
      />

      <form
        onSubmit={submit}
        className="rounded-xl p-5 grid grid-cols-1 lg:grid-cols-[1fr_140px_140px_auto] gap-4 items-end"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
      >
        <Field label="New insight">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="気づいたこと"
            disabled={!canWrite}
          />
        </Field>
        <Select
          label="Category"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          disabled={!canWrite}
          size="md"
          />
        <Select
          label="Priority"
          value={priority}
          onChange={setPriority}
          options={priorityOptions}
          disabled={!canWrite}
          size="md"
          />
        <button
          type="submit"
          className="btn-primary h-12 justify-center"
          disabled={!canWrite || addInsight.busy}
        >
          {addInsight.busy ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Plus size={16} aria-hidden="true" />
          )}
          Add
        </button>
        <div className="lg:col-span-4">
          <Field label="Recommendation">
            <textarea
              rows={2}
              value={recommendation}
              onChange={(event) => setRecommendation(event.target.value)}
              placeholder="推奨アクション"
              disabled={!canWrite}
            />
          </Field>
        </div>
      </form>

      {addInsight.error && <ErrorText>{addInsight.error}</ErrorText>}

      <div className="space-y-4">
        {data.insights.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            canWrite={canWrite}
            client={client}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}
