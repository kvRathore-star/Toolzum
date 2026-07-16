"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Heart, Scale, Dumbbell, Apple } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'bmi' | 'bmr' | 'calories' | 'body';

export default function HealthToolkit() {
  const [tab, setTab] = useState<Tab>('bmi');

  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="bmi" label="BMI Calculator" icon={Scale} />
        <TabBtn v="bmr" label="BMR Calculator" icon={Heart} />
        <TabBtn v="calories" label="Calorie Tracker" icon={Apple} />
        <TabBtn v="body" label="Body Metrics" icon={Dumbbell} />
      </div>
      {tab === 'bmi' && <BmiCalculator />}
      {tab === 'bmr' && <BmrCalculator />}
      {tab === 'calories' && <CalorieTracker />}
      {tab === 'body' && <BodyMetrics />}
    </div>
  );
}

function BmiCalculator() {
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [bmi, setBmi] = useState<number | null>(null);

  const calculate = () => {
    if (height <= 0 || weight <= 0) { toast.error('Enter valid values'); return; }
    const hM = height / 100;
    const val = weight / (hM * hM);
    setBmi(Math.round(val * 10) / 10);
  };

  const getCategory = (v: number) => {
    if (v < 18.5) return { label: 'Underweight', color: 'text-blue-500' };
    if (v < 25) return { label: 'Normal', color: 'text-emerald-500' };
    if (v < 30) return { label: 'Overweight', color: 'text-yellow-500' };
    return { label: 'Obese', color: 'text-red-500' };
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Height (cm)</label>
          <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
          <input type="range" min={100} max={250} value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full mt-1" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Weight (kg)</label>
          <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
          <input type="range" min={30} max={200} value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full mt-1" />
        </div>
      </div>
      <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Calculate BMI</button>
      {bmi !== null && (
        <div className="text-center py-4 bg-zinc-50 dark:bg-black rounded-xl">
          <div className="text-3xl font-bold text-zinc-900 dark:text-white">{bmi}</div>
          <div className={getCategory(bmi).color + ' text-sm font-medium'}>{getCategory(bmi).label}</div>
        </div>
      )}
    </div>
  );
}

