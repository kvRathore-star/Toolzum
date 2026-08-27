import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFFmpeg } from '@/hooks/useFFmpeg';

vi.mock('@ffmpeg/ffmpeg', () => ({
  FFmpeg: vi.fn().mockImplementation(() => ({
    load: vi.fn().mockResolvedValue(undefined),
    writeFile: vi.fn().mockResolvedValue(undefined),
    readFile: vi.fn().mockResolvedValue(new Uint8Array()),
    exec: vi.fn().mockResolvedValue(undefined),
    deleteFile: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  })),
}));

vi.mock('@ffmpeg/util', () => ({
  fetchFile: vi.fn().mockResolvedValue(new Uint8Array()),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useFFmpeg', () => {
  it('returns initial state', () => {
    const { result } = renderHook(() => useFFmpeg());
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.progress).toBe(0);
  });

  it('returns loadFFmpeg function', () => {
    const { result } = renderHook(() => useFFmpeg());
    expect(typeof result.current.loadFFmpeg).toBe('function');
  });
});
