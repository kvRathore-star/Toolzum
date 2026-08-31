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
      auto={true}
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
      auto={true}
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
      auto={true}
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
      auto={true}
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

  const presets = [
    { label: '70kg, 30min', apply: () => { setWeight('70'); setActivity('30'); } },
    { label: '60kg, 60min', apply: () => { setWeight('60'); setActivity('60'); } },
    { label: '80kg, 90min', apply: () => { setWeight('80'); setActivity('90'); } },
    { label: 'Clear', apply: () => { setWeight('70'); setActivity('30'); } },
  ];

  const resultText = `${(base + extra).toFixed(1)} L / day`;

  return (
    <CalculatorShell
      title="Daily Water Intake"
      result={resultText}
      auto={true}
      presets={presets}
      accent="blue"
      downloadData={JSON.stringify({ weight: w, activityMin: Number(activity), base: base.toFixed(2), extra: extra.toFixed(2), total: (base + extra).toFixed(2) }, null, 2)}
      downloadFilename="water.json"
    >
      <div className="space-y-4">
        <div className="flex gap-2"><div><label className={labelClass}>Weight (kg)</label><Input label="Value" type="number" value={weight} onChange={setWeight} /></div><div><label className={labelClass}>Exercise (min)</label><Input label="Value" type="number" value={activity} onChange={setActivity} /></div></div>
      </div>
    </CalculatorShell>
  );
}
// --- SleepRequirementCalculator ---
export function SleepRequirementCalculator() {
  const clr = ac('SleepRequirementCalculator');
  const [age, setAge] = useState('30');
  const a = Number(age);
  const rec = a < 1 ? '12-16 hours' : a < 2 ? '11-14 hours' : a < 5 ? '10-13 hours' : a < 13 ? '9-12 hours' : a < 18 ? '8-10 hours' : a < 65 ? '7-9 hours' : '7-8 hours';

  const presets = [
    { label: 'Infant (0-1)', apply: () => { setAge('0'); } },
    { label: 'Child (5)', apply: () => { setAge('5'); } },
    { label: 'Teen (15)', apply: () => { setAge('15'); } },
    { label: 'Adult (30)', apply: () => { setAge('30'); } },
    { label: 'Senior (70)', apply: () => { setAge('70'); } },
  ];

  const resultText = `Recommended: ${rec}`;

  return (
    <CalculatorShell
      title="Sleep Requirements by Age"
      result={resultText}
      auto={true}
      presets={presets}
      accent="indigo"
      downloadData={JSON.stringify({ age: a, recommendation: rec }, null, 2)}
      downloadFilename="sleep.json"
    >
      <div className="space-y-4">
        <Input label="Value" type="number" value={age} onChange={setAge} />
      </div>
    </CalculatorShell>
  );
}
// --- HeartRateCalculator ---
export function HeartRateCalculator() {
  const clr = ac('HeartRateCalculator');
  const [age, setAge] = useState('35');
  const a = Number(age);
  const max = 220 - a;

  const presets = [
    { label: 'Age 20', apply: () => { setAge('20'); } },
    { label: 'Age 30', apply: () => { setAge('30'); } },
    { label: 'Age 40', apply: () => { setAge('40'); } },
    { label: 'Age 50', apply: () => { setAge('50'); } },
  ];

  const resultText = `Max HR: ${max} bpm | Zone 1: ${Math.round(max * 0.5)}-${Math.round(max * 0.6)} | Zone 2: ${Math.round(max * 0.6)}-${Math.round(max * 0.7)} | Zone 3: ${Math.round(max * 0.7)}-${Math.round(max * 0.8)} | Zone 4: ${Math.round(max * 0.8)}-${Math.round(max * 0.9)} | Zone 5: ${Math.round(max * 0.9)}-${max}`;

  return (
    <CalculatorShell
      title="Target Heart Rate Zones"
      result={resultText}
      auto={true}
      presets={presets}
      accent="rose"
      downloadData={JSON.stringify({ age: a, maxHR: max, zones: { z1: `${Math.round(max * 0.5)}-${Math.round(max * 0.6)}`, z2: `${Math.round(max * 0.6)}-${Math.round(max * 0.7)}`, z3: `${Math.round(max * 0.7)}-${Math.round(max * 0.8)}`, z4: `${Math.round(max * 0.8)}-${Math.round(max * 0.9)}`, z5: `${Math.round(max * 0.9)}-${max}` } }, null, 2)}
      downloadFilename="heart-rate.json"
    >
      <div className="space-y-4">
        <Input label="Value" type="number" value={age} onChange={setAge} />
        <p className="text-xs text-[var(--text-secondary)]">Uses %-of-max HR method. For Karvonen method, see <Link href="/health/heart-rate-zone-calculator" className="text-blue-600 hover:underline">Heart Rate Zone Calculator</Link>.</p>
      </div>
    </CalculatorShell>
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

  const presets = [
    { label: 'Male 170cm', apply: () => { setGender('male'); setHeight('170'); } },
    { label: 'Female 160cm', apply: () => { setGender('female'); setHeight('160'); } },
    { label: 'Male 180cm', apply: () => { setGender('male'); setHeight('180'); } },
    { label: 'Clear', apply: () => { setHeight('170'); setGender('male'); } },
  ];

  const resultText = `Devine: ${devine.toFixed(1)} kg | Robinson: ${robinson.toFixed(1)} kg`;

  return (
    <CalculatorShell
      title="Ideal Body Weight"
      result={resultText}
      auto={true}
      presets={presets}
      accent="emerald"
      downloadData={JSON.stringify({ height: h, gender, devine: devine.toFixed(1), robinson: robinson.toFixed(1) }, null, 2)}
      downloadFilename="ideal-weight.json"
    >
      <div className="space-y-4">
        <div className="flex gap-2"><select className={selClass} value={gender} onChange={e => setGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option></select><Input label="Value" type="number" value={height} onChange={setHeight} /></div>
      </div>
    </CalculatorShell>
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

  const presets = [
    { label: '10km in 50min', apply: () => { setDist('10'); setTime('50'); } },
    { label: '5km in 25min', apply: () => { setDist('5'); setTime('25'); } },
    { label: 'Marathon (42.2km) 3:30', apply: () => { setDist('42.2'); setTime('210'); } },
    { label: 'Clear', apply: () => { setDist('10'); setTime('50'); } },
  ];

  const resultText = d ? `${paceMinWhole}:${paceSec.toString().padStart(2, '0')} /km (${(d / t * 60).toFixed(2)} km/h)` : 'Enter distance and time';

  return (
    <CalculatorShell
      title="Running Pace Calculator"
      result={resultText}
      auto={true}
      presets={presets}
      accent="amber"
      downloadData={d ? JSON.stringify({ distanceKm: d, timeMin: t, pace: `${paceMinWhole}:${paceSec.toString().padStart(2, '0')}`, speedKmh: (d / t * 60).toFixed(2) }, null, 2) : ''}
      downloadFilename="pace.json"
    >
      <div className="space-y-4">
        <div className="flex gap-2"><div><label className={labelClass}>Distance (km)</label><Input label="Value" type="number" value={dist} onChange={setDist} /></div><div><label className={labelClass}>Time (min)</label><Input label="Value" type="number" value={time} onChange={setTime} /></div></div>
      </div>
    </CalculatorShell>
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

  const presets = [
    { label: '10,000 steps (170cm)', apply: () => { setSteps('10000'); setHeight('170'); } },
    { label: '5,000 steps (160cm)', apply: () => { setSteps('5000'); setHeight('160'); } },
    { label: '15,000 steps (180cm)', apply: () => { setSteps('15000'); setHeight('180'); } },
    { label: 'Clear', apply: () => { setSteps('10000'); setHeight('170'); } },
  ];

  const resultText = `Distance: ${distKm.toFixed(2)} km | ${distMi.toFixed(2)} miles | Calories: ${(s * 0.04).toFixed(0)} kcal`;

  return (
    <CalculatorShell
      title="Steps to Distance"
      result={resultText}
      auto={true}
      presets={presets}
      accent="indigo"
      downloadData={JSON.stringify({ steps: s, height: h, distanceKm: distKm.toFixed(2), distanceMiles: distMi.toFixed(2), calories: (s * 0.04).toFixed(0) }, null, 2)}
      downloadFilename="steps-distance.json"
    >
      <div className="space-y-4">
        <div className="flex gap-2"><div><label className={labelClass}>Steps</label><Input label="Value" type="number" value={steps} onChange={setSteps} /></div><div><label className={labelClass}>Height (cm)</label><Input label="Value" type="number" value={height} onChange={setHeight} /></div></div>
        <p className="text-xs text-[var(--text-secondary)]">Uses height-based stride estimate (stride = height × 0.415). For weight-based calories, see <Link href="/health/steps-to-calories-calculator" className="text-blue-600 hover:underline">Steps to Calories Calculator</Link>.</p>
      </div>
    </CalculatorShell>
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

  const presets = [
    { label: 'Running 30min (70kg)', apply: () => { setActivity('running'); setWeight('70'); setDuration('30'); } },
    { label: 'Walking 60min (70kg)', apply: () => { setActivity('walking'); setWeight('70'); setDuration('60'); } },
    { label: 'Cycling 45min (70kg)', apply: () => { setActivity('cycling'); setWeight('70'); setDuration('45'); } },
    { label: 'Clear', apply: () => { setActivity('running'); setWeight('70'); setDuration('30'); } },
  ];

  const resultText = `${burned.toFixed(0)} kcal burned (${activity}, ${met} METs)`;

  return (
    <CalculatorShell
      title="Calories Burned"
      result={resultText}
      auto={true}
      presets={presets}
      accent="orange"
      downloadData={JSON.stringify({ weight: Number(weight), duration: Number(duration), activity, met, calories: burned.toFixed(0) }, null, 2)}
      downloadFilename="calories-burned.json"
    >
      <div className="space-y-4">
        <select className={selClass} value={activity} onChange={e => setActivity(e.target.value)}>{Object.keys(mets).map(k => <option key={k}>{k}</option>)}</select>
        <div className="flex gap-2"><div><label className={labelClass}>Weight (kg)</label><Input label="Value" type="number" value={weight} onChange={setWeight} /></div><div><label className={labelClass}>Duration (min)</label><Input label="Value" type="number" value={duration} onChange={setDuration} /></div></div>
      </div>
    </CalculatorShell>
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

  const presets = [
    { label: 'Male, 70kg, 3 drinks, 2hrs', apply: () => { setGender('male'); setWeight('70'); setDrinks('3'); setHours('2'); } },
    { label: 'Female, 60kg, 2 drinks, 1hr', apply: () => { setGender('female'); setWeight('60'); setDrinks('2'); setHours('1'); } },
    { label: 'Male, 80kg, 5 drinks, 3hrs', apply: () => { setGender('male'); setWeight('80'); setDrinks('5'); setHours('3'); } },
    { label: 'Clear', apply: () => { setGender('male'); setWeight('70'); setDrinks('3'); setHours('2'); } },
  ];

  const resultText = `BAC: ${finalBac.toFixed(3)}% ${finalBac >= 0.08 ? '⚠️ Over legal limit (0.08%)' : '✅ Under legal limit'}`;

  return (
    <CalculatorShell
      title="Blood Alcohol Estimator"
      result={resultText}
      auto={true}
      presets={presets}
      accent={finalBac >= 0.08 ? 'red' : 'green'}
      downloadData={JSON.stringify({ weight: w, gender, drinks: d, hours: h, bac: finalBac.toFixed(3), overLimit: finalBac >= 0.08 }, null, 2)}
      downloadFilename="bac.json"
    >
      <div className="space-y-4">
        <div className="flex gap-2"><select className={selClass} value={gender} onChange={e => setGender(e.target.value)}><option value="male">Male</option><option value="female">Female</option></select><Input label="Weight (kg)" type="number" value={weight} onChange={setWeight} placeholder="Weight (kg)" /></div>
        <div className="flex gap-2"><Input label="Drinks" type="number" value={drinks} onChange={setDrinks} placeholder="Drinks" /><Input label="Value" type="number" value={hours} onChange={setHours} placeholder="Hours" /></div>
      </div>
    </CalculatorShell>
  );
}
// --- PregnancyCalculator ---
export function PregnancyCalculator() {
  const clr = ac('PregnancyCalculator');
  const [lmp, setLmp] = useState('');
  const due = lmp ? new Date(new Date(lmp).getTime() + 280 * 86400000) : null;

  const presets = [
    { label: 'Today', apply: () => { setLmp(new Date().toISOString().slice(0, 10)); } },
    { label: '1 week ago', apply: () => { setLmp(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)); } },
    { label: '2 weeks ago', apply: () => { setLmp(new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10)); } },
    { label: 'Clear', apply: () => { setLmp(''); } },
  ];

  const resultText = due ? `Due Date: ${due.toLocaleDateString()} | Gestational age: ${Math.floor((Date.now() - new Date(lmp).getTime()) / (7 * 86400000))} weeks` : 'Enter LMP date';

  return (
    <CalculatorShell
      title="Pregnancy Calculator"
      result={resultText}
      auto={true}
      presets={presets}
      accent="pink"
      downloadData={due ? JSON.stringify({ lmp, dueDate: due.toISOString().slice(0, 10), gestationalWeeks: Math.floor((Date.now() - new Date(lmp).getTime()) / (7 * 86400000)) }, null, 2) : ''}
      downloadFilename="pregnancy.json"
    >
      <div className="space-y-4">
        <label className={labelClass}>First day of last menstrual period</label>
        <Input label="Value" type="date" value={lmp} onChange={setLmp} />
      </div>
    </CalculatorShell>
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

  const presets = [
    { label: '28-day cycle, today', apply: () => { setLmp(new Date().toISOString().slice(0, 10)); setCycleLength('28'); } },
    { label: '30-day cycle, 1 week ago', apply: () => { setLmp(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)); setCycleLength('30'); } },
    { label: '26-day cycle, 2 weeks ago', apply: () => { setLmp(new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10)); setCycleLength('26'); } },
    { label: 'Clear', apply: () => { setLmp(''); setCycleLength('28'); } },
  ];

  const resultText = results ? `Fertile: ${results.fertileStart.toLocaleDateString()} - ${results.fertileEnd.toLocaleDateString()} | Ovulation: ${results.ovulation.toLocaleDateString()} | Next period: ${results.nextPeriod.toLocaleDateString()}` : 'Enter LMP and cycle length';

  return (
    <CalculatorShell
      title="Ovulation Tracker"
      result={resultText}
      auto={true}
      presets={presets}
      accent="pink"
      downloadData={results ? JSON.stringify({ lmp, cycleLength: Number(cycleLength), fertileWindow: { start: results.fertileStart.toISOString().slice(0, 10), end: results.fertileEnd.toISOString().slice(0, 10) }, ovulation: results.ovulation.toISOString().slice(0, 10), nextPeriod: results.nextPeriod.toISOString().slice(0, 10) }, null, 2) : ''}
      downloadFilename="ovulation.json"
    >
      <div className="space-y-4">
        <label className={labelClass}>First day of LMP</label>
        <Input label="Value" type="date" value={lmp} onChange={setLmp} />
        <label className={labelClass}>Cycle Length (days)</label>
        <Input label="Value" type="number" value={cycleLength} onChange={setCycleLength} min={20} max={45} />
      </div>
    </CalculatorShell>
  );
}
