"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function PrimeFactorizationCalculator() {
  const clr = ac('PrimeFactorizationCalculator');
  const [n, setN] = useState('84');
  const nn = Number(n) || 0;
  const factors = (x: number) => { const f: number[] = []; let d = 2; while (x > 1) { while (x % d === 0) { f.push(d); x /= d; } d++; } return f; };
  const f = nn >= 2 ? factors(nn) : [];
  const uniqueFactors = [...new Set(f)];
  const factorCounts = uniqueFactors.map(p => ({ prime: p, count: f.filter(x => x === p).length }));

  const presets = [
    { label: '84', apply: () => setN('84') },
    { label: '100', apply: () => setN('100') },
    { label: '1000', apply: () => setN('1000') },
    { label: '997 (prime)', apply: () => setN('997') },
    { label: '720720', apply: () => setN('720720') },
  ];

  const resultText = nn >= 2 ? `${nn} = ${factorCounts.map(fc => fc.count > 1 ? `${fc.prime}^${fc.count}` : fc.prime).join(' × ')}` : 'Enter number ≥ 2';

  return (
    <CalculatorShell title="Prime Factorization" result={resultText} onCalculate={() => {}} presets={presets} accent="blue" downloadData={nn >= 2 ? JSON.stringify({ number: nn, factors: factorCounts }, null, 2) : ''} downloadFilename="factors.json">
      <div className="space-y-4">
        <label className={labelClass}>Number (≥ 2)</label>
        <input type="number" min={2} value={n} onChange={e => setN(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-blue-500/50" />

        {nn >= 2 && (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Factorization</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300 font-mono break-all">
              ${nn} = ${factorCounts.map(fc => fc.count > 1 ? `${fc.prime}<sup>${fc.count}</sup>` : fc.prime).join(' × ')}
            </div>
          </div>
        )}

        {nn >= 2 && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Prime Factors Detail</div>
            <div className="space-y-1.5">
              {factorCounts.map(fc => (
                <div key={fc.prime} className="flex items-center justify-between p-2 bg-[var(--bg-overlay)] rounded-lg">
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">${fc.prime}</span>
                  <span className="text-sm text-[var(--text-secondary)]">
                    ${fc.count > 1 ? `^${fc.count} (${fc.prime} × ${' × '.repeat(fc.count - 1)}${fc.prime})` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {nn >= 2 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Unique Primes</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${uniqueFactors.length}</div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Total Factors</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${f.length}</div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
