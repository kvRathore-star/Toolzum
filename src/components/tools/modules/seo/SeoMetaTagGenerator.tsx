"use client";
import { useState } from 'react';
import { Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function SeoMetaTagGenerator() {
  const [title, setTitle] = useState('My Amazing Page Title');
  const [description, setDescription] = useState('This is a compelling meta description for search engines and social media platforms.');
  const [keywords, setKeywords] = useState('toolzum, online tools, free tools');
  const [result, setResult] = useState('');

  const generate = () => {
    setResult(`<title>${title}</title>\n<meta name="description" content="${description}" />\n<meta name="keywords" content="${keywords}" />\n<meta property="og:title" content="${title}" />\n<meta property="og:description" content="${description}" />\n<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${title}" />\n<meta name="twitter:description" content="${description}" />`);
  };

  const presets = [
    { label: 'Blog Post', apply: () => { setTitle('How to Build Amazing Web Apps'); setDescription('Learn the secrets of building modern web applications with the latest technologies and best practices.'); setKeywords('web development, programming, tutorial'); } },
    { label: 'Product Page', apply: () => { setTitle('Premium Widget Pro - Best Quality Widget'); setDescription('The ultimate widget for professionals. Durable, efficient, and affordable.'); setKeywords('widget, premium, professional, tools'); } },
    { label: 'Landing Page', apply: () => { setTitle('Welcome to Toolzum - Free Online Tools'); setDescription('Discover 1000+ free online tools for developers, designers, and everyday tasks. No sign-up required.'); setKeywords('free tools, online tools, developer tools'); } },
    { label: 'Clear', apply: () => { setResult(''); } },
  ];

  const resultText = result ? 'Meta tags generated successfully' : 'Enter details to generate meta tags';

  const customResult = result ? (
    <div className="flex flex-col">
      <label htmlFor="lbl-seometataggenerator-generated-meta-tags" className="block text-sm font-medium text-[var(--text-secondary)] mb-2">Generated Meta Tags</label>
      <textarea id="lbl-seometataggenerator-generated-meta-tags" aria-label="Generated Meta Tags" readOnly value={result} rows={10}
        className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] font-mono text-xs resize-none" />
      <div className="flex items-center gap-3 mt-2">
        <button aria-label="Copy meta tags" onClick={() => { clipboardWrite(result).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"><Copy size={14} /></button>
        <button aria-label="Download meta tags" onClick={() => { const blob = new Blob([result], { type: 'text/html' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'meta-tags.html'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"><Download size={14} /></button>
      </div>
    </div>
  ) : undefined;

  return (
    <CalculatorShell category="SEO" title="SEO Meta Tag Generator" result={resultText} customResult={customResult} onCalculate={generate} calculateLabel="Generate" presets={presets} accent="blue" downloadData={result} downloadFilename="meta-tags.html">
      <div className="space-y-4">
        <div>
          <label htmlFor="lbl-seometataggenerator-title-60" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Title (<span id="title-len">{title.length}</span>/60)</label>
          <input id="lbl-seometataggenerator-title-60" aria-label="Title (max 60 characters)" type="text" value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50" />
        </div>
        <div>
          <label htmlFor="lbl-seometataggenerator-description-160" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Description (<span id="desc-len">{description.length}</span>/160)</label>
          <textarea id="lbl-seometataggenerator-description-160" aria-label="Description (max 160 characters)" value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Compelling description for search engines and social media..."
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50 resize-y" />
        </div>
        <div>
          <label htmlFor="lbl-seometataggenerator-keywords" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Keywords</label>
          <input id="lbl-seometataggenerator-keywords" aria-label="Keywords" type="text" value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="toolzum, online tools, free tools"
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50" />
        </div>
      </div>
    </CalculatorShell>
  );
}
