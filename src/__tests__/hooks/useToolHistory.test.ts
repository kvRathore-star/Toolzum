import { describe, it, expect, vi, beforeEach } from 'vitest';

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

describe('useToolHistory', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('exports correct structure', async () => {
    const mod = await import('@/hooks/useToolHistory');
    expect(mod.useToolHistory).toBeDefined();
    expect(mod.useUndoHistory).toBeDefined();
  });

  it('useUndoHistory exports correct functions', async () => {
    const mod = await import('@/hooks/useToolHistory');
    expect(typeof mod.useUndoHistory).toBe('function');
  });
});
