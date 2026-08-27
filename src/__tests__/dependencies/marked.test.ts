import { describe, it, expect } from 'vitest';
import { marked } from 'marked';

describe('marked dependency', () => {
  it('imports marked successfully', () => {
    expect(marked).toBeDefined();
  });

  it('converts heading', () => {
    const html = marked('# Hello World');
    expect(html).toContain('<h1>');
    expect(html).toContain('Hello World');
  });

  it('converts paragraph', () => {
    const html = marked('This is a paragraph.');
    expect(html).toContain('<p>');
    expect(html).toContain('This is a paragraph.');
  });

  it('converts bold text', () => {
    const html = marked('**Bold text**');
    expect(html).toContain('<strong>');
    expect(html).toContain('Bold text');
  });

  it('converts italic text', () => {
    const html = marked('*Italic text*');
    expect(html).toContain('<em>');
    expect(html).toContain('Italic text');
  });

  it('converts links', () => {
    const html = marked('[Link](https://example.com)');
    expect(html).toContain('<a');
    expect(html).toContain('https://example.com');
  });

  it('converts images', () => {
    const html = marked('![Alt](https://example.com/img.png)');
    expect(html).toContain('<img');
    expect(html).toContain('https://example.com/img.png');
  });

  it('converts code blocks', () => {
    const html = marked('```\nconsole.log("hello");\n```');
    expect(html).toContain('<code>');
  });

  it('converts inline code', () => {
    const html = marked('Use `console.log()`');
    expect(html).toContain('<code>');
    expect(html).toContain('console.log()');
  });

  it('converts lists', () => {
    const html = marked('- Item 1\n- Item 2\n- Item 3');
    expect(html).toContain('<ul>');
    expect(html).toContain('<li>');
  });

  it('converts blockquotes', () => {
    const html = marked('> Quote');
    expect(html).toContain('<blockquote>');
  });

  it('handles empty input', () => {
    const html = marked('');
    expect(html).toBe('');
  });

  it('handles multiple elements', () => {
    const md = '# Title\n\nParagraph with **bold** and *italic*.\n\n- List item';
    const html = marked(md);
    expect(html).toContain('<h1>');
    expect(html).toContain('<p>');
    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
    expect(html).toContain('<ul>');
  });
});

describe('marked integration with Toolzum patterns', () => {
  it('simulates markdown editor workflow', () => {
    const markdown = `# My Document

This is a **bold** statement and this is *italic*.

## Features
- Feature 1
- Feature 2
- Feature 3

> Important note

\`\`\`javascript
const x = 1;
\`\`\`
`;

    const html = marked(markdown);
    expect(html).toContain('<h1>');
    expect(html).toContain('<h2>');
    expect(html).toContain('<strong>');
    expect(html).toContain('<em>');
    expect(html).toContain('<ul>');
    expect(html).toContain('<blockquote>');
  });

  it('simulates markdown preview workflow', () => {
    const userInput = 'Hello **World**';
    const preview = marked(userInput);
    expect(preview).toContain('Hello');
    expect(preview).toContain('World');
    expect(preview).toContain('<strong>');
  });
});
