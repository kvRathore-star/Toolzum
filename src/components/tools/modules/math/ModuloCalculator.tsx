"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function ModuloCalculator() {
  const clr = ac('ModuloCalculator');
  const [a, setA] = useState('17');
  const [b, setB] = useState('5');
  const na = Number(a), nb = Number(b);

  // JavaScript mod (truncates toward zero)
  const jsMod = nb !== 0 ? na % nb : NaN;
  const jsQuotient = nb !== 0 ? Math.floor(na / nb) : NaN;

  // Python/Floored mod (always positive remainder)
  const pyMod = nb !== 0 ? ((na % nb) + nb) % nb : NaN;
  const pyQuotient = nb !== 0 ? Math.floor(na / nb) : NaN;

  const differs = nb !== 0 && jsMod !== pyMod && na < 0;

  const presets = [
    { label: '17 mod 5', apply: () => { setA('17'); setB('5'); } },
    { label: '-17 mod 5', apply: () => { setA('-17'); setB('5'); } },
    { label: '23 mod 7', apply: () => { setA('23'); setB('7'); } },
    { label: '-23 mod 7', apply: () => { setA('-23'); setB('7'); } },
    { label: '100 mod 3', apply: () => { setA('100'); setB('3'); } },
  ];

  const resultText = nb !== 0
    ? `${na} mod ${nb} = ${jsMod} (JS)${differs ? ` / ${pyMod} (Python)` : ''}`
    : 'Divisor cannot be zero';

  return (
    <CalculatorShell title="Modulo Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="emerald" customResult={
      nb !== 0 ? (
        <div className="space-y-3">
          <div className="text-center">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">JavaScript / C-style</div>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{na} mod {nb} = {jsMod}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Truncates toward zero</div>
          </div>

          {differs && (
            <div className="text-center">
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Python / Floored (mathematical)</div>
              <div className="text-3xl font-bold text-amber-700 dark:text-amber-300">{na} mod {nb} = {pyMod}</div>
              <div className="text-xs text-[var(--text-secondary)] mt-1">Floors toward −∞ (always non-negative)</div>
            </div>
          )}

          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Division Identity</div>
            <div className="font-mono text-sm text-[var(--text-primary)] space-y-1">
              <div>{na} = {nb} × {jsQuotient} + {jsMod} <span className="text-emerald-600 dark:text-emerald-400">(JS)</span></div>
              {differs && <div>{na} = {nb} × {pyQuotient} + {pyMod} <span className="text-amber-600 dark:text-amber-400">(Python)</span></div>}
            </div>
          </div>

          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Long Division</div>
            <div className="font-mono text-xs text-[var(--text-primary)] space-y-1">
              <div>{na} ÷ {nb} = {(na / nb).toFixed(4)}</div>
              <div>Quotient (floor): {jsQuotient}</div>
              <div>Remainder: {na} − ({nb} × {jsQuotient}) = {jsMod}</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-amber-600 dark:text-amber-400 text-center">
          Divisor cannot be zero
        </div>
      )
    }>
      <div className="space-y-4">
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <label className={labelClass}>Dividend (a)</label>
            <input type="number" value={a} onChange={e => setA(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <span className="text-sm font-bold self-center">mod</span>
          <div className="flex-1">
            <label className={labelClass}>Divisor (b)</label>
            <input type="number" min={1} value={b} onChange={e => setB(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
