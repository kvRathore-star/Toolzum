import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWithRetry } from '@/lib/fetchWithRetry';

describe('fetchWithRetry', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns response on success', async () => {
    const mockResponse = { ok: true, status: 200 } as Response;
    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const result = await fetchWithRetry('https://api.example.com/data');
    expect(result).toBe(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('retries on 500 errors', async () => {
    const errorResponse = { ok: false, status: 500 } as Response;
    const successResponse = { ok: true, status: 200 } as Response;
    
    (global.fetch as any)
      .mockResolvedValueOnce(errorResponse)
      .mockResolvedValueOnce(successResponse);

    const result = await fetchWithRetry('https://api.example.com/data', {}, 2, 10);
    expect(result).toBe(successResponse);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('does not retry on 400 errors', async () => {
    const errorResponse = { ok: false, status: 400 } as Response;
    (global.fetch as any).mockResolvedValueOnce(errorResponse);

    const result = await fetchWithRetry('https://api.example.com/data', {}, 2, 10);
    expect(result).toBe(errorResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('retries on network errors', async () => {
    const successResponse = { ok: true, status: 200 } as Response;
    
    (global.fetch as any)
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce(successResponse);

    const result = await fetchWithRetry('https://api.example.com/data', {}, 2, 10);
    expect(result).toBe(successResponse);
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('throws after max retries', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    await expect(fetchWithRetry('https://api.example.com/data', {}, 1, 10))
      .rejects.toThrow('Failed after 2 attempts');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('returns 500 response after max retries', async () => {
    const errorResponse = { ok: false, status: 500 } as Response;
    (global.fetch as any).mockResolvedValue(errorResponse);

    const result = await fetchWithRetry('https://api.example.com/data', {}, 1, 10);
    expect(result).toBe(errorResponse);
    expect(result.ok).toBe(false);
    expect(result.status).toBe(500);
  });

  it('passes options to fetch', async () => {
    const mockResponse = { ok: true, status: 200 } as Response;
    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' } };
    await fetchWithRetry('https://api.example.com/data', options, 2, 10);
    
    expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data', options);
  });
});
