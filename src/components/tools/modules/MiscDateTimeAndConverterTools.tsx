"use client";
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { ac, pillClass, btnClass, borderClass } from './miscToolColors';
import { Input, labelClass, selClass } from './MiscToolsShared';
import { CalculatorShell } from './shared/CalculatorShell';

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

  const presets = [
    { label: 'Today - 1 week', apply: () => { setD1(new Date().toISOString().slice(0, 10)); setD2(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)); } },
    { label: 'Today - 1 month', apply: () => { setD1(new Date().toISOString().slice(0, 10)); setD2(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)); } },
    { label: 'Today - 1 year', apply: () => { setD1(new Date().toISOString().slice(0, 10)); setD2(new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)); } },
    { label: 'Clear', apply: () => { setD1(''); setD2(''); } },
  ];

  const resultText = diff ? `${diff.days} days (${diff.hours}h ${diff.minutes}m ${diff.seconds}s)` : 'Select two dates';

  return (
    <CalculatorShell category="Converter"
      title="Date Difference Calculator"
      result={resultText}
      auto={true}
      presets={presets}
      accent="indigo"
      downloadData={diff ? JSON.stringify({ date1: d1, date2: d2, ...diff }, null, 2) : ''}
      downloadFilename="date-diff.json"
    >
      <div className="space-y-4">
        <div className="flex gap-2"><Input label="Start date" type="date" value={d1} onChange={setD1} /><Input label="End date" type="date" value={d2} onChange={setD2} /></div>
      </div>
    </CalculatorShell>
  );
}
// --- DateAdditionCalculator ---
export function DateAdditionCalculator() {
  const clr = ac('DateAdditionCalculator');
  const [start, setStart] = useState('');
  const [days, setDays] = useState('30');
  const result = start ? new Date(new Date(start).getTime() + Number(days) * 86400000) : null;

  const presets = [
    { label: 'Today + 30 days', apply: () => { setStart(new Date().toISOString().slice(0, 10)); setDays('30'); } },
    { label: 'Today + 7 days', apply: () => { setStart(new Date().toISOString().slice(0, 10)); setDays('7'); } },
    { label: 'Today + 90 days', apply: () => { setStart(new Date().toISOString().slice(0, 10)); setDays('90'); } },
    { label: 'Clear', apply: () => { setStart(''); setDays('30'); } },
  ];

  const resultText = result ? result.toLocaleDateString() : 'Enter start date and days';

  return (
    <CalculatorShell category="Converter"
      title="Date Addition / Subtraction"
      result={resultText}
      auto={true}
      presets={presets}
      accent="emerald"
      downloadData={result ? JSON.stringify({ start, days: Number(days), result: result.toISOString().slice(0, 10) }, null, 2) : ''}
      downloadFilename="date-add.json"
    >
      <div className="space-y-4">
        <div className="flex gap-2"><Input label="Start date" type="date" value={start} onChange={setStart} /><Input label="Days to add or subtract" type="number" value={days} onChange={setDays} /></div>
      </div>
    </CalculatorShell>
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

  const presets = [
    { label: 'Today', apply: () => { setDate(new Date().toISOString().slice(0, 10)); } },
    { label: 'Jan 1', apply: () => { setDate(`${d.getFullYear()}-01-01`); } },
    { label: 'Dec 31', apply: () => { setDate(`${d.getFullYear()}-12-31`); } },
    { label: 'Clear', apply: () => { setDate(new Date().toISOString().slice(0, 10)); } },
  ];

  const resultText = `Week ${week} of ${d.getFullYear()}`;

  return (
    <CalculatorShell category="Converter"
      title="Week Number Calculator"
      result={resultText}
      auto={true}
      presets={presets}
      accent="amber"
      downloadData={JSON.stringify({ date, week, year: d.getFullYear(), dayOfWeek: d.toLocaleDateString('en-US', { weekday: 'long' }) }, null, 2)}
      downloadFilename="week-number.json"
    >
      <div className="space-y-4">
        <Input label="Date" type="date" value={date} onChange={setDate} />
      </div>
    </CalculatorShell>
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

  const presets = [
    { label: '1 week ago', apply: () => { setDate(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)); } },
    { label: '1 month ago', apply: () => { setDate(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10)); } },
    { label: '1 year ago', apply: () => { setDate(new Date(Date.now() - 365 * 86400000).toISOString().slice(0, 10)); } },
    { label: 'Clear', apply: () => { setDate(new Date().toISOString().slice(0, 10)); } },
  ];

  const resultText = d.getTime() > now.getTime() ? `${yr} years, ${mo} months, ${wk} weeks, ${day} days until` : `${yr} years, ${mo} months, ${wk} weeks, ${day} days since`;

  return (
    <CalculatorShell category="Converter"
      title="Time Since / Until"
      result={resultText}
      auto={true}
      presets={presets}
      accent="rose"
      downloadData={JSON.stringify({ date, years: yr, months: mo, weeks: wk, days: day, hours: hr, minutes: min, seconds: sec }, null, 2)}
      downloadFilename="time-since.json"
    >
      <div className="space-y-4">
        <Input label="Date" type="date" value={date} onChange={setDate} />
      </div>
    </CalculatorShell>
  );
}
// --- TimeZoneConverter ---
const COMMON_TIMEZONES = [
  'UTC', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Toronto', 'America/Sao_Paulo', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
  'Africa/Cairo', 'Asia/Dubai', 'Asia/Kolkata', 'Asia/Singapore', 'Asia/Tokyo',
  'Asia/Shanghai', 'Australia/Sydney', 'Pacific/Auckland',
];

