"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function BreadcrumbSchemaGenerator() {
  const [pages, setPages] = useState('Home,https://example.com\nProducts,https://example.com/products\nWidgets,https://example.com/widgets'); const [result, setResult] = useState('');
  const generate = () => { const items = pages.split('\n').filter(l => l.trim()).map(l => { const [name, url] = l.split(',').map(s => s.trim()); return { name, url }; }); if (items.length < 2) return; setResult(JSON.stringify({ "@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": items.map((item, i) => ({ "@type": "ListItem", "position": i + 1, "name": item.name, "item": item.url })) }, null, 2)); };

  const presets = [
    { label: 'E-commerce', apply: () => setPages('Home,https://example.com\nProducts,https://example.com/products\nWidgets,https://example.com/widgets') },
    { label: 'Blog', apply: () => setPages('Home,https://blog.example.com\nCategory,https://blog.example.com/category\nPost,https://blog.example.com/post') },
    { label: 'Documentation', apply: () => setPages('Home,https://docs.example.com\nGuides,https://docs.example.com/guides\nAPI,https://docs.example.com/api') },
    { label: 'Clear', apply: () => { setPages(''); setResult(''); } },
  ];

  const resultText = result ? 'Breadcrumb schema generated' : 'Enter pages to generate breadcrumb schema';

  const customResult = result ? (
    <div className="flex flex-col min-h-[200px]">
      <textarea aria-label="Breadcrumb schema" readOnly value={result} rows={10}
        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] font-mono text-xs resize-none" />
      <button aria-label="Copy breadcrumb schema" onClick={() => { clipboardWrite(result).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="mt-2 p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors self-start"><Copy size={14} /></button>
    </div>
  ) : undefined;

  return (
    <CalculatorShell category="SEO" title="Breadcrumb Schema Generator" result={resultText} customResult={customResult} onCalculate={generate} calculateLabel="Generate" presets={presets} accent="amber" downloadData={result} downloadFilename="breadcrumb-schema.json">
      <div className="space-y-4">
        <label htmlFor="lbl-breadcrumbschemagenerator-pages-name-url-per-line" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Pages (Name,URL per line)</label>
        <textarea id="lbl-breadcrumbschemagenerator-pages-name-url-per-line" aria-label="Pages (Name,URL per line)" value={pages} onChange={e => setPages(e.target.value)} rows={5} placeholder="Home,https://example.com\nProducts,https://example.com/products"
          className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50 resize-y" />
      </div>
    </CalculatorShell>
  );
}
