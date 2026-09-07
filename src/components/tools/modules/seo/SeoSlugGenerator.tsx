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

  return (
    <CalculatorShell category="SEO" title="SEO Slug Generator" result={resultText} onCalculate={generate} calculateLabel="Generate" presets={presets} accent="emerald" downloadData={slug} downloadFilename="slug.txt">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
        <input aria-label="Text" type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Enter text to convert to slug"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />

        {slug && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col justify-center items-center min-h-[100px]">
            <div className="text-center">
              <p className="text-lg font-mono font-bold text-[var(--text-primary)] break-all">{slug}</p>
              <button aria-label="Copy slug" onClick={() => { clipboardWrite(slug); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors mt-2 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"><Copy size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
