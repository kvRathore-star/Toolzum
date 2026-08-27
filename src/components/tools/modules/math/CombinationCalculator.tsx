"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function CombinationCalculator() {
  const clr = ac('CombinationCalculator');
  const [n, setN] = useState('5');
  const [r, setR] = useState('3');

  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const nn = Number(n) || 0;
  const rr = Number(r) || 0;
  const valid = nn >= 0 && rr >= 0 && rr <= nn;
  const c = valid ? fact(nn) / (fact(rr) * fact(nn - rr)) : NaN;
  const p = valid ? fact(nn) / fact(nn - rr) : NaN;

  const swap = () => { setN(r); setR(n); };

  const presets = [
    { label: 'Lottery 6/49', apply: () => { setN('49'); setR('6'); } },
    { label: 'Poker 5/52', apply: () => { setN('52'); setR('5'); } },
    { label: 'Committee 3 from 10', apply: () => { setN('10'); setR('3'); } },
    { label: 'Team 5 from 20', apply: () => { setN('20'); setR('5'); } },
    { label: 'Pick 2 from 8', apply: () => { setN('8'); setR('2'); } },
  ];

  const resultText = valid
    ? `C(${nn}, ${rr}) = ${isFinite(c) ? c.toLocaleString() : '∞'} | P(${nn}, ${rr}) = ${isFinite(p) ? p.toLocaleString() : '∞'}`
    : 'Enter valid n ≥ r ≥ 0';

  const maxDisplay = 20;
  const displayN = Math.min(nn, maxDisplay);
  const displayR = Math.min(rr, maxDisplay);

  return (
    <CalculatorShell
      title="Combinations & Permutations"
      result={resultText}
      onCalculate={() => {}}
      presets={presets}
      accent="violet"
    >
      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className={labelClass}>n (total items)</label>
            <input type="number" min="0" value={n} onChange={e => setN(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
          </div>
          <button onClick={swap} className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-sm" title="Swap n and r">⇄</button>
          <div className="flex-1">
            <label className={labelClass}>r (choose)</label>
            <input type="number" min="0" value={r} onChange={e => setR(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
          </div>
        </div>

        {valid && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
                <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">C(n, r) — Combinations</div>
                <div className="text-2xl font-bold text-violet-700 dark:text-violet-300">
                  {isFinite(c) ? c.toLocaleString() : '∞'}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Order doesn&apos;t matter</div>
              </div>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 text-center">
                <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">P(n, r) — Permutations</div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {isFinite(p) ? p.toLocaleString() : '∞'}
                </div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">Order matters</div>
              </div>
            </div>

            {nn > 0 && nn <= maxDisplay && (
              <div className="bg-[var(--bg-surface)] rounded-xl p-3">
                <div className="text-xs text-[var(--text-secondary)] mb-2">Formula</div>
                <div className="font-mono text-sm text-[var(--text-primary)]">
                  <span className="text-violet-600 dark:text-violet-400">C({nn}, {rr})</span>
                  {' = '}
                  <span className="text-[var(--text-secondary)]">{nn}! / ({rr}! × {nn - rr}!) = </span>
                  <span className="font-bold">{isFinite(c) ? c.toLocaleString() : '∞'}</span>
                </div>
              </div>
            )}

            {nn > 0 && nn <= 12 && (
              <div className="bg-[var(--bg-surface)] rounded-xl p-3">
                <div className="text-xs text-[var(--text-secondary)] mb-2">All C({nn}, r) values</div>
                <div className="flex flex-wrap gap-1.5">
                  {Array.from({ length: displayN + 1 }, (_, i) => {
                    const val = fact(nn) / (fact(i) * fact(nn - i));
                    const isActive = i === rr;
                    return (
                      <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono transition-colors ${isActive ? 'bg-violet-500/20 text-violet-700 dark:text-violet-300 border border-violet-500/30' : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)]'}`}>
                        <span className="text-[var(--text-secondary)]">{nn},{i}</span>
                        <span className={isActive ? 'font-bold' : ''}>{isFinite(val) ? val.toLocaleString() : '∞'}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {!valid && nn > 0 && rr > nn && (
          <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
            r ({rr}) cannot be greater than n ({nn})
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
