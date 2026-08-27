import { describe, it, expect } from 'vitest';
import JSZip from 'jszip';

describe('jszip dependency', () => {
  it('creates a new zip instance', () => {
    const zip = new JSZip();
    expect(zip).toBeDefined();
  });

  it('adds a file to zip', () => {
    const zip = new JSZip();
    zip.file('test.txt', 'Hello World');
    expect(zip.file('test.txt')).toBeDefined();
  });

  it('adds multiple files', () => {
    const zip = new JSZip();
    zip.file('file1.txt', 'Content 1');
    zip.file('file2.txt', 'Content 2');
    zip.file('file3.txt', 'Content 3');
    
    const files = zip.filter(() => true);
    expect(files.length).toBe(3);
  });

  it('adds file in subdirectory', () => {
    const zip = new JSZip();
    zip.file('folder/subfolder/file.txt', 'Nested content');
    
    expect(zip.file('folder/subfolder/file.txt')).toBeDefined();
  });

  it('generates zip as blob', async () => {
    const zip = new JSZip();
    zip.file('test.txt', 'Hello World');
    
    const blob = await zip.generateAsync({ type: 'blob' });
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('generates zip as base64', async () => {
    const zip = new JSZip();
    zip.file('test.txt', 'Hello World');
    
    const base64 = await zip.generateAsync({ type: 'base64' });
    expect(typeof base64).toBe('string');
    expect(base64.length).toBeGreaterThan(0);
  });

  it('generates zip as uint8array', async () => {
    const zip = new JSZip();
    zip.file('test.txt', 'Hello World');
    
    const array = await zip.generateAsync({ type: 'uint8array' });
    expect(array).toBeInstanceOf(Uint8Array);
  });

  it('loads zip from data', async () => {
    const zip = new JSZip();
    zip.file('test.txt', 'Hello World');
    const data = await zip.generateAsync({ type: 'uint8array' });
    
    const loadedZip = await JSZip.loadAsync(data);
    expect(loadedZip.file('test.txt')).toBeDefined();
  });

  it('extracts file content', async () => {
    const zip = new JSZip();
    zip.file('test.txt', 'Hello World');
    const data = await zip.generateAsync({ type: 'uint8array' });
    
    const loadedZip = await JSZip.loadAsync(data);
    const content = await loadedZip.file('test.txt')?.async('string');
    expect(content).toBe('Hello World');
  });

  it('handles binary data', async () => {
    const zip = new JSZip();
    const binaryData = new Uint8Array([1, 2, 3, 4, 5]);
    zip.file('binary.bin', binaryData);
    
    const zipData = await zip.generateAsync({ type: 'uint8array' });
    const loadedZip = await JSZip.loadAsync(zipData);
    const extracted = await loadedZip.file('binary.bin')?.async('uint8array');
    
    expect(extracted).toEqual(binaryData);
  });

  it('removes a file', () => {
    const zip = new JSZip();
    zip.file('test.txt', 'Hello');
    zip.remove('test.txt');
    expect(zip.file('test.txt')).toBeNull();
  });

  it('lists all files', () => {
    const zip = new JSZip();
    zip.file('a.txt', 'A');
    zip.file('b.txt', 'B');
    zip.file('c.txt', 'C');
    
    const files = zip.filter(() => true);
    expect(files.map(f => f.name).sort()).toEqual(['a.txt', 'b.txt', 'c.txt']);
  });

  it('handles empty zip', async () => {
    const zip = new JSZip();
    const data = await zip.generateAsync({ type: 'uint8array' });
    const loadedZip = await JSZip.loadAsync(data);
    
    const files = loadedZip.filter(() => true);
    expect(files.length).toBe(0);
  });

  it('supports compression options', async () => {
    const zip = new JSZip();
    zip.file('test.txt', 'Hello World'.repeat(100));
    
    const compressed = await zip.generateAsync({ 
      type: 'uint8array', 
      compression: 'DEFLATE',
      compressionOptions: { level: 9 }
    });
    
    const uncompressed = await zip.generateAsync({ 
      type: 'uint8array', 
      compression: 'STORE'
    });
    
    // Compressed should be smaller for repeated content
    expect(compressed.length).toBeLessThanOrEqual(uncompressed.length);
  });
});

describe('jszip integration with Toolzum patterns', () => {
  it('simulates ZIP creation from multiple files', async () => {
    const zip = new JSZip();
    
    // Simulate adding multiple text files
    zip.file('document1.txt', 'Document 1 content');
    zip.file('document2.txt', 'Document 2 content');
    zip.file('images/photo.jpg', 'fake-jpeg-data');
    
    const data = await zip.generateAsync({ type: 'uint8array' });
    expect(data.length).toBeGreaterThan(0);
    
    // Verify structure
    const loadedZip = await JSZip.loadAsync(data);
    expect(loadedZip.file('document1.txt')).toBeDefined();
    expect(loadedZip.file('document2.txt')).toBeDefined();
    expect(loadedZip.file('images/photo.jpg')).toBeDefined();
  });

  it('simulates ZIP extraction workflow', async () => {
    // Create a zip
    const originalZip = new JSZip();
    originalZip.file('readme.txt', 'This is a readme');
    originalZip.file('data.json', '{"key": "value"}');
    
    const zipData = await originalZip.generateAsync({ type: 'uint8array' });
    
    // Extract and process
    const extractedZip = await JSZip.loadAsync(zipData);
    const readme = await extractedZip.file('readme.txt')?.async('string');
    const data = await extractedZip.file('data.json')?.async('string');
    
    expect(readme).toBe('This is a readme');
    expect(data).toBe('{"key": "value"}');
  });

  it('simulates batch file processing', async () => {
    const files = [
      { name: 'file1.txt', content: 'Content 1' },
      { name: 'file2.txt', content: 'Content 2' },
      { name: 'file3.txt', content: 'Content 3' },
    ];
    
    const zip = new JSZip();
    files.forEach(f => zip.file(f.name, f.content));
    
    const data = await zip.generateAsync({ type: 'uint8array' });
    const loadedZip = await JSZip.loadAsync(data);
    
    for (const f of files) {
      const content = await loadedZip.file(f.name)?.async('string');
      expect(content).toBe(f.content);
    }
  });

  it('simulates ZIP preview without full extraction', async () => {
    const zip = new JSZip();
    zip.file('large-file.bin', 'x'.repeat(10000));
    zip.file('small-file.txt', 'small');
    
    const data = await zip.generateAsync({ type: 'uint8array' });
    const loadedZip = await JSZip.loadAsync(data);
    
    // List files without extracting
    const fileList = loadedZip.filter(() => true);
    expect(fileList.length).toBe(2);
    expect(fileList.map(f => f.name)).toContain('large-file.bin');
    expect(fileList.map(f => f.name)).toContain('small-file.txt');
  });
});
