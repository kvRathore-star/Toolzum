import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Data-migration story gate (#27).
 *
 * History: analytics tables were created lazily at request time
 * (ensureTable / CREATE TABLE IF NOT EXISTS in functions/), while
 * versioned migrations in src/db/migrations/ were applied manually or
 * never — so schemas lived in two places and drifted silently.
 *
 * Rules from now on:
 * 1. Every runtime-created table has a versioned migration (the source
 *    of truth; runtime DDL stays only as an idempotent fallback).
 * 2. Column sets are identical between each runtime copy and its
 *    migration (the error_log schema existed in 3 places).
 * 3. Every retention-purged table has a versioned migration.
 */
const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

function walk(dir: string, ext: RegExp): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full, ext));
    else if (ext.test(e.name)) out.push(full);
  }
  return out;
}

// table -> set of column names for every CREATE TABLE IF NOT EXISTS found.
function collectCreates(files: string[]): Map<string, Set<string>> {
  const tables = new Map<string, Set<string>>();
  for (const full of files) {
    const content = fs.readFileSync(full, "utf8");
    for (const m of content.matchAll(
      /CREATE TABLE\s+(?:IF NOT EXISTS\s+)?"?(\w+)"?\s*\(([\s\S]*?)\)\s*;/g,
    )) {
      const cols = new Set<string>();
      for (const line of m[2]!.split("\n")) {
        const name = line
          .trim()
          .match(/^"?(\w+)"?\s+(text|integer|real|blob|numeric)/i)?.[1]
          ?.toLowerCase();
        if (name) cols.add(name);
      }
      const prev = tables.get(m[1]!);
      if (prev) for (const c of cols) prev.add(c);
      else tables.set(m[1]!, cols);
    }
  }
  return tables;
}

// Tables the retention sweeper deletes from (must all be migrated).
function purgeTargets(): string[] {
  const src = read("functions/api/_retention.ts");
  const body = src.match(/PURGE_TARGETS[^=]*=\s*\[([\s\S]*?)\];/)?.[1] ?? "";
  return [...body.matchAll(/\[\s*"([^"]+)"/g)].map((m) => m[1]!);
}

const RUNTIME_FILES = [
  ...walk(path.join(ROOT, "functions"), /\.ts$/),
  ...walk(path.join(ROOT, "src/lib"), /\.ts$/),
];
const MIGRATION_FILES = walk(path.join(ROOT, "src/db/migrations"), /\.sql$/);

describe("data-migration story (#27)", () => {
  it("every runtime-created table has a versioned migration", () => {
    const runtime = collectCreates(RUNTIME_FILES);
    const migrated = collectCreates(MIGRATION_FILES);
    const missing = [...runtime.keys()].filter((t) => !migrated.has(t));
    expect(
      missing,
      "tables created lazily with no versioned migration",
    ).toEqual([]);
    expect(runtime.size).toBeGreaterThan(0);
  });

  it("runtime and migration column sets are identical (no drift)", () => {
    const runtime = collectCreates(RUNTIME_FILES);
    const migrated = collectCreates(MIGRATION_FILES);
    const drift: string[] = [];
    for (const [table, rcols] of runtime) {
      const mcols = migrated.get(table);
      if (!mcols) continue;
      const onlyRuntime = [...rcols].filter((c) => !mcols.has(c));
      const onlyMigrated = [...mcols].filter((c) => !rcols.has(c));
      if (onlyRuntime.length || onlyMigrated.length) {
        drift.push(
          `${table}: runtime-only {${onlyRuntime}} vs migration-only {${onlyMigrated}}`,
        );
      }
    }
    expect(drift, "schema drift between runtime DDL and migrations").toEqual(
      [],
    );
  });

  it("every retention-purged table has a versioned migration", () => {
    const migrated = collectCreates(MIGRATION_FILES);
    const missing = purgeTargets().filter((t) => !migrated.has(t));
    expect(missing, "purged tables without a migration").toEqual([]);
  });
});
