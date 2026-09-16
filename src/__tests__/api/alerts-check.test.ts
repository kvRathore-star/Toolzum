import { describe, it, expect, vi } from 'vitest';
import { onRequestGet as alertsCheck } from '../../../functions/api/admin/alerts-check';

function mockDb(opts?: {
  errors?: number;
  blocked?: number;
  total?: number;
  cooldownFresh?: boolean;
}) {
  const { errors = 0, blocked = 0, total = 0, cooldownFresh = false } = opts ?? {};
  const runs: string[] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn((..._args: unknown[]) => ({
      first: vi.fn(async () => {
        if (sql.includes('FROM "error_log"')) return { c: errors };
        if (sql.includes('FROM "download_event"')) {
          return { c: sql.includes('blocked%') ? blocked : total };
        }
        if (sql.includes('FROM alert_log')) {
          return cooldownFresh
            ? { lastSentAt: Math.floor(Date.now() / 1000) }
            : null;
        }
        return null;
      }),
      run: vi.fn(async () => {
        runs.push(sql);
        return {};
      }),
    })),
  }));
  return { db: { prepare } as unknown as D1Database, runs };
}

const ENV = (db: D1Database, token: string | undefined = 'sekret') =>
  ({ DB: db, ALERT_TOKEN: token }) as unknown as Record<string, unknown>;

function req(token = 'sekret') {
  return new Request('https://toolzum.com/api/admin/alerts-check', {
    headers: { Authorization: `Bearer ${token}` },
  });
}

describe('GET /api/admin/alerts-check (#21)', () => {
  it('503s LOUD without a configured token (never silently dead)', async () => {
    const { db } = mockDb();
    const res = await alertsCheck({
      request: req(),
      env: { DB: db } as unknown as Record<string, unknown>,
    });
    expect(res.status).toBe(503);
  });

  it('401s on a wrong token', async () => {
    const { db } = mockDb();
    const res = await alertsCheck({ request: req('wrong'), env: ENV(db) });
    expect(res.status).toBe(401);
  });

  it('stays quiet on a healthy database', async () => {
    const { db } = mockDb({ errors: 3, blocked: 2, total: 100 });
    const res = await alertsCheck({ request: req(), env: ENV(db) });
    expect(await res.json()).toMatchObject({ triggered: false, alerts: [] });
  });

  it('fires error-burst at threshold and claims the cooldown slot', async () => {
    const { db, runs } = mockDb({ errors: 50 });
    const res = await alertsCheck({ request: req(), env: ENV(db) });
    const body = (await res.json()) as { triggered: boolean; alerts: { key: string }[] };
    expect(body.triggered).toBe(true);
    expect(body.alerts.map((a) => a.key)).toEqual(['error-burst']);
    expect(runs.some((s) => s.includes('alert_log'))).toBe(true);
  });

  it('respects cooldown (one page per incident per hour)', async () => {
    const { db } = mockDb({ errors: 500, cooldownFresh: true });
    const res = await alertsCheck({ request: req(), env: ENV(db) });
    expect(await res.json()).toMatchObject({ triggered: false, alerts: [] });
  });

  it('fires quota-wall-spike on share with sufficient volume', async () => {
    const { db } = mockDb({ blocked: 50, total: 100 });
    const res = await alertsCheck({ request: req(), env: ENV(db) });
    const body = (await res.json()) as { triggered: boolean; alerts: { key: string }[] };
    expect(body.triggered).toBe(true);
    expect(body.alerts.map((a) => a.key)).toEqual(['quota-wall-spike']);
  });

  it('ignores tiny samples (8/10 blocked is noise, not an incident)', async () => {
    const { db } = mockDb({ blocked: 8, total: 10 });
    const res = await alertsCheck({ request: req(), env: ENV(db) });
    expect(await res.json()).toMatchObject({ triggered: false });
  });
});
