"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';

export default function DiscountCalculator() {
  const [mode, setMode] = useState<'forward' | 'reverse'>('forward');
  const [price, setPrice] = useState('100');
  const [discount, setDiscount] = useState('20');
  const [salePrice, setSalePrice] = useState('80');
  const [result, setResult] = useState('');

  const calc = useCallback(() => {
    if (mode === 'forward') {
      const p = parseFloat(price) || 0;
      const d = parseFloat(discount) || 0;
      const savings = p * d / 100;
      const final = p - savings;
      setResult(`Original: $${p.toFixed(2)}\nDiscount: ${d}% (-$${savings.toFixed(2)})\nFinal Price: $${final.toFixed(2)}\nYou Save: $${savings.toFixed(2)}`);
    } else {
      const sp = parseFloat(salePrice) || 0;
      const d = parseFloat(discount) || 0;
      if (d >= 100) { setResult('Discount must be less than 100%'); return; }
      const original = sp / (1 - d / 100);
      const savings = original - sp;
      setResult(`Sale Price: $${sp.toFixed(2)}\nDiscount: ${d}%\nOriginal Price: $${original.toFixed(2)}\nYou Saved: $${savings.toFixed(2)}`);
    }
  }, [mode, price, discount, salePrice]);

  const presets = mode === 'forward' ? [
    { label: 'Flash Sale 50%', apply: () => { setPrice('100'); setDiscount('50'); } },
    { label: 'Seasonal 30%', apply: () => { setPrice('200'); setDiscount('30'); } },
    { label: 'Clearance 70%', apply: () => { setPrice('150'); setDiscount('70'); } },
  ] : [
    { label: '50% off $80', apply: () => { setSalePrice('80'); setDiscount('50'); } },
    { label: '30% off $140', apply: () => { setSalePrice('140'); setDiscount('30'); } },
    { label: '25% off $60', apply: () => { setSalePrice('60'); setDiscount('25'); } },
  ];

  const p = parseFloat(price) || 0;
  const d = parseFloat(discount) || 0;
  const sp = parseFloat(salePrice) || 0;
  const savings = mode === 'forward' ? p * d / 100 : (sp / (1 - d / 100)) - sp;
  const finalPrice = mode === 'forward' ? p - savings : sp;
  const originalPrice = mode === 'forward' ? p : sp / (1 - d / 100);

  return (
    <CalculatorShell title="Discount Calculator" result={result} onCalculate={calc} presets={presets} accent="teal">
      <div className="flex gap-1 mb-4">
        <button onClick={() => setMode('forward')} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${mode === 'forward' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border-subtle)]'}`}>
          Find Sale Price
        </button>
        <button onClick={() => setMode('reverse')} className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${mode === 'reverse' ? 'bg-[var(--accent)] text-white border-[var(--accent)]' : 'border-[var(--border-subtle)]'}`}>
          Find Original Price
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mode === 'forward' ? (
          <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Original Price ($)</label><input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} /></div>
        ) : (
          <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Sale Price ($)</label><input type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} className={inputCls} /></div>
        )}
        <div><label className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Discount (%)</label><input type="number" value={discount} onChange={e => setDiscount(e.target.value)} className={inputCls} /></div>
      </div>
      {result && (
        <div className="bg-[var(--bg-overlay)] rounded-xl p-4 border border-[var(--border-subtle)]">
          <div className="flex justify-between items-end mb-3">
            <div className="text-center flex-1">
              <div className="text-lg line-through text-[var(--text-tertiary)]">${originalPrice.toFixed(2)}</div>
              <div className="text-xs text-[var(--text-tertiary)]">Original</div>
            </div>
            <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 px-4">&#8594;</div>
            <div className="text-center flex-1">
              <div className="text-3xl font-bold text-[var(--text-primary)]">${finalPrice.toFixed(2)}</div>
              <div className="text-xs text-[var(--text-tertiary)]">{mode === 'forward' ? 'Final Price' : 'Sale Price'}</div>
            </div>
          </div>
          <div className="bg-emerald-700/10 rounded-lg p-2 text-center">
            <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
              {mode === 'forward'
                ? `You Save $${savings.toFixed(2)} (${d}% off)`
                : `Original was $${originalPrice.toFixed(2)} (${d}% off = $${sp.toFixed(2)})`
              }
            </span>
          </div>
        </div>
      )}
    </CalculatorShell>
  );
}
