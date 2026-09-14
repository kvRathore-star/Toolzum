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
  const [initial, setInitial] = useState('10000');
  const [final, setFinal] = useState('15000');

  const init = parseFloat(initial);
  const fin = parseFloat(final);
  const valid = Number.isFinite(init) && Number.isFinite(fin) && init > 0 && fin >= 0;
  const gain = valid ? fin - init : 0;
  const roi = valid ? (gain / init) * 100 : 0;
  const result = valid ? `${roi.toFixed(2)}% ROI` : 'Enter investment and final value';

  const csvContent = valid ? `Metric,Value\nInitial Investment,${init}\nFinal Value,${fin}\nNet Gain,${gain}\nROI,${roi.toFixed(2)}%` : '';

  return (
    <CalculatorShell
      category="Finance"
      title="ROI Calculator"
      accent="emerald"
      result={result}
      auto
      presets={PRESETS.map(p => ({ label: p.name, apply: () => { setInitial(String(p.initial)); setFinal(String(p.final)); } }))}
      resultStats={[
        { label: 'Net Return Gain', value: valid ? `$${gain.toFixed(2)}` : '—', color: gain >= 0 ? 'text-emerald-500' : 'text-red-500' },
        { label: 'Total Return', value: valid ? `$${fin.toLocaleString()} from $${init.toLocaleString()}` : '—' },
      ]}
      resultLabel="Return on Investment (ROI)"
      downloadData={csvContent}
      downloadFilename="roi-calculation.csv"
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="lbl-roicalculator-initial-investment" className={labelCls}>Initial Investment ($)</label>
          <input id="lbl-roicalculator-initial-investment" aria-label="Initial Investment ($)" className={inputCls} type="number" value={initial} onChange={e => setInitial(e.target.value)} />
        </div>
        <div>
          <label htmlFor="lbl-roicalculator-final-value" className={labelCls}>Final Value ($)</label>
          <input id="lbl-roicalculator-final-value" aria-label="Final Value ($)" className={inputCls} type="number" value={final} onChange={e => setFinal(e.target.value)} />
        </div>
      </div>
    </CalculatorShell>
  );
}
