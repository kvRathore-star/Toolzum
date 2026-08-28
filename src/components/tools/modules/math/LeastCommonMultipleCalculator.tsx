"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function LeastCommonMultipleCalculator() {
  const clr = ac('LeastCommonMultipleCalculator');
  const [a, setA] = useState('4');
  const [b, setB] = useState('6');
  const gcd = (x: number, y: number): number => y ? gcd(y, x % y) : x;
  const lcm = (x: number, y: number) => x && y ? (x * y) / gcd(x, y) : 0;
  const na = Number(a), nb = Number(b);
  const result = lcm(na, nb);

  const presets = [
    { label: '4 & 6', apply: () => { setA('4'); setB('6'); } },
    { label: '6 & 8', apply: () => { setA('6'); setB('8'); } },
    { label: '12 & 18', apply: () => { setA('12'); setB('18'); } },
    { label: '15 & 25', apply: () => { setA('15'); setB('25'); } },
    { label: '7 & 11', apply: () => { setA('7'); setB('11'); } },
  ];

  const resultText = `LCM(${na}, ${nb}) = ${result}`;

  return (
    <CalculatorShell title="LCM Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="violet" downloadData={`Number1,Number2,LCM,GCF,Product\n${a},${b},${result},${gcd(na, nb)},${na * nb}`} downloadFilename="lcm-calculation.csv">
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className={labelClass}>First number</label>
            <input type="number" min={0} value={a} onChange={e => setA(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50" />
          </div>
          <div className="flex-1">
            <label className={labelClass}>Second number</label>
            <input type="number" min={0} value={b} onChange={e => setB(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50" />
          </div>
        </div>

        {na > 0 && nb > 0 && (
          <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">Least Common Multiple</div>
            <div className="text-4xl font-bold text-violet-700 dark:text-violet-300">{result.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Smallest positive multiple of both numbers</div>
          </div>
        )}

        {na > 0 && nb > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Formula</div>
            <div className="font-mono text-sm text-[var(--text-primary)] space-y-1">
              <div>LCM(a, b) = |a × b| / GCF(a, b)</div>
              <div className="text-[var(--text-secondary)]">{na} × {nb} / {gcd(na, nb)} = {result}</div>
            </div>
          </div>
        )}

        {na > 0 && nb > 0 && (
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">GCF</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{gcd(na, nb)}</div>
            </div>
            <div className="bg-[var(--bg-surface)] rounded-xl p-2.5 text-center">
              <div className="text-xs text-[var(--text-secondary)]">Product</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{na * nb}</div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}
