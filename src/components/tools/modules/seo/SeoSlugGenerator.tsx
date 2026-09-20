"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function SeoSlugGenerator() {
  const [text, setText] = useState('How to Write SEO-Friendly URLs'); const [slug, setSlug] = useState('');
  const generate = () => { setSlug(text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')); };

  const presets = [
    { label: 'Blog Post', apply: () => { setText('How to Write SEO-Friendly URLs'); generate(); } },
    { label: 'Product', apply: () => { setText('Premium Wireless Headphones - Black'); generate(); } },
    { label: 'Category', apply: () => { setText('Men\'s Running Shoes - Size 10'); generate(); } },
    { label: 'Clear', apply: () => { setText(''); setSlug(''); } },
  ];

  const resultText = slug ? `Slug generated: ${slug}` : 'Enter text to generate slug';

  const customResult = slug ? (
    <div className="flex flex-col justify-center items-center min-h-[100px] text-center">
      <p className="text-lg font-mono font-bold text-[var(--text-primary)] break-all">{slug}</p>
      <button aria-label="Copy slug" onClick={() => { clipboardWrite(slug).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors mt-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"><Copy size={14} /></button>
    </div>
  ) : undefined;

  return (
    <CalculatorShell category="SEO" title="SEO Slug Generator" result={resultText} customResult={customResult} onCalculate={generate} calculateLabel="Generate" presets={presets} accent="emerald" downloadData={slug} downloadFilename="slug.txt">
      <div className="space-y-4">
        <label htmlFor="lbl-seosluggenerator-text" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
        <input id="lbl-seosluggenerator-text" aria-label="Text" type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Enter text to convert to slug"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />
      </div>
    </CalculatorShell>
  );
}
