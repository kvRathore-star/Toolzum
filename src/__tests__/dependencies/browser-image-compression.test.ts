import { describe, it, expect } from 'vitest';
import imageCompression from 'browser-image-compression';

describe('browser-image-compression', () => {
  it('exports compression function', () => {
    expect(imageCompression).toBeDefined();
    expect(typeof imageCompression).toBe('function');
  });

  it('exports getDataUrlFromFile', () => {
    expect(imageCompression.getDataUrlFromFile).toBeDefined();
    expect(typeof imageCompression.getDataUrlFromFile).toBe('function');
  });

  it('exports getFilefromDataUrl', () => {
    expect(imageCompression.getFilefromDataUrl).toBeDefined();
    expect(typeof imageCompression.getFilefromDataUrl).toBe('function');
  });

  it('exports loadImage', () => {
    expect(imageCompression.loadImage).toBeDefined();
    expect(typeof imageCompression.loadImage).toBe('function');
  });

  it('exports canvasToFile', () => {
    expect(imageCompression.canvasToFile).toBeDefined();
    expect(typeof imageCompression.canvasToFile).toBe('function');
  });

  it('exports version', () => {
    expect(imageCompression.version).toBeDefined();
  });

  it('getDataUrlFromFile reads file as data URL', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const dataUrl = await imageCompression.getDataUrlFromFile(file);
    expect(dataUrl).toContain('data:text/plain');
  });
});
