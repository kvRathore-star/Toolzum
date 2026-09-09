"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function TextDiffChecker() {
  const [text1, setText1] = useState('The quick brown fox\njumps over the lazy dog');
  const [text2, setText2] = useState('The quick brown fox\njumps over the sleepy cat');
  const [diff, setDiff] = useState<{ lines: { text: string; type: 'same' | 'added' | 'removed' }[] } | null>(null);

  const compare = () => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const maxLen = Math.max(lines1.length, lines2.length);
    const lines: { text: string; type: 'same' | 'added' | 'removed' }[] = [];
    for (let i = 0; i < maxLen; i++) {
      if (i >= lines1.length) lines.push({ text: lines2[i]!, type: 'added' });
      else if (i >= lines2.length) lines.push({ text: lines1[i]!, type: 'removed' });
      else if (lines1[i] === lines2[i]) lines.push({ text: lines1[i]!, type: 'same' });
      else { lines.push({ text: lines1[i]!, type: 'removed' }); lines.push({ text: lines2[i]!, type: 'added' }); }
    }
    setDiff({ lines });
  };

  const added = diff ? diff.lines.filter(l => l.type === 'added').length : 0;
  const removed = diff ? diff.lines.filter(l => l.type === 'removed').length : 0;
  const same = diff ? diff.lines.filter(l => l.type === 'same').length : 0;

  const presets = [
    { label: 'Code Change', apply: () => { setText1('function add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(1, 2));'); setText2('function add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(1, 2));\nconsole.log(add(3, 4));'); } },
    { label: 'Config Diff', apply: () => { setText1('DEBUG=true\nPORT=3000\nHOST=localhost'); setText2('DEBUG=false\nPORT=8080\nHOST=0.0.0.0\nLOG_LEVEL=info'); } },
    { label: 'Clear', apply: () => { setText1(''); setText2(''); setDiff(null); } },
  ];

  const resultText = diff
    ? `${added} added, ${removed} removed, ${same} unchanged`
    : 'Enter two texts to compare';

  return (
    <CalculatorShell category="SEO" title="Text Diff Checker" result={resultText} onCalculate={compare} calculateLabel="Check" presets={presets} accent="violet" downloadData={diff ? JSON.stringify({ text1, text2, diff: diff.lines }, null, 2) : ''} downloadFilename="diff.json">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Original Text</label>
          <textarea aria-label="Original Text" value={text1} onChange={e => { setText1(e.target.value); setDiff(null); }} rows={6} placeholder="Original text..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50 resize-y" />
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">New Text</label>
          <textarea aria-label="New Text" value={text2} onChange={e => { setText2(e.target.value); setDiff(null); }} rows={6} placeholder="New text..."
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50 resize-y" />
        </div>

        {diff && (
          <div className="space-y-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full font-medium">+{added} added</span>
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full font-medium">-{removed} removed</span>
              <span className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-full font-medium">{same} same</span>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 max-h-[400px] overflow-y-auto font-mono text-xs space-y-0.5">
              {diff.lines.map((l, i) => (
                <div key={i} className={`p-1.5 rounded ${l.type === 'same' ? 'bg-transparent' : l.type === 'added' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300'}`}>
                  <span className="mr-2 font-bold text-[var(--text-muted)]">
                    {l.type === 'added' ? '+' : l.type === 'removed' ? '-' : ' '}
                  </span>
                  <span>{l.text || '\u00A0'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
