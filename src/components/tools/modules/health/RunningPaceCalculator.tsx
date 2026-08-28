"use client";
import { useState, useCallback } from 'react';
import { CalculatorShell } from '../shared/CalculatorShell';
import { inputCls, labelCls } from '../Calculators.shared';

export default function RunningPaceCalculator() {
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
