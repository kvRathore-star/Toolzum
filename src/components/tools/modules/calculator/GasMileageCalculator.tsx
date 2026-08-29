"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function GasMileageCalculator() {
  const [distance, setDistance] = useState('300');
  const [gallons, setGallons] = useState('10');
  const [pricePerGallon, setPricePerGallon] = useState('3.50');
  const [unit, setUnit] = useState<'us'|'metric'>('us');
  const [result, setResult] = useState('');
  const calc = useCallback(() => {
    const d = parseFloat(distance) || 0;
    const g = parseFloat(gallons) || 0;
    const p = parseFloat(pricePerGallon) || 0;
    if (!d || !g) { setResult(''); return; }
    if (unit === 'us') {
      const mpg = d / g;
      const cost = g * p;
      const perMile = cost / d;
      setResult(`Fuel economy: ${mpg.toFixed(1)} mpg\nFuel used: ${g.toFixed(1)} gal\nFuel cost: $${cost.toFixed(2)}\nCost per mile: $${perMile.toFixed(3)}`);
    } else {
      const liters = g * 3.78541;
      const km = d * 1.60934;
      const lPer100km = (liters / km) * 100;
      const cost = g * p;
      setResult(`Fuel economy: ${lPer100km.toFixed(1)} L/100km\nFuel used: ${liters.toFixed(1)} L\nFuel cost: $${cost.toFixed(2)}\nCost per km: $${(cost / km).toFixed(3)}`);
    }
  }, [distance, gallons, pricePerGallon, unit]);
  return (
    <CalculatorShell title="Gas Mileage Calculator" accent="amber" result={result} onCalculate={calc} customResult={
      result ? (
        <div className="font-mono text-sm whitespace-pre">{result}</div>
      ) : null
    }>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Unit</label><select className={inputCls} value={unit} onChange={e => setUnit(e.target.value as 'us'|'metric')}><option value="us">US (mi, gal)</option><option value="metric">Metric (km, L)</option></select></div>
        <div className="opacity-0 pointer-events-none"><label className={labelCls}>_</label><input className={inputCls} /></div>
        <div><label className={labelCls}>{unit === 'us' ? 'Distance (miles)' : 'Distance (km)'}</label><input className={inputCls} type="number" value={distance} onChange={e => setDistance(e.target.value)} /></div>
        <div><label className={labelCls}>{unit === 'us' ? 'Gallons used' : 'Gallons used'}</label><input className={inputCls} type="number" value={gallons} onChange={e => setGallons(e.target.value)} /></div>
        <div><label className={labelCls}>Price per gallon ($)</label><input className={inputCls} type="number" value={pricePerGallon} onChange={e => setPricePerGallon(e.target.value)} /></div>
      </div>
      <div className="flex gap-3 mt-3">
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setDistance('300'); setGallons('10'); setUnit('us'); }}>Avg SUV</button>
        <button className="px-4 py-2 rounded-xl text-sm bg-[var(--bg-overlay)] border border-[var(--border-subtle)] text-[var(--text-secondary)]" onClick={() => { setDistance('400'); setGallons('8'); setUnit('us'); }}>Efficient sedan</button>
      </div>
    </CalculatorShell>
  );
}
