/**
 * Search synonym aliases (Sep 2026) — registry vocabulary vs user vocabulary.
 * "remove background" vs "bg changer", "merge" vs "combine PDFs".
 *
 * Seeded by hand; the missed-query log (search:miss:* rows in
 * analytics_event, zero-result queries only) feeds future entries —
 * check top misses monthly and promote repeats here. Keep entries tight:
 * each alias should resolve to 1–3 slugs or it stops being navigation.
 */

export const SEARCH_ALIASES: Record<string, string[]> = {
  // Background removal
  "remove background": ["ai-bg-changer", "bulk-bg-changer"],
  "bg remover": ["ai-bg-changer", "bulk-bg-changer"],
  "background remover": ["ai-bg-changer", "bulk-bg-changer"],
  "transparent background": ["ai-bg-changer"],
  // PDF merge / combine
  merge: ["bulk-pdf-merger", "pdf-merger"],
  combine: ["bulk-pdf-merger", "pdf-merger"],
  join: ["bulk-pdf-merger", "pdf-merger", "audio-merger"],
  // Compression
  shrink: ["bulk-image-compressor", "image-compressor", "bulk-pdf-size-reducer"],
  reduce: ["bulk-image-compressor", "video-compressor"],
  optimize: ["bulk-image-compressor", "bulk-avif-optimizer"],
  // Conversion
  convert: ["bulk-image-converter", "image-converter", "document-converter"],
  change: ["bulk-image-converter", "video-converter"],
  // Resize
  resize: ["bulk-image-resizer", "image-resizer"],
  scale: ["bulk-image-resizer", "image-resizer"],
  // Font
  "font converter": ["font-converter"],
  // Text tools
  summarize: ["pdf-ai-summariser"],
  summary: ["pdf-ai-summariser", "meeting-minutes-generator"],
  translate: ["ai-translator", "subtitle-translator"],
  paraphrase: ["ai-paraphrasing-tool"],
  rewrite: ["ai-paraphrasing-tool", "ai-humanizer"],
  transcribe: ["audio-to-text-transcription", "video-to-text-transcription", "indian-voice-transcriber"],
  subtitle: ["video-to-text-transcription", "subtitle-translator", "bulk-video-subtitle-burner"],
  // Images
  upscale: ["ai-image-upscaler", "bulk-image-upscaler"],
  enhance: ["image-enhancer", "ai-image-upscaler"],
  compress: ["bulk-image-compressor", "image-compressor"],
  watermark: ["bulk-image-watermark", "gemini-watermark-remover"],
  // Video / audio
  trim: ["video-trimmer", "audio-cutter"],
  cut: ["video-trimmer", "audio-cutter"],
  extract: ["bulk-pdf-data-extractor", "video-to-mp3"],
  // Utility
  password: ["password-generator"],
  qr: ["qr-code-generator", "bulk-qr-code-generator"],
  json: ["json-formatter"],
  pdf: ["bulk-pdf-suite"],
  // Finance (Indian users)
  emi: ["emi-calculator"],
  sip: ["sip-calculator"],
  gst: ["gst-calculator"],
};

/** Alias terms pointing at a slug (lowercased, for index building). */
export function aliasesForSlug(slug: string): string[] {
  const out: string[] = [];
  for (const [term, slugs] of Object.entries(SEARCH_ALIASES)) {
    if (slugs.includes(slug)) out.push(term);
  }
  return out;
}
