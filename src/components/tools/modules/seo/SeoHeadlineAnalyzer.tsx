"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

const POWER_WORDS = ['amazing','essential','exclusive','guaranteed','instant','powerful','proven','simple','ultimate','urgent','free','new','secret','hidden','shocking','remarkable','complete','easy','fast','best'];

export default function SeoHeadlineAnalyzer() {
  const [headline, setHeadline] = useState('10 Amazing SEO Tips for Better Rankings');
  const [analysis, setAnalysis] = useState<{ wordCount: number; charCount: number; powerWords: string[]; sentiment: string; score: number } | null>(null);
  const analyze = () => {
    const words = headline.split(/\s+/).filter(Boolean); const found = words.filter(w => POWER_WORDS.includes(w.toLowerCase()));
    const wordCount = words.length; const charCount = headline.length;
    const positive = ['amazing','best','free','new','easy','fast','proven','simple','ultimate','essential'];
    const negative = ['worst','bad','terrible','awful','hate'];
    const posCount = words.filter(w => positive.includes(w.toLowerCase())).length;
    const negCount = words.filter(w => negative.includes(w.toLowerCase())).length;
    const sentiment = posCount > negCount ? 'Positive' : negCount > posCount ? 'Negative' : 'Neutral';
    const score = Math.min(100, Math.max(0, Math.round(wordCount * 5 + found.length * 10 - Math.abs(charCount - 60) * 0.5)));
    setAnalysis({ wordCount, charCount, powerWords: found, sentiment, score });
  };

  const presets = [
    { label: 'Strong', apply: () => { setHeadline('10 Amazing SEO Tips for Better Rankings'); analyze(); } },
    { label: 'Weak', apply: () => { setHeadline('SEO tips'); analyze(); } },
    { label: 'Clickbait', apply: () => { setHeadline('You Won\'t Believe This Amazing Secret Trick'); analyze(); } },
    { label: 'Clear', apply: () => { setHeadline(''); setAnalysis(null); } },
  ];

  const resultText = analysis ? `Score: ${analysis.score}/100 (${analysis.sentiment})` : 'Enter headline to analyze';

  return (
    <CalculatorShell category="SEO" title="SEO Headline Analyzer" result={resultText} onCalculate={analyze} calculateLabel="Analyze" presets={presets} accent="rose" downloadData={analysis ? JSON.stringify({ headline, ...analysis }, null, 2) : ''} downloadFilename="headline-analysis.json">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Headline</label>
        <input type="text" value={headline} onChange={e => setHeadline(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-rose-500/50" />

        {analysis && (
          <div aria-live="polite" className="space-y-3">
            <div className={`p-4 rounded-xl text-center ${analysis.score >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/20' : analysis.score >= 40 ? 'bg-amber-50 dark:bg-amber-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
              <span className="text-xs text-[var(--text-muted)]">SEO Score</span>
              <p className={`text-4xl font-extrabold ${analysis.score >= 70 ? 'text-emerald-500' : analysis.score >= 40 ? 'text-amber-500' : 'text-red-500'}`}>{analysis.score}/100</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-[var(--bg-surface)] rounded-lg"><span className="text-[var(--text-muted)]">Words</span><p className="font-bold">{analysis.wordCount}</p></div>
              <div className="p-2 bg-[var(--bg-surface)] rounded-lg"><span className="text-[var(--text-muted)]">Chars</span><p className="font-bold">{analysis.charCount}</p></div>
              <div className="p-2 bg-[var(--bg-surface)] rounded-lg"><span className="text-[var(--text-muted)]">Sentiment</span><p className="font-bold">{analysis.sentiment}</p></div>
              <div className="p-2 bg-[var(--bg-surface)] rounded-lg"><span className="text-[var(--text-muted)]">Power Words</span><p className="font-bold">{analysis.powerWords.length}</p></div>
            </div>
            {analysis.powerWords.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {analysis.powerWords.map((w, i) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded text-xs font-medium">{w}</span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
