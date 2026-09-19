"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls } from '../Calculators.shared';

export default function DiscountCalculator() {
  const [mode, setMode] = useState<'forward' | 'reverse'>('forward');
  const [price, setPrice] = useState('100');
  const [discount, setDiscount] = useState('20');
  const [salePrice, setSalePrice] = useState('80');

  const presets = mode === 'forward' ? [
    { label: 'Flash Sale 50%', apply: () => { setPrice('100'); setDiscount('50'); } },
    { label: 'Seasonal 30%', apply: () => { setPrice('200'); setDiscount('30'); } },
    { label: 'Clearance 70%', apply: () => { setPrice('150'); setDiscount('70'); } },
  ] : [
    { label: '50% off $80', apply: () => { setSalePrice('80'); setDiscount('50'); } },
    { label: '30% off $140', apply: () => { setSalePrice('140'); setDiscount('30'); } },
    { label: '25% off $60', apply: () => { setSalePrice('60'); setDiscount('25'); } },
  ];

  const hasInput = mode === 'forward'
    ? price !== '' && discount !== ''
    : salePrice !== '' && discount !== '';

  let savings = 0;
  let finalPrice = 0;
  let originalPrice = 0;
  let d = 0;
  let sp = 0;
  let result = '';

  if (hasInput) {
    const p = parseFloat(price) || 0;
    d = parseFloat(discount) || 0;
    sp = parseFloat(salePrice) || 0;

    if (mode === 'forward') {
      savings = p * d / 100;
      finalPrice = p - savings;
      originalPrice = p;
      result = `Original: $${p.toFixed(2)}\nDiscount: ${d}% (-$${savings.toFixed(2)})\nFinal Price: $${finalPrice.toFixed(2)}\nYou Save: $${savings.toFixed(2)}`;
    } else if (d >= 100) {
      result = 'Discount must be less than 100%';
    } else {
      savings = (sp / (1 - d / 100)) - sp;
      finalPrice = sp;
      originalPrice = sp / (1 - d / 100);
      result = `Sale Price: $${sp.toFixed(2)}\nDiscount: ${d}%\nOriginal Price: $${originalPrice.toFixed(2)}\nYou Saved: $${savings.toFixed(2)}`;
    }
  }

  return (
    <CalculatorShell category="Finance" title="Discount Calculator" result={result} auto presets={presets} accent="teal" customResult={
      hasInput && result !== 'Discount must be less than 100%' ? (
        <div>
          <div className="flex justify-between items-end mb-3">
            <div className="text-center flex-1">
              <div className="text-lg line-through text-[var(--text-tertiary)]">${originalPrice.toFixed(2)}</div>
              <div className="text-xs text-[var(--text-tertiary)]">Original</div>
            </div>
            <div className="text-2xl font-bold text-[var(--accent)] px-4">&#8594;</div>
            <div className="text-center flex-1">
              <div className="text-lg font-bold text-[var(--text-primary)]">${finalPrice.toFixed(2)}</div>
              <div className="text-xs text-[var(--text-tertiary)]">{mode === 'forward' ? 'Final Price' : 'Sale Price'}</div>
            </div>
          </div>
          <div className="bg-emerald-700/10 rounded-lg p-2 text-center">
            <span className="text-sm font-bold text-[var(--accent)]">
              {mode === 'forward'
                ? `You Save $${savings.toFixed(2)} (${d}% off)`
                : `Original was $${originalPrice.toFixed(2)} (${d}% off = $${sp.toFixed(2)})`
              }
            </span>
          </div>
        </div>
      ) : null
    }>
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
          <div><label htmlFor="lbl-discountcalculator-original-price" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Original Price ($)</label><input id="lbl-discountcalculator-original-price" aria-label="Original Price ($)" type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} /></div>
        ) : (
          <div><label htmlFor="lbl-discountcalculator-sale-price" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Sale Price ($)</label><input id="lbl-discountcalculator-sale-price" aria-label="Sale Price ($)" type="number" value={salePrice} onChange={e => setSalePrice(e.target.value)} className={inputCls} /></div>
        )}
        <div><label htmlFor="lbl-discountcalculator-discount" className="block text-sm font-bold text-[var(--text-primary)] mb-1.5">Discount (%)</label><input id="lbl-discountcalculator-discount" aria-label="Discount (%)" type="number" value={discount} onChange={e => setDiscount(e.target.value)} className={inputCls} /></div>
      </div>
    </CalculatorShell>
  );
}
