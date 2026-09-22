/**
 * Single source of truth for transcription metering AND provider routing —
 * imported by functions/api/ai/transcribe.ts (charges + chain), the
 * transcriber UIs (cost preview + duration gate), and tests. Change numbers
 * here, never inline, or frontend messaging and backend charges drift apart.
 *
 * Chain: Workers AI Whisper Turbo (~$0.0005/min, all languages) primary,
 * Groq (~$0.0007/min, English) then Gemini native (free tier) as fallbacks.
 * 1 credit ~= 1 minute. Worst case per file (30 min): ~$0.015. Pro monthly
 * max (200 min): ~$0.10. Free trial max (5 min): under a cent.
 */
export const TRANSCRIPTION_CREDITS_PER_MINUTE = 1;

/** Hard duration cap. Client pre-checks via audio metadata; server rejects above it. */
export const TRANSCRIPTION_MAX_MINUTES = 30;
export const TRANSCRIPTION_MAX_SECONDS = TRANSCRIPTION_MAX_MINUTES * 60;

/** Provider multipart cap. Enforced server-side (413). */
export const TRANSCRIPTION_MAX_BYTES = 25 * 1024 * 1024;

/** Credits for a file of durationSec seconds. Always >= 1. */
export function transcriptionCostForDuration(durationSec: number): number {
  if (!Number.isFinite(durationSec) || durationSec <= 0) return 1;
  return Math.max(1, Math.ceil(durationSec / 60));
}

/**
 * Floor bitrate (B/s) used for the server-side plausibility check: a file
 * cannot plausibly encode more minutes than sizeBytes / FLOOR_BYTES_PER_SEC.
 * Deliberately generous (speech codecs go low) — this catches corrupt
 * metadata, not deliberate fraud (bounded to ~$1 at provider rates).
 */
export const TRANSCRIPTION_FLOOR_BYTES_PER_SEC = 500;

/** Max plausible seconds for a file of sizeBytes, with slack. */
export function transcriptionMaxPlausibleSeconds(sizeBytes: number): number {
  return Math.floor(sizeBytes / TRANSCRIPTION_FLOOR_BYTES_PER_SEC) + 120;
}

export type TranscriptionProvider = 'workers-ai' | 'groq' | 'gemini';

export interface TranscriptionKeys {
  workersAi: boolean;
  groq: boolean;
  gemini: boolean;
}

/**
 * Ordered provider chain for a language + available keys. Workers AI
 * (multilingual Turbo) leads whenever bound. English falls back to Groq;
 * non-English never touches Groq (English-leaning accuracy) and falls back
 * to Gemini native instead. Empty chain = 500, no silent degradation.
 */
export function transcriptionProviderChain(
  language: string | null,
  keys: TranscriptionKeys,
): TranscriptionProvider[] {
  const chain: TranscriptionProvider[] = [];
  if (keys.workersAi) chain.push('workers-ai');
  const l = (language || '').trim().toLowerCase();
  const isEnglish = l === 'en' || l.startsWith('en-');
  if (isEnglish) {
    if (keys.groq) chain.push('groq');
  }
  if (keys.gemini) chain.push('gemini');
  return chain;
}

/** Approximate provider cost per audio minute, for margin math only. */
export const TRANSCRIPTION_PROVIDER_COST_PER_MIN: Record<TranscriptionProvider, number> = {
  'workers-ai': 0.0005,
  groq: 0.0007,
  gemini: 0,
};
