import { describe, it, expect, vi } from 'vitest';
import { deleteUserAppData } from '@/lib/userErasure';

describe('erasure cascade (#26: no orphaned app rows on self-delete)', () => {
  it('batch-deletes favorites, usage, payments, and AI-credit events', async () => {
    const batch = vi.fn(async () => []);
    // Prepare stub keeps its SQL reachable for assertions.
    const prepare = vi.fn((sql: string) => {
      const stmt = { sql, bind: vi.fn(() => stmt) };
      return stmt;
    });
    const db = { prepare, batch } as unknown as D1Database;

    await deleteUserAppData(db, 'user-1');

    expect(batch).toHaveBeenCalledTimes(1);
    expect(prepare).toHaveBeenCalled();
    const sqls = (batch.mock.calls[0][0] as { sql: string }[]).map((s) => s.sql);
    for (const table of [
      'user_favorite',
      'user_tool_usage',
      'payment',
      'ai_credit_event',
    ]) {
      expect(
        sqls.some((s) => s.includes(table)),
        `deletes ${table}`,
      ).toBe(true);
    }
    expect(prepare).toHaveBeenCalled();
  });

  it('never throws when the database fails', async () => {
    const db = {
      prepare: vi.fn(() => {
        throw new Error('D1 down');
      }),
      batch: vi.fn(async () => {
        throw new Error('D1 down');
      }),
    } as unknown as D1Database;
    await expect(deleteUserAppData(db, 'user-1')).resolves.toBeUndefined();
  });
});
