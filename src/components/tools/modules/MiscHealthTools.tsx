"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ac, pillClass, btnClass, borderClass } from './miscToolColors';
import { Input, labelClass, selClass } from './MiscToolsShared';
import { CalculatorShell } from './shared/CalculatorShell';

export function BodyMassIndexCalculator() {
  const clr = ac('BodyMassIndexCalculator');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('70');
  const [unit, setUnit] = useState('metric');
  const h = unit === 'metric' ? Number(height) / 100 : Number(height) * 0.0254;
  const w = unit === 'metric' ? Number(weight) : Number(weight) * 0.453592;
  const bmi = h > 0 ? w / (h * h) : 0;
  const category = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
  const color = bmi < 18.5 ? 'text-yellow-500' : bmi < 25 ? 'text-green-600' : bmi < 30 ? 'text-orange-500' : 'text-red-500';

  const presets = [
    { label: 'Average Male (170cm, 70kg)', apply: () => { setUnit('metric'); setHeight('170'); setWeight('70'); } },
    { label: 'Average Female (160cm, 60kg)', apply: () => { setUnit('metric'); setHeight('160'); setWeight('60'); } },
    { label: 'Imperial (5\'7\", 154lb)', apply: () => { setUnit('imperial'); setHeight('67'); setWeight('154'); } },
    { label: 'Clear', apply: () => { setHeight('170'); setWeight('70'); setUnit('metric'); } },
  ];

  const resultText = bmi > 0 ? `BMI: ${bmi.toFixed(1)} (${category})` : 'Enter height and weight';

  return (
    <CalculatorShell
      title="BMI Calculator"
      result={resultText}
      onCalculate={() => {}}
      presets={presets}
      accent="blue"
      downloadData={bmi > 0 ? JSON.stringify({ height, weight, unit, bmi: bmi.toFixed(1), category }, null, 2) : ''}
      downloadFilename="bmi.json"
    >
      <div className="space-y-4">
        <select className={selClass} value={unit} onChange={e => setUnit(e.target.value)}>
          <option value="metric">Metric (cm/kg)</option><option value="imperial">Imperial (in/lb)</option>
        </select>
        <div className="flex gap-2">
          <Input label="Value" type="number" value={height} onChange={setHeight} placeholder={unit === 'metric' ? 'cm' : 'in'} />
          <Input label="Value" type="number" value={weight} onChange={setWeight} placeholder={unit === 'metric' ? 'kg' : 'lb'} />
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- BodyFatCalculator ---
export function BodyFatCalculator() {
  const clr = ac('BodyFatCalculator');
  const [bmi, setBmi] = useState('24');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const b = Number(bmi), a = Number(age);
  const bf = gender === 'male' ? 1.2 * b + 0.23 * a - 16.2 : 1.2 * b + 0.23 * a - 5.4;

  const presets = [
    { label: 'Male, BMI 24, Age 30', apply: () => { setGender('male'); setBmi('24'); setAge('30'); } },
    { label: 'Female, BMI 22, Age 25', apply: () => { setGender('female'); setBmi('22'); setAge('25'); } },
    { label: 'Male, BMI 28, Age 40', apply: () => { setGender('male'); setBmi('28'); setAge('40'); } },
    { label: 'Clear', apply: () => { setBmi('24'); setAge('30'); setGender('male'); } },
  ];

  const resultText = `Body Fat: ${bf.toFixed(1)}%`;

  return (
    <CalculatorShell
      title="Body Fat % Estimator"
      result={resultText}
      onCalculate={() => {}}
      presets={presets}
      accent="emerald"
      downloadData={JSON.stringify({ bmi: Number(bmi), age: Number(age), gender, bodyFat: bf.toFixed(1) }, null, 2)}
      downloadFilename="body-fat.json"
    >
      <div className="space-y-4">
        <select className={selClass} value={gender} onChange={e => setGender(e.target.value)}>
          <option value="male">Male</option><option value="female">Female</option>
        </select>
        <div className="flex gap-2">
          <div><label className={labelClass}>BMI</label><Input label="Value" type="number" value={bmi} onChange={setBmi} /></div>
          <div><label className={labelClass}>Age</label><Input label="Value" type="number" value={age} onChange={setAge} /></div>
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- CalorieIntakeCalculator ---
export function CalorieIntakeCalculator() {
  const clr = ac('CalorieIntakeCalculator');
  const [weight, setWeight] = useState('70');
  const [height, setHeight] = useState('170');
  const [age, setAge] = useState('30');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('1.55');
  const w = Number(weight), h = Number(height), a = Number(age), act = Number(activity);
  const bmr = gender === 'male' ? 10 * w + 6.25 * h - 5 * a + 5 : 10 * w + 6.25 * h - 5 * a - 161;

  const presets = [
    { label: 'Male, 70kg, 170cm, 30, Moderate', apply: () => { setGender('male'); setWeight('70'); setHeight('170'); setAge('30'); setActivity('1.55'); } },
    { label: 'Female, 60kg, 160cm, 25, Light', apply: () => { setGender('female'); setWeight('60'); setHeight('160'); setAge('25'); setActivity('1.375'); } },
    { label: 'Male, 80kg, 180cm, 40, Active', apply: () => { setGender('male'); setWeight('80'); setHeight('180'); setAge('40'); setActivity('1.725'); } },
    { label: 'Clear', apply: () => { setWeight('70'); setHeight('170'); setAge('30'); setGender('male'); setActivity('1.55'); } },
  ];

  const resultText = `BMR: ${bmr.toFixed(0)} kcal/day | Maintenance: ${(bmr * act).toFixed(0)} kcal/day`;

  return (
    <CalculatorShell
      title="Daily Calorie Needs"
      result={resultText}
      onCalculate={() => {}}
      presets={presets}
      accent="emerald"
      downloadData={JSON.stringify({ weight: w, height: h, age: a, gender, activity: act, bmr: bmr.toFixed(0), maintenance: (bmr * act).toFixed(0) }, null, 2)}
      downloadFilename="calories.json"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <select className={selClass} value={gender} onChange={e => setGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option></select>
          <select className={selClass} value={activity} onChange={e => setActivity(e.target.value)}>
            <option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option>
            <option value="1.725">Active</option><option value="1.9">Very Active</option>
          </select>
        </div>
        <div className="flex gap-2"><div><label className={labelClass}>Weight (kg)</label><Input label="Value" type="number" value={weight} onChange={setWeight} /></div><div><label className={labelClass}>Height (cm)</label><Input label="Value" type="number" value={height} onChange={setHeight} /></div><div><label className={labelClass}>Age</label><Input label="Value" type="number" value={age} onChange={setAge} /></div></div>
      </div>
    </CalculatorShell>
  );
}
// --- MacroSplitCalculator ---
export function MacroSplitCalculator() {
  const clr = ac('MacroSplitCalculator');
  const [calories, setCalories] = useState('2000');
  const c = Number(calories);

  const presets = [
    { label: '2000 kcal', apply: () => { setCalories('2000'); } },
    { label: '1500 kcal', apply: () => { setCalories('1500'); } },
    { label: '2500 kcal', apply: () => { setCalories('2500'); } },
    { label: 'Clear', apply: () => { setCalories('2000'); } },
  ];

  const resultText = `Protein: ${(c * 0.3 / 4).toFixed(0)}g (${(c * 0.3).toFixed(0)} kcal) | Carbs: ${(c * 0.4 / 4).toFixed(0)}g (${(c * 0.4).toFixed(0)} kcal) | Fat: ${(c * 0.3 / 9).toFixed(0)}g (${(c * 0.3).toFixed(0)} kcal)`;

  return (
    <CalculatorShell
      title="Daily Macronutrients"
      result={resultText}
      onCalculate={() => {}}
      presets={presets}
      accent="amber"
      downloadData={JSON.stringify({ calories: c, protein: { g: (c * 0.3 / 4).toFixed(0), kcal: (c * 0.3).toFixed(0) }, carbs: { g: (c * 0.4 / 4).toFixed(0), kcal: (c * 0.4).toFixed(0) }, fat: { g: (c * 0.3 / 9).toFixed(0), kcal: (c * 0.3).toFixed(0) } }, null, 2)}
      downloadFilename="macros.json"
    >
      <div className="space-y-4">
        <Input label="Value" type="number" value={calories} onChange={setCalories} />
      </div>
    </CalculatorShell>
  );
}
// --- WaterRequirementCalculator ---
export function WaterRequirementCalculator() {
  const clr = ac('WaterRequirementCalculator');
  const [weight, setWeight] = useState('70');
  const [activity, setActivity] = useState('30');
  const w = Number(weight);
  const base = w * 0.033;
  const extra = Math.floor(Number(activity) / 30) * 0.35;
  return (
    <Section title="Daily Water Intake">
      <div className="flex gap-2"><div><label className={labelClass}>Weight (kg)</label><Input label="Value" type="number" value={weight} onChange={setWeight} /></div><div><label className={labelClass}>Exercise (min)</label><Input label="Value" type="number" value={activity} onChange={setActivity} /></div></div>
      <div className="text-lg font-bold">{(base + extra).toFixed(1)} L / day</div>
    </Section>
  );
}
// --- SleepRequirementCalculator ---
export function SleepRequirementCalculator() {
  const clr = ac('SleepRequirementCalculator');
  const [age, setAge] = useState('30');
  const a = Number(age);
  const rec = a < 1 ? '12-16 hours' : a < 2 ? '11-14 hours' : a < 5 ? '10-13 hours' : a < 13 ? '9-12 hours' : a < 18 ? '8-10 hours' : a < 65 ? '7-9 hours' : '7-8 hours';
  return (
    <Section title="Sleep Requirements by Age">
      <Input label="Value" type="number" value={age} onChange={setAge} />
      <div className="text-lg font-bold">Recommended: {rec}</div>
    </Section>
  );
}
// --- HeartRateCalculator ---
export function HeartRateCalculator() {
  const clr = ac('HeartRateCalculator');
  const [age, setAge] = useState('35');
  const a = Number(age);
  const max = 220 - a;
  return (
    <Section title="Target Heart Rate Zones">
      <Input label="Value" type="number" value={age} onChange={setAge} />
      <div className="text-xs space-y-1">
        <div>Max HR: {max} bpm</div>
        <div>Zone 1 (50-60%): {Math.round(max * 0.5)}-{Math.round(max * 0.6)} bpm</div>
        <div>Zone 2 (60-70%): {Math.round(max * 0.6)}-{Math.round(max * 0.7)} bpm</div>
        <div>Zone 3 (70-80%): {Math.round(max * 0.7)}-{Math.round(max * 0.8)} bpm</div>
        <div>Zone 4 (80-90%): {Math.round(max * 0.8)}-{Math.round(max * 0.9)} bpm</div>
        <div>Zone 5 (90-100%): {Math.round(max * 0.9)}-{max} bpm</div>
      </div>
      <p className="text-xs text-[var(--text-secondary)] mt-2">Uses %-of-max HR method. For a more precise calculation using your resting HR, see <Link href="/health/heart-rate-zone-calculator" className="text-blue-600 hover:underline">Heart Rate Zone Calculator (Karvonen)</Link>.</p>
    </Section>
  );
}
// --- IdealWeightCalc ---
export function IdealWeightCalc() {
  const clr = ac('IdealWeightCalc');
  const [height, setHeight] = useState('170');
  const [gender, setGender] = useState('male');
  const h = Number(height);
  const devine = gender === 'male' ? 50 + 2.3 * ((h - 152.4) / 2.54) : 45.5 + 2.3 * ((h - 152.4) / 2.54);
  const robinson = gender === 'male' ? 52 + 1.9 * ((h - 152.4) / 2.54) : 49 + 1.7 * ((h - 152.4) / 2.54);
  return (
    <Section title="Ideal Body Weight">
      <div className="flex gap-2"><select className={selClass} value={gender} onChange={e => setGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option></select><Input label="Value" type="number" value={height} onChange={setHeight} /></div>
      <div className="text-xs space-y-1"><div>Devine: {devine.toFixed(1)} kg</div><div>Robinson: {robinson.toFixed(1)} kg</div></div>
    </Section>
  );
}
// --- PaceCalculator ---
export function PaceCalculator() {
  const clr = ac('PaceCalculator');
  const [dist, setDist] = useState('10');
  const [time, setTime] = useState('50');
  const d = Number(dist), t = Number(time);
  const paceMin = d ? t / d : 0;
  const paceMinWhole = Math.floor(paceMin);
  const paceSec = Math.round((paceMin - paceMinWhole) * 60);
  return (
    <Section title="Running Pace Calculator">
      <div className="flex gap-2"><div><label className={labelClass}>Distance (km)</label><Input label="Value" type="number" value={dist} onChange={setDist} /></div><div><label className={labelClass}>Time (min)</label><Input label="Value" type="number" value={time} onChange={setTime} /></div></div>
      <div className="text-lg font-bold">{paceMinWhole}:{paceSec.toString().padStart(2, '0')} /km</div>
      <div className="text-sm">Speed: {d && t ? (d / t * 60).toFixed(2) : 0} km/h</div>
    </Section>
  );
}
// --- StepsCalculator ---
export function StepsCalculator() {
  const clr = ac('StepsCalculator');
  const [steps, setSteps] = useState('10000');
  const [height, setHeight] = useState('170');
  const s = Number(steps), h = Number(height);
  const stride = h * 0.415;
  const distM = s * stride;
  const distKm = distM / 1000;
  const distMi = distKm / 1.609;
  return (
    <Section title="Steps to Distance">
      <div className="flex gap-2"><div><label className={labelClass}>Steps</label><Input label="Value" type="number" value={steps} onChange={setSteps} /></div><div><label className={labelClass}>Height (cm)</label><Input label="Value" type="number" value={height} onChange={setHeight} /></div></div>
      <div className="text-xs space-y-1"><div>Distance: {distKm.toFixed(2)} km</div><div>Distance: {distMi.toFixed(2)} miles</div><div>Calories (est): {(s * 0.04).toFixed(0)} kcal</div></div>
      <p className="text-xs text-[var(--text-secondary)] mt-2">Uses height-based stride estimate (stride = height × 0.415). For a weight-based calorie calculation, see <Link href="/health/steps-to-calories-calculator" className="text-blue-600 hover:underline">Steps to Calories Calculator</Link>.</p>
    </Section>
  );
}
// --- CaloriesBurnedCalculator ---
export function CaloriesBurnedCalculator() {
  const clr = ac('CaloriesBurnedCalculator');
  const [weight, setWeight] = useState('70');
  const [duration, setDuration] = useState('30');
  const [activity, setActivity] = useState('running');
  const mets: Record<string, number> = { running: 9.8, walking: 3.5, cycling: 7.5, swimming: 8, yoga: 2.5, lifting: 4.5, 'jump rope': 12 };
  const met = mets[activity] || 5;
  const burned = met * Number(weight) * (Number(duration) / 60);
  return (
    <Section title="Calories Burned">
      <div className="flex gap-2"><select className={selClass} value={activity} onChange={e => setActivity(e.target.value)}>{Object.keys(mets).map(k => <option key={k}>{k}</option>)}</select>
      <div><label className={labelClass}>Weight (kg)</label><Input label="Value" type="number" value={weight} onChange={setWeight} /></div>
      <div><label className={labelClass}>Duration (min)</label><Input label="Value" type="number" value={duration} onChange={setDuration} /></div></div>
      <div className="text-lg font-bold">{burned.toFixed(0)} kcal burned</div>
    </Section>
  );
}
// --- BloodAlcoholCalculator ---
export function BloodAlcoholCalculator() {
  const clr = ac('BloodAlcoholCalculator');
  const [weight, setWeight] = useState('70');
  const [gender, setGender] = useState('male');
  const [drinks, setDrinks] = useState('3');
  const [hours, setHours] = useState('2');
  const w = Number(weight), d = Number(drinks), h = Number(hours);
  const r = gender === 'male' ? 0.68 : 0.55;
  const bac = (d * 14 / (w * 1000 * r)) * 100 - (h * 0.015);
  const finalBac = Math.max(0, bac);
  return (
    <Section title="Blood Alcohol Estimator">
      <div className="flex gap-2"><select className={selClass} value={gender} onChange={e => setGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option></select><Input label="Weight (kg)" type="number" value={weight} onChange={setWeight} placeholder="Weight (kg)" /></div>
      <div className="flex gap-2"><Input label="Drinks" type="number" value={drinks} onChange={setDrinks} placeholder="Drinks" /><Input label="Value" type="number" value={hours} onChange={setHours} placeholder="Hours" /></div>
      <div className={'text-lg font-bold ' + (finalBac >= 0.08 ? 'text-red-500' : 'text-green-600')}>BAC: {finalBac.toFixed(3)}%</div>
      {finalBac >= 0.08 && <div className="text-xs text-red-500">Over legal limit (0.08%)</div>}
    </Section>
  );
}
// --- PregnancyCalculator ---
export function PregnancyCalculator() {
  const clr = ac('PregnancyCalculator');
  const [lmp, setLmp] = useState('');
  const due = lmp ? new Date(new Date(lmp).getTime() + 280 * 86400000) : null;
  return (
    <Section title="Pregnancy Calculator">
      <label className={labelClass}>First day of last menstrual period</label>
      <Input label="Value" type="date" value={lmp} onChange={setLmp} />
      {due && <div><div className="text-lg font-bold">Due Date: {due.toLocaleDateString()}</div><div className="text-xs">Gestational age: {Math.floor((Date.now() - new Date(lmp).getTime()) / (7 * 86400000))} weeks</div></div>}
    </Section>
  );
}
// --- OvulationTracker ---
export function OvulationTracker() {
  const clr = ac('OvulationTracker');
  const [lmp, setLmp] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const results = lmp ? (() => {
    const start = new Date(lmp);
    const cycleLen = Number(cycleLength) || 28;
    const fertileStart = new Date(start.getTime() + (cycleLen - 14 - 5) * 86400000);
    const fertileEnd = new Date(start.getTime() + (cycleLen - 14 + 1) * 86400000);
    const ovulation = new Date(start.getTime() + (cycleLen - 14) * 86400000);
    const nextPeriod = new Date(start.getTime() + cycleLen * 86400000);
    return { fertileStart, fertileEnd, ovulation, nextPeriod };
  })() : null;
  return (
    <Section title="Ovulation Tracker">
      <label className={labelClass}>First day of LMP</label>
      <Input label="Value" type="date" value={lmp} onChange={setLmp} />
      <label className={labelClass}>Cycle Length (days)</label>
      <Input label="Value" type="number" value={cycleLength} onChange={setCycleLength} min={20} max={45} />
      {results && <div className="text-xs space-y-1">
        <div>Fertile window: {results.fertileStart.toLocaleDateString()} - {results.fertileEnd.toLocaleDateString()}</div>
        <div className="font-bold">Ovulation: {results.ovulation.toLocaleDateString()}</div>
        <div>Next period: {results.nextPeriod.toLocaleDateString()}</div>
      </div>}
    </Section>
  );
}
// --- AgeCalculator ---
