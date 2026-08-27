import { describe, it, expect } from 'vitest';
import { createDownloadBlob } from '@/utils/blob';

describe('createDownloadBlob', () => {
  it('creates blob from Uint8Array', () => {
    const data = new Uint8Array([72, 101, 108, 108, 111]);
    const blob = createDownloadBlob(data, 'text/plain');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/plain');
  });

  it('creates blob from string', () => {
    const blob = createDownloadBlob('Hello', 'text/plain');
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('text/plain');
  });

  it('preserves mime type', () => {
    const blob = createDownloadBlob('test', 'application/pdf');
    expect(blob.type).toBe('application/pdf');
  });
});
