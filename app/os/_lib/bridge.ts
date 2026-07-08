import { z } from "zod";
import { DEFAULT_BRIDGE_URL } from "./config";

export type BridgeSettings = {
  url: string;
  token: string;
};

export type BridgeHealth = {
  ok: boolean;
  name?: string;
  vaultRoot?: string;
  readOnly?: boolean;
  excludedPatterns?: string[];
  error?: string;
};

export type VaultSearchResult = {
  path: string;
  title: string;
  excerpt: string;
  modifiedAt?: string;
};

export type VaultDbWhere = {
  field: string;
  op: "eq" | "neq" | "contains" | "exists";
  value?: unknown;
};

export type VaultDbQuery = {
  folder?: string;
  recursive?: boolean;
  where?: VaultDbWhere[];
  sort?: { field: string; order: "asc" | "desc" };
  limit?: number;
};

export type VaultDbRow = {
  path: string;
  name: string;
  modifiedAt?: string;
  properties: Record<string, unknown>;
};

export type VaultDbResult = {
  rows: VaultDbRow[];
  total: number;
};

export type MulmoHealth = {
  ok: boolean;
  url?: string;
  status?: number;
  error?: string;
};

// Bridgeはローカルプロセスとはいえ信頼境界の外。4つのfetch応答をzodで検証する。
const bridgeHealthSchema = z.object({
  ok: z.boolean(),
  name: z.string().optional(),
  vaultRoot: z.string().optional(),
  readOnly: z.boolean().optional(),
  excludedPatterns: z.array(z.string()).optional(),
  error: z.string().optional(),
});

const vaultSearchResultSchema = z.object({
  path: z.string(),
  title: z.string(),
  excerpt: z.string(),
  modifiedAt: z.string().optional(),
});

const vaultSearchResponseSchema = z.object({
  results: z.array(vaultSearchResultSchema).optional(),
});

const vaultDbRowSchema = z.object({
  path: z.string(),
  name: z.string(),
  modifiedAt: z.string().optional(),
  properties: z.record(z.string(), z.unknown()),
});

const vaultDbResponseSchema = z.object({
  rows: z.array(vaultDbRowSchema).optional(),
  total: z.number().optional(),
});

const mulmoHealthSchema = z.object({
  ok: z.boolean(),
  url: z.string().optional(),
  status: z.number().optional(),
  error: z.string().optional(),
});

const urlKey = "jimi-os.bridge.url";
const tokenKey = "jimi-os.bridge.token";

export function getBridgeSettings(): BridgeSettings {
  if (typeof window === "undefined") {
    return { url: DEFAULT_BRIDGE_URL, token: "" };
  }

  return {
    url: window.localStorage.getItem(urlKey) || DEFAULT_BRIDGE_URL,
    token: window.localStorage.getItem(tokenKey) || "",
  };
}

export function saveBridgeSettings(settings: BridgeSettings) {
  window.localStorage.setItem(urlKey, settings.url);
  window.localStorage.setItem(tokenKey, settings.token);
}

export async function checkBridgeHealth(
  settings: BridgeSettings,
): Promise<BridgeHealth> {
  if (!settings.token) {
    return { ok: false, error: "Bridge token is not set." };
  }

  try {
    const response = await fetch(`${settings.url.replace(/\/$/, "")}/health`, {
      headers: {
        Authorization: `Bearer ${settings.token}`,
      },
      signal: AbortSignal.timeout(2500),
    });

    if (!response.ok) {
      return { ok: false, error: `Bridge returned ${response.status}.` };
    }

    const parsed = bridgeHealthSchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: "Bridge returned a malformed response." };
    }

    return { ...parsed.data, ok: Boolean(parsed.data.ok) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Bridge is offline.",
    };
  }
}

export async function searchVault(
  settings: BridgeSettings,
  query: string,
): Promise<VaultSearchResult[]> {
  const response = await fetch(`${settings.url.replace(/\/$/, "")}/vault/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, limit: 8 }),
  });

  if (!response.ok) {
    throw new Error(`Bridge search failed with ${response.status}.`);
  }

  const parsed = vaultSearchResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Bridge search response was malformed.");
  }

  return parsed.data.results ?? [];
}

export async function queryVaultDb(
  settings: BridgeSettings,
  query: VaultDbQuery,
): Promise<VaultDbResult> {
  const response = await fetch(`${settings.url.replace(/\/$/, "")}/vault/db/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(query),
  });

  if (!response.ok) {
    throw new Error(`Bridge db query failed with ${response.status}.`);
  }

  const parsed = vaultDbResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Bridge db query response was malformed.");
  }

  return { rows: parsed.data.rows ?? [], total: parsed.data.total ?? 0 };
}

export async function checkMulmoHealth(
  settings: BridgeSettings,
): Promise<MulmoHealth> {
  if (!settings.token) {
    return { ok: false, error: "Bridge token is not set." };
  }

  try {
    const response = await fetch(`${settings.url.replace(/\/$/, "")}/mulmo/health`, {
      headers: {
        Authorization: `Bearer ${settings.token}`,
      },
      signal: AbortSignal.timeout(2500),
    });

    if (!response.ok) {
      return { ok: false, error: `Bridge returned ${response.status}.` };
    }

    const parsed = mulmoHealthSchema.safeParse(await response.json());
    if (!parsed.success) {
      return { ok: false, error: "Bridge returned a malformed response." };
    }

    return { ...parsed.data, ok: Boolean(parsed.data.ok) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "MulmoClaude is offline.",
    };
  }
}
