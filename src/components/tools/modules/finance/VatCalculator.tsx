"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

type Preset = { name: string; rate: number };
const PRESETS: Preset[] = [
  { name: 'UK Standard', rate: 20 },
  { name: 'EU Standard', rate: 19 },
  { name: 'India GST 18%', rate: 18 },
  { name: 'India GST 12%', rate: 12 },
  { name: 'UAE 5%', rate: 5 },
  { name: 'Switzerland', rate: 8.1 },
];

export default function VatCalculator() {
  const [netPrice, setNetPrice] = useState('100');
  const [vatRate, setVatRate] = useState('15');

  // String states: the old numeric states with Math.max clamps made fields
  // unclearable (clearing snapped back to 0) and always rendered a result.
  const net = parseFloat(netPrice);
  const rate = parseFloat(vatRate);
  const valid = Number.isFinite(net) && Number.isFinite(rate) && net >= 0 && rate >= 0;
  const vatAmount = valid ? net * (rate / 100) : 0;
  const grossPrice = valid ? net + vatAmount : 0;
  const totalPercent = 100 + (valid ? rate : 0);
  const exclusiveFromGross = grossPrice > 0 ? (grossPrice / totalPercent) * 100 : 0;
  const exclusiveVat = grossPrice - exclusiveFromGross;

  const csvContent = valid ? `Metric,Value\nNet Price (Excl. Tax),${net}\nVAT Rate,${rate}%\nVAT Amount,${vatAmount.toFixed(2)}\nGross Price (Incl. Tax),${grossPrice.toFixed(2)}` : '';

  const result = valid ? `$${grossPrice.toFixed(2)} gross price` : 'Enter a price and VAT rate';

  return (
    <CalculatorShell
      category="Finance"
      title="VAT Calculator"
      accent="emerald"
      result={result}
      auto
      presets={PRESETS.map(p => ({ label: p.name, apply: () => setVatRate(p.rate) }))}
      resultStats={valid ? [
        { label: 'VAT Amount', value: `$${vatAmount.toFixed(2)}` },
        ...(rate > 0 ? [{ label: 'Reverse VAT', value: `$${exclusiveVat.toFixed(2)}` }] : []),
      ] : []}
      resultLabel="Gross Price (Inclusive)"
      downloadData={csvContent}
      downloadFilename="vat-calculation.csv"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="lbl-vatcalculator-net-price-pre-tax" className={labelCls}>Net Price / Pre-tax ($)</label>
          <input id="lbl-vatcalculator-net-price-pre-tax" aria-label="Net Price / Pre-tax ($)" className={inputCls} type="number" min="0" value={netPrice} onChange={e => setNetPrice(e.target.value)} />
        </div>
        <div>
          <label className={labelCls}>VAT / GST Rate (%)</label>
          <input aria-label="VAT / GST Rate (%)" className={inputCls} type="number" min="0" max="99" value={vatRate} onChange={e => setVatRate(e.target.value)} />
          <input aria-label="VAT / GST Rate (%)" type="range" min="0" max="28" step="0.5" value={Number(vatRate) || 0} onChange={e => setVatRate(e.target.value)} className="w-full accent-emerald-500 mt-1" />
        </div>
      </div>
    </CalculatorShell>
  );
}
