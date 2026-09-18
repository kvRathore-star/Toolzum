"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function SeoPreviewGenerator() {
  const [title, setTitle] = useState('Toolzum - Free Online Tools');
  const [url, setUrl] = useState('https://toolzum.com/');
  const [description, setDescription] = useState('Free online tools for developers, designers, and everyday tasks. No sign-up required, 100% browser-based.');

  const ogLength = title.length;
  const descLength = description.length;

  const presets = [
    { label: 'Toolzum', apply: () => { setTitle('Toolzum - Free Online Tools'); setUrl('https://toolzum.com/'); setDescription('Free online tools for developers, designers, and everyday tasks. No sign-up required, 100% browser-based.'); } },
    { label: 'E-commerce', apply: () => { setTitle('Buy Premium Widgets Online - Best Prices'); setUrl('https://shop.example.com/widgets'); setDescription('Shop premium widgets at unbeatable prices. Fast shipping, easy returns.'); } },
    { label: 'Blog Post', apply: () => { setTitle('10 Tips for Better SEO in 2024'); setUrl('https://blog.example.com/seo-tips-2024'); setDescription('Boost your search rankings with these proven SEO strategies and techniques.'); } },
    { label: 'Clear', apply: () => { setTitle(''); setUrl(''); setDescription(''); } },
  ];

  const resultText = `Title: ${ogLength}/60 ${ogLength > 60 ? '⚠️ Too long' : '✓'} | Description: ${descLength}/160 ${descLength > 160 ? '⚠️ Too long' : '✓'}`;

  return (
    <CalculatorShell category="SEO" title="SEO Preview Generator" result={resultText} auto={true} calculateLabel="Generate" presets={presets} accent="indigo" downloadData={JSON.stringify({ title, url, description, ogLength, descLength }, null, 2)} downloadFilename="seo-preview.json">
      <div className="space-y-4">
        <div>
          <label htmlFor="lbl-seopreviewgenerator-title" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Title</label>
          <input id="lbl-seopreviewgenerator-title" aria-label="Title" type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        <div>
          <label htmlFor="lbl-seopreviewgenerator-url" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Page URL</label>
          <input id="lbl-seopreviewgenerator-url" aria-label="Page URL" type="url" value={url} onChange={e => setUrl(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        <div>
          <label htmlFor="lbl-seopreviewgenerator-description" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Description</label>
          <textarea id="lbl-seopreviewgenerator-description" aria-label="Description" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Meta description..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50 resize-y" />
        </div>

        <div aria-live="polite" className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col justify-center min-h-[200px]">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-3">Google SERP Preview</p>
          <div className="p-4 border border-[var(--border-subtle)] rounded-xl bg-white dark:bg-[var(--bg-surface)]">
            <div className="text-xs text-green-700 dark:text-green-400 mb-1">{url}</div>
            <div className="text-xl text-[var(--accent)] font-medium leading-tight mb-1 hover:underline cursor-pointer">{title}</div>
            <div className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] leading-snug">{description}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 bg-[var(--bg-surface)] rounded-lg text-center">
            <div className="text-[var(--text-muted)]">Title Length</div>
            <div className={`font-bold ${ogLength > 60 ? 'text-red-500' : 'text-green-500'}`}>{ogLength}/60</div>
          </div>
          <div className="p-2 bg-[var(--bg-surface)] rounded-lg text-center">
            <div className="text-[var(--text-muted)]">Description Length</div>
            <div className={`font-bold ${descLength > 160 ? 'text-red-500' : 'text-green-500'}`}>{descLength}/160</div>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
