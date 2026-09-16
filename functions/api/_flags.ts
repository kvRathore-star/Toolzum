/**
 * Lightweight feature-flag service (#41/49).
 *
 * D1-backed kill-switches: flipping a row disables a feature instantly,
 * no rebuild, no redeploy. Readers fail OPEN (missing table/row =
 * enabled) — a flag outage must never take the site down; the kill
 * direction (enabled -> disabled) is what matters and it always works.
 */

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS "feature_flag" (
    "key" text PRIMARY KEY,
    "enabled" integer NOT NULL DEFAULT 1,
    "note" text,
    "updatedAt" integer NOT NULL
  )
`;

const SEEDS: [string, number, string][] = [
  [
    "ai_generation",
    1,
    "Master kill-switch for server AI (generate/transcribe/image).",
  ],
  ["ai_image_gemini", 0, "Gemini HD image engine (unverified)."],
];

async function ensureTable(DB: D1Database): Promise<void> {
  try {
    await DB.prepare("SELECT 1 FROM feature_flag LIMIT 1").first();
  } catch {
    await DB.prepare(CREATE_TABLE).run();
    for (const [key, enabled, note] of SEEDS) {
      try {
        await DB.prepare(
          'INSERT OR IGNORE INTO "feature_flag" ("key", "enabled", "note", "updatedAt") VALUES (?, ?, ?, unixepoch())',
        )
          .bind(key, enabled, note)
          .run();
      } catch {
        /* seed best-effort */
      }
    }
  }
}

/** All flags as a key->boolean map. Unknown keys are absent (client defaults apply). */
export async function listFlags(DB: D1Database): Promise<Record<string, boolean>> {
  try {
    await ensureTable(DB);
    const res = await DB.prepare('SELECT "key", "enabled" FROM "feature_flag"').all<{
      key: string;
      enabled: number;
    }>();
    const out: Record<string, boolean> = {};
    for (const row of res.results || []) out[row.key] = row.enabled === 1;
    return out;
  } catch {
    return {};
  }
}

/** Single-flag read. Missing table/row => `fallback` (default: enabled). */
export async function isFlagEnabled(
  DB: D1Database,
  key: string,
  fallback = true,
): Promise<boolean> {
  try {
    await ensureTable(DB);
    const row = await DB.prepare('SELECT "enabled" FROM "feature_flag" WHERE "key" = ?')
      .bind(key)
      .first<{ enabled: number }>();
    if (!row) return fallback;
    return row.enabled === 1;
  } catch {
    return fallback;
  }
}

/** Admin write. Returns the stored value. */
export async function setFlag(
  DB: D1Database,
  key: string,
  enabled: boolean,
  note?: string,
): Promise<boolean> {
  await ensureTable(DB);
  const clean = key.trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 64);
  if (!clean) throw new Error("invalid_key");
  await DB.prepare(
    `INSERT INTO "feature_flag" ("key", "enabled", "note", "updatedAt") VALUES (?, ?, ?, unixepoch())
     ON CONFLICT("key") DO UPDATE SET "enabled" = excluded."enabled", "updatedAt" = excluded."updatedAt"` +
      (note !== undefined ? `, "note" = ?` : ""),
  )
    .bind(...(note !== undefined ? [clean, enabled ? 1 : 0, note] : [clean, enabled ? 1 : 0]))
    .run();
  return enabled;
}
