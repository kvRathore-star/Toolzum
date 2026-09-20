"use client";
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { CalculatorShell } from '../shared/CalculatorShell';
import { Input, ADJECTIVES, NOUNS, randInt, randItem } from './GeneratorsShared';

export default function RandomUsernameGenerator() {
  const [pattern, setPattern] = useState('adj-noun'); const [includeNum, setIncludeNum] = useState(false); const [count, setCount] = useState(5); const [results, setResults] = useState<string[]>([]);
  const generate = () => { const usernames: string[] = []; for (let i = 0; i < count; i++) { let u = ''; switch (pattern) { case 'adj-noun': u = randItem(ADJECTIVES) + randItem(NOUNS); break; case 'noun-num': u = randItem(NOUNS) + randInt(10, 999); break; case 'adj-noun-num': u = randItem(ADJECTIVES) + randItem(NOUNS) + randInt(10, 999); break; case 'word-word': u = (randItem(ADJECTIVES) + randItem(NOUNS)).toLowerCase(); break; } if (includeNum) u += randInt(10, 999); usernames.push(u); } setResults(usernames); };

  const presets = [
    { label: 'Adjective + Noun', apply: () => { setPattern('adj-noun'); generate(); } },
    { label: 'Noun + Number', apply: () => { setPattern('noun-num'); generate(); } },
    { label: 'Adjective + Noun + Number', apply: () => { setPattern('adj-noun-num'); generate(); } },
    { label: 'word-word (lowercase)', apply: () => { setPattern('word-word'); generate(); } },
    { label: 'Clear', apply: () => { setResults([]); } },
  ];

  const resultText = results.length > 0 ? 'Generated ' + results.length + ' usernames (' + pattern + ')' : 'Configure and generate';

  const customResult = results.length > 0 ? (
    <div className="flex flex-col min-h-[160px]">
      <div className="space-y-1 max-h-[300px] overflow-y-auto">
        {results.map((u, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm">
            <span className="font-mono">{u}</span>
            <button aria-label={`Copy username ${u}`} onClick={() => { clipboardWrite(u).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="text-xs text-[var(--accent)] hover:underline"><Copy size={12} /></button>
          </div>
        ))}
        <button onClick={() => { clipboardWrite(results.join('\n')).then(ok => { if (ok) toast.success('Copied all!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-2">Copy All</button>
      </div>
    </div>
  ) : undefined;

  return (
    <CalculatorShell category="Utility"
      title="Random Username Generator"
      result={resultText}
      customResult={customResult}
      onCalculate={generate}
      calculateLabel="Generate"
      presets={presets}
      accent="indigo"
      downloadData={JSON.stringify({ pattern, includeNum, count, usernames: results }, null, 2)}
      downloadFilename="usernames.json"
    >
      <div className="space-y-4">
        <div className="mb-3">
          <label htmlFor="lbl-randomusernamegenerator-pattern" className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Pattern</label>
          <select id="lbl-randomusernamegenerator-pattern" aria-label="Pattern" value={pattern} onChange={e => setPattern(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-sm text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-[var(--accent)]/50"><option value="adj-noun">Adjective + Noun</option><option value="noun-num">Noun + Number</option><option value="adj-noun-num">Adjective + Noun + Number</option><option value="word-word">word-word (lowercase)</option></select>
        </div>
        <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
        <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={includeNum} onChange={e => setIncludeNum(e.target.checked)} className="accent-[var(--accent)]" />Append random number</label>
      </div>
    </CalculatorShell>
  );
}
