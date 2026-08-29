"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function CalorieCalculator() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [age, setAge] = useState('30');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');
  const [activity, setActivity] = useState('1.55');
  const [goal, setGoal] = useState('maintain');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 30;
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const act = parseFloat(activity) || 1.55;
    if (!w || !h) { setResult(''); return; }
    let bmr: number;
    if (gender === 'male') bmr = 10 * w + 6.25 * h - 5 * a + 5;
    else bmr = 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * act;
    let goalCals = tdee;
    if (goal === 'lose') goalCals = tdee - 500;
    else if (goal === 'gain') goalCals = tdee + 500;
    setResult(`BMR: ${Math.round(bmr)} kcal\nTDEE: ${Math.round(tdee)} kcal\n${goal === 'maintain' ? 'Maintenance' : goal === 'lose' ? 'Weight loss (-0.5kg/wk)' : 'Weight gain (+0.5kg/wk)'}: ${Math.round(goalCals)} kcal`);
  }, [gender, age, weight, height, activity, goal]);
  return (
    <CalculatorShell
      title="Calorie Calculator (TDEE)"
      accent="emerald"
      result={result}
      onCalculate={calc}
      presets={[
        { label: 'Avg Male', apply: () => { setGender('male'); setAge('30'); setWeight('70'); setHeight('170'); setActivity('1.55'); setGoal('maintain'); } },
        { label: 'Avg Female', apply: () => { setGender('female'); setAge('30'); setWeight('60'); setHeight('165'); setActivity('1.55'); setGoal('maintain'); } },
        { label: 'Active Male', apply: () => { setGender('male'); setAge('25'); setWeight('80'); setHeight('180'); setActivity('1.725'); setGoal('lose'); } },
      ]}
      downloadData={`Gender,Age,Weight,Height,Activity,Goal,Result\n${gender},${age},${weight},${height},${activity},${goal},${result.replace(/\n/g, ' | ')}`}
      downloadFilename="calorie-tdee.csv"
    >
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Age</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Activity level</label><select className={inputCls} value={activity} onChange={e => setActivity(e.target.value)}><option value="1.2">Sedentary</option><option value="1.375">Light (1-3 days)</option><option value="1.55">Moderate (3-5 days)</option><option value="1.725">Very active (6-7 days)</option><option value="1.9">Extra active</option></select></div>
        <div><label className={labelCls}>Goal</label><select className={inputCls} value={goal} onChange={e => setGoal(e.target.value)}><option value="lose">Lose weight</option><option value="maintain">Maintain</option><option value="gain">Gain weight</option></select></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('30'); setWeight('70'); setHeight('170'); setGender('male'); }}>Avg Male</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('30'); setWeight('60'); setHeight('165'); setGender('female'); }}>Avg Female</button>
      </div>
    </CalculatorShell>
  );
}
