"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ac, borderClass } from '../miscToolColors';
import { Input, labelClass, selClass } from '../MiscToolsShared';

export default function PermutationCalculator() {
  const clr = ac('PermutationCalculator');
  const [n, setN] = useState('5');
  const [r, setR] = useState('3');
  const fact = (x: number): number => x <= 1 ? 1 : x * fact(x - 1);
  const nn = Number(n), rr = Number(r);
  const p = fact(nn) / fact(nn - rr);
  const resultText = `P(${nn}, ${rr}) = ${isFinite(p) ? p.toFixed(0) : 'N/A'}`;
  const presets = [
    { label: '10P3', apply: () => { setN('10'); setR('3'); } },
    { label: '5P2', apply: () => { setN('5'); setR('2'); } },
  ];
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Permutations (nPr)</h2>
        <div className="flex gap-2 items-center">
          <Input label="n" type="number" value={n} onChange={setN} placeholder="n" />
          <Input label="r" type="number" value={r} onChange={setR} placeholder="r" />
        </div>
        <div className="text-lg font-bold">P({nn}, {rr}) = {isFinite(p) ? p.toFixed(0) : 'N/A'}</div>
        <div className="flex gap-2">
          <button onClick={() => { navigator.clipboard.writeText(resultText); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
          <button onClick={() => { const blob = new Blob([resultText], {type:'text/plain'}); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='result.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Download</button>
        </div>
      </div>
    </>
  );
}
