"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function CAGRCalculator() {
  const clr = ac('CAGRCalculator');
  const [start, setStart] = useState('1000');
  const [end, setEnd] = useState('2000');
  const [years, setYears] = useState('5');
  const s = Number(start), e = Number(end), y = Number(years);
  const cagr = s > 0 && y > 0 ? (Math.pow(e / s, 1 / y) - 1) * 100 : 0;
  const totalReturn = s ? ((e - s) / s * 100) : 0;

  const presets = [
    { label: '1K to 2K in 5yr', apply: () => { setStart('1000'); setEnd('2000'); setYears('5'); } },
    { label: '10K to 50K in 10yr', apply: () => { setStart('10000'); setEnd('50000'); setYears('10'); } },
    { label: '100 to 1000 in 7yr', apply: () => { setStart('100'); setEnd('1000'); setYears('7'); } },
    { label: '5000 to 7500 in 3yr', apply: () => { setStart('5000'); setEnd('7500'); setYears('3'); } },
  ];

  const resultText = s > 0 && y > 0 ? `CAGR: ${cagr.toFixed(2)}% (Total: ${totalReturn.toFixed(2)}%)` : 'Enter valid values';

  return (
    <CalculatorShell category="Math" title="CAGR Calculator" result={resultText} auto presets={presets} accent="emerald" downloadData={`StartValue,EndValue,Years,CAGR,TotalReturn\n${s},${e},${y},${cagr.toFixed(2)},${totalReturn.toFixed(2)}`} downloadFilename="cagr-calculation.csv">
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className={labelClass}>Start Value</label>
            <input type="number" min={0} step="0.01" value={start} onChange={e => setStart(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className={labelClass}>End Value</label>
            <input type="number" min={0} step="0.01" value={end} onChange={e => setEnd(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />
          </div>
          <div>
            <label className={labelClass}>Years</label>
            <input type="number" min={0} step="0.1" value={years} onChange={e => setYears(e.target.value)}
              className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500/50" />
          </div>
        </div>

        {s > 0 && y > 0 && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">Compound Annual Growth Rate</div>
            <div className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">${cagr.toFixed(2)}%</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">Total return: ${totalReturn.toFixed(2)}%</div>
          </div>
        )}

        {s > 0 && y > 0 && (
          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Year-by-Year Growth</div>
            <div className="max-h-48 overflow-auto space-y-1">
              {Array.from({ length: y }, (_, i) => {
                const year = i + 1;
                const value = s * Math.pow(e / s, year / y);
                return (
                  <div key={year} className="flex justify-between p-2 bg-[var(--bg-overlay)] rounded-lg text-sm">
                    <span>Year ${year}</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">${value.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="bg-[var(--bg-surface)] rounded-xl p-3">
          <div className="text-xs text-[var(--text-secondary)] mb-2">Formula</div>
          <div className="font-mono text-sm text-[var(--text-primary)]">
            CAGR = (End / Start)^(1 / Years) - 1
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
