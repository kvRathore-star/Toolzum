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
});
