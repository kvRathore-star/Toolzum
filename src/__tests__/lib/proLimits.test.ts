import { describe, it, expect } from 'vitest';
import { PRO_LIMITS, PRO_LIMIT_MESSAGES } from '@/lib/proLimits';

describe('PRO_LIMITS', () => {
  it('has correct QR limits', () => {
    expect(PRO_LIMITS.dailyQr).toBe(5);
    expect(PRO_LIMITS.proQrMax).toBe(100);
  });

  it('has correct icon limits', () => {
    expect(PRO_LIMITS.dailyIcon).toBe(5);
    expect(PRO_LIMITS.proIconMax).toBe(100);
  });

  it('has correct crop limits', () => {
    expect(PRO_LIMITS.dailyCrop).toBe(3);
  });

  it('has correct batch sizes', () => {
    expect(PRO_LIMITS.freeBatchSize).toBe(5);
    expect(PRO_LIMITS.proBatchSize).toBe(100);
  });

  it('has correct concurrency limits', () => {
    expect(PRO_LIMITS.maxConcurrentFree).toBe(1);
    expect(PRO_LIMITS.maxConcurrentPro).toBe(4);
  });

  it('pro limits are higher than free limits', () => {
    expect(PRO_LIMITS.proQrMax).toBeGreaterThan(PRO_LIMITS.dailyQr);
    expect(PRO_LIMITS.proIconMax).toBeGreaterThan(PRO_LIMITS.dailyIcon);
    expect(PRO_LIMITS.proBatchSize).toBeGreaterThan(PRO_LIMITS.freeBatchSize);
    expect(PRO_LIMITS.maxConcurrentPro).toBeGreaterThan(PRO_LIMITS.maxConcurrentFree);
  });
});

describe('PRO_LIMIT_MESSAGES', () => {
  it('dailyQrRemaining returns correct message', () => {
    const msg = PRO_LIMIT_MESSAGES.dailyQrRemaining(3);
    expect(msg).toBe('3 / 5 remaining');
  });

  it('dailyQrRemaining handles zero', () => {
    const msg = PRO_LIMIT_MESSAGES.dailyQrRemaining(0);
    expect(msg).toBe('0 / 5 remaining');
  });

  it('dailyQrUpgrade mentions free tier limit', () => {
    expect(PRO_LIMIT_MESSAGES.dailyQrUpgrade).toContain('5');
    expect(PRO_LIMIT_MESSAGES.dailyQrUpgrade).toContain('Pro');
  });

  it('freeBatchUpgrade mentions free tier limit', () => {
    expect(PRO_LIMIT_MESSAGES.freeBatchUpgrade).toContain('5');
    expect(PRO_LIMIT_MESSAGES.freeBatchUpgrade).toContain('100');
  });
});
