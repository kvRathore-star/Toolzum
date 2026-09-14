"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function KeywordDensityChecker() {
  const [text, setText] = useState('');
  const [keyword, setKeyword] = useState('');
  const [density, setDensity] = useState<{ count: number; total: number; percentage: number } | null>(null);

  const check = () => {
    const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean);
    const kwWords = keyword.toLowerCase().split(/\s+/).filter(Boolean);
    // Sliding-window phrase match: the old single-word compare made any
    // multi-word keyword (e.g. 'coffee maker') score 0% forever.
    let count = 0;
    if (kwWords.length > 0) {
      for (let i = 0; i <= words.length - kwWords.length; i++) {
        if (kwWords.every((w, j) => words[i + j] === w)) count++;
      }
    }
    const total = words.length;
    setDensity({ count, total, percentage: total > 0 ? (count / total) * 100 : 0 });
  };

  const presets = [
    { label: 'SEO Article', apply: () => { setText('The best SEO tools help you optimize your website for search engines. SEO tools analyze your content and provide recommendations. Good SEO requires quality content and technical optimization.'); setKeyword('SEO'); } },
    { label: 'Product Description', apply: () => { setText('Our premium coffee maker brews the perfect cup every time. This coffee maker features programmable settings, a thermal carafe, and a built-in grinder. The coffee maker is easy to clean and maintain.'); setKeyword('coffee maker'); } },
    { label: 'Clear', apply: () => { setText(''); setKeyword(''); setDensity(null); } },
  ];

  const resultText = density
    ? `"${keyword}" appears ${density.count}/${density.total} times (${density.percentage.toFixed(2)}%)`
    : 'Enter text and keyword to check density';

  const getDensityGrade = (pct: number) => {
    if (pct < 0.5) return { label: 'Too Low', color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10' };
    if (pct <= 2.5) return { label: 'Optimal', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500/10' };
    if (pct <= 4) return { label: 'High', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10' };
    return { label: 'Keyword Stuffing Risk', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-500/10' };
  };

  const grade = density ? getDensityGrade(density.percentage) : null;

  return (
    <CalculatorShell category="SEO" title="Keyword Density Checker" result={resultText} onCalculate={check} calculateLabel="Check" presets={presets} accent="amber" downloadData={density ? JSON.stringify({ keyword, text, ...density }, null, 2) : ''} downloadFilename="keyword-density.json">
      <div className="space-y-4">
        <div className="space-y-3">
          <label htmlFor="lbl-keyworddensitychecker-text" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
          <textarea id="lbl-keyworddensitychecker-text" aria-label="Text" value={text} onChange={e => setText(e.target.value)} rows={6} placeholder="Paste your content here..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50 resize-y" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="lbl-keyworddensitychecker-keyword" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Keyword</label>
            <input id="lbl-keyworddensitychecker-keyword" aria-label="Keyword" type="text" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="Enter keyword to check..."
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50" />
          </div>
        </div>

        {density && (
          <div aria-live="polite" className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-[var(--bg-surface)] rounded-xl text-center border border-zinc-200 dark:border-zinc-700">
                <p className="text-3xl font-extrabold text-amber-500">{density.count}</p>
                <p className="text-xs text-[var(--text-muted)]">Occurrences</p>
              </div>
              <div className="p-3 bg-[var(--bg-surface)] rounded-xl text-center border border-zinc-200 dark:border-zinc-700">
                <p className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">{density.total}</p>
                <p className="text-xs text-[var(--text-muted)]">Total Words</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl ${grade?.bg} border border-amber-500/20`}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-[var(--text-secondary)]">Density</span>
                <span className="text-3xl font-extrabold text-amber-500">{density.percentage.toFixed(2)}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div style={{ width: `${Math.min(density.percentage * 20, 100)}%` }} className="bg-amber-500 h-full rounded-full" />
              </div>
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>0%</span>
                <span>0.5%</span>
                <span>2.5%</span>
                <span>4%+</span>
              </div>
            </div>

            {grade && (
              <div className={`px-4 py-2 rounded-lg ${grade.bg} border border-amber-500/30`}>
                <span className={`font-medium ${grade.color}`}>{grade.label}</span>
                <span className="text-xs text-[var(--text-muted)] ml-2">({density.percentage.toFixed(2)}%)</span>
              </div>
            )}
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
