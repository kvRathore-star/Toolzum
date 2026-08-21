"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Copy, Delete } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { CalculatorShell } from './shared/CalculatorShell';
import { gradePointsMap, gcd, factorial, inputCls, labelCls, btnCls } from './Calculators.shared';

export function BmiCalculatorForKids() {
  const [age, setAge] = useState('10');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [height, setHeight] = useState('140');
  const [weight, setWeight] = useState('35');
  const [result, setResult] = useState('');
  const [category, setCategory] = useState('');
  const [percentile, setPercentile] = useState(0);
  const calc = useCallback(() => {
    const a = parseFloat(age) || 0;
    const h = parseFloat(height) || 0;
    const w = parseFloat(weight) || 0;
    if (!a || !h || !w) { setResult('Please fill all fields.'); return; }
    const bmi = w / ((h / 100) ** 2);
    const bmiRounded = Math.round(bmi * 10) / 10;
    const medianBmi: Record<string, Record<number, number>> = { male: { 2:15.5,5:15.4,8:16.2,10:17.0,12:18.0,14:19.5,16:21.0,18:22.5 }, female: { 2:15.3,5:15.2,8:16.3,10:17.2,12:18.5,14:19.8,16:21.2,18:22.3 } };
    const ages = Object.keys(medianBmi[gender]).map(Number);
    const closest = ages.reduce((prev, curr) => Math.abs(curr - a) < Math.abs(prev - a) ? curr : prev);
    const median = medianBmi[gender][closest];
    const pct = median ? Math.round((1 - (Math.abs(bmi - median) / (median * 0.3))) * 100) : 50;
    const clamped = Math.max(1, Math.min(99, pct));
    setPercentile(clamped);
    let cat = '';
    if (bmiRounded < 14.5) cat = 'Underweight';
    else if (bmiRounded < 18.5) cat = 'Normal weight';
    else if (bmiRounded < 25) cat = 'Overweight';
    else cat = 'Obese';
    setCategory(cat);
    setResult(bmiRounded.toString());
  }, [age, gender, height, weight]);
  return (
    <CalculatorShell title="BMI Calculator for Kids (2-18)" accent="cyan" result={result} onCalculate={calc}>
      <div className="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Age (years)</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
          <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
          <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
          <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        </div>
        <div className="flex gap-3 mt-3">
          <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('8'); setHeight('128'); setWeight('25'); }}>Age 8 (Boy)</button>
          <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('12'); setHeight('150'); setWeight('42'); }}>Age 12 (Girl)</button>
        </div>
        {result && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">BMI</div>
              <div className="text-2xl font-bold text-cyan-700 dark:text-cyan-400">{result}</div>
            </div>
            <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Category</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">{category}</div>
            </div>
            <div className="col-span-2 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <div className="text-xs text-[var(--text-tertiary)] mb-2">Estimated Percentile: {percentile}th</div>
              <div className="w-full bg-[var(--bg-overlay)] rounded-full h-3">
                <div className="h-3 rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all" style={{ width: `${percentile}%` }} />
              </div>
              <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1"><span>Underweight</span><span>Normal</span><span>Overweight</span></div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

export function BodyFatPercentageCalculator() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [weight, setWeight] = useState('80');
  const [waist, setWaist] = useState('90');
  const [neck, setNeck] = useState('40');
  const [hip, setHip] = useState('100');
  const [result, setResult] = useState('');
  const [category, setCategory] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const wa = parseFloat(waist) || 0;
    const n = parseFloat(neck) || 0;
    const h = parseFloat(hip) || 0;
    if (!w || !wa || !n) { setResult('Please fill required fields.'); return; }
    let bf: number;
    if (gender === 'male') {
      bf = 495 / (1.0324 - 0.19077 * Math.log10(wa - n) + 0.15456 * Math.log10(w)) - 450;
    } else {
      if (!h) { setResult('Hip measurement required for female.'); return; }
      bf = 495 / (1.29579 - 0.35004 * Math.log10(wa + h - n) + 0.22100 * Math.log10(w)) - 450;
    }
    const rounded = Math.round(bf * 10) / 10;
    setResult(rounded.toString());
    let cat = '';
    if (gender === 'male') {
      if (rounded < 6) cat = 'Essential fat';
      else if (rounded < 14) cat = 'Athletes';
      else if (rounded < 18) cat = 'Fitness';
      else if (rounded < 25) cat = 'Acceptable';
      else cat = 'Obese';
    } else {
      if (rounded < 14) cat = 'Essential fat';
      else if (rounded < 21) cat = 'Athletes';
      else if (rounded < 25) cat = 'Fitness';
      else if (rounded < 32) cat = 'Acceptable';
      else cat = 'Obese';
    }
    setCategory(cat);
  }, [gender, weight, waist, neck, hip]);
  return (
    <CalculatorShell title="Body Fat Percentage" accent="rose" result={result} onCalculate={calc}>
      <div className="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
          <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
          <div><label className={labelCls}>Waist (cm)</label><input className={inputCls} type="number" value={waist} onChange={e => setWaist(e.target.value)} /></div>
          <div><label className={labelCls}>Neck (cm)</label><input className={inputCls} type="number" value={neck} onChange={e => setNeck(e.target.value)} /></div>
          <div className={gender === 'female' ? '' : 'opacity-50'}><label className={labelCls}>Hip (cm, female)</label><input className={inputCls} type="number" value={hip} onChange={e => setHip(e.target.value)} disabled={gender === 'male'} /></div>
        </div>
        {result && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Body Fat</div>
              <div className="text-2xl font-bold text-rose-700 dark:text-rose-400">{result}%</div>
            </div>
            <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Category</div>
              <div className="text-lg font-bold text-[var(--text-primary)]">{category}</div>
            </div>
            <div className="col-span-2 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4">
              <div className="text-xs text-[var(--text-tertiary)] mb-2">Body Fat Indicator</div>
              <div className="w-full bg-[var(--bg-overlay)] rounded-full h-3">
                <div className={`h-3 rounded-full transition-all ${parseFloat(result) > 25 ? 'bg-red-500' : parseFloat(result) > 18 ? 'bg-yellow-500' : parseFloat(result) > 14 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, Math.max(5, parseFloat(result) * 2.5))}%` }} />
              </div>
              <div className="flex justify-between text-xs text-[var(--text-tertiary)] mt-1"><span>Essential</span><span>Fitness</span><span>Acceptable</span><span>Obese</span></div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}

