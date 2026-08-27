import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAiProvider } from '@/hooks/useAiProvider';

const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  vi.clearAllMocks();
});

describe('useAiProvider', () => {
  it('returns generateCompletion function', () => {
    const { result } = renderHook(() => useAiProvider());
    expect(typeof result.current.generateCompletion).toBe('function');
  });

  it('calls API with correct params', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ content: 'AI response' }),
    });

    const { result } = renderHook(() => useAiProvider());
    const response = await result.current.generateCompletion([
      { role: 'user', content: 'Hello' },
    ]);

    expect(mockFetch).toHaveBeenCalledWith('/api/ai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hello' }],
        temperature: 0.7,
      }),
    });
    expect(response).toBe('AI response');
  });

  it('throws error on API failure', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'API error' }),
    });

    const { result } = renderHook(() => useAiProvider());
    await expect(
      result.current.generateCompletion([{ role: 'user', content: 'Hello' }])
    ).rejects.toThrow('API error');
  });
});
