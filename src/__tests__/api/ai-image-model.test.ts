import { describe, it, expect } from 'vitest';
import { IMAGE_MODEL, IMAGE_GENERATION_CREDITS } from '../../../functions/api/ai/generate-image';

// Locks the Oct 2026 lesson: a hardcoded model string silently 404s when
// Google retires it. The hero engine must be a GA model with no announced
// shutdown — never a retired generation and never a -preview (short cycle).
describe('IMAGE_MODEL liveness', () => {
  it('is a GA model, not retired and not a preview', () => {
    expect(IMAGE_MODEL).toBe('gemini-3.1-flash-image');
    expect(IMAGE_MODEL).not.toContain('preview');
    expect(IMAGE_MODEL).not.toBe('gemini-2.5-flash-image');
  });

  it('keeps the 5-credit cost (margin math in LIMITS-AND-PRICING depends on it)', () => {
    expect(IMAGE_GENERATION_CREDITS).toBe(5);
  });
});
