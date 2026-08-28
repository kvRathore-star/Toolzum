"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Heart } from 'lucide-react';
import { inputCls, labelCls } from '../Calculators.shared';

export default function WaterIntakeCalculator() {
  const [weight, setWeight] = useState('70');
  const [activity, setActivity] = useState('30');
  const [climate, setClimate] = useState('moderate');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const act = parseFloat(activity) || 0;
    if (!w) { setResult(''); return; }
    const baseMl = w * 35;
    const actMl = Math.round(act * 12);
    const climateFactor = climate === 'hot' ? 1.3 : climate === 'cold' ? 0.9 : 1;
    const total = Math.round((baseMl + actMl) * climateFactor);
    setResult(`Base: ${Math.round(baseMl)} mL\nActivity: +${actMl} mL\nClimate factor: ${climateFactor}x\nTotal: ${total} mL (${(total / 1000).toFixed(1)} L)\nCups (8oz): ${Math.round(total / 240)}`);
  }, [weight, activity, climate]);
  return (
    <CalculatorShell
      title="Water Intake Calculator"
      icon={<Heart className="w-5 h-5" />}
      accent="sky"
      result={result}
      onCalculate={calc}
      presets={[
        { label: 'Avg adult', apply: () => { setWeight('70'); setActivity('30'); setClimate('moderate'); } },
        { label: 'Active / hot', apply: () => { setWeight('80'); setActivity('60'); setClimate('hot'); } },
        { label: 'Sedentary / cold', apply: () => { setWeight('65'); setActivity('10'); setClimate('cold'); } },
      ]}
      downloadData={`Weight,ExerciseMin,Climate,Result\n${weight},${activity},${climate},${result.replace(/\n/g, ' | ')}`}
      downloadFilename="water-intake.csv"
    >
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Exercise (min/day)</label><input className={inputCls} type="number" value={activity} onChange={e => setActivity(e.target.value)} /></div>
        <div><label className={labelCls}>Climate</label><select className={inputCls} value={climate} onChange={e => setClimate(e.target.value)}><option value="moderate">Moderate</option><option value="hot">Hot / humid</option><option value="cold">Cold</option></select></div>
      </div>
    </CalculatorShell>
  );
}
