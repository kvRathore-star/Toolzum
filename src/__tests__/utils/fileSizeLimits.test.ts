import { describe, it, expect } from 'vitest';
import { smartMax } from '@/utils/fileSizeLimits';

describe('smartMax', () => {
  it('returns video limits for video files', () => {
    const limits = smartMax('video/mp4,video/webm');
    expect(limits.signed).toBe(250);
    expect(limits.free).toBe(250);
  });

  it('returns PDF limits for PDF files', () => {
    const limits = smartMax('application/pdf');
    expect(limits.signed).toBe(125);
    expect(limits.free).toBe(125);
  });

  it('returns audio limits for audio files', () => {
    const limits = smartMax('audio/mp3,audio/wav');
    expect(limits.signed).toBe(100);
    expect(limits.free).toBe(100);
  });

  it('returns image ceilings for image files', () => {
    const limits = smartMax('image/png,image/jpeg');
    expect(limits.signed).toBe(50);
    expect(limits.free).toBe(50);
  });

  it('returns the generous other-category ceiling for text files', () => {
    const limits = smartMax('text/plain');
    expect(limits.signed).toBe(150);
    expect(limits.free).toBe(150);
  });

  it('anon and signed-in share the same ceilings (local compute is free)', () => {
    for (const accept of ['video/mp4', 'application/pdf', 'audio/mp3', 'text/plain', 'image/png']) {
      const limits = smartMax(accept);
      expect(limits.signed).toBe(limits.free);
    }
  });

  it('video has highest limits', () => {
    const video = smartMax('video/mp4');
    const pdf = smartMax('application/pdf');
    const audio = smartMax('audio/mp3');
    const other = smartMax('text/plain');

    expect(video.signed).toBeGreaterThan(pdf.signed);
    expect(video.signed).toBeGreaterThan(audio.signed);
    expect(video.signed).toBeGreaterThan(other.signed);
  });
});
