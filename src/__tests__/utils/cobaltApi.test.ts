import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchCobaltDownload } from '@/utils/cobaltApi';

describe('fetchCobaltDownload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('exports fetchCobaltDownload function', () => {
    expect(typeof fetchCobaltDownload).toBe('function');
  });

  it('returns redirect response on success', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ status: 'redirect', url: 'https://download.example.com/video.mp4' }),
    };
    global.fetch = vi.fn(async () => mockResponse as Response);

    const result = await fetchCobaltDownload({ url: 'https://youtube.com/watch?v=123' });
    expect(result.status).toBe('redirect');
    expect(result.url).toBe('https://download.example.com/video.mp4');
  });

  it('tries fallback endpoints on failure', async () => {
    const failResponse = { ok: false, status: 500 };
    const successResponse = {
      ok: true,
      status: 200,
      json: async () => ({ status: 'success', url: 'https://dl.example.com/video.mp4' }),
    };
    global.fetch = vi.fn()
      .mockResolvedValueOnce(failResponse)
      .mockResolvedValueOnce(successResponse as Response);

    const result = await fetchCobaltDownload({ url: 'https://youtube.com/watch?v=123' });
    expect(result.status).toBe('success');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('skips rate-limited endpoints and tries next', async () => {
    const rateLimited = { ok: false, status: 429 };
    const successResponse = {
      ok: true,
      status: 200,
      json: async () => ({ status: 'stream', url: 'https://dl.example.com/video.mp4' }),
    };
    global.fetch = vi.fn()
      .mockResolvedValueOnce(rateLimited)
      .mockResolvedValueOnce(successResponse as Response);

    const result = await fetchCobaltDownload({ url: 'https://youtube.com/watch?v=123' });
    expect(result.status).toBe('stream');
  });

  it('returns error when all endpoints fail', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await fetchCobaltDownload({ url: 'https://youtube.com/watch?v=123' });
    expect(result.status).toBe('error');
    expect(result.text).toContain('All download servers');
  });

  it('sends correct request body with defaults', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ status: 'success' }),
    };
    global.fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string);
      expect(body.url).toBe('https://youtube.com/watch?v=123');
      expect(body.vQuality).toBe('1080');
      expect(body.vCodec).toBe('h264');
      expect(body.aFormat).toBe('mp3');
      expect(body.isAudioOnly).toBe(false);
      expect(body.isNoTTWatermark).toBe(true);
      return mockResponse as Response;
    });

    await fetchCobaltDownload({ url: 'https://youtube.com/watch?v=123' });
  });

  it('sends custom options in request body', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({ status: 'success' }),
    };
    global.fetch = vi.fn(async (_url: string, init: RequestInit) => {
      const body = JSON.parse(init.body as string);
      expect(body.vQuality).toBe('720');
      expect(body.vCodec).toBe('vp9');
      expect(body.aFormat).toBe('ogg');
      expect(body.isAudioOnly).toBe(true);
      return mockResponse as Response;
    });

    await fetchCobaltDownload({
      url: 'https://youtube.com/watch?v=123',
      vQuality: '720',
      vCodec: 'vp9',
      aFormat: 'ogg',
      isAudioOnly: true,
    });
  });

  it('handles picker response type', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      json: async () => ({
        status: 'picker',
        picker: [
          { url: 'https://dl.example.com/img1.jpg', type: 'photo' },
          { url: 'https://dl.example.com/img2.jpg', type: 'photo' },
        ],
      }),
    };
    global.fetch = vi.fn(async () => mockResponse as Response);

    const result = await fetchCobaltDownload({ url: 'https://instagram.com/p/123' });
    expect(result.status).toBe('picker');
    expect(result.picker).toHaveLength(2);
  });
});
