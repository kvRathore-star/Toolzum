import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';

const mockUseSession = vi.fn(() => ({
  data: { user: { plan: 'pro' } },
}));

vi.mock('@/lib/auth-client', () => ({
  useSession: () => mockUseSession(),
}));

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

describe('useWorkflowPresets', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    localStorageMock.clear();
    mockUseSession.mockReturnValue({ data: { user: { plan: 'pro' } } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ plan: 'pro' }) }));
    await import('@/hooks/useWorkflowPresets');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('exports useWorkflowPresets function', async () => {
    const { useWorkflowPresets } = await import('@/hooks/useWorkflowPresets');
    expect(typeof useWorkflowPresets).toBe('function');
  });

  it('loads presets filtered by toolSlug from localStorage', async () => {
    const existingPresets = [
      { id: '1', name: 'Saved A', toolSlug: 'test-tool', config: { a: 1 }, createdAt: '2026-01-01' },
      { id: '2', name: 'Saved B', toolSlug: 'other-tool', config: { b: 2 }, createdAt: '2026-01-01' },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(existingPresets));

    const { useWorkflowPresets } = await import('@/hooks/useWorkflowPresets');
    const { result } = renderHook(() => useWorkflowPresets('test-tool'));

    await act(async () => {});

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('Saved A');
  });

  it('savePreset returns true for pro users and persists', async () => {
    localStorageMock.getItem.mockReturnValue('[]');

    const { useWorkflowPresets } = await import('@/hooks/useWorkflowPresets');
    const { result } = renderHook(() => useWorkflowPresets('test-tool'));

    await waitFor(() => expect(result.current.isPro).toBe(true));

    let saveResult: boolean | undefined;
    await act(async () => {
      saveResult = result.current.savePreset('My Config', { quality: 1080 });
    });

    expect(saveResult).toBe(true);
    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].name).toBe('My Config');
  });

  it('savePreset returns false for non-pro users', async () => {
    mockUseSession.mockReturnValue({ data: { user: { plan: 'free' } } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ plan: 'free' }) }));
    localStorageMock.getItem.mockReturnValue('[]');

    const { useWorkflowPresets } = await import('@/hooks/useWorkflowPresets');
    const { result } = renderHook(() => useWorkflowPresets('test-tool'));

    let saveResult: boolean | undefined;
    await act(async () => {
      saveResult = result.current.savePreset('My Config', { quality: 1080 });
    });

    expect(saveResult).toBe(false);
    expect(result.current.presets).toHaveLength(0);
  });

  it('loadPreset returns config for matching id', async () => {
    const presets = [
      { id: '1', name: 'Config 1', toolSlug: 'test-tool', config: { x: 42 }, createdAt: '2026-01-01' },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(presets));

    const { useWorkflowPresets } = await import('@/hooks/useWorkflowPresets');
    const { result } = renderHook(() => useWorkflowPresets('test-tool'));

    await act(async () => {});

    const config = result.current.loadPreset('1');
    expect(config).toEqual({ x: 42 });
  });

  it('loadPreset returns null for non-matching id', async () => {
    localStorageMock.getItem.mockReturnValue('[]');

    const { useWorkflowPresets } = await import('@/hooks/useWorkflowPresets');
    const { result } = renderHook(() => useWorkflowPresets('test-tool'));

    await act(async () => {});

    const config = result.current.loadPreset('nonexistent');
    expect(config).toBeNull();
  });

  it('deletePreset removes preset from state', async () => {
    const presets = [
      { id: '1', name: 'Config 1', toolSlug: 'test-tool', config: {}, createdAt: '2026-01-01' },
      { id: '2', name: 'Config 2', toolSlug: 'test-tool', config: {}, createdAt: '2026-01-01' },
    ];
    localStorageMock.getItem.mockReturnValue(JSON.stringify(presets));

    const { useWorkflowPresets } = await import('@/hooks/useWorkflowPresets');
    const { result } = renderHook(() => useWorkflowPresets('test-tool'));

    await act(async () => {});

    expect(result.current.presets).toHaveLength(2);

    await act(async () => {
      result.current.deletePreset('1');
    });

    expect(result.current.presets).toHaveLength(1);
    expect(result.current.presets[0].id).toBe('2');
  });

  it('isPro reflects server plan even when session is stale', async () => {
    mockUseSession.mockReturnValue({ data: { user: { plan: 'free' } } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ plan: 'pro' }) }));
    localStorageMock.getItem.mockReturnValue('[]');

    const { useWorkflowPresets } = await import('@/hooks/useWorkflowPresets');
    const { result } = renderHook(() => useWorkflowPresets('test-tool'));

    await act(async () => {});

    expect(result.current.isPro).toBe(true);
  });

  it('isPro is false for free plan', async () => {
    mockUseSession.mockReturnValue({ data: { user: { plan: 'free' } } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ plan: 'free' }) }));
    localStorageMock.getItem.mockReturnValue('[]');

    const { useWorkflowPresets } = await import('@/hooks/useWorkflowPresets');
    const { result } = renderHook(() => useWorkflowPresets('test-tool'));

    await act(async () => {});

    expect(result.current.isPro).toBe(false);
  });
});
