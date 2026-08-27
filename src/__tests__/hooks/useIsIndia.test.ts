import { describe, it, expect, vi } from 'vitest';

describe('useIsIndia', () => {
  it('exports correct structure', async () => {
    const mod = await import('@/hooks/useIsIndia');
    expect(mod.useIsIndia).toBeDefined();
    expect(typeof mod.useIsIndia).toBe('function');
  });
});
