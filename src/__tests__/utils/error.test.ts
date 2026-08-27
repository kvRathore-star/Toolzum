import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '@/utils/error';

describe('getErrorMessage', () => {
  it('returns message from Error', () => {
    expect(getErrorMessage(new Error('test'))).toBe('test');
  });

  it('returns string directly', () => {
    expect(getErrorMessage('string error')).toBe('string error');
  });

  it('returns message from object with message', () => {
    expect(getErrorMessage({ message: 'obj error' })).toBe('obj error');
  });

  it('returns JSON string for null', () => {
    expect(getErrorMessage(null)).toBe('null');
  });

  it('returns undefined for undefined (JSON.stringify behavior)', () => {
    expect(getErrorMessage(undefined)).toBeUndefined();
  });

  it('returns custom fallback only on JSON.stringify error', () => {
    const circular: any = {};
    circular.self = circular;
    expect(getErrorMessage(circular, 'custom')).toBe('custom');
  });

  it('returns JSON for objects without message', () => {
    expect(getErrorMessage({ code: 42 })).toBe('{"code":42}');
  });
});
