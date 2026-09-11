"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function WordFrequencyCounter() {
  const [text, setText] = useState('');
  const [limit, setLimit] = useState(20);
  const [frequencies, setFrequencies] = useState<{ word: string; count: number; pct: number }[]>([]);

  const analyze = () => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const freq: Record<string, number> = {};
    words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });
    const total = words.length;
    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([word, count]) => ({ word, count, pct: (count / total) * 100 }));
    setFrequencies(sorted);
  };

  const maxCount = frequencies.length > 0 ? frequencies[0]!.count : 1;
  const totalWords = frequencies.reduce((sum, f) => sum + f.count, 0);

  const presets = [
    { label: 'Lorem Ipsum', apply: () => { setText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'); } },
    { label: 'Repeated Words', apply: () => { setText('the quick brown fox jumps over the lazy dog the quick brown fox jumps over the lazy dog the quick brown fox'); } },
    { label: 'Clear', apply: () => { setText(''); setFrequencies([]); } },
  ];

  const resultText = frequencies.length > 0
    ? `Top ${frequencies.length} words from ${totalWords} total words`
    : 'Enter text and analyze';

  return (
    <CalculatorShell category="SEO" title="Word Frequency Counter" result={resultText} onCalculate={analyze} calculateLabel="Count" presets={presets} accent="indigo" downloadData={frequencies.length > 0 ? JSON.stringify({ totalWords, topWords: frequencies }, null, 2) : ''} downloadFilename="word-frequency.json">
      <div className="space-y-4">
        <div>
          <label htmlFor="lbl-wordfrequencycounter-text" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
          <textarea id="lbl-wordfrequencycounter-text" aria-label="Text" value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Paste text to analyze..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50 resize-y" />
        </div>
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label htmlFor="lbl-wordfrequencycounter-show-top" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Show Top</label>
            <input id="lbl-wordfrequencycounter-show-top" aria-label="Show Top" type="number" min={5} max={100} value={String(limit)} onChange={v => setLimit(Number(v.target.value))}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-indigo-500/50" />
          </div>
        </div>

        {frequencies.length > 0 && (
          <div aria-live="polite" className="bg-[var(--bg-surface)] rounded-xl border border-zinc-200 dark:border-zinc-700 p-4">
            <div className="max-h-[400px] overflow-y-auto space-y-1.5">
              {frequencies.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-2 bg-[var(--bg-overlay)] rounded-lg text-sm">
                  <span className="w-6 text-xs text-[var(--text-muted)] font-bold">{i + 1}</span>
                  <span className="flex-1 font-medium">{f.word}</span>
                  <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                    <div style={{ width: `${(f.count / maxCount) * 100}%` }} className="bg-emerald-700 h-full rounded-full" />
                  </div>
                  <span className="w-20 text-right font-mono text-xs text-[var(--text-muted)]">{f.count} ({f.pct.toFixed(1)}%)</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-[var(--text-muted)] mt-2">
              Showing {frequencies.length} of {Object.keys(frequencies.reduce((acc: Record<string, number>, f) => { acc[f.word] = f.count; return acc; }, {})).length} unique words
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
