import { describe, it, expect, vi } from 'vitest';
import DOMPurify from 'dompurify';

// Mock window for jsdom
Object.defineProperty(global, 'window', {
  value: {
    DOMParser: class {
      parseFromString() {
        return {
          body: {
            firstChild: {
              textContent: '',
            },
          },
        };
      }
    },
  },
  writable: true,
});

describe('dompurify dependency', () => {
  it('imports dompurify successfully', () => {
    expect(DOMPurify).toBeDefined();
  });

  it('sanitizes clean HTML', () => {
    const clean = DOMPurify.sanitize('<p>Hello World</p>');
    expect(clean).toContain('Hello World');
  });

  it('removes script tags', () => {
    const dirty = '<p>Hello</p><script>alert("xss")</script>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('<script>');
    expect(clean).toContain('Hello');
  });

  it('removes event handlers', () => {
    const dirty = '<p onclick="alert(\'xss\')">Hello</p>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('onclick');
  });

  it('removes javascript: URLs', () => {
    const dirty = '<a href="javascript:alert(\'xss\')">Click</a>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).not.toContain('javascript:');
  });

  it('allows safe HTML', () => {
    const dirty = '<p><strong>Bold</strong> and <em>italic</em></p>';
    const clean = DOMPurify.sanitize(dirty);
    expect(clean).toContain('<strong>');
    expect(clean).toContain('<em>');
  });

  it('handles empty input', () => {
    const clean = DOMPurify.sanitize('');
    expect(clean).toBe('');
  });

  it('handles malformed HTML', () => {
    const dirty = '<p>Unclosed tag';
    const clean = DOMPurify.sanitize(dirty);
    expect(typeof clean).toBe('string');
  });
});

describe('dompurify integration with Toolzum patterns', () => {
  it('sanitizes markdown output', () => {
    const markdownHtml = '<h1>Title</h1><p>Content with <script>bad</script></p>';
    const clean = DOMPurify.sanitize(markdownHtml);
    expect(clean).toContain('<h1>');
    expect(clean).toContain('<p>');
    expect(clean).not.toContain('<script>');
  });

  it('sanitizes user input', () => {
    const userInput = '<img src=x onerror=alert(1)>';
    const clean = DOMPurify.sanitize(userInput);
    expect(clean).not.toContain('onerror');
  });

  it('preserves formatting', () => {
    const formatted = '<p style="color: red;">Text</p>';
    const clean = DOMPurify.sanitize(formatted);
    expect(clean).toContain('Text');
  });
});
