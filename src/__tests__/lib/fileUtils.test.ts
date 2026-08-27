import { describe, it, expect } from 'vitest';
import { hasLargeFiles, checkMemory } from '@/lib/fileUtils';

describe('hasLargeFiles', () => {
  it('returns false for small files', () => {
    const files = [
      new File(['test'], 'small.txt', { type: 'text/plain' }),
    ];
    expect(hasLargeFiles(files)).toBe(false);
  });

  it('returns false for empty array', () => {
    expect(hasLargeFiles([])).toBe(false);
  });
});

describe('checkMemory', () => {
  it('returns memory info', () => {
    const result = checkMemory();
    expect(result).toHaveProperty('low');
    expect(result).toHaveProperty('available');
  });
});
