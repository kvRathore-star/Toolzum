/**
 * Minimal Web Speech API types (lib.dom doesn't ship them).
 * Covers only what our tools use: result indexing, error codes,
 * start/stop lifecycle. Shared by LiveTranscription + SubtitleGenerator
 * so the shape is defined once.
 */
export interface SpeechRecognitionResultItem {
  readonly transcript: string;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly [index: number]: SpeechRecognitionResultItem;
}

export interface SpeechRecognitionResultEvent {
  readonly resultIndex: number;
  readonly results: ArrayLike<SpeechRecognitionResult> & { readonly length: number };
}

export interface SpeechRecognitionErrorEvent {
  readonly error: string;
}

export interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

export type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionCtor;
    webkitSpeechRecognition?: SpeechRecognitionCtor;
  }
}

/** Returns the best-available SpeechRecognition constructor, if any. */
export function getSpeechRecognitionCtor(): SpeechRecognitionCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition || window.webkitSpeechRecognition;
}
