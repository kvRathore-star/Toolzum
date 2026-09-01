"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function FractionToDecimalCalculator() {
  const clr = ac('FractionToDecimalCalculator');
  const [num, setNum] = useState('3');
  const [den, setDen] = useState('4');
  const n = Number(num), d = Number(den);
  const decimal = d ? n / d : NaN;
  const percent = d ? (n / d * 100).toFixed(2) : '—';

  const presets = [
    { label: '1/2', apply: () => { setNum('1'); setDen('2'); } },
    { label: '3/4', apply: () => { setNum('3'); setDen('4'); } },
    { label: '5/8', apply: () => { setNum('5'); setDen('8'); } },
    { label: '22/7', apply: () => { setNum('22'); setDen('7'); } },
  ];

  const resultText = d ? `${n}/${d} = ${decimal.toFixed(6)} (${percent}%)` : 'Enter denominator';

  return (
    <CalculatorShell category="Math" title="Fraction to Decimal" result={resultText} auto presets={presets} accent="blue" downloadData={d ? `Fraction,Decimal,Percent\n${n}/${d},${decimal.toFixed(6)},${percent}` : ''} downloadFilename="fraction-decimal.csv">
      <div className="space-y-4">
        <div className="flex gap-2 items-center">
          <div className="flex-1">
            <label className={labelClass}>Numerator</label>
            <input type="number" value={num} onChange={e => setNum(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <span className="text-xl font-bold">/</span>
          <div className="flex-1">
            <label className={labelClass}>Denominator</label>
            <input type="number" value={den} onChange={e => setDen(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>

        {d && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Decimal Value</div>
            <div className="text-3xl font-bold text-blue-700 dark:text-blue-300 font-mono">${decimal.toFixed(6)}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">${percent}%</div>
          </div>
        )}

        {d && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Equivalent Fractions</div>
            <div className="flex flex-wrap gap-2">
              {[
                Math.round(n * 2) + '/' + Math.round(d * 2),
                Math.round(n * 3) + '/' + Math.round(d * 3),
                Math.round(n * 4) + '/' + Math.round(d * 4),
                Math.round(n * 5) + '/' + Math.round(d * 5),
              ].map(f => (
                <span key={f} className="px-2 py-1 bg-[var(--bg-overlay)] rounded-lg text-sm font-mono">${f}</span>
              ))}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
