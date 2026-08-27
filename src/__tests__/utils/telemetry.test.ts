import { describe, it, expect, vi, beforeEach } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('telemetry', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('exports tracking functions', async () => {
    const mod = await import('@/utils/telemetry');
    expect(mod.trackError).toBeDefined();
    expect(mod.trackToolUse).toBeDefined();
    expect(mod.trackDownload).toBeDefined();
    expect(mod.trackPageView).toBeDefined();
    expect(mod.initTelemetry).toBeDefined();
    expect(mod.dumpTelemetry).toBeDefined();
  });

  it('trackError stores event', async () => {
    const mod = await import('@/utils/telemetry');
    mod.trackError(new Error('test error'), 'context');
    const stored = JSON.parse(localStorage.getItem('th_telemetry') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].type).toBe('error');
  });

  it('trackToolUse stores event', async () => {
    const mod = await import('@/utils/telemetry');
    mod.trackToolUse('tool-slug');
    const stored = JSON.parse(localStorage.getItem('th_telemetry') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].type).toBe('tool_use');
    expect(stored[0].data.slug).toBe('tool-slug');
  });

  it('trackDownload stores event', async () => {
    const mod = await import('@/utils/telemetry');
    mod.trackDownload('tool-slug');
    const stored = JSON.parse(localStorage.getItem('th_telemetry') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].type).toBe('download');
  });

  it('trackPageView stores event', async () => {
    const mod = await import('@/utils/telemetry');
    mod.trackPageView();
    const stored = JSON.parse(localStorage.getItem('th_telemetry') || '[]');
    expect(stored).toHaveLength(1);
    expect(stored[0].type).toBe('page_view');
  });

  it('limits stored events to 100', async () => {
    const mod = await import('@/utils/telemetry');
    for (let i = 0; i < 110; i++) {
      mod.trackToolUse(`tool-${i}`);
    }
    const stored = JSON.parse(localStorage.getItem('th_telemetry') || '[]');
    expect(stored.length).toBeLessThanOrEqual(100);
  });
});
