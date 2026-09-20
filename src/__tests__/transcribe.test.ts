// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import { submitTranscription, TRANSCRIBE_ENDPOINT } from '@/utils/transcribe';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

function mockFile(name = 'episode.mp3') {
  return new File(['audio-bytes'], name, { type: 'audio/mpeg' });
}

function mockFetchResponse(ok: boolean, status: number, body: BodyInit, headers?: HeadersInit) {
  return new Response(body, { status, headers });
}

describe('submitTranscription wiring contract', () => {
  it('POSTs a FormData payload with file + durationSec + response_format=text to the transcribe endpoint', async () => {
    const fetchMock = vi.fn(async () =>
      mockFetchResponse(true, 200, 'hello transcript', { 'content-type': 'text/plain' }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const file = mockFile();
    const result = await submitTranscription(file, 95);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe(TRANSCRIBE_ENDPOINT);
    expect(init.method).toBe('POST');
    expect(init.body).toBeInstanceOf(FormData);
    const body = init.body as FormData;
    expect(body.get('file')).toBe(file);
    expect(body.get('durationSec')).toBe('95');
    expect(body.get('response_format')).toBe('text');
    expect(result).toBe('hello transcript');
  });

  it('throws the server error message when the API returns a JSON error', async () => {
    const fetchMock = vi.fn(async () =>
      mockFetchResponse(false, 500, JSON.stringify({ error: 'Audio too large' }), { 'content-type': 'application/json' }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitTranscription(mockFile(), 60)).rejects.toThrow('Audio too large');
  });

  it('throws a fallback message when the API error body is not JSON', async () => {
    const fetchMock = vi.fn(async () => mockFetchResponse(false, 502, 'Bad Gateway'));
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitTranscription(mockFile(), 60)).rejects.toThrow('Transcription failed (502)');
  });

  it('surfaces the raw transcript on success without an Accept/content-type override', async () => {
    const fetchMock = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(init?.headers).toBeUndefined();
      return mockFetchResponse(true, 200, 'line one\nline two');
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitTranscription(mockFile(), 60);
    expect(result).toBe('line one\nline two');
  });
});
