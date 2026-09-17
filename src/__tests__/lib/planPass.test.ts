import { describe, it, expect, vi } from 'vitest';
import {
  resolvePlanWithPass,
  effectivePlanForUser,
  grantPass,
  PASS_DAYS,
  PASS_CREDITS,
} from '@/lib/planTiers';

const NOW = 1_757_000_000_000;

function mockDb(passExpiresAt: number | null | "missing" = null) {
  const seen: string[] = [];
  const prepare = vi.fn((sql: string) => ({
    bind: vi.fn(() => ({
      first: vi.fn(async () => {
        if (passExpiresAt === "missing") throw new Error("no such column");
        if (sql.includes("passExpiresAt")) return { passExpiresAt };
        return null;
      }),
      run: vi.fn(async () => {
        seen.push(sql);
        return {};
      }),
    })),
  }));
  return { db: { prepare } as unknown as D1Database, seen };
}

describe('Project Pass plan resolution (pricing spec)', () => {
  it('live pass reads as pro without touching the stored plan', () => {
    expect(resolvePlanWithPass(true, 'free', NOW + 86400000, NOW)).toBe('pro');
  });

  it('expired pass falls back to the stored plan (no writes needed)', () => {
    expect(resolvePlanWithPass(true, 'free', NOW - 1000, NOW)).toBe('signedin');
    expect(resolvePlanWithPass(true, 'pro', NOW - 1000, NOW)).toBe('pro');
  });

  it('anonymous users never get pass treatment', () => {
    expect(resolvePlanWithPass(false, 'free', NOW + 86400000, NOW)).toBe('anon');
  });

  it('effectivePlanForUser tolerates pre-migration databases', async () => {
    const { db } = mockDb("missing");
    expect(await effectivePlanForUser(db, 'u1', 'free', NOW)).toBe('signedin');
  });

  it('effectivePlanForUser honors a live pass', async () => {
    const { db } = mockDb(NOW + 86400000);
    expect(await effectivePlanForUser(db, 'u1', 'free', NOW)).toBe('pro');
  });

  it('grantPass stamps a 7-day expiry and tops up 70 credits', async () => {
    const { db, seen } = mockDb(null);
    await grantPass(db, 'u1', PASS_DAYS, PASS_CREDITS, NOW);
    expect(PASS_DAYS).toBe(7);
    expect(PASS_CREDITS).toBe(70);
    expect(
      seen.some(
        (s) => s.includes('passExpiresAt') && s.includes('credits = credits +'),
      ),
    ).toBe(true);
  });
});
