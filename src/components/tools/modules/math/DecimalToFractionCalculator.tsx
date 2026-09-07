"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function DecimalToFractionCalculator() {
  const clr = ac('DecimalToFractionCalculator');
  const [dec, setDec] = useState('0.75');
  const [precision, setPrecision] = useState(1000000);
  const d = parseFloat(dec);
  const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : a;
  const getFraction = (v: number, prec: number) => {
    if (isNaN(v)) return { n: 0, d: 0 };
    const n = Math.round(v * prec);
    const g = gcd(n, prec);
    return { n: n / g, d: prec / g };
  };
  const f = isNaN(d) ? { n: 0, d: 0 } : getFraction(d, precision);
  const decimalVal = f.d ? f.n / f.d : 0;
  const error = f.d ? Math.abs(d - decimalVal) : 0;

  const presets = [
    { label: '0.75', apply: () => setDec('0.75') },
    { label: '0.333...', apply: () => setDec('0.3333333333') },
    { label: '0.142857', apply: () => setDec('0.142857142857') },
    { label: 'π - 3', apply: () => setDec((Math.PI - 3).toFixed(10)) },
  ];

  const resultText = f.d ? `${dec} ≈ ${f.n}/${f.d} (error: ${error.toExponential(2)})` : 'Enter decimal';

  return (
    <CalculatorShell category="Math" title="Decimal to Fraction" result={resultText} auto presets={presets} accent="amber" downloadData={f.d ? JSON.stringify({ decimal: d, fraction: `${f.n}/${f.d}`, error }, null, 2) : ''} downloadFilename="decimal-fraction.json" customResult={
      f.d ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Fraction</div>
            <div className="text-3xl font-bold text-amber-700 dark:text-amber-300 font-mono">${f.n}/${f.d}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">≈ ${decimalVal.toFixed(10)} (error: ${error.toExponential(2)})</div>
          </div>

          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Precision</div>
            <input type="range" min={10} max={100000000} step={10} value={precision} onChange={e => setPrecision(Number(e.target.value))}
              className="w-full accent-amber-500 mb-2" />
            <div className="text-xs text-[var(--text-muted)]">Precision: ${precision.toLocaleString()}</div>
          </div>

          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Continued Fraction Approximations</div>
            <div className="flex flex-wrap gap-2">
              {[
                { prec: 10, label: '10' },
                { prec: 100, label: '100' },
                { prec: 1000, label: '1,000' },
                { prec: 10000, label: '10,000' },
                { prec: 100000, label: '100,000' },
                { prec: 1000000, label: '1,000,000' },
              ].map(p => {
                const fr = getFraction(d, p.prec);
                return (
                  <span key={p.prec} className="px-2 py-1 bg-[var(--bg-overlay)] rounded-lg text-xs font-mono ${p.prec === precision ? 'bg-amber-500/20 ring-1 ring-amber-500' : ''}">
                    ${fr.n}/${fr.d} (${p.label})
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      ) : null
    }>
      <div className="space-y-4">
        <label className={labelClass}>Decimal Value</label>
        <input aria-label="Decimal Value" type="text" value={dec} onChange={e => setDec(e.target.value)} placeholder="0.75"
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-amber-500/50" />
      </div>
    </CalculatorShell>
  );
}
