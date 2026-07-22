"use client";
import React, { useState } from 'react';
import { Activity } from 'lucide-react';

type UnitSystem = 'metric' | 'imperial';

export default function BmiCalculator() {
  const [unit, setUnit] = useState<UnitSystem>('metric');
  const [weightKg, setWeightKg] = useState(70);
  const [heightCm, setHeightCm] = useState(170);
  const [weightLbs, setWeightLbs] = useState(154);
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(9);

  const heightM = heightCm / 100;
  const bmi = heightM > 0 ? weightKg / (heightM * heightM) : 0;

  let category = 'Normal';
  let color = 'text-emerald-500';
  if (bmi < 18.5) {
    category = 'Underweight';
    color = 'text-amber-500';
  } else if (bmi >= 25 && bmi < 29.9) {
    category = 'Overweight';
    color = 'text-orange-500';
  } else if (bmi >= 30) {
    category = 'Obese';
    color = 'text-red-500';
  }

  const minHealthy = heightCm > 0 ? (18.5 * heightM * heightM).toFixed(1) : '—';
  const maxHealthy = heightCm > 0 ? (24.9 * heightM * heightM).toFixed(1) : '—';
  const minHealthyImp = heightCm > 0 ? (parseFloat(minHealthy) * 2.20462).toFixed(0) : '—';
  const maxHealthyImp = heightCm > 0 ? (parseFloat(maxHealthy) * 2.20462).toFixed(0) : '—';

  const switchToMetric = () => {
    setWeightKg(Math.round(parseFloat(weightLbs.toString()) * 0.453592));
    setHeightCm(Math.round((parseFloat(heightFt.toString()) * 30.48) + (parseFloat(heightIn.toString()) * 2.54)));
    setUnit('metric');
  };

  const switchToImperial = () => {
    setWeightLbs(Math.round(parseFloat(weightKg.toString()) * 2.20462));
    const totalInches = Math.round(parseFloat(heightCm.toString()) * 0.393701);
    setHeightFt(Math.floor(totalInches / 12));
    setHeightIn(totalInches % 12);
    setUnit('imperial');
  };

  const onWeightKgChange = (val: number) => {
    setWeightKg(val);
    if (unit === 'metric') setWeightLbs(Math.round(val * 2.20462));
  };

  const onHeightCmChange = (val: number) => {
    setHeightCm(val);
    if (unit === 'metric') {
      const totalInches = Math.round(val * 0.393701);
      setHeightFt(Math.floor(totalInches / 12));
      setHeightIn(totalInches % 12);
    }
  };

  const onWeightLbsChange = (val: number) => {
    setWeightLbs(val);
    if (unit === 'imperial') setWeightKg(Math.round(val * 0.453592));
  };

  const onHeightImperialChange = (ft: number, inches: number) => {
    setHeightFt(ft);
    setHeightIn(inches);
    if (unit === 'imperial') setHeightCm(Math.round((ft * 30.48) + (inches * 2.54)));
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-rose-500" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">BMI Calculator</h3>
        </div>
        <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
          <button onClick={switchToMetric} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${unit === 'metric' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>Metric</button>
          <button onClick={switchToImperial} className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${unit === 'imperial' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>US/Imperial</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {unit === 'metric' ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Weight (kg)</label>
                <input type="number" value={weightKg} onChange={e => onWeightKgChange(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
                <input type="range" min="30" max="150" value={weightKg} onChange={e => onWeightKgChange(parseInt(e.target.value))} className="w-full accent-rose-500 mt-1" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Height (cm)</label>
                <input type="number" value={heightCm} onChange={e => onHeightCmChange(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
                <input type="range" min="100" max="220" value={heightCm} onChange={e => onHeightCmChange(parseInt(e.target.value))} className="w-full accent-rose-500 mt-1" />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Weight (lbs)</label>
                <input type="number" value={weightLbs} onChange={e => onWeightLbsChange(Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" />
                <input type="range" min="70" max="330" value={weightLbs} onChange={e => onWeightLbsChange(parseInt(e.target.value))} className="w-full accent-rose-500 mt-1" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Height</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input type="number" value={heightFt} onChange={e => onHeightImperialChange(Math.max(0, parseInt(e.target.value) || 0), heightIn)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" placeholder="ft" />
                    <div className="text-[10px] text-zinc-400 mt-1 text-center">ft</div>
                  </div>
                  <div className="flex-1">
                    <input type="number" value={heightIn} onChange={e => onHeightImperialChange(heightFt, Math.max(0, parseInt(e.target.value) || 0))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white text-sm outline-none" placeholder="in" />
                    <div className="text-[10px] text-zinc-400 mt-1 text-center">in</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-zinc-50 dark:bg-black/30 rounded-2xl p-6 border border-zinc-100 dark:border-zinc-800 flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase mb-4">Body Mass Index</h4>
            <p className="text-5xl font-extrabold text-[var(--text-secondary)] dark:text-white">{bmi.toFixed(1)}</p>
          </div>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-6 space-y-3">
            <div>
              <span className="text-xs text-zinc-400">Classification</span>
              <p className={`text-2xl font-bold ${color}`}>{category}</p>
            </div>
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <span className="text-xs text-zinc-400">Healthy BMI Range (18.5–24.9)</span>
              <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                {unit === 'metric' ? `${minHealthy} – ${maxHealthy} kg` : `${minHealthyImp} – ${maxHealthyImp} lbs`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}