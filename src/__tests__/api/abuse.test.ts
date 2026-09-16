import { describe, it, expect, vi } from 'vitest';
import {
  checkAiIpVelocity,
  checkAnonDlVelocity,
  AI_IP_HOURLY_LIMIT,
  ANON_DL_DAILY_LIMIT,
} from '../../../functions/api/_abuse';

// COUNT(*) stub + run recorder.
function mockDb(count: number, opts?: { throwAll?: boolean }) {
  const runs: string[] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => {
        if (opts?.throwAll) throw new Error('D1 down');
        if (sql.includes('COUNT(*)')) return { c: count };
        return null;
      }),
      run: vi.fn(async () => {
        runs.push(sql);
        return {};
      }),
    })),
    first: vi.fn(async () => {
      if (opts?.throwAll) throw new Error('D1 down');
      if (sql.includes('COUNT(*)')) return { c: count };
      return null;
    }),
    run: vi.fn(async () => {
      runs.push(sql);
      return {};
    }),
  }));
  return { db: { prepare } as unknown as D1Database, runs };
}

describe('bot rules (#37)', () => {
  it('allows AI traffic under the hourly IP budget and records the tick', async () => {
    const { db, runs } = mockDb(AI_IP_HOURLY_LIMIT - 1);
    expect(await checkAiIpVelocity(db, '1.2.3.4', '/ai/generate')).toBeNull();
    expect(runs.some((s) => s.includes('ai-ip'))).toBe(true);
  });

  it('429s AI traffic at the budget and logs abuse', async () => {
    const { db, runs } = mockDb(AI_IP_HOURLY_LIMIT);
    const res = await checkAiIpVelocity(db, '1.2.3.4', '/ai/generate');
    expect(res?.status).toBe(429);
    expect(runs.some((s) => s.includes('abuse'))).toBe(true);
  });

  it('429s anonymous download floods at the daily budget', async () => {
    const { db } = mockDb(ANON_DL_DAILY_LIMIT);
    const res = await checkAnonDlVelocity(db, '1.2.3.4', '/downloads/record');
    expect(res?.status).toBe(429);
  });

  it('allows normal anonymous volume', async () => {
    const { db } = mockDb(12);
    expect(await checkAnonDlVelocity(db, '1.2.3.4', '/downloads/record')).toBeNull();
  });

  it('fails open when D1 is down (guards never take the site down)', async () => {
    const { db } = mockDb(0, { throwAll: true });
    expect(await checkAiIpVelocity(db, '1.2.3.4', '/x')).toBeNull();
    expect(await checkAnonDlVelocity(db, '1.2.3.4', '/x')).toBeNull();
  });
});
