"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { labelClass, ADJECTIVES, NOUNS, randInt, randItem } from './GeneratorsShared';

const NICKNAME_PARTS = ['Star', 'Shadow', 'Light', 'Blaze', 'Storm', 'Frost', 'Crystal', 'Thunder', 'Dark', 'Wild', 'Fire', 'Ice', 'Iron', 'Steel', 'Silver', 'Gold', 'Mystic', 'Phantom', 'Neon', 'Cyber'];
const NICKNAME_PATTERNS = [
  { name: 'Adjective+Part+Num', get: () => randItem(ADJECTIVES).toLowerCase() + randItem(NICKNAME_PARTS).toLowerCase() + randInt(1, 99) },
  { name: 'Color+Animal', get: () => randItem(['Red', 'Blue', 'Dark', 'Gold', 'Silver', 'Neon', 'Ice', 'Fire']) + randItem(['Wolf', 'Fox', 'Bear', 'Hawk', 'Lion', 'Viper', 'Puma', 'Elk']) },
  { name: 'Random Word', get: () => randItem(NICKNAME_PARTS) + randItem(ADJECTIVES) + randInt(10, 999) },
  { name: 'Gamer Tag', get: () => 'xX' + randItem(ADJECTIVES) + randItem(NOUNS) + randInt(1, 99) + 'Xx' },
];
export default function NicknameGenerator() {
  const [patternIdx, setPatternIdx] = useState(0);
  const [count, setCount] = useState(10);
  const [results, setResults] = useState<string[]>([]);
  const generate = () => { const n: string[] = []; for (let i = 0; i < count; i++) n.push(NICKNAME_PATTERNS[patternIdx].get()); setResults(n); };

  const presets = [
    { label: 'Gamer', apply: () => { setPatternIdx(0); setCount(10); generate(); } },
    { label: 'Fantasy', apply: () => { setPatternIdx(1); setCount(10); generate(); } },
    { label: 'Sci-Fi', apply: () => { setPatternIdx(2); setCount(10); generate(); } },
    { label: 'Cute', apply: () => { setPatternIdx(3); setCount(10); generate(); } },
    { label: 'Professional', apply: () => { setPatternIdx(4); setCount(10); generate(); } },
  ];

  const resultText = results.length > 0 ? 'Generated ' + results.length + ' nicknames (' + NICKNAME_PATTERNS[patternIdx].name + ')' : 'Select pattern and generate';

  return (
    <CalculatorShell category="Utility" title="Nickname Generator" result={resultText} onCalculate={generate} calculateLabel="Generate" presets={presets} accent="pink" downloadData={results.join('\n')} downloadFilename="nicknames.txt">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Pattern</label>
          <select value={patternIdx} onChange={e => setPatternIdx(Number(e.target.value))}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-pink-500/50">
            {NICKNAME_PATTERNS.map((p, i) => (<option key={i} value={i}>{p.name}</option>))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Count</label>
          <input type="number" min={1} max={100} value={String(count)} onChange={e => setCount(Number(e.target.value))}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-pink-500/50" />
        </div>

        {results.length > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 flex flex-col min-h-[160px]">
            <div className="space-y-1 max-h-[250px] overflow-y-auto">
              {results.map((n, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm">
                  <span>{n}</span>
                  <button onClick={() => { clipboardWrite(n); toast.success('Copied!'); }} className="text-xs text-[var(--accent)] hover:underline"><Copy size={12} /></button>
                </div>
              ))}
            </div>
            <button onClick={() => { clipboardWrite(results.join('\n')); toast.success('Copied all!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-2">Copy All</button>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
