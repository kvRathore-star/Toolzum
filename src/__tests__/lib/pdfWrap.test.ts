import { describe, it, expect } from 'vitest';

// wrapLines lives in the client component (needs no DOM to test — pure).
// Import via the module path; the component file has no top-level side
// effects beyond pdf.js worker config (safe in jsdom).
import { wrapLines } from '@/components/tools/modules/pdf/PdfEditor';

const measure = (s: string) => s.length * 10;

describe('wrapLines', () => {
  it('wraps at maxWidth', () => {
    const lines = wrapLines('the quick brown fox jumps', 100, measure);
    expect(lines).toEqual(['the quick', 'brown fox', 'jumps']);
  });

  it('keeps short text on one line', () => {
    expect(wrapLines('hi', 100, measure)).toEqual(['hi']);
  });

  it('preserves explicit newlines as paragraph breaks', () => {
    expect(wrapLines('one\ntwo', 1000, measure)).toEqual(['one', 'two']);
  });

  it('never returns empty (placeholder-safe)', () => {
    expect(wrapLines('', 100, measure)).toEqual(['']);
    expect(wrapLines('   ', 100, measure)).toEqual(['']);
  });

  it('long single words overflow rather than vanish', () => {
    expect(wrapLines('supercalifragilistic', 50, measure)).toEqual(['supercalifragilistic']);
  });
});
