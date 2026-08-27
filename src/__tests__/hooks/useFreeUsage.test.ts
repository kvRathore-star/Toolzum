import { describe, it, expect, vi } from 'vitest';

describe('useFreeUsage', () => {
  it('exports correct structure', async () => {
    const mod = await import('@/hooks/useFreeUsage');
    expect(mod.useFreeUsage).toBeDefined();
    expect(typeof mod.useFreeUsage).toBe('function');
  });
});
