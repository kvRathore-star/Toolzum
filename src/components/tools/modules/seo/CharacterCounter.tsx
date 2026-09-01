"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function CharacterCounter() {
  const [text, setText] = useState('');
  const total = text.length;
  const noSpace = text.replace(/\s/g, '').length;
  const letters = (text.match(/[a-zA-Z]/g) || []).length;
  const digits = (text.match(/[0-9]/g) || []).length;
  const spaces = (text.match(/\s/g) || []).length;
  const punctuation = (text.match(/[^\w\s]/g) || []).length;
  const uppercase = (text.match(/[A-Z]/g) || []).length;
  const lowercase = (text.match(/[a-z]/g) || []).length;

  const presets = [
    { label: 'Lorem Ipsum', apply: () => setText('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.') },
    { label: 'Code Sample', apply: () => setText('function hello() {\n  console.log("Hello, World!");\n  return 42;\n}') },
    { label: 'Email', apply: () => setText('user.name+tag@example-domain.com') },
    { label: 'Clear', apply: () => setText('') },
  ];

  const resultText = total > 0
    ? `${total} chars (${noSpace} no space), ${letters} letters, ${digits} digits, ${spaces} spaces, ${punctuation} punct`
    : 'No text entered';

  const stats = [
    { label: 'Total', value: total, color: 'text-zinc-600 dark:text-zinc-400' },
    { label: 'No Spaces', value: noSpace, color: 'text-emerald-500' },
    { label: 'Letters', value: letters, color: 'text-blue-700 dark:text-blue-400', sub: `↑${uppercase} ↓${lowercase}` },
    { label: 'Digits', value: digits, color: 'text-amber-500' },
    { label: 'Spaces', value: spaces, color: 'text-cyan-500' },
    { label: 'Punctuation', value: punctuation, color: 'text-rose-500' },
  ];

  return (
    <CalculatorShell category="SEO" title="Character Counter" result={resultText} auto={true} calculateLabel="Count" presets={presets} accent="sky" downloadData={JSON.stringify({ total, noSpace, letters, uppercase, lowercase, digits, spaces, punctuation }, null, 2)} downloadFilename="char-count.json">
      <div className="space-y-4">
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label>
        <textarea value={text} onChange={e => setText(e.target.value)} rows={10} placeholder="Type or paste text..."
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-sky-500/50 resize-y" />

        {text && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="p-3 bg-[var(--bg-surface)] rounded-xl text-center border border-zinc-200 dark:border-zinc-700">
                <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                {s.sub && <p className="text-[10px] text-[var(--text-muted)]">{s.sub}</p>}
              </div>
            ))}
          </div>
        )}

        {total > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Composition</div>
            <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden flex">
              {letters > 0 && <div style={{ width: `${(letters / total) * 100}%` }} className="bg-blue-500 h-full" title="Letters" />}
              {digits > 0 && <div style={{ width: `${(digits / total) * 100}%` }} className="bg-amber-500 h-full" title="Digits" />}
              {spaces > 0 && <div style={{ width: `${(spaces / total) * 100}%` }} className="bg-cyan-500 h-full" title="Spaces" />}
              {punctuation > 0 && <div style={{ width: `${(punctuation / total) * 100}%` }} className="bg-rose-500 h-full" title="Punctuation" />}
            </div>
            <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
              <span>Letters: {letters}</span>
              <span>Digits: {digits}</span>
              <span>Spaces: {spaces}</span>
              <span>Punct: {punctuation}</span>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
