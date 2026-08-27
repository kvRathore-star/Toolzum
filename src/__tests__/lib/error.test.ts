import { describe, it, expect } from 'vitest';
import { getErrorMessage } from '@/utils/error';

describe('getErrorMessage', () => {
  it('returns message from Error object', () => {
    const error = new Error('Test error');
    expect(getErrorMessage(error)).toBe('Test error');
  });

  it('returns string directly', () => {
    expect(getErrorMessage('String error')).toBe('String error');
  });

  it('returns message from object with message property', () => {
    expect(getErrorMessage({ message: 'Object error' })).toBe('Object error');
  });

  it('stringifies objects without message', () => {
    expect(getErrorMessage({ code: 404 })).toBe('{"code":404}');
  });

  it('returns fallback for null', () => {
    expect(getErrorMessage(null)).toBe('null');
  });

  it('returns undefined for undefined', () => {
    expect(getErrorMessage(undefined)).toBeUndefined();
  });

  it('returns fallback for numbers', () => {
    expect(getErrorMessage(123)).toBe('123');
  });
});
