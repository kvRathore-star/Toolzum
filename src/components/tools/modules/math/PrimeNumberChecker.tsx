"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function PrimeNumberChecker() {
  const clr = ac('PrimeNumberChecker');
  const [n, setN] = useState('17');
  const nn = Number(n) || 0;
  const isPrime = (x: number) => { if (x < 2) return false; for (let i = 2; i * i <= x; i++) { if (x % i === 0) return false; } return true; };
  const factors = (x: number) => { const f: number[] = []; let d = 2; while (x > 1) { while (x % d === 0) { f.push(d); x /= d; } d++; } return f; };
  const prime = nn >= 2 && isPrime(nn);
  const factorList = nn >= 2 ? factors(nn) : [];

  const presets = [
    { label: '2', apply: () => setN('2') },
    { label: '17', apply: () => setN('17') },
    { label: '97', apply: () => setN('97') },
    { label: '100', apply: () => setN('100') },
    { label: '997', apply: () => setN('997') },
    { label: '104729', apply: () => setN('104729') },
  ];

  const nearestPrimes = (() => {
    if (nn < 2) return { below: null, above: 2 };
    let below = nn, above = nn;
    while (below > 2 && !isPrime(below)) below--;
    while (!isPrime(above)) above++;
    if (below === nn && prime) { let b = nn - 1; while (b > 2 && !isPrime(b)) below = b--; }
    return { below: below !== nn ? below : null, above: above !== nn ? above : null };
  })();

  const resultText = nn < 2 ? `${nn} is less than 2` : prime ? `${nn} is prime` : `${nn} = ${factorList.join(' × ')}`;

  return (
    <CalculatorShell category="Math" title="Prime Number Checker" result={resultText} auto presets={presets} accent="emerald" downloadData={`Number,IsPrime,Factors,NearestPrimeBelow,NearestPrimeAbove\n${n},${prime ? 'Yes' : 'No'},${factorList.join('*')},${nearestPrimes.below || ''},${nearestPrimes.above || ''}`} downloadFilename="prime-check.csv">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Number</label>
          <input aria-label="Number" type="number" min={0} value={n} onChange={e => setN(e.target.value)}
            className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />
        </div>

        {nn >= 2 && (
          <div className={`p-4 rounded-xl border ${prime ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
            <div className="flex items-center gap-3">
              <span className={`text-4xl ${prime ? 'text-emerald-500' : 'text-rose-500'}`}>{prime ? '✓' : '✗'}</span>
              <div>
                <div className={`text-lg font-bold ${prime ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                  {nn} is {prime ? 'prime' : 'not prime'}
                </div>
                {!prime && factorList.length > 0 && (
                  <div className="text-sm text-[var(--text-secondary)] mt-1">
                    {nn} = {factorList.join(' × ')}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {nn >= 2 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Prime?</div>
              <div className={`text-sm font-bold ${prime ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>{prime ? 'Yes' : 'No'}</div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-3 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Factor Count</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{factorList.length}</div>
            </div>
          </div>
        )}

        {nn >= 2 && !prime && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Prime Factorization</div>
            <div className="font-mono text-sm text-[var(--text-primary)]">
              {nn} = {factorList.map((f, i) => (
                <span key={i}>
                  {i > 0 && <span className="text-[var(--text-secondary)]"> × </span>}
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">{f}</span>
                </span>
              ))}
            </div>
          </div>
        )}

        {nn >= 2 && (nearestPrimes.below !== null || nearestPrimes.above !== null) && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Nearest Primes</div>
            <div className="flex gap-2">
              {nearestPrimes.below !== null && (
                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-mono">{nearestPrimes.below}</span>
              )}
              {!prime && <span className="text-xs text-[var(--text-secondary)] self-center">← {nn} →</span>}
              {nearestPrimes.above !== null && nearestPrimes.above !== nn && (
                <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-mono">{nearestPrimes.above}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
