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
  const [netPrice, setNetPrice] = useState(100);
  const [vatRate, setVatRate] = useState(15);

  const vatAmount = netPrice * (vatRate / 100);
  const grossPrice = netPrice + vatAmount;
  const totalPercent = 100 + vatRate;
  const exclusiveFromGross = grossPrice > 0 ? (grossPrice / totalPercent) * 100 : 0;
  const exclusiveVat = grossPrice - exclusiveFromGross;

  const csvContent = `Metric,Value\nNet Price (Excl. Tax),${netPrice}\nVAT Rate,${vatRate}%\nVAT Amount,${vatAmount.toFixed(2)}\nGross Price (Incl. Tax),${grossPrice.toFixed(2)}`;

  const result = `$${grossPrice.toFixed(2)} gross price`;

  return (
    <CalculatorShell
      category="Finance"
      title="VAT Calculator"
      accent="emerald"
      result={result}
      auto
      presets={PRESETS.map(p => ({ label: p.name, apply: () => setVatRate(p.rate) }))}
      resultStats={[
        { label: 'VAT Amount', value: `$${vatAmount.toFixed(2)}` },
        ...(vatRate > 0 ? [{ label: 'Reverse VAT', value: `$${exclusiveVat.toFixed(2)}` }] : []),
      ]}
      resultLabel="Gross Price (Inclusive)"
      downloadData={csvContent}
      downloadFilename="vat-calculation.csv"
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Net Price / Pre-tax ($)</label>
          <input className={inputCls} type="number" value={netPrice} onChange={e => setNetPrice(Math.max(0, parseFloat(e.target.value) || 0))} />
        </div>
        <div>
          <label className={labelCls}>VAT / GST Rate (%)</label>
          <input className={inputCls} type="number" value={vatRate} onChange={e => setVatRate(Math.min(99, Math.max(0, parseFloat(e.target.value) || 0)))} />
          <input type="range" min="0" max="28" step="0.5" value={vatRate} onChange={e => setVatRate(parseFloat(e.target.value))} className="w-full accent-emerald-500 mt-1" />
        </div>
      </div>
    </CalculatorShell>
  );
}
