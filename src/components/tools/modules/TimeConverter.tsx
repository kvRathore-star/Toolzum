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
  { label: 'BST (British Summer Time)', tz: 'Europe/London', offset: '+01:00' },
  { label: 'CET (Central European Time)', tz: 'Europe/Paris', offset: '+01:00' },
  { label: 'AEST (Australian Eastern)', tz: 'Australia/Sydney', offset: '+10:00' },
  { label: 'BRT (Brasília Time)', tz: 'America/Sao_Paulo', offset: '-03:00' },
];

const QUICK_ZONES = TIMEZONES.slice(0, 8);

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

export default function TimeConverter() {
  const [currentTimes, setCurrentTimes] = useState<Record<string, string>>({});
  const [tab, setTab] = useState<'live' | 'quick' | 'convert' | 'units'>('live');
  const [fromIndex, setFromIndex] = useState(0);
  const [toIndex, setToIndex] = useState(2);
  const [inputTime, setInputTime] = useState('12:00');
  const [inputDate, setInputDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [convertResult, setConvertResult] = useState('');
  const [unitFrom, setUnitFrom] = useState('Hour');
  const [unitTo, setUnitTo] = useState('Minute');
  const [unitValue, setUnitValue] = useState('1');

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

  const doConvert = () => {
    if (!inputTime || !inputDate) return;
    const [h, m] = inputTime.split(':').map(Number);
    const localDate = new Date(inputDate + 'T00:00:00');
    const fromOffset = TIMEZONES[fromIndex].offset;
    const [fromH, fromM] = fromOffset.split(':').map(Number);
    const absFromMs = (Math.abs(fromH) * 3600000 + Math.abs(fromM) * 60000) * (fromH >= 0 ? 1 : -1);
    const localMs = localDate.getTime() + (h * 3600000 + m * 60000);
    const utcMs = localMs - absFromMs;

    const toOffset = TIMEZONES[toIndex].offset;
    const [toH, toM] = toOffset.split(':').map(Number);
    const absToMs = (Math.abs(toH) * 3600000 + Math.abs(toM) * 60000) * (toH >= 0 ? 1 : -1);
    const targetMs = utcMs + absToMs;

    const result = new Date(targetMs).toLocaleString('en-US', {
      timeZone: TIMEZONES[toIndex].tz,
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
    setConvertResult(result);
  };

  const unitFromVal = TIME_UNITS.find(u => u.label === unitFrom);
  const unitToVal = TIME_UNITS.find(u => u.label === unitTo);
  const unitResult = unitFromVal && unitToVal && unitValue
    ? (() => { const v = parseFloat(unitValue); if (isNaN(v)) return ''; const r = (v * unitFromVal.ms) / unitToVal.ms; return Number.isInteger(r) ? r.toString() : r.toFixed(6).replace(/\.?0+$/, ''); })()
    : '';

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Time Zone Converter</h3>
      </div>

      <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-2xl w-fit flex-wrap">
        <button onClick={() => setTab('live')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'live' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>Live Clocks</button>
        <button onClick={() => setTab('quick')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'quick' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>Quick Zones</button>
        <button onClick={() => setTab('convert')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'convert' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>Convert</button>
        <button onClick={() => setTab('units')} className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'units' ? 'bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'}`}>Time Units</button>
      </div>

      {tab === 'live' ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Live time across 12 major timezones — updated every second.</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {TIMEZONES.map(({ label, offset }) => (
              <div key={label} className="bg-zinc-50 dark:bg-black/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-center">
                <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">{label.split('(')[1]?.replace(')', '') || label}</p>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200 font-mono">{currentTimes[label] || '--:--:--'}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{offset}</p>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'quick' ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Quick view of 8 major world time zones — updated every second.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK_ZONES.map(({ label, offset }) => (
              <div key={label} className="bg-zinc-50 dark:bg-black/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 text-center">
                <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">{label.split('(')[1]?.replace(')', '') || label}</p>
                <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200 font-mono">{currentTimes[label] || '--:--:--'}</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">{offset}</p>
              </div>
            ))}
          </div>
        </div>
      ) : tab === 'convert' ? (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
          <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Convert Between Timezones</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">From</label>
              <select value={fromIndex} onChange={e => { setFromIndex(Number(e.target.value)); setConvertResult(''); }} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none">
                {TIMEZONES.map((tz, i) => <option key={i} value={i}>{tz.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">To</label>
              <select value={toIndex} onChange={e => { setToIndex(Number(e.target.value)); setConvertResult(''); }} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none">
                {TIMEZONES.map((tz, i) => <option key={i} value={i}>{tz.label}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">Date</label>
              <input type="date" value={inputDate} onChange={e => { setInputDate(e.target.value); setConvertResult(''); }} className="bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none" />
            </div>
            <div>
              <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">Time</label>
              <input type="time" value={inputTime} onChange={e => { setInputTime(e.target.value); setConvertResult(''); }} className="bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none" />
            </div>
            <div className="flex items-end">
              <button onClick={doConvert} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-all active:scale-95 flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" /> Convert
              </button>
            </div>
          </div>
          {convertResult && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-4">
              <div className="text-[10px] text-zinc-500 mb-1">{TIMEZONES[fromIndex].label.split('(')[1]?.replace(')', '') || TIMEZONES[fromIndex].label}</div>
              <div className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{inputDate} {inputTime}</div>
              <div className="text-[10px] text-zinc-500 mt-2 mb-1">{TIMEZONES[toIndex].label.split('(')[1]?.replace(')', '') || TIMEZONES[toIndex].label}</div>
              <div className="text-base font-bold text-emerald-600 dark:text-emerald-400">{convertResult}</div>
            </div>
          )}
        </div>
      ) : (
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
      )}
    </div>
  );
}
