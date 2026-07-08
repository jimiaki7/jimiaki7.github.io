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

    const body = (await response.json()) as BridgeHealth;
    return { ...body, ok: Boolean(body.ok) };
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

  const body = (await response.json()) as { results?: VaultSearchResult[] };
  return body.results ?? [];
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

  const body = (await response.json()) as Partial<VaultDbResult>;
  return { rows: body.rows ?? [], total: body.total ?? 0 };
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

    const body = (await response.json()) as MulmoHealth;
    return { ...body, ok: Boolean(body.ok) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "MulmoClaude is offline.",
    };
  }
}