export function BodySurfaceAreaCalculator() {
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [unit, setUnit] = useState<'metric'|'imperial'>('metric');
  const [result, setResult] = useState<{m2: number; formula: string; value: number}[]>([]);
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (!w || !h) { setResult([]); return; }
    const wKg = unit === 'imperial' ? w * 0.453592 : w;
    const hCm = unit === 'imperial' ? h * 2.54 : h;
    const formulas = [
      { name: 'Mosteller', calc: Math.sqrt(wKg * hCm / 3600) },
      { name: 'Du Bois', calc: 0.007184 * Math.pow(wKg, 0.425) * Math.pow(hCm, 0.725) },
      { name: 'Haycock', calc: 0.024265 * Math.pow(wKg, 0.5378) * Math.pow(hCm, 0.3964) },
      { name: 'Gehan & George', calc: 0.0235 * Math.pow(wKg, 0.51456) * Math.pow(hCm, 0.42246) },
    ];
    setResult(formulas.map(f => ({ m2: Math.round(f.calc * 100) / 100, formula: f.name, value: Math.round(f.calc * 100) / 100 })));
  }, [weight, height, unit]);
  return (
    <CalculatorShell title="Body Surface Area (BSA)" accent="emerald" result={result.length > 0 ? `Avg: ${(result.reduce((s, r) => s + r.m2, 0) / result.length).toFixed(2)} m²` : ''} onCalculate={calc}>
      <div className="max-w-xl">
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Unit</label><select className={inputCls} value={unit} onChange={e => setUnit(e.target.value as 'metric'|'imperial')}><option value="metric">Metric (kg/cm)</option><option value="imperial">Imperial (lb/in)</option></select></div>
          <div><label className={labelCls}>{unit === 'metric' ? 'Weight (kg)' : 'Weight (lb)'}</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
          <div><label className={labelCls}>{unit === 'metric' ? 'Height (cm)' : 'Height (in)'}</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        </div>
        <div className="flex gap-3 mt-3">
          <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('70'); setHeight('170'); }}>Adult (70kg/170cm)</button>
          <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('85'); setHeight('180'); }}>Adult (85kg/180cm)</button>
        </div>
        {result.length > 0 && (
          <div className="mt-6 grid gap-3">
            {result.map((r, i) => {
              const styles = [
                { bg: 'bg-emerald-700/10 border border-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400' },
                { bg: 'bg-blue-500/10 border border-blue-500/20', text: 'text-blue-700 dark:text-blue-400' },
                { bg: 'bg-violet-500/10 border border-violet-500/20', text: 'text-violet-700 dark:text-violet-400' },
                { bg: 'bg-amber-500/10 border border-amber-500/20', text: 'text-amber-700 dark:text-amber-400' },
              ];
              const s = styles[i] || styles[0];
              return (
                <div key={i} className={`flex items-center justify-between ${s.bg} rounded-xl p-4`}>
                  <span className="text-sm font-bold text-[var(--text-primary)]">{r.formula}</span>
                  <span className={`text-xl font-bold ${s.text} font-mono`}>{r.m2} m²</span>
                </div>
              );
            })}
            <div className="bg-emerald-700/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <div className="text-xs text-[var(--text-tertiary)]">Average of all formulas</div>
              <div className="text-2xl font-bold text-emerald-700 dark:text-emerald-400">{(result.reduce((s, r) => s + r.m2, 0) / result.length).toFixed(2)} m²</div>
            </div>
          </div>
        )}
      </div>
    </CalculatorShell>
  );
}


