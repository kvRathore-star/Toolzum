"use client";
import React, { useState } from 'react';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6">
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

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="Calorie Tracker">
        <div className="flex flex-wrap gap-1 mb-3">
          {Object.entries(COMMON_FOODS).map(([name, cal]) => (
            <button key={name} onClick={() => { setFood(name); setCalories(cal); }}
              className="px-2 py-1 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700">{name} ({cal})</button>
          ))}
        </div>
        <div className="flex gap-2 mb-3">
          <input type="text" value={food} onChange={e => setFood(e.target.value)} placeholder="Food name"
            className="flex-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          <input type="number" value={calories || ''} onChange={e => setCalories(Number(e.target.value))} placeholder="Cal"
            className="w-24 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          <button onClick={addFood} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all">+ Add</button>
        </div>
        {entries.length > 0 && (
          <div>
            <div className="space-y-1 max-h-48 overflow-y-auto mb-2">
              {entries.map((e, i) => (
                <div key={i} className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <span>{e.food}</span>
                  <span className="font-mono">{e.cal} kcal</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-zinc-200 dark:border-zinc-700">
              <span className="text-sm font-bold text-zinc-900 dark:text-white">Total: {total} kcal</span>
              <button onClick={clearLog} className="text-xs text-red-500 hover:underline">Clear</button>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

export function WaistToHipRatioCalculator() {
  const [waist, setWaist] = useState(80);
  const [hip, setHip] = useState(95);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [ratio, setRatio] = useState<number | null>(null);

  const calculate = () => {
    if (hip <= 0) return;
    setRatio(Math.round((waist / hip) * 100) / 100);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <Section title="Waist-to-Hip Ratio Calculator">
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Waist (cm)</label>
            <input type="number" value={waist} onChange={e => setWaist(Number(e.target.value))}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Hip (cm)</label>
            <input type="number" value={hip} onChange={e => setHip(Number(e.target.value))}
              className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setGender('male')} className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${gender === 'male' ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>Male</button>
          <button onClick={() => setGender('female')} className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${gender === 'female' ? 'bg-blue-600 text-white shadow-sm' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'}`}>Female</button>
        </div>
        <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Calculate WHR</button>
        {ratio !== null && (
          <div className="mt-4 p-4 bg-zinc-100 dark:bg-zinc-800 rounded-xl text-center">
            <div className="text-3xl font-bold text-zinc-900 dark:text-white">{ratio}</div>
            <div className={`text-xs font-medium mt-1 ${gender === 'male' ? (ratio < 0.9 ? 'text-emerald-500' : ratio < 1.0 ? 'text-yellow-500' : 'text-red-500') : (ratio < 0.8 ? 'text-emerald-500' : ratio < 0.85 ? 'text-yellow-500' : 'text-red-500')}`}>
              {gender === 'male'
                ? (ratio < 0.9 ? 'Low risk' : ratio < 1.0 ? 'Moderate risk' : 'High risk')
                : (ratio < 0.8 ? 'Low risk' : ratio < 0.85 ? 'Moderate risk' : 'High risk')}
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

