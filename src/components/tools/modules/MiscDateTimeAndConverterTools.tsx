"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { ac, pillClass, btnClass, borderClass } from './miscToolColors';

import { Section, Input, labelClass, selClass } from './MiscToolsShared';

export function AgeCalculator() {
  const clr = ac('AgeCalculator');
  const [birth, setBirth] = useState('');
  const calc = birth ? (() => {
    const b = new Date(birth), now = new Date();
    let y = now.getFullYear() - b.getFullYear(), m = now.getMonth() - b.getMonth(), d = now.getDate() - b.getDate();
    if (d < 0) { m--; d += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
    if (m < 0) { y--; m += 12; }
    return { y, m, d };
  })() : null;
  return (
    <Section title="Age Calculator">
      <Input label="Value" type="date" value={birth} onChange={setBirth} />
      {calc && <div className="text-lg font-bold">{calc.y} years, {calc.m} months, {calc.d} days</div>}
    </Section>
  );
}
// --- DateDifferenceCalculator ---
export function DateDifferenceCalculator() {
  const clr = ac('DateDifferenceCalculator');
  const [d1, setD1] = useState('');
  const [d2, setD2] = useState('');
  const diff = d1 && d2 ? (() => {
    const a = new Date(d1), b = new Date(d2);
    const ms = Math.abs(b.getTime() - a.getTime());
    return { days: Math.floor(ms / 86400000), hours: Math.floor(ms / 3600000), minutes: Math.floor(ms / 60000), seconds: Math.floor(ms / 1000) };
  })() : null;
  return (
    <Section title="Date Difference Calculator">
      <div className="flex gap-2"><Input label="Value" type="date" value={d1} onChange={setD1} /><Input label="Value" type="date" value={d2} onChange={setD2} /></div>
      {diff && <div className="text-xs space-y-1">
        <div className="font-bold">{diff.days} days</div>
        <div>{diff.hours} hours</div>
        <div className="text-muted">{diff.minutes} minutes</div>
        <div className="text-muted">{diff.seconds} seconds</div>
      </div>}
    </Section>
  );
}
// --- DateAdditionCalculator ---
export function DateAdditionCalculator() {
  const clr = ac('DateAdditionCalculator');
  const [start, setStart] = useState('');
  const [days, setDays] = useState('30');
  const result = start ? new Date(new Date(start).getTime() + Number(days) * 86400000) : null;
  return (
    <Section title="Date Addition / Subtraction">
      <div className="flex gap-2"><Input label="Value" type="date" value={start} onChange={setStart} /><Input label="Value" type="number" value={days} onChange={setDays} /></div>
      {result && <div className="text-lg font-bold">{result.toLocaleDateString()}</div>}
    </Section>
  );
}
// --- WeekNumberCalculator ---
export function WeekNumberCalculator() {
  const clr = ac('WeekNumberCalculator');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const d = new Date(date);
  const start = new Date(d.getFullYear(), 0, 1);
  const diff = Math.floor((d.getTime() - start.getTime()) / 86400000);
  const week = Math.ceil((diff + start.getDay() + 1) / 7);
  return (
    <Section title="Week Number Calculator">
      <Input label="Value" type="date" value={date} onChange={setDate} />
      <div className="text-lg font-bold">Week {week} of {d.getFullYear()}</div>
      <div className="text-xs text-muted">{d.toLocaleDateString('en-US', { weekday: 'long' })}</div>
    </Section>
  );
}
// --- TimeSinceCalculator ---
export function TimeSinceCalculator() {
  const clr = ac('TimeSinceCalculator');
  const [date, setDate] = useState(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const d = new Date(date);
  const now = new Date();
  const ms = now.getTime() - d.getTime();
  const sec = Math.floor(ms / 1000);
  const min = Math.floor(sec / 60);
  const hr = Math.floor(min / 60);
  const day = Math.floor(hr / 24);
  const wk = Math.floor(day / 7);
  const mo = Math.floor(day / 30.44);
  const yr = Math.floor(day / 365.25);
  return (
    <Section title="Time Since / Until">
      <Input label="Value" type="date" value={date} onChange={setDate} />
      <div className="text-xs space-y-1">
        <div>{yr} years</div><div>{mo} months</div><div>{wk} weeks</div>
        <div>{day} days</div><div>{hr} hours</div><div>{min} minutes</div><div>{sec} seconds</div>
      </div>
    </Section>
  );
}
// --- TimeZoneConverter ---
export function TimeZoneConverter() {
  const clr = ac('TimeZoneConverter');
  const [time, setTime] = useState('12:00');
  const [fromTz, setFromTz] = useState('UTC');
  const [toTz, setToTz] = useState('America/New_York');
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  const local = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  const fromOffset = -new Date(local.toLocaleString('en-US', { timeZone: fromTz })).getTimezoneOffset();
  const toOffset = -new Date(local.toLocaleString('en-US', { timeZone: toTz })).getTimezoneOffset();
  const diffMin = toOffset - fromOffset;
  const resultH = (h + Math.floor(diffMin / 60) + 24) % 24;
  const resultM = (m + diffMin % 60 + 60) % 60;
  return (
    <Section title="Time Zone Converter">
      <div className="flex gap-2"><Input label="Value" type="time" value={time} onChange={setTime} /><Input label="Value" value={fromTz} onChange={setFromTz} /></div>
      <div className="flex gap-2"><Input label="Value" value={toTz} onChange={setToTz} /></div>
      <div className="text-lg font-bold">{String(resultH).padStart(2, '0')}:{String(resultM).padStart(2, '0')}</div>
      <div className="text-xs text-muted">From: {fromTz} → To: {toTz}</div>
    </Section>
  );
}
// --- DaylightSavingTimeChecker ---
export function DaylightSavingTimeChecker() {
  const clr = ac('DaylightSavingTimeChecker');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const y = Number(year);
  const march = new Date(y, 2, 14);
  const nov = new Date(y, 10, 7);
  const dstStart = new Date(march.getTime() + (7 - march.getDay()) * 86400000);
  const dstEnd = new Date(nov.getTime() + (7 - nov.getDay()) * 86400000);
  return (
    <Section title="DST Checker (US)">
      <Input label="Value" type="number" value={year} onChange={setYear} />
      <div className="text-xs">
        <div>DST starts: {dstStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <div>DST ends: {dstEnd.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
        <div>DST period: {Math.round((dstEnd.getTime() - dstStart.getTime()) / 86400000)} days</div>
      </div>
    </Section>
  );
}
// --- WorkHoursCalculator ---
export function WorkHoursCalculator() {
  const clr = ac('WorkHoursCalculator');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [breakMin, setBreakMin] = useState('30');
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  const total = (eH * 60 + eM) - (sH * 60 + sM) - Number(breakMin);
  const hrs = Math.floor(total / 60), mins = total % 60;
  return (
    <Section title="Work Hours Calculator">
      <div className="flex gap-2"><Input label="Value" type="time" value={start} onChange={setStart} /><Input label="Value" type="time" value={end} onChange={setEnd} /><Input label="Value" type="number" value={breakMin} onChange={setBreakMin} /></div>
      <div className="text-lg font-bold">{hrs}h {mins}m</div>
    </Section>
  );
}
// --- HoursMinutesCalculator ---
export function HoursMinutesCalculator() {
  const clr = ac('HoursMinutesCalculator');
  const [h1, setH1] = useState('1'); const [m1, setM1] = useState('30');
  const [h2, setH2] = useState('2'); const [m2, setM2] = useState('15');
  const t1 = Number(h1) * 60 + Number(m1), t2 = Number(h2) * 60 + Number(m2);
  const total = t1 + t2, diff = Math.abs(t1 - t2);
  return (
    <Section title="Hours & Minutes Calculator">
      <div className="flex gap-2">
        <Input label="Value" type="number" value={h1} onChange={setH1} /><Input label="Value" type="number" value={m1} onChange={setM1} />
        <span className="self-center text-muted">+</span>
        <Input label="Value" type="number" value={h2} onChange={setH2} /><Input label="Value" type="number" value={m2} onChange={setM2} />
      </div>
      <div className="text-xs">Total: {Math.floor(total / 60)}h {total % 60}m</div>
      <div className="text-xs">Diff: {Math.floor(diff / 60)}h {diff % 60}m</div>
    </Section>
  );
}
// --- MinutesToHoursConverter ---
export function MinutesToHoursConverter() {
  const clr = ac('MinutesToHoursConverter');
  const [mins, setMins] = useState('150');
  const m = Number(mins);
  return (
    <Section title="Minutes → Hours Converter">
      <Input label="Value" type="number" value={mins} onChange={setMins} />
      <div className="text-lg font-bold">{Math.floor(m / 60)}h {m % 60}m</div>
      <div className="text-xs text-muted">Decimal: {(m / 60).toFixed(2)} hours</div>
    </Section>
  );
}
// --- HoursToMinutesTool ---
export function HoursToMinutesTool() {
  const clr = ac('HoursToMinutesTool');
  const [hrs, setHrs] = useState('2.5');
  const h = Number(hrs);
  return (
    <Section title="Hours → Minutes Tool">
      <Input label="Value" type="number" value={hrs} onChange={setHrs} step="0.1" />
      <div className="text-lg font-bold">{Math.floor(h * 60)} minutes</div>
      <div className="text-xs text-muted">{h * 3600} seconds</div>
    </Section>
  );
}
// --- SecondsToMinutesConverter ---
export function SecondsToMinutesConverter() {
  const clr = ac('SecondsToMinutesConverter');
  const [sec, setSec] = useState('3661');
  const s = Number(sec);
  return (
    <Section title="Seconds → Minutes Converter">
      <Input label="Value" type="number" value={sec} onChange={setSec} />
      <div className="text-lg font-bold">{Math.floor(s / 3600)}h {Math.floor((s % 3600) / 60)}m {s % 60}s</div>
    </Section>
  );
}
// --- SpeedConverter ---
export function SpeedConverter() {
  const clr = ac('SpeedConverter');
  const [kmh, setKmh] = useState('100');
  const k = Number(kmh);
  return (
    <Section title="Speed Converter">
      <Input label="Value" type="number" value={kmh} onChange={setKmh} />
      <div className="text-xs space-y-1">
        <div>mph: {(k * 0.621371).toFixed(2)}</div>
        <div>knots: {(k * 0.539957).toFixed(2)}</div>
        <div>m/s: {(k / 3.6).toFixed(2)}</div>
        <div>ft/s: {(k * 0.911344).toFixed(2)}</div>
      </div>
    </Section>
  );
}
// --- LengthConverter ---
export function LengthConverter() {
  const clr = ac('LengthConverter');
  const [meters, setMeters] = useState('100');
  const m = Number(meters);
  return (
    <Section title="Length Converter">
      <Input label="Value" type="number" value={meters} onChange={setMeters} />
      <div className="text-xs space-y-1">
        <div>km: {(m / 1000).toFixed(4)}</div>
        <div>miles: {(m * 0.000621371).toFixed(4)}</div>
        <div>yards: {(m * 1.09361).toFixed(2)}</div>
        <div>feet: {(m * 3.28084).toFixed(2)}</div>
        <div>inches: {(m * 39.3701).toFixed(2)}</div>
      </div>
    </Section>
  );
}
// --- WeightConverter ---
export function WeightConverter() {
  const clr = ac('WeightConverter');
  const [kg, setKg] = useState('70');
  const k = Number(kg);
  return (
    <Section title="Weight Converter">
      <Input label="Value" type="number" value={kg} onChange={setKg} />
      <div className="text-xs space-y-1">
        <div>g: {(k * 1000).toFixed(0)}</div>
        <div>lb: {(k * 2.20462).toFixed(2)}</div>
        <div>oz: {(k * 35.274).toFixed(2)}</div>
        <div>stone: {(k * 0.157473).toFixed(2)}</div>
      </div>
    </Section>
  );
}
// --- VolumeConverter ---
export function VolumeConverter() {
  const clr = ac('VolumeConverter');
  const [liters, setLiters] = useState('1');
  const l = Number(liters);
  return (
    <Section title="Volume Converter">
      <Input label="Value" type="number" value={liters} onChange={setLiters} />
      <div className="text-xs space-y-1">
        <div>mL: {(l * 1000).toFixed(0)}</div>
        <div>gal (US): {(l * 0.264172).toFixed(4)}</div>
        <div>qt: {(l * 1.05669).toFixed(4)}</div>
        <div>fl oz: {(l * 33.814).toFixed(2)}</div>
        <div>cups: {(l * 4.22675).toFixed(2)}</div>
      </div>
    </Section>
  );
}
// --- AreaConverter ---
export function AreaConverter() {
  const clr = ac('AreaConverter');
  const [sqm, setSqm] = useState('100');
  const a = Number(sqm);
  return (
    <Section title="Area Converter">
      <Input label="Value" type="number" value={sqm} onChange={setSqm} />
      <div className="text-xs space-y-1">
        <div>sq ft: {(a * 10.7639).toFixed(2)}</div>
        <div>acres: {(a * 0.000247105).toFixed(6)}</div>
        <div>hectares: {(a * 0.0001).toFixed(6)}</div>
        <div>sq km: {(a / 1e6).toFixed(6)}</div>
      </div>
    </Section>
  );
}
// --- DataSizeConverter ---
export function DataSizeConverter() {
  const clr = ac('DataSizeConverter');
  const [bytes, setBytes] = useState('1073741824');
  const b = Number(bytes);
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const conv = units.map((u, i) => ({ unit: u, value: b / Math.pow(1024, i) }));
  return (
    <Section title="Data Size Converter">
      <Input label="Value" type="number" value={bytes} onChange={setBytes} />
      <div className="text-xs space-y-1">
        {conv.map(c => <div key={c.unit}><span className="text-muted">{c.unit}:</span> {c.value.toFixed(2)}</div>)}
      </div>
    </Section>
  );
}