export function BabyFormulaCalculator() {
  const [age, setAge] = useState('3');
  const [weight, setWeight] = useState('6');
  const [feedsPerDay, setFeedsPerDay] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 0;
    const w = parseFloat(weight) || 0;
    const feeds = parseFloat(feedsPerDay) || 8;
    let dailyMl: number;
    if (a <= 0.5) dailyMl = w * 150;
    else if (a <= 3) dailyMl = w * 135;
    else if (a <= 6) dailyMl = w * 120;
    else if (a <= 12) dailyMl = w * 100;
    else dailyMl = w * 90;
    const perFeed = dailyMl / feeds;
    setResult(`Daily: ${Math.round(dailyMl)} mL (${(dailyMl * 0.0338).toFixed(1)} oz)\nPer feed: ${Math.round(perFeed)} mL (${(perFeed * 0.0338).toFixed(1)} oz)\nFeeds: ${feeds} per day`);
  }, [age, weight, feedsPerDay]);
  return (
    <CalculatorShell title="Baby Formula Calculator" accent="pink" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Age (months)</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Feeds / day</label><input className={inputCls} type="number" value={feedsPerDay} onChange={e => setFeedsPerDay(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function BabyGrowthPercentileCalculator() {
  const [age, setAge] = useState('12');
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [height, setHeight] = useState('75');
  const [weight, setWeight] = useState('10');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 0;
    const h = parseFloat(height) || 0;
    const w = parseFloat(weight) || 0;
    if (!a || !h || !w) { setResult(''); return; }
    const avgHeight: Record<string, Record<number, number>> = { male: { 0:50,6:68,12:76,24:87,36:96,48:103,60:110 }, female: { 0:49,6:66,12:74,24:86,36:95,48:102,60:109 } };
    const avgWeight: Record<string, Record<number, number>> = { male: { 0:3.4,6:7.9,12:10.2,24:12.8,36:14.5,48:16.5,60:18.5 }, female: { 0:3.2,6:7.3,12:9.5,24:12.2,36:14.0,48:16.0,60:18.0 } };
    const ages: number[] = Object.keys(avgHeight[gender]).map(k => parseInt(k));
    const closest = ages.reduce((x, y) => Math.abs(x - a) < Math.abs(y - a) ? x : y);
    const medH = avgHeight[gender][closest];
    const medW = avgWeight[gender][closest];
    const hPct = medH ? Math.round((1 - Math.abs(h - medH) / (medH * 0.15)) * 100) : 50;
    const wPct = medW ? Math.round((1 - Math.abs(w - medW) / (medW * 0.2)) * 100) : 50;
    setResult(`Height: ${Math.max(1, Math.min(99, hPct))}th percentile\nWeight: ${Math.max(1, Math.min(99, wPct))}th percentile`);
  }, [age, gender, height, weight]);
  return (
    <CalculatorShell title="Baby Growth Percentile" accent="rose" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Age (months)</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Height / Length (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function BabySleepScheduleCalculator() {
  const [ageWeeks, setAgeWeeks] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(ageWeeks) || 0;
    const totalSleep = w <= 4 ? 16 : w <= 12 ? 15 : w <= 24 ? 14 : w <= 48 ? 13 : 12;
    const nightSleep = w <= 4 ? 8 : w <= 12 ? 9 : w <= 24 ? 10 : w <= 48 ? 10.5 : 11;
    const daySleep = totalSleep - nightSleep;
    const naps = w <= 12 ? 4 : w <= 24 ? 3 : w <= 48 ? 2 : 1;
    const wakeWindow = w <= 4 ? '45-60 min' : w <= 12 ? '60-90 min' : w <= 24 ? '2-3 hours' : '3-4 hours';
    setResult(`Total sleep: ${totalSleep}h/day\nNight: ${nightSleep}h | Day: ${daySleep}h\nNaps: ${naps}\nWake window: ${wakeWindow}`);
  }, [ageWeeks]);
  return (
    <CalculatorShell title="Baby Sleep Schedule" accent="purple" result={result} onCalculate={calc}>
      <div className="max-w-sm">
        <div><label className={labelCls}>Age (weeks)</label><input className={inputCls} type="number" value={ageWeeks} onChange={e => setAgeWeeks(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setAgeWeeks('4')}>Newborn (4w)</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setAgeWeeks('16')}>4 months</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => setAgeWeeks('52')}>12 months</button>
      </div>
    </CalculatorShell>
  );
}

export function BreastfeedingCalorieCalculator() {
  const [age, setAge] = useState('3');
  const [feedings, setFeedings] = useState('8');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 0;
    const f = parseFloat(feedings) || 8;
    const milkPerFeedMl = a <= 1 ? 60 : a <= 2 ? 90 : a <= 4 ? 120 : a <= 6 ? 150 : a <= 12 ? 180 : 210;
    const dailyMl = milkPerFeedMl * f;
    const caloriesBurned = Math.round(dailyMl * 0.67);
    setResult(`Est. milk per feed: ${milkPerFeedMl} mL\nDaily milk output: ${dailyMl} mL\nCalories burned: ~${caloriesBurned} kcal/day`);
  }, [age, feedings]);
  return (
    <CalculatorShell title="Breastfeeding Calories" accent="fuchsia" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Baby age (months)</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Feedings / day</label><input className={inputCls} type="number" value={feedings} onChange={e => setFeedings(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function CalorieCalculator() {
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
    <CalculatorShell title="Calorie Calculator (TDEE)" accent="emerald" result={result} onCalculate={calc}>
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

export function ChildHeightPredictor() {
  const [parentHeight, setParentHeight] = useState('170');
  const [motherHeight, setMotherHeight] = useState('160');
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [childAge, setChildAge] = useState('8');
  const [childHeight, setChildHeight] = useState('130');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const ph = parseFloat(parentHeight) || 0;
    const mh = parseFloat(motherHeight) || 0;
    const age = parseFloat(childAge) || 0;
    const ch = parseFloat(childHeight) || 0;
    if (!ph || !mh) { setResult(''); return; }
    const midParent = (ph + mh) / 2;
    let predicted: number;
    if (gender === 'male') predicted = midParent + 6.5;
    else predicted = midParent - 6.5;
    if (age > 2 && age < 18 && ch) {
      const adjusted = (ch / (age >= 2 ? (100 + (age - 2) * 6.2) : 100)) * predicted;
      predicted = Math.round((predicted + adjusted) / 2);
    }
    setResult(`Mid-parental height: ${midParent.toFixed(1)} cm\nPredicted adult height: ${Math.round(predicted)} cm (${(predicted / 2.54).toFixed(1)} in)`);
  }, [parentHeight, motherHeight, gender, childAge, childHeight]);
  return (
    <CalculatorShell title="Child Height Predictor" accent="cyan" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Father height (cm)</label><input className={inputCls} type="number" value={parentHeight} onChange={e => setParentHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Mother height (cm)</label><input className={inputCls} type="number" value={motherHeight} onChange={e => setMotherHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Child gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Child age (optional)</label><input className={inputCls} type="number" value={childAge} onChange={e => setChildAge(e.target.value)} /></div>
        <div><label className={labelCls}>Child height (optional)</label><input className={inputCls} type="number" value={childHeight} onChange={e => setChildHeight(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}


export function CyclingCalorieCalculator() {
  const [weight, setWeight] = useState('80');
  const [distance, setDistance] = useState('30');
  const [speed, setSpeed] = useState('25');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const d = parseFloat(distance) || 0;
    const s = parseFloat(speed) || 0;
    if (!w || !d || !s) { setResult(''); return; }
    const hours = d / s;
    const met = s < 16 ? 4 : s < 20 ? 6 : s < 25 ? 8 : s < 30 ? 10 : 12;
    const calories = Math.round(met * w * hours);
    setResult(`Duration: ${hours.toFixed(1)} hours\nMET: ${met}\nCalories burned: ${calories} kcal`);
  }, [weight, distance, speed]);
  return (
    <CalculatorShell title="Cycling Calorie Calculator" accent="orange" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Distance (km)</label><input className={inputCls} type="number" value={distance} onChange={e => setDistance(e.target.value)} /></div>
        <div><label className={labelCls}>Speed (km/h)</label><input className={inputCls} type="number" value={speed} onChange={e => setSpeed(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('70'); setDistance('20'); setSpeed('20'); }}>Leisure ride</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('80'); setDistance('50'); setSpeed('28'); }}>Road training</button>
      </div>
    </CalculatorShell>
  );
}

export function HeartRateZoneCalculator() {
  const [age, setAge] = useState('35');
  const [restHr, setRestHr] = useState('65');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const a = parseFloat(age) || 35;
    const rhr = parseFloat(restHr) || 65;
    const maxHr = 220 - a;
    const reserve = maxHr - rhr;
    const zones = [
      { name: 'Zone 1: Very Light', intensity: '50-60%', min: Math.round(rhr + reserve * 0.5), max: Math.round(rhr + reserve * 0.6) },
      { name: 'Zone 2: Light', intensity: '60-70%', min: Math.round(rhr + reserve * 0.6), max: Math.round(rhr + reserve * 0.7) },
      { name: 'Zone 3: Moderate', intensity: '70-80%', min: Math.round(rhr + reserve * 0.7), max: Math.round(rhr + reserve * 0.8) },
      { name: 'Zone 4: Hard', intensity: '80-90%', min: Math.round(rhr + reserve * 0.8), max: Math.round(rhr + reserve * 0.9) },
      { name: 'Zone 5: Maximum', intensity: '90-100%', min: Math.round(rhr + reserve * 0.9), max: maxHr },
    ];
    setResult(`Max HR: ${maxHr} bpm\nHR Reserve: ${reserve} bpm` + zones.map(z => `\n${z.name}: ${z.min}-${z.max} bpm`).join(''));
  }, [age, restHr]);
  return (
    <CalculatorShell title="Heart Rate Zone Calculator" accent="rose" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Age</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Resting HR (bpm)</label><input className={inputCls} type="number" value={restHr} onChange={e => setRestHr(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('25'); setRestHr('60'); }}>Athlete 25</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setAge('45'); setRestHr('72'); }}>Average 45</button>
      </div>
    </CalculatorShell>
  );
}

