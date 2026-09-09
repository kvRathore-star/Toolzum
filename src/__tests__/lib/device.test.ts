import { describe, it, expect, vi, afterEach } from 'vitest';
import { isLowEndDevice } from '@/lib/device';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('isLowEndDevice', () => {
  it('returns false when capabilities are unknown (never blocks)', () => {
    // Bare navigator: no deviceMemory, no core count, no connection.
    // (jsdom's own navigator leaks host-ish values, so stub it away.)
    vi.stubGlobal('navigator', {});
    expect(isLowEndDevice()).toBe(false);
  });

  it('flags small device memory', () => {
    vi.stubGlobal('navigator', { deviceMemory: 2, hardwareConcurrency: 8 });
    expect(isLowEndDevice()).toBe(true);
  });

  it('flags few CPU cores', () => {
    vi.stubGlobal('navigator', { hardwareConcurrency: 2 });
    expect(isLowEndDevice()).toBe(true);
  });

  it('flags data-saver and slow connections', () => {
    vi.stubGlobal('navigator', { hardwareConcurrency: 8, connection: { saveData: true } });
    expect(isLowEndDevice()).toBe(true);
    vi.stubGlobal('navigator', { hardwareConcurrency: 8, connection: { effectiveType: '2g' } });
    expect(isLowEndDevice()).toBe(true);
  });

  it('passes capable devices', () => {
    vi.stubGlobal('navigator', {
      deviceMemory: 8,
      hardwareConcurrency: 8,
      connection: { effectiveType: '4g' },
    });
    expect(isLowEndDevice()).toBe(false);
  });
});
