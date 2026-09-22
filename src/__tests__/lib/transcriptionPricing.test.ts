import { describe, it, expect } from 'vitest';
import {
  transcriptionProviderChain,
  transcriptionCostForDuration,
  TRANSCRIPTION_MAX_SECONDS,
  type TranscriptionKeys,
} from '@/lib/transcriptionPricing';

const allKeys: TranscriptionKeys = { workersAi: true, groq: true, gemini: true };

describe('transcriptionProviderChain', () => {
  describe('English (en, en-US)', () => {
    it('returns all three in order when all keys present', () => {
      expect(transcriptionProviderChain('en', allKeys)).toEqual(['workers-ai', 'groq', 'gemini']);
      expect(transcriptionProviderChain('en-US', allKeys)).toEqual(['workers-ai', 'groq', 'gemini']);
      expect(transcriptionProviderChain('EN', allKeys)).toEqual(['workers-ai', 'groq', 'gemini']);
    });

    it('omits Groq when its key is missing', () => {
      expect(transcriptionProviderChain('en', { workersAi: true, groq: false, gemini: true })).toEqual(['workers-ai', 'gemini']);
    });

    it('omits Workers AI when binding is absent', () => {
      expect(transcriptionProviderChain('en', { workersAi: false, groq: true, gemini: true })).toEqual(['groq', 'gemini']);
    });

    it('omits Gemini when its key is missing', () => {
      expect(transcriptionProviderChain('en', { workersAi: true, groq: true, gemini: false })).toEqual(['workers-ai', 'groq']);
    });
  });

  describe('Non-English (hi, ta, es, …)', () => {
    it('never includes Groq', () => {
      const chain = transcriptionProviderChain('hi', allKeys);
      expect(chain).not.toContain('groq');
    });

    it('returns workers-ai + gemini when both available', () => {
      expect(transcriptionProviderChain('ta', allKeys)).toEqual(['workers-ai', 'gemini']);
    });

    it('falls back to Gemini only when Workers AI is absent', () => {
      expect(transcriptionProviderChain('es', { workersAi: false, groq: true, gemini: true })).toEqual(['gemini']);
    });
  });

  describe('Missing / blank language', () => {
    it('treats null like non-English (no Groq)', () => {
      const chain = transcriptionProviderChain(null, allKeys);
      expect(chain).not.toContain('groq');
      expect(chain).toEqual(['workers-ai', 'gemini']);
    });

    it('treats empty string like non-English', () => {
      expect(transcriptionProviderChain('', allKeys)).toEqual(['workers-ai', 'gemini']);
    });

    it('treats whitespace like non-English', () => {
      expect(transcriptionProviderChain('  ', allKeys)).toEqual(['workers-ai', 'gemini']);
    });
  });

  describe('Empty chain (no keys at all)', () => {
    it('returns []', () => {
      expect(transcriptionProviderChain('en', { workersAi: false, groq: false, gemini: false })).toEqual([]);
      expect(transcriptionProviderChain('hi', { workersAi: false, groq: false, gemini: false })).toEqual([]);
      expect(transcriptionProviderChain(null, { workersAi: false, groq: false, gemini: false })).toEqual([]);
    });
  });

  describe('Degraded scenarios', () => {
    it('English with only Gemini key', () => {
      expect(transcriptionProviderChain('en', { workersAi: false, groq: false, gemini: true })).toEqual(['gemini']);
    });

    it('Non-English with only Workers AI', () => {
      expect(transcriptionProviderChain('bn', { workersAi: true, groq: false, gemini: false })).toEqual(['workers-ai']);
    });

    it('Non-English with only Groq key (Groq skipped, Gemini absent → empty)', () => {
      // Groq is English-only; non-English never uses it even as fallback.
      expect(transcriptionProviderChain('hi', { workersAi: false, groq: true, gemini: false })).toEqual([]);
    });
  });
});

describe('transcriptionCostForDuration', () => {
  it('bills 1 credit/min, rounded up, min 1', () => {
    expect(transcriptionCostForDuration(1)).toBe(1);
    expect(transcriptionCostForDuration(60)).toBe(1);
    expect(transcriptionCostForDuration(61)).toBe(2);
    expect(transcriptionCostForDuration(1800)).toBe(30);
    expect(transcriptionCostForDuration(0)).toBe(1);
    expect(transcriptionCostForDuration(NaN)).toBe(1);
  });

  it('caps at 30 minutes', () => {
    expect(TRANSCRIPTION_MAX_SECONDS).toBe(1800);
  });
});
