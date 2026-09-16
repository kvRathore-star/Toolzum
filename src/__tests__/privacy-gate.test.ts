import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

/**
 * Privacy ship-gate (#51 — formalizes the #26/#44 audit categories).
 * New data collection, new tables, or new telemetry must update the
 * matching control, or this suite fails before the code ships:
 *
 * 1. Erasure: every userId-keyed table is cleared on account deletion
 *    (self-service hook + admin endpoint). D1 ignores FK cascades, so
 *    the lists below are the cascade — keep them complete.
 * 2. Retention: every analytics table has a 90-day purge target, and
 *    every module that writes to one also triggers the purge (Pages
 *    has no cron; writers carry the sweeper).
 * 3. Consent: every client telemetry sender honors Decline, and the
 *    consent key has a single source of truth.
 */
const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), "utf8");

function walk(dir: string, ext = /\.tsx?$/): string[] {
  const out: string[] = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(full, ext));
    else if (ext.test(e.name)) out.push(full);
  }
  return out;
}

// Tables with a userId column in the drizzle schema (better-auth deletes
// only rows it owns; these need explicit erasure).
function schemaUserTables(): string[] {
  const src = read("src/db/schema.ts");
  const tables: string[] = [];
  const blocks = src.matchAll(/sqliteTable\("([^"]+)", \{([\s\S]*?)\n\}\)/g);
  for (const b of blocks) {
    if (/["']userId["']/.test(b[2]!)) tables.push(b[1]!);
  }
  return tables.filter((t) => t !== "user");
}

// userId-keyed tables NOT in schema.ts (migration-SQL-only or lazy).
const EXTRA_USER_TABLES = ["download_event", "ai_credit_event"];

const ANALYTICS_TABLES = [
  "analytics_event",
  "error_log",
  "download_event",
  "download_usage",
  "ai_credit_event",
];

describe("privacy ship-gate (#51)", () => {
  it("erases every userId-keyed table on self-service delete", () => {
    const erasure = read("src/lib/userErasure.ts");
    const missing = [...schemaUserTables(), ...EXTRA_USER_TABLES].filter(
      (t) => !erasure.includes(t),
    );
    expect(missing, "tables orphaned on self-delete").toEqual([]);
  });

  it("erases every userId-keyed table on admin delete", () => {
    const admin = read("functions/api/admin/delete-user.ts");
    const missing = [...schemaUserTables(), ...EXTRA_USER_TABLES].filter(
      (t) => !admin.includes(t),
    );
    expect(missing, "tables orphaned on admin delete").toEqual([]);
  });

  it("purges every analytics table past 90 days", () => {
    const retention = read("functions/api/_retention.ts");
    const missing = ANALYTICS_TABLES.filter((t) => !retention.includes(`"${t}"`));
    expect(missing, "analytics tables without a purge target").toEqual([]);
    expect(retention).toContain("90");
  });

  it("every analytics writer triggers the purge", () => {
    const offenders: string[] = [];
    for (const full of walk(path.join(ROOT, "functions"), /\.ts$/)) {
      const content = fs.readFileSync(full, "utf8");
      const writes = ANALYTICS_TABLES.some((t) =>
        content.includes(`INSERT INTO ${t}`) ||
        content.includes(`INSERT INTO "${t}"`),
      );
      if (writes && !content.includes("maybePurgeOldRows")) {
        offenders.push(path.relative(ROOT, full));
      }
    }
    expect(offenders, "analytics writers without a purge trigger").toEqual([]);
  });

  it("every client telemetry sender honors Decline", () => {
    const offenders: string[] = [];
    for (const full of walk(path.join(ROOT, "src"), /\.tsx?$/)) {
      const rel = path.relative(ROOT, full);
      if (rel.includes("__tests__")) continue;
      const content = fs.readFileSync(full, "utf8");
      const sendsTelemetry =
        (content.includes("fetch(") && content.includes("/api/analytics")) ||
        content.includes("posthog.init");
      if (sendsTelemetry && !content.includes("mayCollectTelemetry")) {
        offenders.push(rel);
      }
    }
    expect(offenders, "telemetry senders ignoring Decline").toEqual([]);
  });

  it("the consent key has a single source of truth", () => {
    const offenders: string[] = [];
    for (const full of walk(path.join(ROOT, "src"), /\.tsx?$/)) {
      const rel = path.relative(ROOT, full);
      if (rel.endsWith("privacy-gate.test.ts")) continue;
      const content = fs.readFileSync(full, "utf8");
      if (
        content.includes("th_gdpr_consent") &&
        !rel.endsWith("lib/consent.ts") &&
        !content.includes("lib/consent")
      ) {
        offenders.push(rel);
      }
    }
    expect(offenders, "consent key duplicated outside lib/consent").toEqual([]);
  });
});
