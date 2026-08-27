import { describe, it, expect } from 'vitest';
import { smartMax } from '@/utils/fileSizeLimits';

describe('smartMax', () => {
  it('returns video limits for video files', () => {
    const limits = smartMax('video/mp4,video/webm');
    expect(limits.signed).toBe(150);
    expect(limits.free).toBe(30);
  });

  it('returns PDF limits for PDF files', () => {
    const limits = smartMax('application/pdf');
    expect(limits.signed).toBe(40);
    expect(limits.free).toBe(15);
  });

  it('returns audio limits for audio files', () => {
    const limits = smartMax('audio/mp3,audio/wav');
    expect(limits.signed).toBe(50);
    expect(limits.free).toBe(20);
  });

  it('returns default limits for other files', () => {
    const limits = smartMax('image/png,image/jpeg');
    expect(limits.signed).toBe(20);
    expect(limits.free).toBe(10);
  });

  it('returns default limits for text files', () => {
    const limits = smartMax('text/plain');
    expect(limits.signed).toBe(20);
    expect(limits.free).toBe(10);
  });

  it('signed limits are always higher than free limits', () => {
    const videoLimits = smartMax('video/mp4');
    const pdfLimits = smartMax('application/pdf');
    const audioLimits = smartMax('audio/mp3');
    const defaultLimits = smartMax('text/plain');

    expect(videoLimits.signed).toBeGreaterThan(videoLimits.free);
    expect(pdfLimits.signed).toBeGreaterThan(pdfLimits.free);
    expect(audioLimits.signed).toBeGreaterThan(audioLimits.free);
    expect(defaultLimits.signed).toBeGreaterThan(defaultLimits.free);
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
