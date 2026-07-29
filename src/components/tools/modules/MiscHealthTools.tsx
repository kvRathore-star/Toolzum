"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { ac, pillClass, btnClass, borderClass } from './miscToolColors';

import { Section, Input, labelClass, selClass } from './MiscToolsShared';

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
  return (
    <Section title="BMI Calculator">
      <select className={selClass} value={unit} onChange={e => setUnit(e.target.value)}>
        <option value="metric">Metric (cm/kg)</option><option value="imperial">Imperial (in/lb)</option>
      </select>
      <div className="flex gap-2">
        <Input label="Value" type="number" value={height} onChange={setHeight} placeholder={unit === 'metric' ? 'cm' : 'in'} />
        <Input label="Value" type="number" value={weight} onChange={setWeight} placeholder={unit === 'metric' ? 'kg' : 'lb'} />
      </div>
      <div className={'text-2xl font-bold ' + color}>{bmi.toFixed(1)}</div>
      <div className={'text-sm font-medium ' + color}>{category}</div>
    </Section>
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
  return (
    <Section title="Body Fat % Estimator">
      <select className={selClass} value={gender} onChange={e => setGender(e.target.value)}>
        <option value="male">Male</option><option value="female">Female</option>
      </select>
      <div className="flex gap-2">
        <div><label className={labelClass}>BMI</label><Input label="Value" type="number" value={bmi} onChange={setBmi} /></div>
        <div><label className={labelClass}>Age</label><Input label="Value" type="number" value={age} onChange={setAge} /></div>
      </div>
      <div className="text-lg font-bold">Body Fat: {bf.toFixed(1)}%</div>
    </Section>
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
  return (
    <Section title="Daily Calorie Needs">
      <div className="flex gap-2">
        <select className={selClass} value={gender} onChange={e => setGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option></select>
        <select className={selClass} value={activity} onChange={e => setActivity(e.target.value)}>
          <option value="1.2">Sedentary</option><option value="1.375">Light</option><option value="1.55">Moderate</option>
          <option value="1.725">Active</option><option value="1.9">Very Active</option>
        </select>
      </div>
      <div className="flex gap-2"><div><label className={labelClass}>Weight (kg)</label><Input label="Value" type="number" value={weight} onChange={setWeight} /></div><div><label className={labelClass}>Height (cm)</label><Input label="Value" type="number" value={height} onChange={setHeight} /></div><div><label className={labelClass}>Age</label><Input label="Value" type="number" value={age} onChange={setAge} /></div></div>
      <div className="text-lg font-bold">BMR: {bmr.toFixed(0)} kcal/day</div>
      <div className="text-sm">Maintenance: {(bmr * act).toFixed(0)} kcal/day</div>
    </Section>
  );
}
// --- MacroSplitCalculator ---
export function MacroSplitCalculator() {
  const clr = ac('MacroSplitCalculator');
  const [calories, setCalories] = useState('2000');
  const c = Number(calories);
  return (
    <Section title="Daily Macronutrients">
      <Input label="Value" type="number" value={calories} onChange={setCalories} />
      <div className="text-xs space-y-1">
        <div className="flex justify-between"><span>Protein (30%)</span><span className="font-bold">{(c * 0.3 / 4).toFixed(0)}g = {(c * 0.3).toFixed(0)} kcal</span></div>
        <div className="flex justify-between"><span>Carbs (40%)</span><span className="font-bold">{(c * 0.4 / 4).toFixed(0)}g = {(c * 0.4).toFixed(0)} kcal</span></div>
        <div className="flex justify-between"><span>Fat (30%)</span><span className="font-bold">{(c * 0.3 / 9).toFixed(0)}g = {(c * 0.3).toFixed(0)} kcal</span></div>
      </div>
    </Section>
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
      <p className="text-xs text-[var(--text-secondary)] mt-2">Uses %-of-max HR method. For a more precise calculation using your resting HR, see <a href="/calculator/heart-rate-zone-calculator" className="text-blue-600 hover:underline">Heart Rate Zone Calculator (Karvonen)</a>.</p>
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
      <p className="text-xs text-[var(--text-secondary)] mt-2">Uses height-based stride estimate (stride = height × 0.415). For a weight-based calorie calculation, see <a href="/calculator/steps-to-calories-calculator" className="text-blue-600 hover:underline">Steps to Calories Calculator</a>.</p>
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