export function IdealWeightCalculator() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [height, setHeight] = useState('180');
  const [frame, setFrame] = useState<'small'|'medium'|'large'>('medium');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const h = parseFloat(height) || 0;
    if (!h) { setResult(''); return; }
    const hIn = h / 2.54;
    let devine: number, robinson: number, miller: number, hamwi: number;
    if (gender === 'male') {
      devine = 50 + 2.3 * (hIn - 60);
      robinson = 52 + 1.9 * (hIn - 60);
      miller = 56.2 + 1.41 * (hIn - 60);
      hamwi = 48 + 2.7 * (hIn - 60);
    } else {
      devine = 45.5 + 2.3 * (hIn - 60);
      robinson = 49 + 1.7 * (hIn - 60);
      miller = 53.1 + 1.36 * (hIn - 60);
      hamwi = 45.5 + 2.2 * (hIn - 60);
    }
    const frameAdj = frame === 'small' ? 0.9 : frame === 'large' ? 1.1 : 1;
    const avg = (devine + robinson + miller + hamwi) / 4 * frameAdj;
    setResult(`Devine: ${devine.toFixed(1)} kg\nRobinson: ${robinson.toFixed(1)} kg\nMiller: ${miller.toFixed(1)} kg\nHamwi: ${hamwi.toFixed(1)} kg\nAverage: ${avg.toFixed(1)} kg (${(avg * 2.205).toFixed(1)} lb)`);
  }, [gender, height, frame]);
  return (
    <CalculatorShell title="Ideal Weight Calculator" accent="teal" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Frame</label><select className={inputCls} value={frame} onChange={e => setFrame(e.target.value as 'small'|'medium'|'large')}><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></div>
      </div>
    </CalculatorShell>
  );
}

