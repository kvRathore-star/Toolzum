"use client";
import { useState } from 'react';
import { ac, borderClass } from '../miscToolColors';
import { labelClass, selClass } from '../MiscToolsShared';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Calculator } from 'lucide-react';

export default function FactorialCalculator() {
  const clr = ac('FactorialCalculator');
  const [n, setN] = useState('5');
  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const nn = Number(n) || 0;
  const valid = nn >= 0 && nn <= 170;
  const result = valid ? fact(nn) : 0;
  const digits = valid ? result.toString().length : 0;

  const presets = [
    { label: '0!', apply: () => setN('0') },
    { label: '5!', apply: () => setN('5') },
    { label: '10!', apply: () => setN('10') },
    { label: '20!', apply: () => setN('20') },
    { label: '50!', apply: () => setN('50') },
  ];

  const resultText = valid ? `${nn}! = ${result.toLocaleString()} (${digits} digits)` : (nn > 170 ? 'Max supported: 170' : 'Enter 0-170');

  return (
    <CalculatorShell icon={<Calculator className="w-5 h-5" />} title="Factorial Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="violet" downloadData={valid ? `factorial(${nn}) = ${result}` : ''} downloadFilename="factorial.txt" customResult={
      valid ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">Result</div>
            <div className="text-2xl font-bold text-violet-700 dark:text-violet-300 font-mono break-all">{result.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">${digits} digits</div>
          </div>

          {nn <= 20 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3">
              <div className="text-xs text-[var(--text-secondary)] mb-2">All factorials up to ${nn}</div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                {Array.from({ length: nn + 1 }, (_, i) => {
                  const f = i <= 1 ? 1 : Array.from({ length: i }, (_, j) => j + 1).reduce((a, b) => a * b, 1);
                  return (
                    <div key={i} className="p-2 bg-[var(--bg-overlay)] rounded-lg text-sm font-mono">
                      <span className="text-[var(--text-secondary)]">${i}! =</span>
                      <span className="font-bold">${f.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Formula</div>
            <div className="font-mono text-sm text-[var(--text-primary)]">
              ${nn}! = ${Array.from({ length: nn }, (_, i) => i + 1).join(' × ')}
            </div>
          </div>
        </div>
      ) : nn > 170 ? (
        <div className="text-amber-600 dark:text-amber-400 text-center">
          Factorials above 170 exceed JavaScript&apos;s safe integer range. Maximum supported: 170.
        </div>
      ) : null
    }>
      <div className="space-y-4">
        <label className={labelClass}>Non-negative integer (0-170)</label>
        <input type="number" min={0} max={170} value={n} onChange={e => setN(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50" />
      </div>
    </CalculatorShell>
  );
}
title="Factorial Calculator" result={resultText} onCalculate={() => {}} presets={presets} accent="violet" downloadData={valid ? `factorial(${nn}) = ${result}` : ''} downloadFilename="factorial.txt" customResult={
      valid ? (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">Result</div>
            <div className="text-2xl font-bold text-violet-700 dark:text-violet-300 font-mono break-all">{result.toLocaleString()}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">${digits} digits</div>
          </div>

          {nn <= 20 && (
            <div className="bg-[var(--bg-surface)] rounded-xl p-3">
              <div className="text-xs text-[var(--text-secondary)] mb-2">All factorials up to ${nn}</div>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-auto">
                {Array.from({ length: nn + 1 }, (_, i) => {
                  const f = i <= 1 ? 1 : Array.from({ length: i }, (_, j) => j + 1).reduce((a, b) => a * b, 1);
                  return (
                    <div key={i} className="p-2 bg-[var(--bg-overlay)] rounded-lg text-sm font-mono">
                      <span className="text-[var(--text-secondary)]">${i}! =</span>
                      <span className="font-bold">${f.toLocaleString()}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-[var(--bg-surface)] rounded-xl p-3">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Formula</div>
            <div className="font-mono text-sm text-[var(--text-primary)]">
              ${nn}! = ${Array.from({ length: nn }, (_, i) => i + 1).join(' × ')}
            </div>
          </div>
        </div>
      ) : nn > 170 ? (
        <div className="text-amber-600 dark:text-amber-400 text-center">
          Factorials above 170 exceed JavaScript&apos;s safe integer range. Maximum supported: 170.
        </div>
      ) : null
    }>
      <div className="space-y-4">
        <label className={labelClass}>Non-negative integer (0-170)</label>
        <input type="number" min={0} max={170} value={n} onChange={e => setN(e.target.value)}
          className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-violet-500/50" />
      </div>
    </CalculatorShell>
  );
}
