"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';

export default function UtmBuilder() {
  const [baseUrl, setBaseUrl] = useState('https://example.com');
  const [source, setSource] = useState('newsletter');
  const [medium, setMedium] = useState('email');
  const [campaign, setCampaign] = useState('spring_sale');
  const [term, setTerm] = useState('');
  const [content, setContent] = useState('');
  const [result, setResult] = useState('');

  const build = () => {
    try {
      new URL(baseUrl);
    } catch { return; }
    const u = new URL(baseUrl);
    u.searchParams.set('utm_source', source);
    u.searchParams.set('utm_medium', medium);
    u.searchParams.set('utm_campaign', campaign);
    if (term) u.searchParams.set('utm_term', term);
    if (content) u.searchParams.set('utm_content', content);
    setResult(u.toString());
  };

  const presets = [
    { label: 'Email Campaign', apply: () => { setSource('newsletter'); setMedium('email'); setCampaign('weekly_digest'); } },
    { label: 'Social Media', apply: () => { setSource('facebook'); setMedium('social'); setCampaign('product_launch'); } },
    { label: 'Paid Search', apply: () => { setSource('google'); setMedium('cpc'); setCampaign('brand_terms'); setTerm('running shoes'); } },
    { label: 'Referral', apply: () => { setSource('partner_site'); setMedium('referral'); setCampaign('affiliate'); } },
    { label: 'Clear', apply: () => { setResult(''); } },
  ];

  const resultText = result ? `UTM URL built (${new URL(result).searchParams.toString()})` : 'Fill fields to build a UTM-tagged URL';

  const params = [
    { key: 'utm_source', label: 'Source', value: source, required: true, desc: 'Where traffic comes from' },
    { key: 'utm_medium', label: 'Medium', value: medium, required: true, desc: 'Marketing medium' },
    { key: 'utm_campaign', label: 'Campaign', value: campaign, required: true, desc: 'Specific campaign name' },
    { key: 'utm_term', label: 'Term', value: term, required: false, desc: 'Paid search keywords' },
    { key: 'utm_content', label: 'Content', value: content, required: false, desc: 'A/B test variant' },
  ];

  return (
    <CalculatorShell category="SEO" title="UTM Builder" result={resultText} onCalculate={build} presets={presets} accent="cyan" downloadData={result} downloadFilename="utm-url.txt">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Base URL</label>
        <input type="url" value={baseUrl} onChange={e => setBaseUrl(e.target.value)} placeholder="https://example.com/page"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-cyan-500/50" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {params.map(p => (
            <div key={p.key} className={p.required ? 'ring-1 ring-cyan-500/20' : ''}>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5 flex items-center gap-1">
                {p.label}
                {!p.required && <span className="text-xs text-[var(--text-muted)]">(optional)</span>}
              </label>
              <input type="text" value={p.value} onChange={e => {
                if (p.key === 'utm_source') setSource(e.target.value);
                else if (p.key === 'utm_medium') setMedium(e.target.value);
                else if (p.key === 'utm_campaign') setCampaign(e.target.value);
                else if (p.key === 'utm_term') setTerm(e.target.value);
                else if (p.key === 'utm_content') setContent(e.target.value);
              }} placeholder={p.desc}
                className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-cyan-500/50" />
            </div>
          ))}
        </div>

        {result && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Result</label>
            <div className="flex gap-2">
              <input readOnly value={result} className="flex-1 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100" />
              <button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition-colors shrink-0">Copy</button>
            </div>
            <div className="text-xs text-[var(--text-muted)]">
              <strong>Params:</strong> {new URL(result).searchParams.toString()}
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
          <div className="text-xs text-[var(--text-secondary)] mb-2">UTM Parameter Guide</div>
          <div className="grid grid-cols-2 gap-1 text-xs text-[var(--text-muted)]">
            <div><span className="font-mono text-cyan-600 dark:text-cyan-400">utm_source</span> — Traffic source (google, newsletter, facebook)</div>
            <div><span className="font-mono text-cyan-600 dark:text-cyan-400">utm_medium</span> — Medium (email, cpc, social, referral)</div>
            <div><span className="font-mono text-cyan-600 dark:text-cyan-400">utm_campaign</span> — Campaign name (spring_sale, product_launch)</div>
            <div><span className="font-mono text-cyan-600 dark:text-cyan-400">utm_term</span> — Search keywords (paid search)</div>
            <div><span className="font-mono text-cyan-600 dark:text-cyan-400">utm_content</span> — Ad/content variant (A/B testing)</div>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
