/**
 * GDPR/CCPA erasure cascade (#26).
 *
 * D1 does not enforce foreign-key cascades, and better-auth only deletes
 * the rows it owns (user/session/account/verification). Without this,
 * self-service deletion orphans rows in app tables that still reference
 * the deleted userId. Called from the better-auth `user.delete.after`
 * hook (self-service) and mirrors the admin delete-user endpoint.
 *
 * Never throws — erasure cleanup must not break account deletion.
 */

export async function deleteUserAppData(
  DB: D1Database,
  userId: string,
): Promise<void> {
  try {
    await DB.batch([
      DB.prepare("DELETE FROM user_favorite WHERE userId = ?").bind(userId),
      DB.prepare("DELETE FROM user_tool_usage WHERE userId = ?").bind(userId),
      DB.prepare("DELETE FROM payment WHERE userId = ?").bind(userId),
      // Signed-in download history (fingerprint-keyed analytics stay —
      // they can't identify anyone once the userId link is gone).
      DB.prepare("DELETE FROM download_event WHERE userId = ?").bind(userId),
      // Lazily created (see functions/api/ai/credit-events.ts) — ensure
      // first so one missing table can't abort the whole batch.
      DB.prepare(
        `CREATE TABLE IF NOT EXISTS "ai_credit_event" (
          "userId" text NOT NULL, "task" text NOT NULL,
          "outcome" text NOT NULL, "balance" integer NOT NULL,
          "allowance" integer NOT NULL, "createdAt" integer NOT NULL
        )`,
      ),
      DB.prepare("DELETE FROM ai_credit_event WHERE userId = ?").bind(userId),
    ]);
  } catch {
    /* best effort — the user row itself is already gone */
  }
}
