import { describe, it, expect } from 'vitest';
import { deriveInteractionPattern } from '@/components/tools/ToolPageSEOContent';
import { toolsRegistry } from '@/registry/tools';

function bySlug(slug: string) {
  const t = toolsRegistry.find(t => t.slug === slug);
  if (!t) throw new Error(`slug not in registry: ${slug}`);
  return t;
}

describe('deriveInteractionPattern', () => {
  it('routes text-to-speech to ai-generate (not upload-convert-download)', () => {
    expect(deriveInteractionPattern(bySlug('text-to-speech-tts')).pattern).toBe('ai-generate');
  });

  it('routes speech-to-text to ai-generate (Whisper-backed, not a file conversion)', () => {
    expect(deriveInteractionPattern(bySlug('speech-to-text')).pattern).toBe('ai-generate');
  });

  it('routes audio-converter to upload-convert-download with audio inputType', () => {
    const p = deriveInteractionPattern(bySlug('audio-converter'));
    expect(p.pattern).toBe('upload-convert-download');
    if (p.pattern === 'upload-convert-download') expect(p.inputType).toBe('audio');
  });

  it('leaves controls untouched', () => {
    expect(deriveInteractionPattern(bySlug('aac-to-mp3')).pattern).toBe('upload-convert-download');
    expect(deriveInteractionPattern(bySlug('length-converter')).pattern).toBe('enter-values-result');
    expect(deriveInteractionPattern(bySlug('temperature-converter')).pattern).toBe('enter-values-result');
  });

  it('no speech tool gets the file-conversion pattern', () => {
    const bad = toolsRegistry.filter(t => {
      const n = t.name.toLowerCase();
      if (!n.includes('speech')) return false;
      return deriveInteractionPattern(t).pattern === 'upload-convert-download';
    });
    expect(bad.map(t => t.slug)).toEqual([]);
  });

  it('routes text/code converters to paste-text (not enter-values)', () => {
    // Oct 5 audit: 14 tools showed "fill in numbers, dates, measurements".
    for (const slug of ['yaml-json-converter', 'scss-to-css-converter', 'case-converter', 'hex-text-converter', 'nato-phonetic-converter']) {
      expect(deriveInteractionPattern(bySlug(slug)).pattern).toBe('paste-text-process-copy');
    }
  });

  it('keeps value converters on enter-values-result', () => {
    for (const slug of ['unit-converter', 'currency-converter', 'px-rem-converter', 'power-converter', 'cgpa-to-percentage-converter']) {
      expect(deriveInteractionPattern(bySlug(slug)).pattern).toBe('enter-values-result');
    }
  });

  it('routes timers and speed-test to dedicated patterns (Oct 5 recheck)', () => {
    for (const slug of ['pomodoro-timer', 'timer', 'stopwatch', 'countdown-tool', 'interval-timer', 'tabata-timer']) {
      expect(deriveInteractionPattern(bySlug(slug)).pattern).toBe('set-start-alert');
    }
    expect(deriveInteractionPattern(bySlug('speed-test')).pattern).toBe('measure-read');
  });

  it('routes data/text tools to paste-text (Oct 5 recheck)', () => {
    for (const slug of ['csv-data-cleaner', 'morse-code-translator', 'null-value-handler', 'url-shortener', 'resume-builder']) {
      const p = deriveInteractionPattern(bySlug(slug)).pattern;
      expect(['paste-text-process-copy', 'enter-values-result']).toContain(p);
    }
    expect(deriveInteractionPattern(bySlug('csv-data-cleaner')).pattern).toBe('paste-text-process-copy');
    expect(deriveInteractionPattern(bySlug('url-shortener')).pattern).toBe('paste-text-process-copy');
    expect(deriveInteractionPattern(bySlug('resume-builder')).pattern).toBe('enter-values-result');
  });

  it('routes file converters to upload patterns (Oct 5 recheck)', () => {
    expect(deriveInteractionPattern(bySlug('word-to-pdf')).pattern).toBe('upload-convert-download');
    expect(deriveInteractionPattern(bySlug('blur-face')).pattern).toBe('upload-process-download');
    expect(deriveInteractionPattern(bySlug('pdf-background-color')).pattern).toBe('upload-process-download');
  });

  it('routes pickers, toolkits, SaaS compute, and games (Batch 2 recheck)', () => {
    for (const slug of ['color-picker', 'emoji-picker', 'yes-no-picker']) {
      expect(deriveInteractionPattern(bySlug(slug)).pattern).toBe('click-generate');
    }
    expect(deriveInteractionPattern(bySlug('whatsapp-toolkit')).pattern).toBe('paste-text-process-copy');
    for (const slug of ['saas-payback-period', 'saas-quick-ratio', 'saas-rule-of-40']) {
      expect(deriveInteractionPattern(bySlug(slug)).pattern).toBe('enter-values-result');
    }
    for (const slug of ['number-guessing-game', 'rock-paper-scissors', 'hangman-game']) {
      expect(deriveInteractionPattern(bySlug(slug)).pattern).toBe('play-interact');
    }
  });
});
