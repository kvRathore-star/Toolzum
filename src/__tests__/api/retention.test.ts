import { describe, it, expect, vi } from 'vitest';
import { maybePurgeOldRows, RETENTION_DAYS } from '../../../functions/api/_retention';

// Statement-level D1 stub that records every prepared SQL string.
function mockDb(opts?: { failTables?: string[] }) {
  const seen: string[] = [];
  const prepare = vi.fn((sql: string) => {
    const run = vi.fn(async () => {
      if (opts?.failTables?.some((t) => sql.includes(t))) {
        throw new Error(`no such table`);
      }
      seen.push(sql);
      return { meta: { changes: 3 } };
    });
    const stmt = { bind: vi.fn(() => stmt), run };
    return stmt;
  });
  return { db: { prepare } as unknown as D1Database, seen };
}

describe('90-day retention purge (#26)', () => {
  it('deletes from all five analytics tables with 90-day cutoffs', async () => {
    const { db, seen } = mockDb();
    const res = await maybePurgeOldRows(db, 1);
    expect(res).not.toBeNull();
    for (const table of [
      'analytics_event',
      'error_log',
      'download_event',
      'download_usage',
      'ai_credit_event',
    ]) {
      expect(
        seen.some((s) => s.includes(`DELETE FROM "${table}"`)),
        `purges ${table}`,
      ).toBe(true);
    }
    expect(seen.some((s) => s.includes('-90 days'))).toBe(true);
    expect(seen.some((s) => s.includes(String(RETENTION_DAYS * 86400)))).toBe(true);
    expect(RETENTION_DAYS).toBe(90);
  });

  it('skips entirely when sampling says no', async () => {
    const { db, seen } = mockDb();
    expect(await maybePurgeOldRows(db, 0)).toBeNull();
    expect(seen).toEqual([]);
  });

  it('never throws and still purges other tables when one is missing', async () => {
    const { db, seen } = mockDb({ failTables: ['ai_credit_event'] });
    const res = await maybePurgeOldRows(db, 1);
    expect(res).not.toBeNull();
    expect(seen.some((s) => s.includes('analytics_event'))).toBe(true);
    expect(seen.some((s) => s.includes('error_log'))).toBe(true);
  });
});
