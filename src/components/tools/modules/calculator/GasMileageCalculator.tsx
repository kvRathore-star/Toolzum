"use client";
import { useState } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function GasMileageCalculator() {
  const [distance, setDistance] = useState('300');
  const [gallons, setGallons] = useState('10');
  const [pricePerGallon, setPricePerGallon] = useState('3.50');
  const [unit, setUnit] = useState<'us'|'metric'>('us');
  const presets = [
    { label: 'Avg SUV', apply: () => { setDistance('300'); setGallons('10'); setUnit('us'); } },
    { label: 'Efficient sedan', apply: () => { setDistance('400'); setGallons('8'); setUnit('us'); } },
  ];
  const d = parseFloat(distance) || 0;
  const g = parseFloat(gallons) || 0;
  const p = parseFloat(pricePerGallon) || 0;
  const hasInput = d > 0 && g > 0;
  let usText = '';
  let metricText = '';
  if (hasInput) {
    usText = `Fuel economy: ${(d / g).toFixed(1)} mpg\nFuel used: ${g.toFixed(1)} gal\nFuel cost: $${(g * p).toFixed(2)}\nCost per mile: $${((g * p) / d).toFixed(3)}`;
    const liters = g * 3.78541;
    const km = d * 1.60934;
    const cost = g * p;
    metricText = `Fuel economy: ${((liters / km) * 100).toFixed(1)} L/100km\nFuel used: ${liters.toFixed(1)} L\nFuel cost: $${cost.toFixed(2)}\nCost per km: $${(cost / km).toFixed(3)}`;
  }
  const customResult = !hasInput ? (
    <div className="text-sm text-[var(--text-muted)]">Enter distance and gallons used</div>
  ) : unit === 'us' ? (
    <div className="font-mono text-sm whitespace-pre">{usText}</div>
  ) : (
    <div className="font-mono text-sm whitespace-pre">{metricText}</div>
  );
  return (
    <CalculatorShell category="Calculator" title="Gas Mileage Calculator" accent="amber" result="" auto presets={presets} customResult={customResult}>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Unit</label><select aria-label="Unit" className={inputCls} value={unit} onChange={e => setUnit(e.target.value as 'us'|'metric')}><option value="us">US (mi, gal)</option><option value="metric">Metric (km, L)</option></select></div>
        <div className="opacity-0 pointer-events-none"><label className={labelCls}>_</label><input aria-label="_" className={inputCls} /></div>
        <div><label className={labelCls}>{unit === 'us' ? 'Distance (miles)' : 'Distance (km)'}</label><input aria-label={unit === 'us' ? 'Distance (miles)' : 'Distance (km)'} className={inputCls} type="number" value={distance} onChange={e => setDistance(e.target.value)} /></div>
        <div><label className={labelCls}>{unit === 'us' ? 'Gallons used' : 'Gallons used'}</label><input aria-label="Gallons used" className={inputCls} type="number" value={gallons} onChange={e => setGallons(e.target.value)} /></div>
        <div><label className={labelCls}>Price per gallon ($)</label><input aria-label="Price per gallon ($)" className={inputCls} type="number" value={pricePerGallon} onChange={e => setPricePerGallon(e.target.value)} /></div>
      </div>
    </CalculatorShell>
  );
}
