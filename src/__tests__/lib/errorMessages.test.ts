import { describe, it, expect } from 'vitest';
import { classifyError } from '@/lib/errorMessages';

describe('classifyError', () => {
  it('maps out-of-memory errors to the memory kind', () => {
    const f = classifyError(new Error('Out of memory: wasm allocation failed'));
    expect(f.kind).toBe('memory');
    expect(f.title).toMatch(/memory/i);
  });

  it('maps load failures to the load kind', () => {
    const f = classifyError(new Error('Failed to fetch dynamically imported module'));
    expect(f.kind).toBe('load');
  });

  it('passes through ordinary messages untouched', () => {
    const f = classifyError(new Error('Invalid CSV header'));
    expect(f.kind).toBe('network');
    expect(f.message).toBe('Invalid CSV header');
  });

  it('handles empty/unknown input without crashing', () => {
    const f = classifyError(null);
    expect(f.kind).toBe('unknown');
    expect(f.title).toBeTruthy();
    expect(f.message).toBeTruthy();
  });
});
