import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useUsageCounter } from '@/hooks/useUsageCounter';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

beforeEach(() => {
  vi.clearAllMocks();
  localStorageMock.clear();
});

describe('useUsageCounter', () => {
  it('returns initial usage of 0', () => {
    const { result } = renderHook(() => useUsageCounter('test-key'));
    expect(result.current.usage).toBe(0);
  });

  it('trackUsage updates usage and localStorage', () => {
    const { result } = renderHook(() => useUsageCounter('test-key'));
    act(() => {
      result.current.trackUsage(5);
    });
    expect(result.current.usage).toBe(5);
    expect(localStorageMock.setItem).toHaveBeenCalled();
  });

  it('reads existing usage from localStorage', () => {
    const today = new Date().toISOString().split('T')[0];
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ date: today, count: 10 }));

    const { result } = renderHook(() => useUsageCounter('test-key'));
    expect(result.current.usage).toBe(10);
  });
});
