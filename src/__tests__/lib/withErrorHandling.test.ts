import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withErrorHandling } from '@/lib/withErrorHandling';

vi.mock('react-hot-toast', () => ({
  toast: { error: vi.fn() },
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('withErrorHandling', () => {
  it('returns result on success', async () => {
    const result = await withErrorHandling(async () => 'success');
    expect(result).toBe('success');
  });

  it('returns null on error', async () => {
    const result = await withErrorHandling(async () => {
      throw new Error('Test error');
    });
    expect(result).toBeNull();
  });

  it('shows toast on error', async () => {
    const toast = require('react-hot-toast').toast;
    await withErrorHandling(async () => {
      throw new Error('Test error');
    }, { toast: 'Something went wrong' });
    expect(toast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('returns fallback on error', async () => {
    const result = await withErrorHandling(async () => {
      throw new Error('Test error');
    }, { fallback: 'fallback value' });
    expect(result).toBe('fallback value');
  });

  it('logs error when log option is true', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    await withErrorHandling(async () => {
      throw new Error('Test error');
    }, { log: true });
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
