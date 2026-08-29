"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function NetWorthCalculator() {
  const [assets, setAssets] = useState('500000');
  const [liabilities, setLiabilities] = useState('200000');
  const presets = [
    { label: 'Young Adult', apply: () => { setAssets('50000'); setLiabilities('20000'); } },
    { label: 'Mid Career', apply: () => { setAssets('500000'); setLiabilities('200000'); } },
    { label: 'Pre-Retirement', apply: () => { setAssets('1500000'); setLiabilities('300000'); } },
  ];
  const a = parseFloat(assets) || 0;
  const l = parseFloat(liabilities) || 0;
  const nw = a - l;
  const dti = a > 0 ? (l / a) * 100 : 0;
  return (
    <CalculatorShell title="Net Worth Calculator" result={nw} auto presets={presets} accent="purple" customResult={
      true ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-[var(--text-tertiary)]">Net Worth</div>
              <div className={`text-2xl font-bold ${nw >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                ${nw.toLocaleString()}
              </div>
            </div>
            <div className={`px-3 py-1 rounded-lg text-xs font-bold ${dti <= 30 ? 'bg-emerald-700/20 text-emerald-700 dark:text-emerald-400' : dti <= 50 ? 'bg-amber-500/20 text-amber-700 dark:text-amber-400' : 'bg-red-500/20 text-red-700 dark:text-red-400'}`}>
              {dti.toFixed(0)}% DTI
            </div>
          </div>
          <div className="h-3 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500 rounded-full" style={{ width: `${Math.min(dti, 100)}%` }} />
          </div>
        </div>
      ) : null
    }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Total Assets ($)</label><input type="number" value={assets} onChange={e => setAssets(e.target.value)} className={inputCls} /></div>
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Total Liabilities ($)</label><input type="number" value={liabilities} onChange={e => setLiabilities(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
