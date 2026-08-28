"use client";
import React, { useState, useMemo } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { Heart } from 'lucide-react';

const labelCls = "text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider";
const inputCls = "w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

const COMMON_FOODS: Record<string, number> = {
  'Rice (1 cup)': 206, 'Chicken breast (100g)': 165, 'Egg (1)': 78, 'Apple': 95,
  'Banana': 105, 'Bread (1 slice)': 75, 'Milk (1 cup)': 149, 'Pasta (1 cup)': 220,
};

export function CalorieTracker() {
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState(0);
  const [total, setTotal] = useState(0);
  const [entries, setEntries] = useState<{ food: string; cal: number }[]>([]);

  const addFood = () => {
    if (!food.trim() || calories <= 0) return;
    setEntries(prev => [...prev, { food: food.trim(), cal: calories }]);
    setTotal(prev => prev + calories);
    setFood(''); setCalories(0);
  };

  const clearLog = () => { setEntries([]); setTotal(0); };

  const presets = Object.entries(COMMON_FOODS).map(([name, cal]) => ({
    label: name,
    apply: () => { setFood(name); setCalories(cal); },
  }));

  const customResult = entries.length > 0 ? (
    <div className="space-y-3">
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {entries.map((e, i) => (
          <div key={i} className="flex justify-between text-xs text-[var(--text-muted)] px-3 py-2 bg-[var(--bg-overlay)] rounded-lg">
            <span>{e.food}</span>
            <span className="font-mono">{e.cal} kcal</span>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center pt-2 border-t border-[var(--border-subtle)]">
        <span className="text-sm font-bold text-[var(--text-primary)]">Total: {total} kcal</span>
        <button onClick={clearLog} className="text-xs text-red-500 hover:underline">Clear</button>
      </div>
    </div>
  ) : (
    <p className="text-sm text-[var(--text-muted)]">No entries yet. Add food items to track your intake.</p>
  );

  return (
    <CalculatorShell
      title="Calorie Tracker"
      icon={<Heart className="w-5 h-5" />}
      result={`${total}`}
      onCalculate={addFood}
      calculateLabel="+ Add"
      presets={presets}
      resultStats={[
        { label: 'Total Calories', value: `${total} kcal` },
        { label: 'Items Logged', value: String(entries.length) },
      ]}
      resultLabel="Daily Intake"
      accent="rose"
      customResult={customResult}
    >
      <div className="space-y-4">
        <div>
          <label className={labelCls}>Food Name</label>
          <input type="text" value={food} onChange={e => setFood(e.target.value)} placeholder="e.g. Chicken breast" className={`${inputCls} mt-2`} />
        </div>
        <div>
          <label className={labelCls}>Calories</label>
          <input type="number" value={calories || ''} onChange={e => setCalories(Number(e.target.value))} placeholder="0" className={`${inputCls} mt-2`} />
        </div>
      </div>
    </CalculatorShell>
  );
}

export function WaistToHipRatioCalculator() {
  const [waist, setWaist] = useState(80);
  const [hip, setHip] = useState(95);
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const ratio = useMemo(() => {
    if (hip <= 0) return null;
    return Math.round((waist / hip) * 100) / 100;
  }, [waist, hip]);

  const riskLevel = useMemo(() => {
    if (ratio === null) return '—';
    if (gender === 'male') {
      return ratio < 0.9 ? 'Low risk' : ratio < 1.0 ? 'Moderate risk' : 'High risk';
    }
    return ratio < 0.8 ? 'Low risk' : ratio < 0.85 ? 'Moderate risk' : 'High risk';
  }, [ratio, gender]);

  const riskColor = useMemo(() => {
    if (riskLevel === 'Low risk') return 'text-emerald-500';
    if (riskLevel === 'Moderate risk') return 'text-yellow-500';
    return 'text-red-500';
  }, [riskLevel]);

  const presets = [
    { label: 'Male Average', apply: () => { setWaist(90); setHip(100); setGender('male'); } },
    { label: 'Female Average', apply: () => { setWaist(80); setHip(95); setGender('female'); } },
    { label: 'Male Athlete', apply: () => { setWaist(75); setHip(95); setGender('male'); } },
    { label: 'Female Athlete', apply: () => { setWaist(68); setHip(90); setGender('female'); } },
  ];

  return (
    <CalculatorShell
      title="Waist-to-Hip Ratio"
      icon={<Heart className="w-5 h-5" />}
      result={ratio !== null ? String(ratio) : ''}
      onCalculate={() => {}}
      calculateLabel="Calculate WHR"
      presets={presets}
      resultStats={[
        { label: 'WHR Ratio', value: ratio !== null ? String(ratio) : '—' },
        { label: 'Risk Level', value: riskLevel, color: riskColor },
      ]}
      resultLabel="Waist-to-Hip Ratio"
      accent="rose"
      customResult={
        ratio !== null ? (
          <div className="text-center">
            <div className="text-4xl font-extrabold text-[var(--text-primary)]">{ratio}</div>
            <div className={`text-sm font-medium mt-2 ${riskColor}`}>{riskLevel}</div>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Enter measurements to calculate your ratio.</p>
        )
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Waist (cm)</label>
            <input type="number" value={waist} onChange={e => setWaist(Number(e.target.value))} className={`${inputCls} mt-2`} />
          </div>
          <div>
            <label className={labelCls}>Hip (cm)</label>
            <input type="number" value={hip} onChange={e => setHip(Number(e.target.value))} className={`${inputCls} mt-2`} />
          </div>
        </div>
        <div>
          <label className={labelCls}>Gender</label>
          <div className="flex gap-2 mt-2">
            <button onClick={() => setGender('male')} className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all border ${gender === 'male' ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30' : 'bg-[var(--bg-overlay)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'}`}>Male</button>
            <button onClick={() => setGender('female')} className={`flex-1 py-2.5 text-sm font-semibold rounded-xl transition-all border ${gender === 'female' ? 'bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-500/30' : 'bg-[var(--bg-overlay)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'}`}>Female</button>
          </div>
        </div>
      </div>
    </CalculatorShell>
  );
}
