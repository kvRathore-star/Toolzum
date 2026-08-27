import { describe, it, expect, vi } from 'vitest';

describe('env', () => {
  it('exports getRequiredEnv function', async () => {
    const mod = await import('@/lib/env');
    expect(mod.getRequiredEnv).toBeDefined();
    expect(typeof mod.getRequiredEnv).toBe('function');
  });
});
