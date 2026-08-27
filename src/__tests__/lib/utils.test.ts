import { describe, it, expect } from 'vitest';
import { cn } from '@/lib/utils';

describe('utils', () => {
  it('exports cn function', async () => {
    const mod = await import('@/lib/utils');
    expect(mod.cn).toBeDefined();
    expect(typeof mod.cn).toBe('function');
  });

  it('cn merges class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('cn handles conditional classes', () => {
    const result = cn('base', false && 'hidden', 'extra');
    expect(result).toBe('base extra');
  });

  it('cn handles undefined and null', () => {
    const result = cn('base', undefined, null, 'extra');
    expect(result).toBe('base extra');
  });

  it('cn concatenates classes', () => {
    const result = cn('class1', 'class1');
    expect(result).toBe('class1 class1');
  });
});
