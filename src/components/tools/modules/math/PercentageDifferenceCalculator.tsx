"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function PercentageDifferenceCalculator() {
  const clr = ac('PercentageDifferenceCalculator');
  const [a, setA] = useState('100');
  const [b, setB] = useState('150');

  const numA = Number(a) || 0;
  const numB = Number(b) || 0;
  const avg = (numA + numB) / 2;
  const absDiff = Math.abs(numA - numB);
  const diff = avg ? (absDiff / avg) * 100 : 0;

  const swap = () => { setA(b); setB(a); };

  const presets = [
    { label: '100 vs 150', apply: () => { setA('100'); setB('150'); } },
    { label: '50 vs 75', apply: () => { setA('50'); setB('75'); } },
    { label: '200 vs 250', apply: () => { setA('200'); setB('250'); } },
    { label: '1000 vs 1200', apply: () => { setA('1000'); setB('1200'); } },
    { label: '250 vs 100', apply: () => { setA('250'); setB('100'); } },
  ];

  const resultText = avg > 0
    ? `${numA} and ${numB} differ by ${diff.toFixed(2)}% (avg: ${avg.toFixed(2)}, Δ: ${absDiff.toFixed(2)})`
    : 'Enter two non-zero values';

  const barMax = Math.max(numA, numB, 1);
  const barA = (numA / barMax) * 100;
  const barB = (numB / barMax) * 100;

  const diffColor = diff < 10 ? 'text-emerald-600 dark:text-emerald-400'
    : diff < 25 ? 'text-amber-600 dark:text-amber-400'
    : 'text-rose-600 dark:text-rose-400';

  const barColorA = 'bg-blue-500';
  const barColorB = numB > numA ? 'bg-emerald-500' : numB < numA ? 'bg-rose-500' : 'bg-blue-500';

  return (
    <CalculatorShell
      title="Percentage Difference"
      result={resultText}
      auto
      presets={presets}
      accent="emerald"
      downloadData={`ValueA,ValueB,Average,AbsDiff,PercentDiff\n${a},${b},${avg.toFixed(2)},${absDiff.toFixed(2)},${diff.toFixed(2)}`}
      downloadFilename="percentage-difference.csv"
    >
      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className={labelClass}>Value A</label>
            <input type="number" value={a} onChange={e => setA(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <button onClick={swap} className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors text-sm" title="Swap values">⇄</button>
          <div className="flex-1">
            <label className={labelClass}>Value B</label>
            <input type="number" value={b} onChange={e => setB(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>

        {avg > 0 && (
          <div className="space-y-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${diffColor}`}>{diff.toFixed(2)}%</span>
              <span className="text-sm text-[var(--text-secondary)]">difference</span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)] w-16 text-right">A</span>
                <div className="flex-1 h-5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div className={`h-full ${barColorA} rounded-full transition-all duration-500`} style={{ width: `${barA}%` }} />
                </div>
                <span className="text-xs font-mono text-[var(--text-secondary)] w-20">{numA.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--text-secondary)] w-16 text-right">B</span>
                <div className="flex-1 h-5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                  <div className={`h-full ${barColorB} rounded-full transition-all duration-500`} style={{ width: `${barB}%` }} />
                </div>
                <span className="text-xs font-mono text-[var(--text-secondary)] w-20">{numB.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1">
              <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
                <div className="text-xs text-[var(--text-secondary)]">Average</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{avg.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
                <div className="text-xs text-[var(--text-secondary)]">Absolute Δ</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{absDiff.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
                <div className="text-xs text-[var(--text-secondary)]">Relative Δ</div>
                <div className="text-sm font-semibold text-[var(--text-primary)]">{diff.toFixed(2)}%</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
