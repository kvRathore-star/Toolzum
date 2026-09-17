"use client";
import { useState } from 'react';
import DOMPurify from 'dompurify';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function MarkdownPreviewer() {
  const [md, setMd] = useState('# Hello World\n\nThis is **bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n```\ncode block\n```\n\n> Blockquote'); const [html, setHtml] = useState('');

  const mdTables = (src: string): string => {
    const lines = src.split('\n');
    const out: string[] = [];
    for (let i = 0; i < lines.length; i++) {
      const row = lines[i]!;
      const next = lines[i + 1] ?? '';
      if (/^\|.+\|\s*$/.test(row) && next.includes('-') && /^\|?[\s:|-]+\|?[\s:|-]*$/.test(next)) {
        const head = row.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
        i += 2;
        const body: string[][] = [];
        while (i < lines.length && /^\|.+\|\s*$/.test(lines[i]!)) {
          body.push(lines[i]!.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
          i++;
        }
        i--;
        out.push('<table><thead><tr>' + head.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>' + body.map(r => '<tr>' + r.map(c => `<td>${c}</td>`).join('') + '</tr>').join('') + '</tbody></table>');
      } else {
        out.push(row);
      }
    }
    return out.join('\n');
  };

  const preview = () => {
    let h = mdTables(md).replace(/^###### (.*$)/gm, '<h6>$1</h6>').replace(/^##### (.*$)/gm, '<h5>$1</h5>').replace(/^#### (.*$)/gm, '<h4>$1</h4>').replace(/^### (.*$)/gm, '<h3>$1</h3>').replace(/^## (.*$)/gm, '<h2>$1</h2>').replace(/^# (.*$)/gm, '<h1>$1</h1>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>').replace(/`{3}([\s\S]*?)`{3}/g, '<pre><code>$1</code></pre>').replace(/`(.*?)`/g, '<code>$1</code>').replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>').replace(/^- (.*$)/gm, '<li>$1</li>').replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>').replace(/\n\n/g, '</p><p>').replace(/^(?!<[hulpb])/gm, '');
    h = h.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, '<img alt="$1" src="$2" />').replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
    h = `<p>${h}</p>`.replace(/<p><\/p>/g, '');
    setHtml(h);
  };

  const presets = [
    { label: 'Basic', apply: () => { setMd('# Hello World\n\nThis is **bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n```\ncode block\n```\n\n> Blockquote'); } },
    { label: 'Code', apply: () => { setMd('# Code Example\n\n```javascript\nfunction hello() {\n  console.log("Hello, World!");\n}\n```'); } },
    { label: 'Table', apply: () => { setMd('| Name | Age |\n|------|-----|\n| Alice | 30 |\n| Bob | 25 |'); } },
    { label: 'Clear', apply: () => { setMd(''); setHtml(''); } },
  ];

  const resultText = html ? 'Markdown rendered to HTML' : 'Enter Markdown to preview';

  return (
    <CalculatorShell category="SEO" title="Markdown Previewer" result={resultText} onCalculate={preview} presets={presets} accent="amber" downloadData={html} downloadFilename="preview.html">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Markdown</label>
      <textarea aria-label="Markdown" value={md} onChange={e => setMd(e.target.value)} rows={10} placeholder="Enter Markdown..."
        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm font-mono text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50 resize-y" />

      {html && (
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 min-h-[300px] prose prose-sm dark:prose-invert max-w-none overflow-auto">
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(html) }} />
        </div>
      )}
    </CalculatorShell>
  );
}
