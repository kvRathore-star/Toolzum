import { describe, it, expect, vi } from 'vitest';
import { isFlagEnabled, listFlags, setFlag } from '../../../functions/api/_flags';

// Minimal D1 stub: program canned first() rows by SQL substring.
function mockDb(rows: { match: string; value: unknown }[] = []) {
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => {
        for (const r of rows) if (sql.includes(r.match)) return r.value;
        return null;
      }),
      all: vi.fn(async () => ({ results: [] })),
      run: vi.fn(async () => ({})),
    })),
    first: vi.fn(async () => {
      for (const r of rows) if (sql.includes(r.match)) return r.value;
      return null;
    }),
    all: vi.fn(async () => ({ results: rows.length ? [] : [] })),
    run: vi.fn(async () => ({})),
  }));
  return { db: { prepare } as unknown as D1Database, prepare };
}

describe('flag service (#41/49)', () => {
  it('fails OPEN when the table is missing (flags never take the site down)', async () => {
    const { db } = mockDb();
    expect(await isFlagEnabled(db, 'ai_generation')).toBe(true);
    expect(await listFlags(db)).toEqual({});
  });

  it('reads stored values (0 = killed)', async () => {
    const { db } = mockDb([{ match: 'feature_flag', value: { enabled: 0 } }]);
    expect(await isFlagEnabled(db, 'ai_generation')).toBe(false);
  });

  it('setFlag writes 1/0 and sanitizes keys', async () => {
    const { db, prepare } = mockDb();
    await expect(setFlag(db, 'ai_generation', false)).resolves.toBe(false);
    const sqls = prepare.mock.calls.map((c) => c[0] as string);
    expect(sqls.some((s) => s.includes('feature_flag'))).toBe(true);
    await expect(setFlag(db, '!!!', true)).rejects.toThrow('invalid_key');
  });
});
