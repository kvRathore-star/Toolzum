"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function QuadraticEquationSolver() {
  const [a, setA] = useState('1');
  const [b, setB] = useState('-3');
  const [c, setC] = useState('2');
  const presets = [
    { label: 'x\u00b2-3x+2=0', apply: () => { setA('1'); setB('-3'); setC('2'); } },
    { label: 'x\u00b2-4=0', apply: () => { setA('1'); setB('0'); setC('-4'); } },
    { label: 'x\u00b2+x+1=0', apply: () => { setA('1'); setB('1'); setC('1'); } },
  ];
  const A = parseFloat(a) || 0;
  const B = parseFloat(b) || 0;
  const C = parseFloat(c) || 0;
  const disc = B * B - 4 * A * C;
  const customResult = (
    <div className="text-center">
      <div className="text-xs text-[var(--text-tertiary)]">Discriminant</div>
      <div className={`text-lg font-bold ${disc >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>{disc.toFixed(2)}</div>
    </div>
  );
  return (
    <CalculatorShell category="Calculator" title="Quadratic Solver" result="" auto presets={presets} accent="pink" customResult={customResult}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">a</label><input type="number" value={a} onChange={e => setA(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">b</label><input type="number" value={b} onChange={e => setB(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">c</label><input type="number" value={c} onChange={e => setC(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
