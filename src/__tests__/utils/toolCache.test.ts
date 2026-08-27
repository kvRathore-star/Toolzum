import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock telemetry
vi.mock('@/utils/telemetry', () => ({
  trackError: vi.fn(),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (index: number) => Object.keys(store)[index] || null,
  };
})();
Object.defineProperty(global, 'localStorage', { value: localStorageMock });

describe('toolCache', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('exports getCachedOutput and setCachedOutput', async () => {
    const mod = await import('@/utils/toolCache');
    expect(mod.getCachedOutput).toBeDefined();
    expect(mod.setCachedOutput).toBeDefined();
    expect(typeof mod.getCachedOutput).toBe('function');
    expect(typeof mod.setCachedOutput).toBe('function');
  });

  it('setCachedOutput stores data', async () => {
    const mod = await import('@/utils/toolCache');
    mod.setCachedOutput('input', 'tool-slug', 'output data');
    
    const cached = mod.getCachedOutput('input', 'tool-slug');
    expect(cached).toBe('output data');
  });

  it('getCachedOutput returns null for missing key', async () => {
    const mod = await import('@/utils/toolCache');
    const cached = mod.getCachedOutput('nonexistent', 'tool-slug');
    expect(cached).toBeNull();
  });

  it('getCachedOutput returns null for expired data', async () => {
    const mod = await import('@/utils/toolCache');
    // Set data with 0 TTL (expires immediately)
    mod.setCachedOutput('input', 'tool-slug', 'data', 0);
    
    // Wait a bit to ensure expiry
    await new Promise(r => setTimeout(r, 10));
    
    const cached = mod.getCachedOutput('input', 'tool-slug');
    expect(cached).toBeNull();
  });

  it('different inputs produce different cache keys', async () => {
    const mod = await import('@/utils/toolCache');
    mod.setCachedOutput('input1', 'tool', 'data1');
    mod.setCachedOutput('input2', 'tool', 'data2');
    
    const cached1 = mod.getCachedOutput('input1', 'tool');
    const cached2 = mod.getCachedOutput('input2', 'tool');
    
    expect(cached1).toBe('data1');
    expect(cached2).toBe('data2');
  });

  it('different tools produce different cache keys', async () => {
    const mod = await import('@/utils/toolCache');
    mod.setCachedOutput('input', 'tool1', 'data1');
    mod.setCachedOutput('input', 'tool2', 'data2');
    
    const cached1 = mod.getCachedOutput('input', 'tool1');
    const cached2 = mod.getCachedOutput('input', 'tool2');
    
    expect(cached1).toBe('data1');
    expect(cached2).toBe('data2');
  });
});
