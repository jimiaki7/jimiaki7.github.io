#!/usr/bin/env node
import { createHash, randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { homedir } from "node:os";
import path from "node:path";
import { readdir, readFile, stat } from "node:fs/promises";

const defaultVaultRoot = path.join(
  homedir(),
  "Library/Mobile Documents/iCloud~md~obsidian/Documents/JimiVault",
);

const config = {
  host: process.env.JIMI_OS_BRIDGE_HOST || "127.0.0.1",
  port: Number(process.env.JIMI_OS_BRIDGE_PORT || 3737),
  token: process.env.JIMI_OS_BRIDGE_TOKEN || randomBytes(24).toString("hex"),
  vaultRoot: path.resolve(process.env.JIMI_OS_VAULT_ROOT || defaultVaultRoot),
  readOnly: process.env.JIMI_OS_BRIDGE_READ_ONLY !== "false",
  mulmoUrl: process.env.JIMI_OS_MULMO_URL || "http://127.0.0.1:3001",
  allowedOrigins: new Set([
    "https://jimiaki7.github.io",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    ...(process.env.JIMI_OS_ALLOWED_ORIGINS || "")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean),
  ]),
};

const excludedPatterns = [
  "**/重要データ.md",
  "**/*secret*",
  "**/*credential*",
  "**/keys.json",
  "**/.env*",
];

const excludedFragments = [
  "重要データ.md",
  "keys.json",
  ".env",
  "secret",
  "credential",
  "node_modules",
  ".git",
];

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (config.allowedOrigins.has(origin)) return true;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": isAllowedOrigin(origin)
      ? origin || "http://127.0.0.1"
      : "null",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function sendJson(response, status, body, origin) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    ...corsHeaders(origin),
  });
  response.end(JSON.stringify(body, null, 2));
}

function isAuthorized(request) {
  return request.headers.authorization === `Bearer ${config.token}`;
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function isExcluded(relativePath) {
  // ponytail: macOS/iCloud filenames are often NFD (e.g. "デ" decomposes to base+dakuten),
  // while source string literals are NFC — normalize both sides or dakuten/handakuten
  // filenames (like 重要データ.md itself) silently skip the exclusion filter.
  const normalized = relativePath.split(path.sep).join("/").normalize("NFC").toLowerCase();
  return excludedFragments.some((fragment) =>
    normalized.includes(fragment.normalize("NFC").toLowerCase()),
  );
}

function safeResolve(relativePath) {
  const target = path.resolve(config.vaultRoot, relativePath || ".");
  if (!target.startsWith(config.vaultRoot)) {
    throw new Error("Path escapes the configured Vault root.");
  }
  const rel = path.relative(config.vaultRoot, target);
  if (isExcluded(rel)) {
    throw new Error("This path is excluded by the Bridge safety policy.");
  }
  return target;
}

async function collectMarkdownFiles(directory, output = []) {
  if (output.length >= 5000) return output;

  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    const relative = path.relative(config.vaultRoot, absolute);
    if (isExcluded(relative)) continue;

    if (entry.isDirectory()) {
      await collectMarkdownFiles(absolute, output);
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      output.push(absolute);
    }
  }

  return output;
}

function titleFromContent(filePath, content) {
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading?.[1]) return heading[1].trim();
  return path.basename(filePath, ".md");
}

function excerptFor(content, query) {
  const plain = content
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/\s+/g, " ")
    .trim();
  const lower = plain.toLowerCase();
  const index = lower.indexOf(query.toLowerCase());
  const start = index >= 0 ? Math.max(0, index - 80) : 0;
  return plain.slice(start, start + 240);
}

async function searchVault(body) {
  const query = String(body.query || "").trim();
  const limit = Math.min(Number(body.limit || 10), 25);
  if (!query) return { results: [] };

  const files = await collectMarkdownFiles(config.vaultRoot);
  const results = [];

  for (const file of files) {
    if (results.length >= limit) break;
    const content = await readFile(file, "utf8");
    if (!content.toLowerCase().includes(query.toLowerCase())) continue;
    const fileStat = await stat(file);
    results.push({
      path: path.relative(config.vaultRoot, file),
      title: titleFromContent(file, content),
      excerpt: excerptFor(content, query),
      modifiedAt: fileStat.mtime.toISOString(),
    });
  }

  return { results };
}

async function readVaultFile(body) {
  const requestedPath = String(body.path || "");
  const target = safeResolve(requestedPath);
  const content = await readFile(target, "utf8");
  return {
    path: path.relative(config.vaultRoot, target),
    title: titleFromContent(target, content),
    content,
    sha256: createHash("sha256").update(content).digest("hex"),
  };
}

