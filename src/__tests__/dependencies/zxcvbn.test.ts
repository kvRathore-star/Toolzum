import { describe, it, expect } from 'vitest';
import zxcvbn from 'zxcvbn';

describe('zxcvbn', () => {
  it('exports strength checker', () => {
    expect(zxcvbn).toBeDefined();
    expect(typeof zxcvbn).toBe('function');
  });

  it('checks weak password', () => {
    const result = zxcvbn('password');
    expect(result.score).toBeLessThan(3);
    expect(result.feedback).toBeDefined();
  });

  it('checks strong password', () => {
    const result = zxcvbn('Tr0ub4dor&3');
    expect(result.score).toBeGreaterThan(2);
  });

  it('returns crack times', () => {
    const result = zxcvbn('test');
    expect(result.crack_times_display).toBeDefined();
    expect(result.crack_times_display.offline_slow_hashing_1e4_per_second).toBeDefined();
  });

  it('returns match details', () => {
    const result = zxcvbn('password');
    expect(result.sequence).toBeDefined();
    expect(Array.isArray(result.sequence)).toBe(true);
    expect(result.sequence.length).toBeGreaterThan(0);
  });

  it('handles empty string', () => {
    const result = zxcvbn('');
    expect(result.score).toBe(0);
  });

  it('returns warnings', () => {
    const result = zxcvbn('password');
    expect(result.feedback.warning).toBeDefined();
    expect(typeof result.feedback.warning).toBe('string');
  });
});
