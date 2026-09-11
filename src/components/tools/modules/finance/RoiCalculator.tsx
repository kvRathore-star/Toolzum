"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

type Preset = { name: string; initial: number; final: number };
const PRESETS: Preset[] = [
  { name: 'Stock Investment', initial: 10000, final: 15000 },
  { name: 'Real Estate', initial: 200000, final: 260000 },
  { name: 'Small Business', initial: 50000, final: 75000 },
  { name: 'Marketing Campaign', initial: 5000, final: 12000 },
];

export default function RoiCalculator() {
  const [initial, setInitial] = useState(10000);
  const [final, setFinal] = useState(15000);

  const gain = final - initial;
  const roi = initial > 0 ? (gain / initial) * 100 : 0;
  const result = `${roi.toFixed(2)}% ROI`;

  const csvContent = `Metric,Value\nInitial Investment,${initial}\nFinal Value,${final}\nNet Gain,${gain}\nROI,${roi.toFixed(2)}%`;

  return (
    <CalculatorShell
      category="Finance"
      title="ROI Calculator"
      accent="emerald"
      result={result}
      auto
      presets={PRESETS.map(p => ({ label: p.name, apply: () => { setInitial(p.initial); setFinal(p.final); } }))}
      resultStats={[
        { label: 'Net Return Gain', value: `$${gain.toFixed(2)}`, color: gain >= 0 ? 'text-emerald-500' : 'text-red-500' },
        { label: 'Total Return', value: `$${final.toLocaleString()} from $${initial.toLocaleString()}` },
      ]}
      resultLabel="Return on Investment (ROI)"
      downloadData={csvContent}
      downloadFilename="roi-calculation.csv"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="lbl-roicalculator-initial-investment" className={labelCls}>Initial Investment ($)</label>
          <input id="lbl-roicalculator-initial-investment" aria-label="Initial Investment ($)" className={inputCls} type="number" value={initial} onChange={e => setInitial(Math.max(0, parseFloat(e.target.value) || 0))} />
        </div>
        <div>
          <label htmlFor="lbl-roicalculator-final-value" className={labelCls}>Final Value ($)</label>
          <input id="lbl-roicalculator-final-value" aria-label="Final Value ($)" className={inputCls} type="number" value={final} onChange={e => setFinal(Math.max(0, parseFloat(e.target.value) || 0))} />
        </div>
      </div>
    </CalculatorShell>
  );
}
