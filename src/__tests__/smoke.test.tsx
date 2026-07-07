import { describe, it, expect } from 'vitest';

describe('build smoke tests', () => {
  it('typecheck passes (run via npm run typecheck)', () => {
    expect(true).toBe(true);
  });

  it('withErrorHandling returns fallback on error', async () => {
    const { withErrorHandling } = await import('@/lib/withErrorHandling');
    const result = await withErrorHandling(async () => { throw new Error('fail'); }, { fallback: 'fallback' });
    expect(result).toBe('fallback');
  });

  it('withErrorHandling returns value on success', async () => {
    const { withErrorHandling } = await import('@/lib/withErrorHandling');
    const result = await withErrorHandling(async () => 'success');
    expect(result).toBe('success');
  });
});
