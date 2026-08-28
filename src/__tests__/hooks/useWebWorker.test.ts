import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('useWebWorker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports useWebWorker function', async () => {
    const mod = await import('@/hooks/useWebWorker');
    expect(mod.useWebWorker).toBeDefined();
    expect(typeof mod.useWebWorker).toBe('function');
  });

  it('returns an object with run function', async () => {
    const { renderHook } = await import('@testing-library/react');
    const { useWebWorker } = await import('@/hooks/useWebWorker');
    const { result } = renderHook(() => useWebWorker());
    expect(result.current).toHaveProperty('run');
    expect(typeof result.current.run).toBe('function');
  });
});
