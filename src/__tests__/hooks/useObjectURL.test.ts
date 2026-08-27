import { describe, it, expect, vi } from 'vitest';

describe('useObjectURL', () => {
  it('exports correct structure', async () => {
    const mod = await import('@/hooks/useObjectURL');
    expect(mod.useObjectURL).toBeDefined();
    expect(typeof mod.useObjectURL).toBe('function');
  });
});
