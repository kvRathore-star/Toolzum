"use client";
import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import DOMPurify from 'dompurify';
import { CalculatorShell } from '../shared/CalculatorShell';

export function TextHtmlTool({ defaultMode }: { defaultMode: 'text-to-html' | 'html-to-text' }) {
  const [mode, setMode] = useState(defaultMode); const [input, setInput] = useState(''); const [result, setResult] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [semantic, setSemantic] = useState(false);
  const [hasMarkdown, setHasMarkdown] = useState(false);

  const detectMarkdown = (text: string) => {
    const mdPatterns = [/\*\*.*?\*\*/, /\*.*?\*/, /^#+\s/m, /`{3}/, /^\s*[-*]\s/m, /^\d+\.\s/m, /\[.*?\]\(.*?\)/];
    return mdPatterns.some(p => p.test(text));
  };

  const convert = () => {
    const val = input.trim(); if (!val) { setResult(''); return; }
    try {
      if (mode === 'text-to-html') {
        setHasMarkdown(detectMarkdown(val));
        const paragraphs = val.split(/\n\s*\n/).filter(p => p.trim());
        const htmlParts = paragraphs.map(p => {
          const lines = p.split('\n').filter(l => l.trim()).join('<br />');
          return semantic ? `<section><p>${lines}</p></section>` : `<p>${lines}</p>`;
        });
        setResult(htmlParts.join('\n'));
      } else {
        setResult(val.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>').replace(/"/g, '"').replace(/'/g, "'").replace(/\n\s*\n/g, '\n\n').trim());
      }
    } catch { setResult(''); }
  };

  const isTextToHtml = mode === 'text-to-html';

  const presets = [
    { label: 'Article', apply: () => { setMode('text-to-html'); setInput('Title\n\nFirst paragraph here.\n\nSecond paragraph with **bold** and *italic* text.'); } },
    { label: 'Code Block', apply: () => { setMode('text-to-html'); setInput('function hello() {\n  console.log("Hello, World!");\n}'); } },
    { label: 'HTML', apply: () => { setMode('html-to-text'); setInput('<div class="card"><h1>Title</h1><p>Content with <strong>bold</strong> text.</p></div>'); } },
    { label: 'Clear', apply: () => { setInput(''); setResult(''); } },
  ];

  const resultText = result ? `Converted ${isTextToHtml ? 'text → HTML' : 'HTML → text'}` : 'Enter content to convert';

  return (
    <CalculatorShell title={isTextToHtml ? 'Text to HTML Converter' : 'HTML to Text Converter'} category="SEO" result={resultText} onCalculate={convert} presets={presets} accent="amber" downloadData={result} downloadFilename={isTextToHtml ? 'output.html' : 'output.txt'}>
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{isTextToHtml ? 'Plain Text' : 'HTML'}</label>
        <textarea value={input} onChange={e => setInput(e.target.value)} rows={8} placeholder={isTextToHtml ? 'Enter plain text...' : 'Enter HTML...'}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50 resize-y" />

        <div className="flex flex-wrap gap-2">
          <button onClick={() => setMode(isTextToHtml ? 'html-to-text' : 'text-to-html')} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Switch ↻</button>
          {isTextToHtml && (
            <>
              <button onClick={() => setShowPreview(!showPreview)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${showPreview ? 'bg-amber-500 text-white border-amber-500' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Preview</button>
              <button onClick={() => setSemantic(!semantic)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${semantic ? 'bg-purple-500 text-white border-purple-500' : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Semantic HTML</button>
            </>
          )}
        </div>

        {hasMarkdown && isTextToHtml && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Markdown syntax detected in input. This tool converts plain text to HTML.
          </div>
        )}

        {result && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[250px]">
            {showPreview && isTextToHtml ? (
              <div className="flex-1 p-4 border border-[var(--border-subtle)] rounded-xl bg-white dark:bg-[var(--bg-surface)] prose prose-sm dark:prose-invert max-w-none overflow-auto">
                <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(result) }} />
              </div>
            ) : (
              <textarea readOnly value={result} rows={8} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
            )}
            <div className="flex items-center gap-3 mt-2">
              <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Copy result"><Copy size={14} /></button>
              <button onClick={() => { const blob = new Blob([result], { type: isTextToHtml ? 'text/html' : 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = isTextToHtml ? 'output.html' : 'output.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" aria-label="Download output"><Download size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

export default function TextToHtmlConverter() { return <TextHtmlTool key="text-to-html" defaultMode="text-to-html" />; }
