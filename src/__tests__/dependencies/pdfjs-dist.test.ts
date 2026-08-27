import { describe, it, expect } from 'vitest';
import * as pdfjsLib from 'pdfjs-dist';

describe('pdfjs-dist', () => {
  it('loads PDF.js library', () => {
    expect(pdfjsLib).toBeDefined();
    expect(pdfjsLib.getDocument).toBeDefined();
  });

  it('has version', () => {
    expect(pdfjsLib.version).toBeDefined();
    expect(typeof pdfjsLib.version).toBe('string');
  });

  it('getDocument returns PDFDocumentLoadingTask', async () => {
    const uint8array = new Uint8Array([
      37, 80, 68, 70, 45, 49, 46, 52, // %PDF-1.4
    ]);
    const task = pdfjsLib.getDocument({ data: uint8array });
    expect(task).toBeDefined();
    expect(task.promise).toBeInstanceOf(Promise);
  });

  it('rejects invalid PDF data', async () => {
    const invalidData = new Uint8Array([1, 2, 3, 4]);
    await expect(pdfjsLib.getDocument({ data: invalidData }).promise).rejects.toThrow();
  });
});
