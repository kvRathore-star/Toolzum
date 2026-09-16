/**
 * AI-credit analytics (Sep 2026) — mirrors the download_event pattern so
 * credit walls are measurable the same way quota walls are:
 * which task drains credits, who hits empty, and whether blocks convert.
 *
 * Table is created lazily (same pattern as error-log.ts) — no migration step.
 * Logging never fails the request: all errors are swallowed after a best
 * effort insert.
 */

import { maybePurgeOldRows } from "../_retention";

export type AiCreditTask = "generate" | "transcribe" | "image";
export type AiCreditOutcome = "allowed" | "blocked_exhausted";

const CREATE_TABLE = `
  CREATE TABLE IF NOT EXISTS "ai_credit_event" (
    "userId" text NOT NULL,
    "task" text NOT NULL,
    "outcome" text NOT NULL,
    "balance" integer NOT NULL,
    "allowance" integer NOT NULL,
    "createdAt" integer NOT NULL
  )
`;
const CREATE_INDEX = `CREATE INDEX IF NOT EXISTS "ai_credit_event_task_outcome_idx" ON "ai_credit_event" ("task", "outcome")`;

async function ensureTable(DB: D1Database): Promise<void> {
  try {
    await DB.prepare("SELECT 1 FROM ai_credit_event LIMIT 1").first();
  } catch {
    await DB.prepare(CREATE_TABLE).run();
    await DB.prepare(CREATE_INDEX).run();
  }
}

export async function logAiCreditEvent(
  DB: D1Database,
  event: {
    userId: string;
    task: AiCreditTask;
    outcome: AiCreditOutcome;
    balance: number;
    allowance: number;
  },
): Promise<void> {
  try {
    await ensureTable(DB);
    await DB.prepare(
      `INSERT INTO ai_credit_event (userId, task, outcome, balance, allowance, createdAt)
       VALUES (?, ?, ?, ?, ?, unixepoch())`,
    )
      .bind(event.userId, event.task, event.outcome, event.balance, event.allowance)
      .run();
    // #26: sampled 90-day retention enforcement (no cron on Pages).
    await maybePurgeOldRows(DB);
  } catch {
    // Analytics must never break the request path.
  }
}
