import { describe, it, expect, vi } from 'vitest';
import { onRequestPost } from '../../../functions/api/analytics';

function mockDb(opts: { failNewCols?: boolean } = {}) {
  const runs: { sql: string; args: unknown[] }[] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn((...args: unknown[]) => ({
      run: vi.fn(async () => {
        runs.push({ sql, args });
        if (opts.failNewCols && sql.includes('event, vote')) {
          throw new Error('no such column');
        }
        return {};
      }),
      first: vi.fn(async () => null),
      all: vi.fn(async () => ({ results: [] })),
    })),
  }));
  return { db: { prepare } as unknown as D1Database, runs };
}

function req(body: unknown) {
  return new Request('https://toolzum.com/api/analytics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const ENV = (db: D1Database) => ({ DB: db });

describe('POST /api/analytics votes', () => {
  it('stores yes votes with event marker', async () => {
    const { db, runs } = mockDb();
    const res = await onRequestPost({ request: req({ path: '/pdf/pdf-editor', event: 'vote', vote: 'yes' }), env: ENV(db) });
    expect(res.status).toBe(200);
    const insert = runs.find((r) => r.sql.includes('event, vote'));
    expect(insert).toBeDefined();
    expect(insert!.args).toContain('vote');
    expect(insert!.args).toContain('yes');
  });

  it('rejects vote events with invalid vote values', async () => {
    const { db, runs } = mockDb();
    const res = await onRequestPost({ request: req({ path: '/pdf/pdf-editor', event: 'vote', vote: 'maybe' }), env: ENV(db) });
    expect(res.status).toBe(400);
    expect(runs.filter((r) => r.sql.startsWith('INSERT'))).toEqual([]);
  });

  it('falls back to legacy insert on pre-migration DBs (vote lost, event kept)', async () => {
    const { db, runs } = mockDb({ failNewCols: true });
    const res = await onRequestPost({ request: req({ path: '/pdf/pdf-editor', event: 'vote', vote: 'no' }), env: ENV(db) });
    expect(res.status).toBe(200);
    const newShape = runs.filter((r) => r.sql.includes('event, vote'));
    const legacy = runs.filter((r) => r.sql.startsWith('INSERT INTO analytics_event') && !r.sql.includes('event, vote') && !r.sql.includes("'rate-limit'"));
    expect(newShape.length).toBe(1);
    expect(legacy.length).toBe(1);
  });

  it('plain pageviews still store with null event/vote', async () => {
    const { db, runs } = mockDb();
    const res = await onRequestPost({ request: req({ path: '/pdf/pdf-editor' }), env: ENV(db) });
    expect(res.status).toBe(200);
    const insert = runs.find((r) => r.sql.includes('event, vote'));
    expect(insert).toBeDefined();
    expect(insert!.args.slice(-2)).toEqual([null, null]);
  });
});
