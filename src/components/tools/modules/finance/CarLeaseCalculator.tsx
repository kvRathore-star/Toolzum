"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function CarLeaseCalculator() {
  const [capCost, setCapCost] = useState('30000');
  const [residual, setResidual] = useState('15000');
  const [term, setTerm] = useState('36');
  const [mf, setMf] = useState('0.00125');
  const presets = [
    { label: 'Economy 36mo', apply: () => { setCapCost('25000'); setResidual('12500'); setTerm('36'); setMf('0.00150'); } },
    { label: 'Luxury 36mo', apply: () => { setCapCost('55000'); setResidual('30250'); setTerm('36'); setMf('0.00125'); } },
    { label: 'SUV 48mo', apply: () => { setCapCost('45000'); setResidual('20250'); setTerm('48'); setMf('0.00175'); } },
  ];
  const cap = parseFloat(capCost) || 0;
  const res = parseFloat(residual) || 0;
  const monthly = cap && res ? ((cap - res) / (parseFloat(term) || 1)) + (cap + res) * (parseFloat(mf) || 0) : 0;
  const result = monthly > 0 ? `$${monthly.toFixed(0)}/mo` : '';
  return (
    <CalculatorShell title="Car Lease Calculator" result={result} auto presets={presets} accent="amber" customResult={
      monthly > 0 ? (
        <div>
          <div className="text-center mb-3">
            <div className="text-lg font-bold text-amber-700 dark:text-amber-400">${monthly.toFixed(0)}</div>
            <div className="text-xs text-[var(--text-tertiary)]">monthly lease payment</div>
          </div>
          <div className="flex gap-3">
            <div className="flex-1 bg-[var(--bg-elevated)] rounded-lg p-3 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Residual</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">{((res / cap) * 100).toFixed(0)}%</div>
            </div>
            <div className="flex-1 bg-[var(--bg-elevated)] rounded-lg p-3 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">APR</div>
              <div className="text-sm font-bold text-amber-700 dark:text-amber-400">{((parseFloat(mf) || 0) * 2400).toFixed(2)}%</div>
            </div>
            <div className="flex-1 bg-[var(--bg-elevated)] rounded-lg p-3 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Total</div>
              <div className="text-sm font-bold text-[var(--text-primary)]">${(monthly * (parseFloat(term) || 1)).toFixed(0)}</div>
            </div>
          </div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-2 gap-4">
        <div className="md:col-span-2"><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Capitalized Cost ($)</label><input type="number" value={capCost} onChange={e => setCapCost(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Residual Value ($)</label><input type="number" value={residual} onChange={e => setResidual(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Lease Term (months)</label><input type="number" value={term} onChange={e => setTerm(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Money Factor</label><input type="number" value={mf} onChange={e => setMf(e.target.value)} step="0.00001" className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
