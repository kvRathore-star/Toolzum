import { describe, it, expect } from 'vitest';
import { filesToAttachments, MAX_ATTACHMENT_FILES, MAX_ATTACHMENT_BYTES } from '@/lib/attachClient';

/**
 * jsdom's File/Blob lacks arrayBuffer(), so tests use plain File-shaped
 * objects — attachClient only touches name, type, size, arrayBuffer().
 * Size overrides also keep the limit tests from allocating tens of MB.
 */
function makeFile(
  name: string,
  bytes: Uint8Array = new Uint8Array([1]),
  type = 'image/png',
  sizeOverride?: number
): File {
  return {
    name,
    type,
    size: sizeOverride ?? bytes.byteLength,
    arrayBuffer: async () =>
      bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength),
  } as unknown as File;
}

describe('filesToAttachments', () => {
  it('round-trips bytes through base64 with filename and mime', async () => {
    const payload = new TextEncoder().encode('hello attachment');
    const out = await filesToAttachments([makeFile('note.txt', payload, 'text/plain')]);
    expect(out).toHaveLength(1);
    expect(out[0]!.filename).toBe('note.txt');
    expect(out[0]!.mime).toBe('text/plain');
    const decoded = Uint8Array.from(atob(out[0]!.content), (c) => c.charCodeAt(0));
    expect([...decoded]).toEqual([...payload]);
  });

  it('defaults the mime type to application/octet-stream', async () => {
    const out = await filesToAttachments([makeFile('blob.bin', new Uint8Array([1, 2]), '')]);
    expect(out[0]!.mime).toBe('application/octet-stream');
  });

  it('rejects more than 5 files before doing any work', async () => {
    const files = Array.from({ length: MAX_ATTACHMENT_FILES + 1 }, (_, i) =>
      makeFile(`f${i}.txt`)
    );
    await expect(filesToAttachments(files)).rejects.toThrow(/5 attachments/);
  });

  it('rejects a single file over the 8 MB per-file limit', async () => {
    const big = makeFile('big.bin', new Uint8Array(0), 'application/octet-stream', MAX_ATTACHMENT_BYTES + 1);
    await expect(filesToAttachments([big])).rejects.toThrow(/8 MB per file/);
  });

  it('rejects when the combined files exceed the 12 MB total limit', async () => {
    // 4 files × 4 MB declared = 16 MB — each under the per-file cap,
    // combined over 12 MB, so the total guard must fire on the 4th file.
    const each = Math.floor((12 * 1024 * 1024) / 4) + 1024 * 1024;
    const files = Array.from({ length: 4 }, (_, i) =>
      makeFile(`part${i}.bin`, new Uint8Array([i]), 'application/octet-stream', each)
    );
    await expect(filesToAttachments(files)).rejects.toThrow(/12 MB total/);
  });

  it('slices an over-long filename to 200 chars', async () => {
    const out = await filesToAttachments([makeFile('a'.repeat(500))]);
    expect(out[0]!.filename).toHaveLength(200);
  });
});
