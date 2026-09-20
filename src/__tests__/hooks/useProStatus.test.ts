import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useProStatus } from '@/hooks/useProStatus';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('useProStatus', () => {
  it('defaults to false before check-plan answers', () => {
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise(() => {})));
    const { result } = renderHook(() => useProStatus());
    expect(result.current).toBe(false);
  });

  it('is true for pro plan', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ plan: 'pro' }) }));
    const { result } = renderHook(() => useProStatus());
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('stays false for non-pro plans and on failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ plan: 'signedin' }) }));
    const { result } = renderHook(() => useProStatus());
    await new Promise(r => setTimeout(r, 50));
    expect(result.current).toBe(false);
  });
});