export function KetoCalculator() {
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');
  const [age, setAge] = useState('35');
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [activity, setActivity] = useState('1.55');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    const a = parseFloat(age) || 35;
    const act = parseFloat(activity) || 1.55;
    if (!w || !h) { setResult(''); return; }
    const bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;
    const tdee = bmr * act;
    const deficit = tdee - 500;
    const protein = w * 1.8;
    const fat = (deficit - protein * 4) / 9;
    const carbs = 20;
    setResult(`Daily calories: ${Math.round(deficit)} kcal\nProtein: ${Math.round(protein)} g (${Math.round(protein * 4)} kcal)\nFat: ${Math.round(fat)} g (${Math.round(fat * 9)} kcal)\nCarbs: ${carbs} g (${carbs * 4} kcal)\nNet carbs: ${carbs}g target`);
  }, [weight, height, age, gender, activity]);
  return (
    <CalculatorShell title="Keto Calculator" accent="amber" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
        <div><label className={labelCls}>Age</label><input className={inputCls} type="number" value={age} onChange={e => setAge(e.target.value)} /></div>
        <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Activity</label><select className={inputCls} value={activity} onChange={e => setActivity(e.target.value)}><option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option><option value="1.725">Very active</option></select></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('80'); setHeight('180'); setAge('35'); setGender('male'); }}>Avg Male</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setWeight('65'); setHeight('165'); setAge('35'); setGender('female'); }}>Avg Female</button>
      </div>
    </CalculatorShell>
  );
}

