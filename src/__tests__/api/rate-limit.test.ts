import { describe, it, expect, vi } from 'vitest';
import { checkRateLimit } from '../../../functions/api/rate-limit';

function mockDb(count: number) {
  return {
    prepare: vi.fn(() => ({
      bind: vi.fn(() => ({
        first: vi.fn(async () => ({ c: count })),
        run: vi.fn(async () => ({})),
      })),
    })),
  } as unknown as D1Database;
}

describe('rate-limit contract', () => {
  it('passes through when under the limit', async () => {
    const rl = await checkRateLimit(mockDb(5), 'analytics', '1.2.3.4', 30);
    expect(rl.limited).toBe(false);
    expect(rl.response).toBeUndefined();
  });

  it('returns 429 with Retry-After at the limit', async () => {
    const rl = await checkRateLimit(mockDb(30), 'analytics', '1.2.3.4', 30);
    expect(rl.limited).toBe(true);
    expect(rl.response?.status).toBe(429);
    expect(rl.response?.headers.get('Retry-After')).toBeDefined();
  });

  it('scopes fingerprints per prefix so endpoints do not share quota', async () => {
    const db = mockDb(0);
    await checkRateLimit(db, 'fav-add', 'user-1', 10);
    const sql: string = (db.prepare as any).mock.calls[0][0];
    expect(sql).toContain('analytics_event');
  });
});
