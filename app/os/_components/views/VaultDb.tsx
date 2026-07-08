"use client";

import { Database, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { queryVaultDb, type BridgeHealth, type BridgeSettings, type VaultDbRow } from "../../_lib/bridge";
import { formatDate, toErrorMessage } from "../../_lib/format";
import { BridgeOfflineNotice } from "../ui/BridgeOfflineNotice";
import { ErrorText } from "../ui/ErrorText";
import { Field } from "../ui/Field";
import { SectionHeader } from "../ui/SectionHeader";

type VaultDbPreset = {
  id: string;
  label: string;
  folder?: string;
  limit: number;
};

const vaultDbPresets: VaultDbPreset[] = [
  { id: "sunday", label: "日曜説教", folder: "01_Project/説教/日曜説教", limit: 50 },
  { id: "prayer", label: "祈祷会奨励", folder: "01_Project/説教/祈祷会奨励", limit: 50 },
  { id: "exegesis", label: "釈義ノート", folder: "03_Resource/釈義ノート", limit: 50 },
  { id: "recent", label: "最近のノート", limit: 30 },
];

// ponytail: format.tsはこのタスクでは書き込み対象外の別エージェント所有ファイルの
// ため、VaultDb専用としてここにexportする。将来的にはformat.tsへ移すべき。
export function propertyToText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map((item) => String(item)).join(", ");
  }
  if (value === undefined || value === null || value === "") {
    return "";
  }
  return String(value);
}

export function propertyToTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  if (value === undefined || value === null || value === "") {
    return [];
  }
  return [String(value)];
}

export function VaultDb({
  bridgeSettings,
  bridgeHealth,
}: {
  bridgeSettings: BridgeSettings;
  bridgeHealth: BridgeHealth;
}) {
  const [activePresetId, setActivePresetId] = useState(vaultDbPresets[0].id);
  const [rows, setRows] = useState<VaultDbRow[]>([]);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!bridgeHealth.ok) return;
    let mounted = true;
    const preset =
      vaultDbPresets.find((item) => item.id === activePresetId) ?? vaultDbPresets[0];

    void (async () => {
      await Promise.resolve();
      if (!mounted) return;
      setStatus("loading");
      setMessage("");
      try {
        const result = await queryVaultDb(bridgeSettings, {
          folder: preset.folder,
          recursive: true,
          sort: { field: "modifiedAt", order: "desc" },
          limit: preset.limit,
        });
        if (!mounted) return;
        setRows(result.rows);
        setTotal(result.total);
        setStatus("idle");
      } catch (error) {
        if (!mounted) return;
        setStatus("error");
        setMessage(toErrorMessage(error, "Vault DB query failed."));
      }
    })();

    return () => {
      mounted = false;
    };
  }, [activePresetId, bridgeSettings, bridgeHealth.ok]);

  const needle = filter.trim().toLowerCase();
  const filteredRows = needle
    ? rows.filter((row) => {
        const haystack = `${row.name} ${propertyToText(row.properties.tags)}`.toLowerCase();
        return haystack.includes(needle);
      })
    : rows;

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Database}
        title="Vault DB"
        subtitle="JimiVaultのfrontmatterをNotion風データベースとして閲覧する。"
      />

      <div role="tablist" aria-label="Vault DB プリセット" className="flex flex-wrap gap-2">
        {vaultDbPresets.map((preset) => {
          const active = activePresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              role="tab"
              id={`vaultdb-tab-${preset.id}`}
              aria-selected={active}
              aria-controls="vaultdb-panel"
              onClick={() => setActivePresetId(preset.id)}
              className="text-sm px-3 py-2 rounded-lg transition-colors"
              style={{
                background: active ? "var(--info-soft)" : "var(--bg-card)",
                border: active ? "1px solid var(--info)" : "1px solid var(--border)",
                color: active ? "var(--text-primary)" : "var(--text-secondary)",
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {!bridgeHealth.ok && <BridgeOfflineNotice />}

      {bridgeHealth.ok && (
        <div
          id="vaultdb-panel"
          role="tabpanel"
          aria-labelledby={`vaultdb-tab-${activePresetId}`}
          className="space-y-4"
        >
          <Field label="Filter">
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              placeholder="名前やtagsで絞り込み"
            />
          </Field>

          {status === "error" && message && <ErrorText>{message}</ErrorText>}

          <div className="os-card overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th
                    className="sticky top-0 text-left px-4 py-3"
                    style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-strong)" }}
                  >
                    名前
                  </th>
                  <th
                    className="sticky top-0 text-left px-4 py-3"
                    style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-strong)" }}
                  >
                    tags
                  </th>
                  <th
                    className="sticky top-0 text-left px-4 py-3"
                    style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-strong)" }}
                  >
                    creation date
                  </th>
                  <th
                    className="sticky top-0 text-left px-4 py-3"
                    style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-strong)" }}
                  >
                    更新日時
                  </th>
                </tr>
              </thead>
              <tbody>
                {status === "loading" && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      <Loader2 size={16} className="inline animate-spin mr-2" aria-hidden="true" />
                      Loading...
                    </td>
                  </tr>
                )}
                {status !== "loading" && filteredRows.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-4 py-6 text-center"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      該当するノートがありません。
                    </td>
                  </tr>
                )}
                {status !== "loading" &&
                  filteredRows.map((row) => (
                    <tr key={row.path} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td className="px-4 py-3 break-all">{row.name}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {propertyToTags(row.properties.tags).map((tag) => (
                            <span key={tag} className="skill-badge text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {propertyToText(row.properties["creation date"])}
                      </td>
                      <td className="px-4 py-3">{formatDate(row.modifiedAt)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
            {filteredRows.length} / {total} notes
          </p>
        </div>
      )}
    </div>
  );
}
