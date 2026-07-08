"use client";

import { BrainCircuit, Loader2, Plus, RefreshCw, Search } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { MemoryCard } from "../cards/MemoryCard";
import { useAsyncAction } from "../../_hooks/useAsyncAction";
import {
  searchVault,
  queryVaultDb,
  type BridgeHealth,
  type BridgeSettings,
  type VaultSearchResult,
} from "../../_lib/bridge";
import { createMemoryItem, upsertVaultMemories } from "../../_lib/os-data";
import type { OsData } from "../../_lib/schemas";
import { BridgeOfflineNotice } from "../ui/BridgeOfflineNotice";
import { ErrorText } from "../ui/ErrorText";
import { Field } from "../ui/Field";
import { Notice } from "../ui/Notice";
import { SectionHeader } from "../ui/SectionHeader";

export function MemoryGalaxy({
  data,
  bridgeSettings,
  bridgeHealth,
  client,
  user,
  canWrite,
  onRefresh,
}: {
  data: OsData;
  bridgeSettings: BridgeSettings;
  bridgeHealth: BridgeHealth;
  client: SupabaseClient | null;
  user: User | null;
  canWrite: boolean;
  onRefresh: () => Promise<void>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<VaultSearchResult[]>([]);
  const search = useAsyncAction();

  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const addMemory = useAsyncAction(() => {
    setTitle("");
    setSummary("");
    setTagsInput("");
  });

  const [syncMessage, setSyncMessage] = useState("");
  const sync = useAsyncAction();

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim() || !bridgeHealth.ok) return;
    void search.run(async () => {
      setResults(await searchVault(bridgeSettings, query.trim()));
    });
  };

  const submitManual = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!client || !user || !title.trim()) return;
    void addMemory.run(async () => {
      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      await createMemoryItem(client, user.id, {
        title,
        source_type: "manual",
        source_path: null,
        summary: summary || null,
        tags,
      });
      await onRefresh();
    });
  };

  const syncVault = () => {
    if (!client || !user) return;
    setSyncMessage("");
    void sync.run(async () => {
      const result = await queryVaultDb(bridgeSettings, { limit: 50 });
      const inserted = await upsertVaultMemories(client, user.id, result.rows);
      setSyncMessage(`${inserted}件取り込みました。`);
      await onRefresh();
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={BrainCircuit}
        title="Memory Galaxy"
        subtitle="JimiVault、AI会話、生成物を一つの共有記憶として扱う場所。"
      />

      <form onSubmit={submitSearch} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Field label="Vault search via Local Bridge">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Keryx, 釈義, Aster Works..."
              disabled={!bridgeHealth.ok}
            />
          </Field>
        </div>
        <button
          type="submit"
          className="btn-primary sm:self-end justify-center"
          disabled={!bridgeHealth.ok || search.busy}
        >
          {search.busy ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Search size={16} aria-hidden="true" />
          )}
          Search
        </button>
      </form>

      {!bridgeHealth.ok && <BridgeOfflineNotice />}
      {search.error && <ErrorText>{search.error}</ErrorText>}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {results.map((result) => (
            <MemoryCard
              key={result.path}
              title={result.title}
              path={result.path}
              summary={result.excerpt}
              tags={["Bridge"]}
              strength={100}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <button
          type="button"
          onClick={syncVault}
          className="btn-secondary text-sm py-2 px-3"
          disabled={!canWrite || !bridgeHealth.ok || sync.busy}
        >
          {sync.busy ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <RefreshCw size={16} aria-hidden="true" />
          )}
          Vaultから同期
        </button>
        {syncMessage && (
          <Notice variant="success">{syncMessage}</Notice>
        )}
        {sync.error && <ErrorText>{sync.error}</ErrorText>}
      </div>

      <form
        onSubmit={submitManual}
        className="rounded-xl p-5 grid grid-cols-1 lg:grid-cols-[1fr_1fr_auto] gap-4 items-end"
        style={{ background: "var(--bg-secondary)", border: "1px solid var(--border)" }}
      >
        <Field label="New memory">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="タイトル"
            disabled={!canWrite}
          />
        </Field>
        <Field label="Tags (comma区切り)">
          <input
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="tag1, tag2"
            disabled={!canWrite}
          />
        </Field>
        <button
          type="submit"
          className="btn-primary h-12 justify-center"
          disabled={!canWrite || addMemory.busy}
        >
          {addMemory.busy ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : (
            <Plus size={16} aria-hidden="true" />
          )}
          Add
        </button>
        <div className="lg:col-span-3">
          <Field label="Summary">
            <textarea
              rows={2}
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="要約"
              disabled={!canWrite}
            />
          </Field>
        </div>
      </form>

      {addMemory.error && <ErrorText>{addMemory.error}</ErrorText>}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {data.memoryItems.map((item) => (
          <MemoryCard
            key={item.id}
            id={item.id}
            title={item.title}
            path={item.source_path ?? item.source_type}
            summary={item.summary ?? ""}
            tags={item.tags ?? []}
            strength={item.strength ?? 0}
            canDelete={item.source_type === "manual"}
            canWrite={canWrite}
            client={client}
            onRefresh={onRefresh}
          />
        ))}
      </div>
    </div>
  );
}
