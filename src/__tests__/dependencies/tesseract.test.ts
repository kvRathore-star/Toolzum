import { describe, it, expect } from 'vitest';
import Tesseract from 'tesseract.js';

describe('tesseract.js', () => {
  it('exports Tesseract object', () => {
    expect(Tesseract).toBeDefined();
  });

  it('exports createWorker function', () => {
    expect(typeof Tesseract.createWorker).toBe('function');
  });

  it('exports recognize function', () => {
    expect(Tesseract.recognize).toBeDefined();
    expect(typeof Tesseract.recognize).toBe('function');
  });

  it('exports OEM constants', () => {
    expect(Tesseract.OEM).toBeDefined();
  });

  it('exports PSM constants', () => {
    expect(Tesseract.PSM).toBeDefined();
  });

  it('exports detect function', () => {
    expect(Tesseract.detect).toBeDefined();
    expect(typeof Tesseract.detect).toBe('function');
  });

  it('exports setLogging function', () => {
    expect(Tesseract.setLogging).toBeDefined();
    expect(typeof Tesseract.setLogging).toBe('function');
  });
});