export function LeanBodyMassCalculator() {
  const [gender, setGender] = useState<'male'|'female'>('male');
  const [weight, setWeight] = useState('80');
  const [height, setHeight] = useState('180');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (!w || !h) { setResult(''); return; }
    const boer = gender === 'male' ? 0.407 * w + 0.267 * h - 19.2 : 0.252 * w + 0.473 * h - 48.3;
    const james = gender === 'male' ? 1.1 * w - 128 * Math.pow(w / h, 2) : 1.07 * w - 148 * Math.pow(w / h, 2);
    const avg = (boer + james) / 2;
    setResult(`Boer formula: ${Math.round(boer * 10) / 10} kg\nJames formula: ${Math.round(james * 10) / 10} kg\nAverage LBM: ${Math.round(avg * 10) / 10} kg\nBody fat est.: ${Math.round((w - avg) / w * 100)}%`);
  }, [gender, weight, height]);
  return (
    <CalculatorShell title="Lean Body Mass" accent="blue" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Gender</label><select className={inputCls} value={gender} onChange={e => setGender(e.target.value as 'male'|'female')}><option value="male">Male</option><option value="female">Female</option></select></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function MacroCalculator() {
  const [calories, setCalories] = useState('2000');
  const [proteinPct, setProteinPct] = useState('30');
  const [carbsPct, setCarbsPct] = useState('40');
  const [fatPct, setFatPct] = useState('30');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const cals = parseFloat(calories) || 0;
    const p = parseFloat(proteinPct) || 0;
    const c = parseFloat(carbsPct) || 0;
    const f = parseFloat(fatPct) || 0;
    if (!cals || Math.abs(p + c + f - 100) > 1) { setResult('Percentages must add to 100%.'); return; }
    const proteinG = cals * (p / 100) / 4;
    const carbsG = cals * (c / 100) / 4;
    const fatG = cals * (f / 100) / 9;
    setResult(`Protein: ${Math.round(proteinG)}g (${Math.round(proteinG * 4)} kcal)\nCarbs: ${Math.round(carbsG)}g (${Math.round(carbsG * 4)} kcal)\nFat: ${Math.round(fatG)}g (${Math.round(fatG * 9)} kcal)`);
  }, [calories, proteinPct, carbsPct, fatPct]);
  return (
    <CalculatorShell title="Macro Calculator" accent="lime" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Daily calories</label><input className={inputCls} type="number" value={calories} onChange={e => setCalories(e.target.value)} /></div>
        <div className="opacity-0 pointer-events-none"><label className={labelCls}>_</label><input className={inputCls} /></div>
        <div><label className={labelCls}>Protein %</label><input className={inputCls} type="number" value={proteinPct} onChange={e => setProteinPct(e.target.value)} /></div>
        <div><label className={labelCls}>Carbs %</label><input className={inputCls} type="number" value={carbsPct} onChange={e => setCarbsPct(e.target.value)} /></div>
        <div><label className={labelCls}>Fat %</label><input className={inputCls} type="number" value={fatPct} onChange={e => setFatPct(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCalories('2000'); setProteinPct('30'); setCarbsPct('40'); setFatPct('30'); }}>Balanced</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCalories('2000'); setProteinPct('40'); setCarbsPct('20'); setFatPct('40'); }}>Keto</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCalories('2500'); setProteinPct('35'); setCarbsPct('45'); setFatPct('20'); }}>Muscle gain</button>
      </div>
    </CalculatorShell>
  );
}


export function OvulationCalculator() {
  const [cycle, setCycle] = useState('28');
  const [lastPeriod, setLastPeriod] = useState('2026-01-15');
  const [periodLen, setPeriodLen] = useState('5');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const cyc = parseFloat(cycle) || 28;
    const pl = parseFloat(periodLen) || 5;
    if (!lastPeriod) { setResult(''); return; }
    const lmp = new Date(lastPeriod);
    if (isNaN(lmp.getTime())) { setResult('Invalid date.'); return; }
    const ovulationDay = new Date(lmp);
    ovulationDay.setDate(lmp.getDate() + cyc - 14);
    const fertileStart = new Date(ovulationDay);
    fertileStart.setDate(ovulationDay.getDate() - 5);
    const fertileEnd = new Date(ovulationDay);
    fertileEnd.setDate(ovulationDay.getDate() + 1);
    const nextPeriod = new Date(lmp);
    nextPeriod.setDate(lmp.getDate() + cyc);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    setResult(`Ovulation day: ${fmt(ovulationDay)}\nFertile window: ${fmt(fertileStart)} - ${fmt(fertileEnd)}\nNext period: ${fmt(nextPeriod)}\nCycle day ${cyc - 14} (ovulation)`);
  }, [cycle, lastPeriod, periodLen]);
  return (
    <CalculatorShell title="Ovulation Calculator" accent="rose" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Cycle length (days)</label><input className={inputCls} type="number" value={cycle} onChange={e => setCycle(e.target.value)} /></div>
        <div><label className={labelCls}>Last period date</label><input className={inputCls} type="date" value={lastPeriod} onChange={e => setLastPeriod(e.target.value)} /></div>
        <div><label className={labelCls}>Period length (days)</label><input className={inputCls} type="number" value={periodLen} onChange={e => setPeriodLen(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCycle('28'); setPeriodLen('5'); }}>28-day cycle</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setCycle('28'); setLastPeriod('2026-02-01'); }}>Feb 1 start</button>
      </div>
    </CalculatorShell>
  );
}

