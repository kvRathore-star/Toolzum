import { describe, it, expect, vi, beforeEach } from 'vitest';
import { clipboardWrite } from '@/lib/clipboard';

const mockWriteText = vi.fn().mockResolvedValue(undefined);

Object.defineProperty(navigator, 'clipboard', {
  value: {
    writeText: mockWriteText,
  },
  writable: true,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('clipboardWrite', () => {
  it('calls navigator.clipboard.writeText', async () => {
    await clipboardWrite('test text');
    expect(mockWriteText).toHaveBeenCalledWith('test text');
  });

  it('handles clipboard errors silently', async () => {
    mockWriteText.mockRejectedValue(new Error('Clipboard denied'));
    await expect(clipboardWrite('test')).resolves.toBeUndefined();
  });

  it('handles empty string', async () => {
    await clipboardWrite('');
    expect(mockWriteText).toHaveBeenCalledWith('');
  });
});
