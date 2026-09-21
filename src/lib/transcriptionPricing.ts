/**
 * Single source of truth for transcription metering — imported by BOTH
 * functions/api/ai/transcribe.ts (charges) and the transcriber UI
 * (cost preview + duration gate). Change numbers here, never inline,
 * or frontend messaging and backend charges drift apart again.
 *
 * Model: gpt-4o-mini-transcribe at ~$0.003/min. 1 credit ~= 1 minute.
 * Worst case per file (30 min): ~$0.09. Pro monthly max (200): ~$0.60.
 */
export const TRANSCRIPTION_CREDITS_PER_MINUTE = 1;

/** Hard duration cap. Client pre-checks via audio metadata; server rejects above it. */
export const TRANSCRIPTION_MAX_MINUTES = 30;
export const TRANSCRIPTION_MAX_SECONDS = TRANSCRIPTION_MAX_MINUTES * 60;

/** Provider multipart cap (OpenAI audio inputs). Enforced server-side (413). */
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

export type TranscriptionProvider = 'groq' | 'openai';

/**
 * English goes to Groq Whisper Turbo (~$0.0007/min); everything else
 * (Hindi, Tamil, …) to gpt-4o-mini-transcribe (~$0.003/min) whose
 * multilingual accuracy is the product for those languages. Missing or
 * unparseable language resolves to OpenAI — misrouting non-English audio
 * to an English-leaning model is worse than the savings.
 */
export function transcriptionProviderForLanguage(language: string | null): TranscriptionProvider {
  const l = (language || '').trim().toLowerCase();
  if (l === 'en' || l.startsWith('en-')) return 'groq';
  if (!l) return 'openai';
  return 'openai';
}

/** Approximate provider cost per audio minute, for margin math only. */
export const TRANSCRIPTION_PROVIDER_COST_PER_MIN: Record<TranscriptionProvider, number> = {
  groq: 0.0007,
  openai: 0.003,
};