export function PregnancyDueDateCalculator() {
  const [lmp, setLmp] = useState('2026-01-01');
  const [cycleLen, setCycleLen] = useState('28');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    if (!lmp) { setResult(''); return; }
    const date = new Date(lmp);
    if (isNaN(date.getTime())) { setResult('Invalid date.'); return; }
    const cl = parseFloat(cycleLen) || 28;
    const adjustment = cl - 28;
    const due = new Date(date);
    due.setDate(date.getDate() + 280 + adjustment);
    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const today = new Date();
    const diff = due.getTime() - today.getTime();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    const trimester = daysLeft > 180 ? 'First' : daysLeft > 90 ? 'Second' : 'Third';
    setResult(`Estimated due date: ${fmt(due)}\nDays remaining: ${daysLeft} days\nCurrent trimester: ${trimester}\nWeeks pregnant: ${Math.round((280 - daysLeft) / 7)} weeks`);
  }, [lmp, cycleLen]);
  return (
    <CalculatorShell title="Pregnancy Due Date" accent="fuchsia" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>First day of LMP</label><input className={inputCls} type="date" value={lmp} onChange={e => setLmp(e.target.value)} /></div>
        <div><label className={labelCls}>Cycle length (optional)</label><input className={inputCls} type="number" value={cycleLen} onChange={e => setCycleLen(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function ProteinCalculator() {
  const [weight, setWeight] = useState('80');
  const [goal, setGoal] = useState('general');
  const [activity, setActivity] = useState('moderate');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const w = parseFloat(weight) || 0;
    if (!w) { setResult(''); return; }
    const factors: Record<string, Record<string, number>> = { general: { sedentary: 0.8, moderate: 1.2, active: 1.6 }, muscle: { sedentary: 1.2, moderate: 1.6, active: 2.2 }, weightLoss: { sedentary: 1.2, moderate: 1.6, active: 2.0 } };
    const factor = (factors[goal]?.[activity] || 1.2);
    const proteinG = Math.round(w * factor);
    const perMeal = Math.round(proteinG / 3);
    setResult(`Daily protein: ${proteinG}g\nPer meal (3 meals): ${perMeal}g\nRange: ${Math.round(w * (factor - 0.3))}g - ${Math.round(w * (factor + 0.3))}g`);
  }, [weight, goal, activity]);
  return (
    <CalculatorShell title="Protein Calculator" accent="blue" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Goal</label><select className={inputCls} value={goal} onChange={e => setGoal(e.target.value)}><option value="general">General health</option><option value="muscle">Muscle gain</option><option value="weightLoss">Weight loss</option></select></div>
        <div><label className={labelCls}>Activity</label><select className={inputCls} value={activity} onChange={e => setActivity(e.target.value)}><option value="sedentary">Sedentary</option><option value="moderate">Moderate</option><option value="active">Very active</option></select></div>
      </div>
    </CalculatorShell>
  );
}

export function RunningPaceCalculator() {
  const [distance, setDistance] = useState('5');
  const [unit, setUnit] = useState<'km'|'mi'>('km');
  const [hours, setHours] = useState('0');
  const [minutes, setMinutes] = useState('25');
  const [seconds, setSeconds] = useState('0');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const d = parseFloat(distance) || 0;
    const h = parseFloat(hours) || 0;
    const m = parseFloat(minutes) || 0;
    const s = parseFloat(seconds) || 0;
    if (!d) { setResult(''); return; }
    const totalMin = h * 60 + m + s / 60;
    const paceMin = totalMin / d;
    const paceMinInt = Math.floor(paceMin);
    const paceSec = Math.round((paceMin - paceMinInt) * 60);
    const speed = d / (totalMin / 60);
    const unitLabel = unit === 'km' ? 'km' : 'mi';
    setResult(`Pace: ${paceMinInt}:${paceSec.toString().padStart(2, '0')} /${unitLabel}\nSpeed: ${speed.toFixed(2)} ${unitLabel}/h\nTime: ${h}h ${m}m ${s}s`);
  }, [distance, unit, hours, minutes, seconds]);
  return (
    <CalculatorShell title="Running Pace Calculator" accent="orange" result={result} onCalculate={calc}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Distance</label><input className={inputCls} type="number" value={distance} onChange={e => setDistance(e.target.value)} /></div>
        <div><label className={labelCls}>Unit</label><select className={inputCls} value={unit} onChange={e => setUnit(e.target.value as 'km'|'mi')}><option value="km">km</option><option value="mi">mi</option></select></div>
        <div><label className={labelCls}>Hours</label><input className={inputCls} type="number" value={hours} onChange={e => setHours(e.target.value)} /></div>
        <div><label className={labelCls}>Minutes</label><input className={inputCls} type="number" value={minutes} onChange={e => setMinutes(e.target.value)} /></div>
        <div><label className={labelCls}>Seconds</label><input className={inputCls} type="number" value={seconds} onChange={e => setSeconds(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setDistance('5'); setMinutes('25'); setHours('0'); }}>5K (25 min)</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setDistance('10'); setMinutes('50'); setHours('0'); }}>10K (50 min)</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setDistance('42.2'); setMinutes('0'); setHours('3.5'); }}>Marathon (3:30)</button>
      </div>
    </CalculatorShell>
  );
}

