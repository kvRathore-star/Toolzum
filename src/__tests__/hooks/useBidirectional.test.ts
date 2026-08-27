import { describe, it, expect, vi } from 'vitest';

describe('useBidirectional', () => {
  it('exports correct structure', async () => {
    const mod = await import('@/hooks/useBidirectional');
    expect(mod.useBidirectional).toBeDefined();
    expect(typeof mod.useBidirectional).toBe('function');
  });
});
