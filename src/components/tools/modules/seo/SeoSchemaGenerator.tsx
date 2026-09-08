"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function SeoSchemaGenerator() {
  const [type, setType] = useState('Article'); const [data, setData] = useState('{"headline": "Sample Article", "description": "Article description"}'); const [result, setResult] = useState('');
  const generate = () => { try { const parsed = JSON.parse(data); setResult(JSON.stringify({ '@context': 'https://schema.org', '@type': type, ...parsed }, null, 2)); } catch { setResult('Invalid JSON input'); } };

  const presets = [
    { label: 'Article', apply: () => { setType('Article'); setData('{"headline": "Sample Article", "description": "Article description"}'); generate(); } },
    { label: 'Product', apply: () => { setType('Product'); setData('{"name": "Product Name", "description": "Product description", "price": "29.99", "currency": "USD"}'); generate(); } },
    { label: 'FAQPage', apply: () => { setType('FAQPage'); setData('{"mainEntity": [{"@type": "Question", "name": "Question?", "acceptedAnswer": {"@type": "Answer", "text": "Answer text."}}]}'); generate(); } },
    { label: 'Clear', apply: () => { setResult(''); } },
  ];

  const resultText = result ? 'Schema generated successfully' : 'Enter properties to generate schema';

  return (
    <CalculatorShell category="SEO" title="SEO Schema Generator" result={resultText} onCalculate={generate} calculateLabel="Generate" presets={presets} accent="indigo" downloadData={result} downloadFilename="schema.json">
      <div className="space-y-4">
        <div className="mb-3">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Schema Type</label>
          <select aria-label="Schema Type" value={type} onChange={e => setType(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50">
            <option value="Article">Article</option>
            <option value="Product">Product</option>
            <option value="FAQPage">FAQ</option>
            <option value="LocalBusiness">LocalBusiness</option>
            <option value="Recipe">Recipe</option>
            <option value="Event">Event</option>
          </select>
        </div>

        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Properties (JSON)</label>
        <textarea aria-label="Properties (JSON)" value={data} onChange={e => setData(e.target.value)} rows={6} placeholder='{"headline": "Sample Article", "description": "Article description"}'
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50 resize-y" />

        {result && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 max-h-[300px] overflow-auto">
            <textarea aria-label="Result" readOnly value={result} rows={10}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs resize-none" />
            <button aria-label="Copy schema" onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="mt-2 p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"><Copy size={14} /></button>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
