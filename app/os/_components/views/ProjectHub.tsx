"use client";

import { Layers3, Loader2, Plus } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import { createProject } from "../../_lib/os-data";
import type { OsData, OsProject } from "../../_lib/schemas";
import { SectionHeader } from "../ui/SectionHeader";
import { Field } from "../ui/Field";
import { Select, type SelectOption } from "../ui/Select";
import { Notice } from "../ui/Notice";
import { ErrorText } from "../ui/ErrorText";
import { ProjectCard } from "../cards/ProjectCard";

const domainOptions: SelectOption<OsProject["domain"]>[] = [
  { value: "pastoral", label: "Pastoral" },
  { value: "development", label: "Development" },
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal" },
];

const priorityOptions: SelectOption<OsProject["priority"]>[] = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export function ProjectHub({
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
  const [name, setName] = useState("");
  const [domain, setDomain] = useState<OsProject["domain"]>("development");
  const [priority, setPriority] = useState<OsProject["priority"]>("medium");
  const [description, setDescription] = useState("");

  const create = useAsyncAction(onRefresh);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client || !user || !name.trim()) return;

    void create.run(async () => {
      await createProject(client, user.id, { name, domain, priority, description });
      setName("");
      setDescription("");
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Layers3}
        title="Project Hub"
        subtitle="説教、Keryx、Aster Works、副業案件を同じ操作面で見る。"
      />

      <form
        onSubmit={submit}
        className="rounded-xl p-5 grid grid-cols-1 lg:grid-cols-[1fr_160px_140px_auto] gap-4 items-end"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
      >
        <Field label="New project" id="project-name">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="次の生成プロジェクト"
            disabled={!canWrite}
          />
        </Field>
        <Select
          label="Domain"
          id="project-domain"
          value={domain}
          onChange={setDomain}
          options={domainOptions}
          disabled={!canWrite}
        />
        <Select
          label="Priority"
          id="project-priority"
          value={priority}
          onChange={setPriority}
          options={priorityOptions}
          disabled={!canWrite}
        />
        <button
          type="submit"
          className="btn-primary h-12 justify-center"
          disabled={!canWrite || create.busy}
        >
          {create.busy ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
          Add
        </button>
        <div className="lg:col-span-4">
          <Field label="Description" id="project-description">
            <textarea
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="このプロジェクトが何を前進させるか"
              disabled={!canWrite}
            />
          </Field>
        </div>
      </form>

      {!canWrite && <Notice variant="readonly">Supabase未接続のため読み取り専用です。</Notice>}
      {create.error && <ErrorText>{create.error}</ErrorText>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            canWrite={canWrite}
            client={client}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}
