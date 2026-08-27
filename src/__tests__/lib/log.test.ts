import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('log', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('exports devWarn function', async () => {
    const mod = await import('@/lib/log');
    expect(mod.devWarn).toBeDefined();
    expect(typeof mod.devWarn).toBe('function');
  });

  it('devWarn calls console.warn in non-production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    
    const mod = await import('@/lib/log');
    mod.devWarn('test message');
    
    expect(console.warn).toHaveBeenCalledWith('test message');
    
    process.env.NODE_ENV = originalEnv;
  });
});
