import { describe, it, expect, vi } from 'vitest';
import { getAriaLabel } from '@/lib/keyboard';

describe('getAriaLabel', () => {
  it('returns undefined when iconOnly is false', () => {
    expect(getAriaLabel(false, 'Label')).toBeUndefined();
  });

  it('returns label when iconOnly is true', () => {
    expect(getAriaLabel(true, 'Label')).toBe('Label');
  });

  it('returns tooltip when label is missing', () => {
    expect(getAriaLabel(true, undefined, 'Tooltip')).toBe('Tooltip');
  });

  it('returns undefined when both are missing', () => {
    expect(getAriaLabel(true)).toBeUndefined();
  });
});
