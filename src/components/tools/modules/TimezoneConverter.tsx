"use client";

import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';

const TIMEZONES = [
  { label: 'IST (Indian Standard Time)', tz: 'Asia/Kolkata', offset: '+05:30' },
  { label: 'PST (Pacific Standard Time)', tz: 'America/Los_Angeles', offset: '-08:00' },
  { label: 'EST (Eastern Standard Time)', tz: 'America/New_York', offset: '-05:00' },
  { label: 'CST (Central Standard Time)', tz: 'America/Chicago', offset: '-06:00' },
  { label: 'GMT (Greenwich Mean Time)', tz: 'GMT', offset: '+00:00' },
  { label: 'UTC (Coordinated Universal Time)', tz: 'UTC', offset: '+00:00' },
  { label: 'JST (Japan Standard Time)', tz: 'Asia/Tokyo', offset: '+09:00' },
  { label: 'SGT (Singapore Time)', tz: 'Asia/Singapore', offset: '+08:00' },
];

const TIME_UNITS = [
  { label: 'Millisecond', ms: 1 },
  { label: 'Second', ms: 1000 },
  { label: 'Minute', ms: 60000 },
  { label: 'Hour', ms: 3600000 },
  { label: 'Day', ms: 86400000 },
  { label: 'Week', ms: 604800000 },
  { label: 'Month', ms: 2629800000 },
  { label: 'Year', ms: 31557600000 },
];

export default function TimezoneConverter() {
  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'timezone' | 'convert'>('timezone');

  const [istInput, setIstInput] = useState('12:00');
  const [istDate, setIstDate] = useState(() => new Date().toISOString().split('T')[0]);

  const [unitFrom, setUnitFrom] = useState('Hour');
  const [unitTo, setUnitTo] = useState('Minute');
  const [unitValue, setUnitValue] = useState('1');
  const [unitResult, setUnitResult] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const times: Record<string, string> = {};
      TIMEZONES.forEach(({ label, tz }) => {
        times[label] = new Intl.DateTimeFormat('en-US', {
          timeZone: tz,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(now);
      });
      setCurrentTimes(times);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const convertFromIst = () => {
    if (!istInput || !istDate) return [];
    const [h, m] = istInput.split(':').map(Number);
    const localDate = new Date(istDate + 'T00:00:00');
    const istMs = localDate.getTime() + (h * 3600000 + m * 60000) - (5.5 * 3600000);

    return TIMEZONES.slice(1).map(({ label, tz, offset }) => {
      const tzTime = new Date(istMs).toLocaleString('en-US', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      return { label, time: tzTime, offset, date: new Date(istMs).toLocaleDateString('en-US', { timeZone: tz, weekday: 'short', month: 'short', day: 'numeric' }) };
    });
  };

  useEffect(() => {
    const from = TIME_UNITS.find(u => u.label === unitFrom);
    const to = TIME_UNITS.find(u => u.label === unitTo);
    if (!from || !to || !unitValue) {
      setUnitResult('');
      return;
    }
    const val = parseFloat(unitValue);
    if (isNaN(val)) { setUnitResult(''); return; }
    const inMs = val * from.ms;
    const converted = inMs / to.ms;
    setUnitResult(Number.isInteger(converted) ? converted.toString() : converted.toFixed(6).replace(/\.?0+$/, ''));
  }, [unitValue, unitFrom, unitTo]);

  const convertedTimes = convertFromIst();

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Timezone Converter</h3>
      </div>

      <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-2xl w-fit">
        <button onClick={() => setTab('timezone')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'timezone' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>Live Clocks</button>
        <button onClick={() => setTab('convert')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'convert' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>Convert Time</button>
      </div>

      {tab === 'timezone' ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Live time across major timezones — updated every second.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {TIMEZONES.map(({ label, offset }) => (
              <div key={label} className={`bg-zinc-50 dark:bg-black/30 rounded-xl p-4 border text-center ${label.startsWith('IST') ? 'border-emerald-200 dark:border-emerald-800/50 ring-2 ring-emerald-500/20' : 'border-zinc-200 dark:border-zinc-800'}`}>
                <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">{label.split('(')[1]?.replace(')', '') || label}</p>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200 font-mono">{currentTimes[label] || '--:--:--'}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{offset}</p>
              </div>
            ))}
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Add custom timezones, save frequently used conversions (CET, AEST, BRT, etc.), meeting scheduler with calendar integration, world clock widget for your website.</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-4">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">From IST → Other Timezones</h4>
            <div className="flex gap-3 flex-wrap">
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">Date</label>
                <input type="date" value={istDate} onChange={e => setIstDate(e.target.value)} className="bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">Time (IST)</label>
                <input type="time" value={istInput} onChange={e => setIstInput(e.target.value)} className="bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none" />
              </div>
            </div>

            {convertedTimes.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {convertedTimes.map(({ label, time, date, offset }) => (
                  <div key={label} className="bg-zinc-50 dark:bg-black/30 rounded-xl p-3 border border-zinc-200 dark:border-zinc-800 text-center">
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">{label.split('(')[1]?.replace(')', '') || label}</p>
                    <p className="text-base font-bold text-zinc-800 dark:text-zinc-200 font-mono mt-0.5">{time}</p>
                    <p className="text-[10px] text-zinc-400">{date} ({offset})</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-4">
            <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Time Unit Converter</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-zinc-400">From</label>
                <div className="flex bg-zinc-50 dark:bg-black/50 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <input type="number" value={unitValue} onChange={e => setUnitValue(e.target.value)} className="w-full bg-transparent px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none" />
                  <select value={unitFrom} onChange={e => setUnitFrom(e.target.value)} className="bg-zinc-100 dark:bg-zinc-900 px-3 text-xs border-l border-zinc-200 dark:border-zinc-700 outline-none cursor-pointer text-zinc-700 dark:text-zinc-300">
                    {TIME_UNITS.map(u => <option key={u.label} value={u.label}>{u.label}s</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-semibold text-zinc-400">To</label>
                <div className="flex bg-zinc-50 dark:bg-black/50 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                  <input type="text" readOnly value={unitResult} className="w-full bg-transparent px-3 py-2.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 outline-none" />
                  <select value={unitTo} onChange={e => setUnitTo(e.target.value)} className="bg-zinc-100 dark:bg-zinc-900 px-3 text-xs border-l border-zinc-200 dark:border-zinc-700 outline-none cursor-pointer text-zinc-700 dark:text-zinc-300">
                    {TIME_UNITS.map(u => <option key={u.label} value={u.label}>{u.label}s</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