async function syncVault(body) {
  const limit = Math.min(Number(body.limit || 100), 500);
  const files = (await collectMarkdownFiles(config.vaultRoot)).slice(0, limit);
  const items = [];

  for (const file of files) {
    const content = await readFile(file, "utf8");
    const fileStat = await stat(file);
    items.push({
      title: titleFromContent(file, content),
      source_path: path.relative(config.vaultRoot, file),
      summary: excerptFor(content, ""),
      tags: [],
      strength: 50,
      modifiedAt: fileStat.mtime.toISOString(),
      contentHash: createHash("sha256").update(content).digest("hex"),
    });
  }

  return { items };
}

function unquoteScalar(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"') && trimmed.length >= 2) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'") && trimmed.length >= 2)
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseInlineArray(value) {
  const inner = value.trim().replace(/^\[/, "").replace(/\]$/, "");
  if (!inner.trim()) return [];
  return inner.split(",").map((item) => unquoteScalar(item));
}

// ponytail: full YAML非対応（スカラー/リストのみ）、必要になったらjs-yaml
function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const properties = {};
  let currentKey = null;

  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;

    const listItemMatch = line.match(/^\s+-\s?(.*)$/);
    if (listItemMatch && currentKey) {
      if (!Array.isArray(properties[currentKey])) properties[currentKey] = [];
      properties[currentKey].push(unquoteScalar(listItemMatch[1]));
      continue;
    }

    const topLevelMatch = line.match(/^(\S[^:]*):\s*(.*)$/);
    if (!topLevelMatch) {
      // Indented, non-list line (nested map etc.) — ignored by design.
      currentKey = null;
      continue;
    }

    const key = topLevelMatch[1].trim();
    const rawValue = topLevelMatch[2];

    if (!rawValue) {
      properties[key] = [];
      currentKey = key;
      continue;
    }

    currentKey = null;
    properties[key] = rawValue.trim().startsWith("[")
      ? parseInlineArray(rawValue)
      : unquoteScalar(rawValue);
  }

  return properties;
}

function matchesWhereClause(row, clause) {
  const { field, op, value } = clause || {};
  const actual =
    field === "modifiedAt" || field === "name" ? row[field] : row.properties[field];

  if (op === "exists") {
    if (Array.isArray(actual)) return actual.length > 0;
    return actual !== undefined && actual !== null && actual !== "";
  }
  if (actual === undefined || actual === null) return false;

  if (op === "eq") {
    return Array.isArray(actual) ? actual.includes(value) : actual === value;
  }
  if (op === "neq") {
    return Array.isArray(actual) ? !actual.includes(value) : actual !== value;
  }
  if (op === "contains") {
    if (Array.isArray(actual)) return actual.includes(value);
    if (typeof actual === "string") {
      return actual.toLowerCase().includes(String(value).toLowerCase());
    }
    return false;
  }
  return false;
}

function sortValueFor(row, field) {
  const value = field === "modifiedAt" || field === "name" ? row[field] : row.properties[field];
  if (Array.isArray(value)) return value.join(",");
  return value === undefined || value === null ? "" : String(value);
}

async function listMarkdownFilesDirect(directory) {
  // Non-recursive: only .md files directly inside `directory` (no subfolder walk).
  const entries = await readdir(directory, { withFileTypes: true });
  const output = [];
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith(".md")) continue;
    const absolute = path.join(directory, entry.name);
    if (isExcluded(path.relative(config.vaultRoot, absolute))) continue;
    output.push(absolute);
  }
  return output;
}

function sortStubsInPlace(stubs, sortField, sortOrder) {
  stubs.sort((a, b) => {
    const av = sortValueFor(a, sortField);
    const bv = sortValueFor(b, sortField);
    if (av === bv) return 0;
    const direction = av < bv ? -1 : 1;
    return sortOrder === "asc" ? direction : -direction;
  });
}