function BmrCalculator() {
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [bmrWeight, setBmrWeight] = useState(70);
  const [bmrHeight, setBmrHeight] = useState(170);
  const [bmrResult, setBmrResult] = useState<number | null>(null);

  const calculate = () => {
    if (!age || !bmrWeight || !bmrHeight) { toast.error('Fill all fields'); return; }
    const bmr = gender === 'male'
      ? 88.362 + (13.397 * bmrWeight) + (4.799 * bmrHeight) - (5.677 * age)
      : 447.593 + (9.247 * bmrWeight) + (3.098 * bmrHeight) - (4.330 * age);
    setBmrResult(Math.round(bmr));
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Age</label>
          <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Gender</label>
          <div className="flex gap-2">
            <button onClick={() => setGender('male')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${gender === 'male' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>Male</button>
            <button onClick={() => setGender('female')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${gender === 'female' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>Female</button>
          </div>
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Weight (kg)</label>
          <input type="number" value={bmrWeight} onChange={e => setBmrWeight(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </div>
        <div>
          <label className="text-xs text-zinc-500 block mb-1">Height (cm)</label>
          <input type="number" value={bmrHeight} onChange={e => setBmrHeight(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
        </div>
      </div>
      <button onClick={calculate} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Calculate BMR</button>
      {bmrResult !== null && (
        <div className="text-center py-4 bg-zinc-50 dark:bg-black rounded-xl">
          <div className="text-3xl font-bold text-zinc-900 dark:text-white">{bmrResult}</div>
          <div className="text-xs text-zinc-500">kcal/day (Basal Metabolic Rate)</div>
        </div>
      )}
    </div>
  );
}

function CalorieTracker() {
  const [food, setFood] = useState('');
  const [calories, setCalories] = useState(0);
  const [total, setTotal] = useState(0);
  const [entries, setEntries] = useState<{ food: string; cal: number }[]>([]);

  const COMMON_FOODS: Record<string, number> = {
    'Rice (1 cup)': 206, 'Chicken breast (100g)': 165, 'Egg (1)': 78, 'Apple': 95,
    'Banana': 105, 'Bread (1 slice)': 75, 'Milk (1 cup)': 149, 'Pasta (1 cup)': 220,
  };

  const addFood = () => {
    if (!food.trim()) { toast.error('Enter food name'); return; }
    if (calories <= 0) { toast.error('Enter calories'); return; }
    setEntries(prev => [...prev, { food: food.trim(), cal: calories }]);
    setTotal(prev => prev + calories);
    setFood(''); setCalories(0);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
      <div className="flex flex-wrap gap-1">
        {Object.entries(COMMON_FOODS).map(([name, cal]) => (
          <button key={name} onClick={() => { setFood(name); setCalories(cal); }}
            className="px-2 py-1 text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700">{name} ({cal})</button>
        ))}
      </div>
      <div className="flex gap-2">
        <input type="text" value={food} onChange={e => setFood(e.target.value)} placeholder="Food name"
          className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
        <input type="number" value={calories || ''} onChange={e => setCalories(Number(e.target.value))} placeholder="Cal"
          className="w-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
        <button onClick={addFood} className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-xl">+ Add</button>
      </div>
      {entries.length > 0 && (
        <div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {entries.map((e, i) => (
              <div key={i} className="flex justify-between text-xs text-zinc-600 dark:text-zinc-400 px-2 py-1 bg-zinc-50 dark:bg-black rounded-lg">
                <span>{e.food}</span>
                <span className="font-mono">{e.cal} kcal</span>
              </div>
            ))}
          </div>
          <div className="text-right text-sm font-bold text-zinc-900 dark:text-white mt-2 pt-2 border-t border-zinc-200 dark:border-white/10">
            Total: {total} kcal
          </div>
        </div>
      )}
    </div>
  );
}

function BodyMetrics() {
  const [waist, setWaist] = useState(80);
  const [hip, setHip] = useState(95);
  const [ratio, setRatio] = useState<number | null>(null);
  const [bodyFat, setBodyFat] = useState<number | null>(null);
  const [bfAge, setBfAge] = useState(30);
  const [bfGender, setBfGender] = useState<'male' | 'female'>('male');
  const [bfBmi, setBfBmi] = useState(24);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Waist-to-Hip Ratio</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Waist (cm)</label>
            <input type="number" value={waist} onChange={e => setWaist(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Hip (cm)</label>
            <input type="number" value={hip} onChange={e => setHip(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
        </div>
        <button onClick={() => { if (hip > 0) setRatio(Math.round((waist / hip) * 100) / 100); else toast.error('Hip must be > 0'); }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Calculate</button>
        {ratio !== null && (
          <div className="text-center py-2 bg-zinc-50 dark:bg-black rounded-xl">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{ratio}</div>
            <div className={`text-xs font-medium ${ratio < 0.9 ? 'text-emerald-500' : ratio < 1.0 ? 'text-yellow-500' : 'text-red-500'}`}>
              {ratio < 0.9 ? 'Low risk' : ratio < 1.0 ? 'Moderate risk' : 'High risk'}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
        <h4 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Body Fat Estimate</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">BMI</label>
            <input type="number" value={bfBmi} onChange={e => setBfBmi(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Age</label>
            <input type="number" value={bfAge} onChange={e => setBfAge(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500" />
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setBfGender('male')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${bfGender === 'male' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>Male</button>
          <button onClick={() => setBfGender('female')} className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${bfGender === 'female' ? 'bg-blue-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>Female</button>
        </div>
        <button onClick={() => {
          const bf = bfGender === 'male' ? (1.20 * bfBmi) + (0.23 * bfAge) - 16.2 : (1.20 * bfBmi) + (0.23 * bfAge) - 5.4;
          setBodyFat(Math.round(bf * 10) / 10);
        }} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Estimate</button>
        {bodyFat !== null && (
          <div className="text-center py-2 bg-zinc-50 dark:bg-black rounded-xl">
            <div className="text-2xl font-bold text-zinc-900 dark:text-white">{bodyFat}%</div>
            <div className="text-xs text-zinc-500">Estimated body fat</div>
          </div>
        )}
      </div>
    </div>
  );
}
