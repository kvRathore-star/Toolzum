"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function GreatestCommonFactorCalculator() {
  const clr = ac('GreatestCommonFactorCalculator');
  const [a, setA] = useState('12');
  const [b, setB] = useState('18');
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const na = Number(a), nb = Number(b);
  const result = gcd(na, nb);

  const presets = [
    { label: '12 & 18', apply: () => { setA('12'); setB('18'); } },
    { label: '24 & 36', apply: () => { setA('24'); setB('36'); } },
    { label: '48 & 180', apply: () => { setA('48'); setB('180'); } },
    { label: '100 & 75', apply: () => { setA('100'); setB('75'); } },
    { label: '81 & 153', apply: () => { setA('81'); setB('153'); } },
  ];

  const resultText = `GCF(${na}, ${nb}) = ${result}`;

  const steps = (() => {
    const s: string[] = [];
    let x = na, y = nb;
    while (y) {
      const q = Math.floor(x / y);
      const r = x % y;
      s.push(`${x} = ${y} × ${q} + ${r}`);
      [x, y] = [y, r];
    }
    return s;
  })();

  return (
    <CalculatorShell category="Math" title="GCF / GCD Calculator" result={resultText} auto presets={presets} accent="blue" downloadData={`Number1,Number2,GCF,LCM,AreCoprime\n${a},${b},${result},${na && nb ? (na * nb / result) : ''},${result === 1 ? 'Yes' : 'No'}`} downloadFilename="gcf-calculation.csv">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <label htmlFor="lbl-greatestcommonfactorcalculator-first-number" className={labelClass}>First number</label>
            <input id="lbl-greatestcommonfactorcalculator-first-number" aria-label="First number" type="number" min={0} value={a} onChange={e => setA(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <div className="flex-1">
            <label htmlFor="lbl-greatestcommonfactorcalculator-second-number" className={labelClass}>Second number</label>
            <input id="lbl-greatestcommonfactorcalculator-second-number" aria-label="Second number" type="number" min={0} value={b} onChange={e => setB(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>

        {na > 0 && nb > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Greatest Common Factor</div>
            <div className="text-4xl font-bold text-blue-700 dark:text-blue-300">{result}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Largest integer dividing both numbers</div>
          </div>
        )}

        {na > 0 && nb > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Euclidean Algorithm Steps</div>
            <div className="font-mono text-sm space-y-1 text-[var(--text-primary)]">
              {steps.map((step, i) => (
                <div key={i} className={i === steps.length - 1 ? 'font-bold text-emerald-600 dark:text-emerald-400' : ''}>
                  {step}
                </div>
              ))}
            </div>
          </div>
        )}

        {na > 0 && nb > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Are coprime?</div>
              <div className={`text-sm font-bold ${result === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {result === 1 ? 'Yes' : 'No'}
              </div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">LCM</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">
                {na && nb ? (na * nb / result).toLocaleString() : '—'}
              </div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