async function queryVaultDb(body) {
  const folder = String(body.folder || "");
  // safeResolve rejects ".." traversal and folders matched by the exclusion list;
  // folder === "" resolves to the vault root itself.
  const folderAbs = safeResolve(folder);
  const recursive = body.recursive !== false;
  const where = Array.isArray(body.where) ? body.where : [];
  const sort = body.sort && typeof body.sort === "object" ? body.sort : {};
  const sortField = sort.field || "modifiedAt";
  const sortOrder = sort.order === "asc" ? "asc" : "desc";
  const limit = Math.min(Math.max(Number(body.limit) || 50, 1), 200);

  // ponytail: walk only the requested folder subtree, not the whole vault —
  // scanning 1,700+ files just to throw most of them away was the perf bug.
  let candidates;
  try {
    candidates = recursive
      ? await collectMarkdownFiles(folderAbs)
      : await listMarkdownFilesDirect(folderAbs);
  } catch (error) {
    if (error && error.code === "ENOENT") return { rows: [], total: 0 };
    throw error;
  }

  // Fast path: no filter and sorting only needs stat data, so read frontmatter
  // for the `limit` winners instead of every candidate file.
  if (where.length === 0 && (sortField === "modifiedAt" || sortField === "name")) {
    const stubs = [];
    for (const file of candidates) {
      const fileStat = await stat(file);
      stubs.push({
        path: path.relative(config.vaultRoot, file).split(path.sep).join("/"),
        name: path.basename(file, ".md"),
        modifiedAt: fileStat.mtime.toISOString(),
        file,
      });
    }

    sortStubsInPlace(stubs, sortField, sortOrder);

    const rows = [];
    for (const stub of stubs.slice(0, limit)) {
      const content = await readFile(stub.file, "utf8");
      rows.push({
        path: stub.path,
        name: stub.name,
        modifiedAt: stub.modifiedAt,
        properties: parseFrontmatter(content),
      });
    }

    return { rows, total: stubs.length };
  }

  // where clauses (or a custom sort field) need every candidate's frontmatter.
  const rows = [];
  for (const file of candidates) {
    const content = await readFile(file, "utf8");
    const fileStat = await stat(file);
    const row = {
      path: path.relative(config.vaultRoot, file).split(path.sep).join("/"),
      name: path.basename(file, ".md"),
      modifiedAt: fileStat.mtime.toISOString(),
      properties: parseFrontmatter(content),
    };

    if (where.every((clause) => matchesWhereClause(row, clause))) {
      rows.push(row);
    }
  }

  sortStubsInPlace(rows, sortField, sortOrder);

  return { rows: rows.slice(0, limit), total: rows.length };
}

async function checkMulmoHealth() {
  const url = config.mulmoUrl;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(url, { signal: controller.signal });
    return { ok: true, url, status: res.status };
  } catch {
    return { ok: false, url, error: "offline" };
  } finally {
    clearTimeout(timer);
  }
}

async function proposeWrite(body) {
  const requestedPath = String(body.path || "");
  const proposedContent = String(body.content || "");
  const target = safeResolve(requestedPath);

  return {
    writeAllowed: false,
    readOnly: config.readOnly,
    targetPath: path.relative(config.vaultRoot, target),
    proposedContent,
    proposal:
      "Bridge does not write to JimiVault directly. Review this proposal and apply it manually or through an approved future workflow.",
  };
}

const server = createServer(async (request, response) => {
  const origin = request.headers.origin || "";

  if (!isAllowedOrigin(origin)) {
    sendJson(response, 403, { error: "Origin is not allowed." }, origin);
    return;
  }

  if (request.method === "OPTIONS") {
    response.writeHead(204, corsHeaders(origin));
    response.end();
    return;
  }

  if (!isAuthorized(request)) {
    sendJson(response, 401, { error: "Unauthorized Bridge request." }, origin);
    return;
  }

  try {
    const url = new URL(request.url || "/", `http://${config.host}:${config.port}`);

    if (request.method === "GET" && url.pathname === "/health") {
      sendJson(
        response,
        200,
        {
          ok: true,
          name: "jimi-os-bridge",
          vaultRoot: config.vaultRoot,
          readOnly: config.readOnly,
          excludedPatterns,
        },
        origin,
      );
      return;
    }

    if (request.method === "GET" && url.pathname === "/mulmo/health") {
      sendJson(response, 200, await checkMulmoHealth(), origin);
      return;
    }

    if (request.method !== "POST") {
      sendJson(response, 405, { error: "Method not allowed." }, origin);
      return;
    }

    const body = await readBody(request);
    if (url.pathname === "/vault/search") {
      sendJson(response, 200, await searchVault(body), origin);
      return;
    }
    if (url.pathname === "/vault/read") {
      sendJson(response, 200, await readVaultFile(body), origin);
      return;
    }
    if (url.pathname === "/vault/sync") {
      sendJson(response, 200, await syncVault(body), origin);
      return;
    }
    if (url.pathname === "/vault/db/query") {
      sendJson(response, 200, await queryVaultDb(body), origin);
      return;
    }
    if (url.pathname === "/proposal/write-note") {
      sendJson(response, 200, await proposeWrite(body), origin);
      return;
    }

    sendJson(response, 404, { error: "Unknown endpoint." }, origin);
  } catch (error) {
    sendJson(
      response,
      500,
      { error: error instanceof Error ? error.message : "Bridge error." },
      origin,
    );
  }
});

server.listen(config.port, config.host, () => {
  console.log(`Jimi OS Bridge listening on http://${config.host}:${config.port}`);
  console.log(`Vault root: ${config.vaultRoot}`);
  console.log(`Bridge token: ${config.token}`);
  console.log("Paste the token into /os/settings. Keep it local.");
});
