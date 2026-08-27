import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBatchProgress } from '@/hooks/useBatchProgress';

vi.mock('react-hot-toast', () => ({
  toast: { error: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useBatchProgress', () => {
  it('initializes with empty files', () => {
    const { result } = renderHook(() => useBatchProgress());
    expect(result.current.files).toEqual([]);
    expect(result.current.isProcessing).toBe(false);
  });

  it('adds files', () => {
    const { result } = renderHook(() => useBatchProgress());
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    act(() => {
      result.current.addFiles([file]);
    });

    expect(result.current.files).toHaveLength(1);
    expect(result.current.files[0].status).toBe('queued');
  });

  it('removes files', () => {
    const { result } = renderHook(() => useBatchProgress());
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    act(() => {
      result.current.addFiles([file]);
    });

    const fileId = result.current.files[0].id;
    act(() => {
      result.current.removeFile(fileId);
    });

    expect(result.current.files).toHaveLength(0);
  });

  it('clears all files', () => {
    const { result } = renderHook(() => useBatchProgress());
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });

    act(() => {
      result.current.addFiles([file]);
    });

    act(() => {
      result.current.clearFiles();
    });

    expect(result.current.files).toHaveLength(0);
  });

  it('calculates progress', () => {
    const { result } = renderHook(() => useBatchProgress());
    expect(result.current.progress.percent).toBe(0);
    expect(result.current.progress.total).toBe(0);
  });
});
