import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('geo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
  });

  it('exports correct functions', async () => {
    const mod = await import('@/lib/geo');
    expect(mod.isIndiaFromCookie).toBeDefined();
    expect(mod.isIndiaFromTz).toBeDefined();
    expect(mod.isIndiaFromIp).toBeDefined();
  });

  it('isIndiaFromCookie returns false when no cookie', async () => {
    const mod = await import('@/lib/geo');
    const result = mod.isIndiaFromCookie();
    expect(result).toBe(false);
  });

  it('isIndiaFromCookie returns true for IN country', async () => {
    document.cookie = 'user-country=IN';
    const mod = await import('@/lib/geo');
    const result = mod.isIndiaFromCookie();
    expect(result).toBe(true);
  });

  it('isIndiaFromCookie returns false for other country', async () => {
    document.cookie = 'user-country=US';
    const mod = await import('@/lib/geo');
    const result = mod.isIndiaFromCookie();
    expect(result).toBe(false);
  });

  it('isIndiaFromTz returns boolean', async () => {
    const mod = await import('@/lib/geo');
    const result = mod.isIndiaFromTz();
    expect(typeof result).toBe('boolean');
  });
});
