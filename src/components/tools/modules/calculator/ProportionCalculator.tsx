"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function ProportionCalculator() {
  const [a, setA] = useState('2');
  const [b, setB] = useState('5');
  const [c, setC] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const na = parseFloat(a) || 0;
    const nb = parseFloat(b) || 0;
    const nc = parseFloat(c) || 0;
    if (!na) return;
    const d = (nb * nc) / na;
    setResult(`${na} : ${nb} = ${nc} : ${d.toFixed(4)}\nMissing value (D) = ${d.toFixed(4)}`);
  }, [a, b, c]);
  const presets = [
    { label: '2:5 = 8:?', apply: () => { setA('2'); setB('5'); setC('8'); } },
    { label: '3:4 = 12:?', apply: () => { setA('3'); setB('4'); setC('12'); } },
    { label: '1:10 = 5:?', apply: () => { setA('1'); setB('10'); setC('5'); } },
  ];
  const na = parseFloat(a) || 0;
  const nb = parseFloat(b) || 0;
  const nc = parseFloat(c) || 0;
  const d = na ? (nb * nc) / na : 0;
  return (
    <CalculatorShell title="Proportion Calculator" result={result} onCalculate={calc} presets={presets} accent="indigo">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">A</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">B (first ratio)</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">C (solve D)</label><input type="number" value={c} onChange={e => setC(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 text-center border border-[var(--border-subtle)] font-mono text-lg">
          <span className="text-[var(--text-primary)]">{na} : {nb} = {nc} : <span className="text-indigo-700 dark:text-indigo-400 font-bold">{d.toFixed(2)}</span></span>
        </div>
      )}
    </CalculatorShell>
  );
}