function supportedTimeZones(): string[] {
  try {
    const all = (Intl as unknown as { supportedValuesOf?: (k: string) => string[] }).supportedValuesOf?.('timeZone');
    if (Array.isArray(all) && all.length > 0) return all;
  } catch { /* fall through to common list */ }
  return COMMON_TIMEZONES;
}

function zoneOffsetMinutes(tz: string, instant: Date): number | null {
  // True zone offset via formatToParts round-trip. (The old code parsed a
  // wall-clock string and read the SYSTEM offset — it returned the input
  // time unchanged for every pair of zones.)
  try {
    const dtf = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts: Record<string, string> = {};
    for (const p of dtf.formatToParts(instant)) parts[p.type] = p.value;
    const asUTC = Date.UTC(
      Number(parts.year),
      Number(parts.month) - 1,
      Number(parts.day),
      Number(parts.hour) % 24,
      Number(parts.minute),
      Number(parts.second),
    );
    return Math.round((asUTC - instant.getTime()) / 60000);
  } catch {
    return null; // invalid IANA name — never crash render on a typo
  }
}
export function TimeZoneConverter() {
  const clr = ac('TimeZoneConverter');
  const [time, setTime] = useState('12:00');
  const [fromTz, setFromTz] = useState('UTC');
  const [toTz, setToTz] = useState('America/New_York');
  const zones = supportedTimeZones();
  const now = new Date();
  const [h, m] = time.split(':').map(Number);
  // Interpret the entered wall time on today's date IN the source zone,
  // then project into the target zone. All DST handling falls out of the
  // offsets — no hardcoded rules.
  const fromOffset = Number.isFinite(h) && Number.isFinite(m)
    ? zoneOffsetMinutes(fromTz, new Date(now.getFullYear(), now.getMonth(), now.getDate(), h ?? 0, m ?? 0))
    : null;
  const valid =
    fromOffset !== null &&
    h !== undefined && m !== undefined && !isNaN(h) && !isNaN(m);
  let resultText = 'Enter a time and valid time zones';
  let downloadText = '';
  if (valid) {
    const baseUTC = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), h as number, m as number) - (fromOffset as number) * 60000;
    const toOffset = zoneOffsetMinutes(toTz, new Date(baseUTC));
    if (toOffset === null) {
      resultText = 'Enter a time and valid time zones';
    } else {
      const out = new Date(baseUTC + toOffset * 60000);
      const hh = String(out.getUTCHours()).padStart(2, '0');
      const mm = String(out.getUTCMinutes()).padStart(2, '0');
      const inDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())).getTime();
      const outDay = new Date(Date.UTC(out.getUTCFullYear(), out.getUTCMonth(), out.getUTCDate())).getTime();
      const dayShift = Math.round((outDay - inDay) / 86400000);
      const suffix = dayShift === 0 ? '' : dayShift > 0 ? ` (+${dayShift}d)` : ` (${dayShift}d)`;
      resultText = `${hh}:${mm}${suffix} (${fromTz} → ${toTz})`;
      downloadText = resultText;
    }
  }

  const presets = [
    { label: 'UTC → NYC', apply: () => { setFromTz('UTC'); setToTz('America/New_York'); } },
    { label: 'UTC → London', apply: () => { setFromTz('UTC'); setToTz('Europe/London'); } },
    { label: 'UTC → Tokyo', apply: () => { setFromTz('UTC'); setToTz('Asia/Tokyo'); } },
    { label: 'Clear', apply: () => { setTime('12:00'); setFromTz('UTC'); setToTz('America/New_York'); } },
  ];

  const setNow = () => {
    const n = new Date();
    setTime(`${String(n.getHours()).padStart(2, '0')}:${String(n.getMinutes()).padStart(2, '0')}`);
  };

  return (
    <CalculatorShell category="Converter"
      title="Time Zone Converter"
      result={resultText}
      auto={true}
      presets={presets}
      accent="violet"
      downloadData={valid && downloadText ? JSON.stringify({ time, fromTz, toTz, result: downloadText }, null, 2) : ''}
      downloadFilename="timezone.json"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input label="Time" type="time" value={time} onChange={setTime} />
          <button onClick={setNow} className="px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl self-end" aria-label="Use current time">Now</button>
          <button onClick={() => { setFromTz(toTz); setToTz(fromTz); }} className="px-3 py-2 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-xl self-end" aria-label="Swap time zones">⇄ Swap</button>
        </div>
        <div className="flex gap-2"><Input label="From time zone" value={fromTz} onChange={setFromTz} list="tz-list" /><Input label="To time zone" value={toTz} onChange={setToTz} list="tz-list" /></div>
        <datalist id="tz-list">
          {zones.map((z) => <option key={z} value={z} />)}
        </datalist>
      </div>
    </CalculatorShell>
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

  const presets = [
    { label: 'Current Year', apply: () => { setYear(String(new Date().getFullYear())); } },
    { label: 'Next Year', apply: () => { setYear(String(new Date().getFullYear() + 1)); } },
    { label: '2025', apply: () => { setYear('2025'); } },
    { label: '2024', apply: () => { setYear('2024'); } },
  ];

  const resultText = `DST: ${dstStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${dstEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${Math.round((dstEnd.getTime() - dstStart.getTime()) / 86400000)} days)`;

  return (
    <CalculatorShell category="Converter"
      title="DST Checker (US)"
      result={resultText}
      auto={true}
      presets={presets}
      accent="orange"
      downloadData={JSON.stringify({ year: y, dstStart: dstStart.toISOString().slice(0, 10), dstEnd: dstEnd.toISOString().slice(0, 10), periodDays: Math.round((dstEnd.getTime() - dstStart.getTime()) / 86400000) }, null, 2)}
      downloadFilename="dst.json"
    >
      <div className="space-y-4">
        <Input label="Year" type="number" value={year} onChange={setYear} />
      </div>
    </CalculatorShell>
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
  // Overnight shifts cross midnight — wrap into a 0–24h day instead of
  // printing a negative total (22:00→06:00 is 8h, not −16h).
  const total = (((eH! * 60 + eM!) - (sH! * 60 + sM!) - Number(breakMin)) % 1440 + 1440) % 1440;
  const hrs = Math.floor(total / 60), mins = total % 60;

  const presets = [
    { label: '9-5 (30min break)', apply: () => { setStart('09:00'); setEnd('17:00'); setBreakMin('30'); } },
    { label: '8-4 (30min break)', apply: () => { setStart('08:00'); setEnd('16:00'); setBreakMin('30'); } },
    { label: 'Shift (1hr break)', apply: () => { setStart('07:00'); setEnd('15:00'); setBreakMin('60'); } },
    { label: 'Clear', apply: () => { setStart('09:00'); setEnd('17:00'); setBreakMin('30'); } },
  ];

  const resultText = `${hrs}h ${mins}m`;

  return (
    <CalculatorShell category="Converter"
      title="Work Hours Calculator"
      result={resultText}
      auto={true}
      presets={presets}
      accent="emerald"
      downloadData={JSON.stringify({ start, end, breakMin, totalHours: hrs, totalMinutes: mins }, null, 2)}
      downloadFilename="work-hours.json"
    >
      <div className="space-y-4">
        <div className="flex gap-2"><Input label="Shift start" type="time" value={start} onChange={setStart} /><Input label="Shift end" type="time" value={end} onChange={setEnd} /><Input label="Break (minutes)" type="number" value={breakMin} onChange={setBreakMin} /></div>
      </div>
    </CalculatorShell>
  );
}
// --- HoursMinutesCalculator ---
export function HoursMinutesCalculator() {
  const clr = ac('HoursMinutesCalculator');
  const [h1, setH1] = useState('1'); const [m1, setM1] = useState('30');
  const [h2, setH2] = useState('2'); const [m2, setM2] = useState('15');
  const t1 = Number(h1) * 60 + Number(m1), t2 = Number(h2) * 60 + Number(m2);
  const total = t1 + t2, diff = Math.abs(t1 - t2);

  const presets = [
    { label: '1h30 + 2h15', apply: () => { setH1('1'); setM1('30'); setH2('2'); setM2('15'); } },
    { label: '2h + 3h', apply: () => { setH1('2'); setM1('0'); setH2('3'); setM2('0'); } },
    { label: '45m + 1h15m', apply: () => { setH1('0'); setM1('45'); setH2('1'); setM2('15'); } },
    { label: 'Clear', apply: () => { setH1('1'); setM1('30'); setH2('2'); setM2('15'); } },
  ];

  const resultText = `Total: ${Math.floor(total / 60)}h ${total % 60}m | Diff: ${Math.floor(diff / 60)}h ${diff % 60}m`;

  return (
    <CalculatorShell category="Converter"
      title="Hours & Minutes Calculator"
      result={resultText}
      auto={true}
      presets={presets}
      accent="indigo"
      downloadData={JSON.stringify({ time1: `${h1}h${m1}m`, time2: `${h2}h${m2}m`, total: `${Math.floor(total / 60)}h${total % 60}m`, diff: `${Math.floor(diff / 60)}h${diff % 60}m` }, null, 2)}
      downloadFilename="hours-minutes.json"
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input label="Time 1 – hours" type="number" value={h1} onChange={setH1} /><Input label="Time 1 – minutes" type="number" value={m1} onChange={setM1} />
          <span className="self-center text-muted">+</span>
          <Input label="Time 2 – hours" type="number" value={h2} onChange={setH2} /><Input label="Time 2 – minutes" type="number" value={m2} onChange={setM2} />
        </div>
      </div>
    </CalculatorShell>
  );
}
// --- SpeedConverter ---
export function SpeedConverter() {
  const clr = ac('SpeedConverter');
  const [kmh, setKmh] = useState('100');
  const k = Number(kmh);

  const presets = [
    { label: '100 km/h', apply: () => { setKmh('100'); } },
    { label: '60 mph', apply: () => { setKmh(String(Math.round(60 / 0.621371))); } },
    { label: '50 knots', apply: () => { setKmh(String(Math.round(50 / 0.539957))); } },
    { label: 'Clear', apply: () => { setKmh('100'); } },
  ];

  const resultText = `mph: ${(k * 0.621371).toFixed(2)} | knots: ${(k * 0.539957).toFixed(2)} | m/s: ${(k / 3.6).toFixed(2)} | ft/s: ${(k * 0.911344).toFixed(2)}`;

  return (
    <CalculatorShell category="Converter"
      title="Speed Converter"
      result={resultText}
      auto={true}
      presets={presets}
      accent="cyan"
      downloadData={JSON.stringify({ kmh: k, mph: (k * 0.621371).toFixed(2), knots: (k * 0.539957).toFixed(2), ms: (k / 3.6).toFixed(2), fts: (k * 0.911344).toFixed(2) }, null, 2)}
      downloadFilename="speed.json"
    >
      <div className="space-y-4">
        <Input label="Speed" type="number" value={kmh} onChange={setKmh} />
      </div>
    </CalculatorShell>
  );
}
// --- LengthConverter ---
export function LengthConverter() {
  const clr = ac('LengthConverter');
  const [meters, setMeters] = useState('100');
  const m = Number(meters);

  const presets = [
    { label: '100 m', apply: () => { setMeters('100'); } },
    { label: '1 km', apply: () => { setMeters('1000'); } },
    { label: '1 mile', apply: () => { setMeters('1609.34'); } },
    { label: 'Clear', apply: () => { setMeters('100'); } },
  ];

  const resultText = `km: ${(m / 1000).toFixed(4)} | miles: ${(m * 0.000621371).toFixed(4)} | yards: ${(m * 1.09361).toFixed(2)} | feet: ${(m * 3.28084).toFixed(2)} | inches: ${(m * 39.3701).toFixed(2)}`;

  return (
    <CalculatorShell category="Converter"
      title="Length Converter"
      result={resultText}
      auto={true}
      presets={presets}
      accent="emerald"
      downloadData={JSON.stringify({ meters: m, km: (m / 1000).toFixed(4), miles: (m * 0.000621371).toFixed(4), yards: (m * 1.09361).toFixed(2), feet: (m * 3.28084).toFixed(2), inches: (m * 39.3701).toFixed(2) }, null, 2)}
      downloadFilename="length.json"
    >
      <div className="space-y-4">
        <Input label="Length" type="number" value={meters} onChange={setMeters} />
      </div>
    </CalculatorShell>
  );
}
// --- WeightConverter ---
export function WeightConverter() {
  const clr = ac('WeightConverter');
  const [kg, setKg] = useState('70');
  const k = Number(kg);

  const presets = [
    { label: '70 kg', apply: () => { setKg('70'); } },
    { label: '150 lb', apply: () => { setKg(String(Math.round(150 / 2.20462))); } },
    { label: '10 stone', apply: () => { setKg(String(Math.round(10 / 0.157473))); } },
    { label: 'Clear', apply: () => { setKg('70'); } },
  ];

  const resultText = `g: ${(k * 1000).toFixed(0)} | lb: ${(k * 2.20462).toFixed(2)} | oz: ${(k * 35.274).toFixed(2)} | stone: ${(k * 0.157473).toFixed(2)}`;

  return (
    <CalculatorShell category="Converter"
      title="Weight Converter"
      result={resultText}
      auto={true}
      presets={presets}
      accent="amber"
      downloadData={JSON.stringify({ kg: k, g: (k * 1000).toFixed(0), lb: (k * 2.20462).toFixed(2), oz: (k * 35.274).toFixed(2), stone: (k * 0.157473).toFixed(2) }, null, 2)}
      downloadFilename="weight.json"
    >
      <div className="space-y-4">
        <Input label="Weight" type="number" value={kg} onChange={setKg} />
      </div>
    </CalculatorShell>
  );
}
// --- VolumeConverter ---
export function VolumeConverter() {
  const clr = ac('VolumeConverter');
  const [liters, setLiters] = useState('1');
  const l = Number(liters);

  const presets = [
    { label: '1 L', apply: () => { setLiters('1'); } },
    { label: '1 gal (US)', apply: () => { setLiters(String(1 / 0.264172)); } },
    { label: '1 cup', apply: () => { setLiters(String(1 / 4.22675)); } },
    { label: 'Clear', apply: () => { setLiters('1'); } },
  ];

  const resultText = `mL: ${(l * 1000).toFixed(0)} | gal (US): ${(l * 0.264172).toFixed(4)} | qt: ${(l * 1.05669).toFixed(4)} | fl oz: ${(l * 33.814).toFixed(2)} | cups: ${(l * 4.22675).toFixed(2)}`;

  return (
    <CalculatorShell category="Converter"
      title="Volume Converter"
      result={resultText}
      auto={true}
      presets={presets}
      accent="blue"
      downloadData={JSON.stringify({ liters: l, ml: (l * 1000).toFixed(0), galUS: (l * 0.264172).toFixed(4), qt: (l * 1.05669).toFixed(4), floz: (l * 33.814).toFixed(2), cups: (l * 4.22675).toFixed(2) }, null, 2)}
      downloadFilename="volume.json"
    >
      <div className="space-y-4">
        <Input label="Volume" type="number" value={liters} onChange={setLiters} />
      </div>
    </CalculatorShell>
  );
}
// --- AreaConverter ---
export function AreaConverter() {
  const clr = ac('AreaConverter');
  const [sqm, setSqm] = useState('100');
  const a = Number(sqm);

  const presets = [
    { label: '100 m²', apply: () => { setSqm('100'); } },
    { label: '1 acre', apply: () => { setSqm(String(1 / 0.000247105)); } },
    { label: '1 hectare', apply: () => { setSqm('10000'); } },
    { label: 'Clear', apply: () => { setSqm('100'); } },
  ];

  const resultText = `sq ft: ${(a * 10.7639).toFixed(2)} | acres: ${(a * 0.000247105).toFixed(6)} | hectares: ${(a * 0.0001).toFixed(6)} | sq km: ${(a / 1e6).toFixed(6)}`;

  return (
    <CalculatorShell category="Converter"
      title="Area Converter"
      result={resultText}
      auto={true}
      presets={presets}
      accent="green"
      downloadData={JSON.stringify({ sqm: a, sqft: (a * 10.7639).toFixed(2), acres: (a * 0.000247105).toFixed(6), hectares: (a * 0.0001).toFixed(6), sqkm: (a / 1e6).toFixed(6) }, null, 2)}
      downloadFilename="area.json"
    >
      <div className="space-y-4">
        <Input label="Area" type="number" value={sqm} onChange={setSqm} />
      </div>
    </CalculatorShell>
  );
}
// --- DataSizeConverter ---
export function DataSizeConverter() {
  const clr = ac('DataSizeConverter');
  const [bytes, setBytes] = useState('1073741824');
  const b = Number(bytes);
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const conv = units.map((u, i) => ({ unit: u, value: b / Math.pow(1024, i) }));

  const presets = [
    { label: '1 GB', apply: () => { setBytes('1073741824'); } },
    { label: '1 MB', apply: () => { setBytes('1048576'); } },
    { label: '1 TB', apply: () => { setBytes('1099511627776'); } },
    { label: 'Clear', apply: () => { setBytes('1073741824'); } },
  ];

  const resultText = conv.map(c => `${c.unit}: ${c.value.toFixed(2)}`).join(' | ');

  return (
    <CalculatorShell category="Converter"
      title="Data Size Converter"
      result={resultText}
      auto={true}
      presets={presets}
      accent="purple"
      downloadData={JSON.stringify({ bytes: b, ...Object.fromEntries(conv.map(c => [c.unit.toLowerCase(), c.value.toFixed(2)])) }, null, 2)}
      downloadFilename="datasize.json"
    >
      <div className="space-y-4">
        <Input label="Data size" type="number" value={bytes} onChange={setBytes} />
      </div>
    </CalculatorShell>
  );
}