export function SleepCalculator() {
  const [wakeTime, setWakeTime] = useState('06:30');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    if (!wakeTime) { setResult(''); return; }
    const [h, m] = wakeTime.split(':').map(Number);
    const wakeMin = h * 60 + m;
    const cycles = [5, 4.5, 4, 3.5, 3, 2.5, 2].map(c => {
      const sleepMin = c * 90;
      let bedMin = wakeMin - sleepMin - 15;
      if (bedMin < 0) bedMin += 1440;
      const bedH = Math.floor(bedMin / 60) % 24;
      const bedM = Math.round(bedMin % 60);
      return { cycles: c, time: `${bedH.toString().padStart(2, '0')}:${bedM.toString().padStart(2, '0')}` };
    });
    setResult(cycles.map(c => `${c.cycles} cycles (${c.cycles * 1.5}h): ${c.time}`).join('\n'));
  }, [wakeTime]);
  return (
    <CalculatorShell title="Sleep Calculator" accent="purple" result={result} onCalculate={calc}>
      <div className="max-w-sm">
        <div><label className={labelCls}>Wake time</label><input className={inputCls} type="time" value={wakeTime} onChange={e => setWakeTime(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}

export function StepsToCaloriesCalculator() {
  const [steps, setSteps] = useState('10000');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const s = parseFloat(steps) || 0;
    const w = parseFloat(weight) || 0;
    const h = parseFloat(height) || 0;
    if (!s || !w || !h) { setResult(''); return; }
    const strideLen = h * 0.415;
    const distKm = s * strideLen / 100000;
    const calories = Math.round(distKm * w * 1.036);
    const distMiles = distKm * 0.621371;
    setResult(`Distance: ${distKm.toFixed(2)} km (${distMiles.toFixed(2)} mi)\nCalories burned: ${calories} kcal\nStride length: ${strideLen.toFixed(1)} cm`);
  }, [steps, weight, height]);
  return (
    <CalculatorShell title="Steps to Calories" accent="green" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Steps</label><input className={inputCls} type="number" value={steps} onChange={e => setSteps(e.target.value)} /></div>
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Height (cm)</label><input className={inputCls} type="number" value={height} onChange={e => setHeight(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setSteps('10000'); setWeight('70'); setHeight('170'); }}>10K steps</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setSteps('5000'); }}>5K steps</button>
      </div>
    </CalculatorShell>
  );
}

export function WaterIntakeCalculator() {
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
    <CalculatorShell title="Water Intake Calculator" accent="sky" result={result} onCalculate={calc}>
      <div className="grid grid-cols-3 gap-4">
        <div><label className={labelCls}>Weight (kg)</label><input className={inputCls} type="number" value={weight} onChange={e => setWeight(e.target.value)} /></div>
        <div><label className={labelCls}>Exercise (min/day)</label><input className={inputCls} type="number" value={activity} onChange={e => setActivity(e.target.value)} /></div>
        <div><label className={labelCls}>Climate</label><select className={inputCls} value={climate} onChange={e => setClimate(e.target.value)}><option value="moderate">Moderate</option><option value="hot">Hot / humid</option><option value="cold">Cold</option></select></div>
      </div>
    </CalculatorShell>
  );
}
