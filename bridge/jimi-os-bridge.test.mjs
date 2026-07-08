import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";

// Point the module at a throwaway vault root *before* importing it, since
// config.vaultRoot is computed once at module load time.
const vaultRoot = mkdtempSync(path.join(tmpdir(), "jimi-vault-test-"));
process.env.JIMI_OS_VAULT_ROOT = vaultRoot;

const {
  isExcluded,
  safeResolve,
  parseFrontmatter,
  matchesWhereClause,
  sortValueFor,
  unquoteScalar,
  parseInlineArray,
} = await import("./jimi-os-bridge.mjs");

// --- isExcluded ---------------------------------------------------------

test("isExcluded blocks 重要データ.md in NFC form", () => {
  const nfc = "02_Area/個人/重要データ.md".normalize("NFC");
  assert.equal(isExcluded(nfc), true);
});

test("isExcluded blocks 重要データ.md in NFD form (real macOS/iCloud filename)", () => {
  // macOS/iCloud decomposes "デ" into base + combining dakuten. This is the
  // exact 2026-07-08 regression: NFD filenames silently bypassed the filter.
  const nfd = "02_Area/個人/重要データ.md".normalize("NFD");
  assert.notEqual(nfd, nfd.normalize("NFC")); // sanity: NFD really differs from NFC here
  assert.equal(isExcluded(nfd), true);
});

test("isExcluded does not flag an unrelated markdown file", () => {
  assert.equal(isExcluded("00_Home/index.md"), false);
});

// --- safeResolve ---------------------------------------------------------

test("safeResolve rejects .. traversal out of the vault root", () => {
  assert.throws(() => safeResolve("../../etc/passwd"));
});

test("safeResolve rejects paths that otherwise escape the vault root", () => {
  assert.throws(() => safeResolve("00_Home/../../../etc/passwd"));
});

test("safeResolve accepts a normal in-vault path", () => {
  const resolved = safeResolve("00_Home/index.md");
  assert.equal(resolved, path.join(vaultRoot, "00_Home/index.md"));
});

// --- parseFrontmatter -----------------------------------------------------

test("parseFrontmatter parses scalars, inline arrays, and block lists", () => {
  const content = [
    "---",
    'title: "Hello World"',
    "count: 42",
    'tags: [a, b, "c d"]',
    "aliases:",
    "  - Alias One",
    '  - "Alias Two"',
    "---",
    "Body content here",
  ].join("\n");

  assert.deepEqual(parseFrontmatter(content), {
    title: "Hello World",
    count: "42",
    tags: ["a", "b", "c d"],
    aliases: ["Alias One", "Alias Two"],
  });
});

test("parseFrontmatter returns {} when there is no frontmatter block", () => {
  assert.deepEqual(parseFrontmatter("# Just a heading\n\nbody text"), {});
});

test("parseFrontmatter returns {} for an unterminated (broken) frontmatter block", () => {
  const content = ["---", "title: Unclosed", "no closing delimiter"].join("\n");
  assert.deepEqual(parseFrontmatter(content), {});
});

// --- matchesWhereClause -----------------------------------------------------

const row = {
  name: "psalm-44",
  modifiedAt: "2026-01-01T00:00:00.000Z",
  properties: {
    title: "Hello World",
    tags: ["説教", "詩篇"],
  },
};

test("matchesWhereClause: eq on an array property", () => {
  assert.equal(matchesWhereClause(row, { field: "tags", op: "eq", value: "詩篇" }), true);
  assert.equal(matchesWhereClause(row, { field: "tags", op: "eq", value: "箇条" }), false);
});

test("matchesWhereClause: neq on an array property", () => {
  assert.equal(matchesWhereClause(row, { field: "tags", op: "neq", value: "箇条" }), true);
  assert.equal(matchesWhereClause(row, { field: "tags", op: "neq", value: "詩篇" }), false);
});

test("matchesWhereClause: contains on a string property (case-insensitive)", () => {
  assert.equal(matchesWhereClause(row, { field: "title", op: "contains", value: "ell" }), true);
  assert.equal(matchesWhereClause(row, { field: "title", op: "contains", value: "zzz" }), false);
});

test("matchesWhereClause: exists on an array property", () => {
  assert.equal(matchesWhereClause(row, { field: "tags", op: "exists" }), true);
  assert.equal(
    matchesWhereClause({ ...row, properties: { ...row.properties, tags: [] } }, { field: "tags", op: "exists" }),
    false,
  );
});

test("matchesWhereClause: exists on a string property", () => {
  assert.equal(matchesWhereClause(row, { field: "title", op: "exists" }), true);
  assert.equal(
    matchesWhereClause({ ...row, properties: { ...row.properties, title: undefined } }, { field: "title", op: "exists" }),
    false,
  );
});

// --- sortValueFor / unquoteScalar / parseInlineArray -----------------------

test("sortValueFor reads direct row fields and joins array properties", () => {
  assert.equal(sortValueFor(row, "modifiedAt"), "2026-01-01T00:00:00.000Z");
  assert.equal(sortValueFor(row, "name"), "psalm-44");
  assert.equal(sortValueFor(row, "tags"), "説教,詩篇");
  assert.equal(sortValueFor(row, "missing"), "");
});

test("unquoteScalar strips matching double or single quotes only", () => {
  assert.equal(unquoteScalar('"quoted"'), "quoted");
  assert.equal(unquoteScalar("'quoted'"), "quoted");
  assert.equal(unquoteScalar("bare"), "bare");
  assert.equal(unquoteScalar('"mismatched\''), "\"mismatched'");
});

test("parseInlineArray splits, trims, and unquotes items", () => {
  assert.deepEqual(parseInlineArray("[a, b, \"c d\"]"), ["a", "b", "c d"]);
  assert.deepEqual(parseInlineArray("[]"), []);
});
