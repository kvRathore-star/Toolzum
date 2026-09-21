import { describe, it, expect } from 'vitest';
import {
  transcriptionProviderForLanguage,
  transcriptionCostForDuration,
  TRANSCRIPTION_MAX_SECONDS,
} from '@/lib/transcriptionPricing';

describe('transcriptionProviderForLanguage', () => {
  it('routes English variants to Groq', () => {
    expect(transcriptionProviderForLanguage('en')).toBe('groq');
    expect(transcriptionProviderForLanguage('en-US')).toBe('groq');
    expect(transcriptionProviderForLanguage('EN')).toBe('groq');
  });

  it('routes everything else to OpenAI mini-transcribe', () => {
    for (const l of ['hi', 'ta', 'bn', 'es', 'fr', 'de']) {
      expect(transcriptionProviderForLanguage(l)).toBe('openai');
    }
  });

  it('defaults missing/blank language to OpenAI (never English-leaning)', () => {
    expect(transcriptionProviderForLanguage(null)).toBe('openai');
    expect(transcriptionProviderForLanguage('')).toBe('openai');
    expect(transcriptionProviderForLanguage('  ')).toBe('openai');
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
