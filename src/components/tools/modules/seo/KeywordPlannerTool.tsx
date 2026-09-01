"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

const STOP_WORDS = new Set(['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','shall','can','need','dare','ought','used','to','of','in','for','on','with','at','by','from','as','into','through','during','before','after','above','below','between','out','off','over','under','again','further','then','once','here','there','when','where','why','how','all','each','every','both','few','more','most','other','some','such','no','nor','not','only','own','same','so','than','too','very','just','because','but','and','or','if','while','that','this','these','those','it','its','also']);

export default function KeywordPlannerTool() {
  const [text, setText] = useState('');
  const [keywords, setKeywords] = useState<{ word: string; count: number; density: number }[]>([]);
  const [minLength, setMinLength] = useState(3);

  const extract = () => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const freq: Record<string, number> = {};
    words.forEach(w => { if (w.length >= minLength && !STOP_WORDS.has(w)) freq[w] = (freq[w] || 0) + 1; });
    const total = words.length;
    setKeywords(Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 50).map(([word, count]) => ({ word, count, density: (count / total) * 100 })));
  };

  const presets = [
    { label: 'Blog Post', apply: () => setText('Writing effective blog posts requires understanding your audience and their search intent. Content marketing strategies should focus on providing value through educational content that solves real problems. SEO optimization helps your content rank higher in search results.') },
    { label: 'Product Page', apply: () => setText('Our premium wireless headphones feature active noise cancellation, 30-hour battery life, and premium comfort. The headphones are perfect for travel, work, and music lovers. Shop now for the best audio experience with free shipping.') },
    { label: 'Clear', apply: () => { setText(''); setKeywords([]); } },
  ];

  const resultText = keywords.length > 0
    ? `Extracted ${keywords.length} keywords from ${text.split(/\s+/).filter(Boolean).length} words (min length: ${minLength})`
    : 'Enter text to extract keywords';

  const totalWords = text.trim() ? text.split(/\s+/).length : 0;

  return (
    <CalculatorShell category="SEO" title="Keyword Planner Tool" result={resultText} onCalculate={extract} presets={presets} accent="indigo" downloadData={keywords.length > 0 ? JSON.stringify({ totalWords, keywords }, null, 2) : ''} downloadFilename="keywords.json">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text Content</label>
          <textarea value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Paste your content here..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50 resize-y" />
        </div>
        <div className="flex gap-2 flex-wrap items-end">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Min Word Length</label>
            <input type="number" min={2} max={10} value={String(minLength)} onChange={e => setMinLength(Number(e.target.value))}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50" />
          </div>
        </div>

        {keywords.length > 0 && (
          <div aria-live="polite" className="bg-[var(--bg-surface)] rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
            <div className="max-h-[400px] overflow-y-auto space-y-1">
              {keywords.map((k, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-overlay)] rounded-lg text-sm">
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-muted)] w-5">{i + 1}</span>
                    <span className="font-medium">{k.word}</span>
                  </span>
                  <span className="font-mono text-xs text-[var(--text-muted)]">{k.count} ({k.density.toFixed(2)}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
