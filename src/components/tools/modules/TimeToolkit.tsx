"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Timer, Calendar, Clock, Hourglass } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'timers' | 'date' | 'convert' | 'time';

export default function TimeToolkit() {
  const [tab, setTab] = useState<Tab>('timers');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        <TabBtn v="timers" label="Timers" icon={Timer} />
        <TabBtn v="date" label="Date Math" icon={Calendar} />
        <TabBtn v="convert" label="Converters" icon={Clock} />
        <TabBtn v="time" label="Time Math" icon={Hourglass} />
      </div>
      {tab === 'timers' && <TimersTab />}
      {tab === 'date' && <DateMathTab />}
      {tab === 'convert' && <ConvertersTab />}
      {tab === 'time' && <TimeMathTab />}
    </div>
  );
}

const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-3 rounded-xl space-y-2">
    <h5 className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
    {children}
  </div>
);

const CalcBtn = ({ onClick, label }: { onClick: () => void; label: string }) => (
  <button onClick={onClick} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg transition-all active:scale-[0.98]">{label}</button>
);

const Inp = ({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) => (
  <div className="flex items-center gap-1.5">
    <label className="text-[10px] text-zinc-500 shrink-0">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-2 py-1 text-[11px] font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
  </div>
);

function Output({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div className="relative">
      <pre className="text-xs font-mono bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg p-2 text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap">{value}</pre>
      <button onClick={() => { clipboardWrite(value); toast.success('Copied!'); }} className="text-[10px] text-blue-500 hover:underline mt-0.5">Copy</button>
    </div>
  );
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '0s';
  const sec = Math.floor(ms / 1000) % 60;
  const min = Math.floor(ms / 60000) % 60;
  const hr = Math.floor(ms / 3600000) % 24;
  const day = Math.floor(ms / 86400000);
  const parts: string[] = [];
  if (day) parts.push(`${day}d`);
  if (hr) parts.push(`${hr}h`);
  if (min) parts.push(`${min}m`);
  if (sec || !parts.length) parts.push(`${sec}s`);
  return parts.join(' ');
}

function TimersTab() {
  const [cdTarget, setCdTarget] = useState(() => new Date(Date.now() + 3600000).toISOString().slice(0, 16));
  const [cdRemaining, setCdRemaining] = useState('');
  const [cdRunning, setCdRunning] = useState(false);
  const cdRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [events, setEvents] = useState<{ name: string; time: string }[]>([{ name: 'New Year', time: new Date(new Date().getFullYear() + 1, 0, 1).toISOString().slice(0, 16) }]);
  const [eventOut, setEventOut] = useState('');
  const [eventRunning, setEventRunning] = useState(false);
  const evRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [swRunning, setSwRunning] = useState(false);
  const [swTime, setSwTime] = useState(0);
  const [swLaps, setSwLaps] = useState<string[]>([]);
  const swRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const swStartRef = useRef(0);

  useEffect(() => {
    if (cdRunning) {
      cdRef.current = setInterval(() => {
        const diff = new Date(cdTarget).getTime() - Date.now();
        if (diff <= 0) { setCdRemaining('🎉 Time\'s up!'); setCdRunning(false); if (cdRef.current) clearInterval(cdRef.current); return; }
        setCdRemaining(formatDuration(diff));
      }, 200);
    }
    return () => { if (cdRef.current) clearInterval(cdRef.current); };
  }, [cdRunning, cdTarget]);

  useEffect(() => {
    if (eventRunning && events.length) {
      evRef.current = setInterval(() => {
        const lines = events.map(e => {
          const diff = new Date(e.time).getTime() - Date.now();
          return `${e.name}: ${diff <= 0 ? '🎉 Passed!' : formatDuration(diff)}`;
        });
        setEventOut(lines.join('\n'));
      }, 200);
    }
    return () => { if (evRef.current) clearInterval(evRef.current); };
  }, [eventRunning, events]);

  useEffect(() => {
    if (swRunning) {
      swRef.current = setInterval(() => setSwTime(Date.now() - swStartRef.current), 50);
    }
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swRunning]);

  const addEvent = () => setEvents(prev => [...prev, { name: 'Event ' + (prev.length + 1), time: new Date(Date.now() + 86400000).toISOString().slice(0, 16) }]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Countdown Timer">
        <Inp label="Target" value={cdTarget} onChange={setCdTarget} type="datetime-local" />
        <div className="text-center py-3">
          <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">{cdRemaining || 'Set target & start'}</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setCdRunning(true); }} disabled={cdRunning} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[11px] font-bold py-1.5 rounded-lg">Start</button>
          <button onClick={() => { setCdRunning(false); if (cdRef.current) clearInterval(cdRef.current); }} className="flex-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[11px] font-bold py-1.5 rounded-lg">Stop</button>
          <button onClick={() => { setCdRunning(false); setCdRemaining(''); if (cdRef.current) clearInterval(cdRef.current); }} className="px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[11px] font-bold py-1.5 rounded-lg">Reset</button>
        </div>
      </Card>

      <Card title="Event Countdown Timer">
        {events.map((e, i) => (
          <div key={i} className="flex gap-1 items-center">
            <input value={e.name} onChange={v => { const n = [...events]; n[i].name = v.target.value; setEvents(n); }} className="w-16 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-1 py-0.5 text-[10px] text-zinc-900 dark:text-white outline-none" />
            <input type="datetime-local" value={e.time} onChange={v => { const n = [...events]; n[i].time = v.target.value; setEvents(n); }} className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded px-1 py-0.5 text-[10px] text-zinc-900 dark:text-white outline-none" />
            <button onClick={() => setEvents(prev => prev.filter((_, j) => j !== i))} className="text-zinc-400 hover:text-red-500 text-[10px]">✕</button>
          </div>
        ))}
        <button onClick={addEvent} className="text-[10px] text-blue-500 hover:underline">+ Add event</button>
        <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 min-h-[2em]">{eventOut}</div>
        <div className="flex gap-2">
          <button onClick={() => setEventRunning(true)} disabled={eventRunning} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-[11px] font-bold py-1.5 rounded-lg">Start</button>
          <button onClick={() => { setEventRunning(false); if (evRef.current) clearInterval(evRef.current); }} className="px-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[11px] font-bold py-1.5 rounded-lg">Stop</button>
        </div>
      </Card>

      <Card title="Stopwatch">
        <div className="text-center py-3">
          <span className="text-2xl font-mono font-bold text-blue-600 dark:text-blue-400">{(swTime / 1000).toFixed(2)}s</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {!swRunning ? (
            <button onClick={() => { swStartRef.current = Date.now() - swTime; setSwRunning(true); }} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold py-1.5 rounded-lg">Start</button>
          ) : (
            <button onClick={() => setSwRunning(false)} className="flex-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-[11px] font-bold py-1.5 rounded-lg">Stop</button>
          )}
          <button onClick={() => { if (swRunning) setSwLaps(prev => [...prev, (swTime / 1000).toFixed(2) + 's']); }} className="flex-1 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-[11px] font-bold py-1.5 rounded-lg">Lap</button>
          <button onClick={() => { setSwRunning(false); setSwTime(0); setSwLaps([]); }} className="px-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 text-[11px] font-bold py-1.5 rounded-lg">Reset</button>
        </div>
        {swLaps.length > 0 && (
          <div className="max-h-20 overflow-y-auto text-[10px] font-mono text-zinc-500">
            {swLaps.map((l, i) => <div key={i}>Lap {i + 1}: {l}</div>)}
          </div>
        )}
      </Card>
    </div>
  );
}

function DateMathTab() {
  const [dAddStart, setDAddStart] = useState(() => new Date().toISOString().split('T')[0]);
  const [dAddDays, setDAddDays] = useState('30');
  const [dAddOut, setDAddOut] = useState('');
  const [dDiffA, setDDiffA] = useState(() => new Date().toISOString().split('T')[0]);
  const [dDiffB, setDDiffB] = useState(() => new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);
  const [dDiffOut, setDDiffOut] = useState('');
  const [wnDate, setWnDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [wnOut, setWnOut] = useState('');

  const dateAdd = () => {
    const d = new Date(dAddStart);
    const n = parseInt(dAddDays) || 0;
    d.setDate(d.getDate() + n);
    setDAddOut(`Start: ${dAddStart}\n${n >= 0 ? '+ ' : ''}${n} days\nResult: ${d.toISOString().split('T')[0]} (${d.toDateString()})`);
  };

  const dateDiff = () => {
    const a = new Date(dDiffA), b = new Date(dDiffB);
    const ms = Math.abs(b.getTime() - a.getTime());
    const days = Math.floor(ms / 86400000);
    const hrs = Math.floor(ms / 3600000);
    const mins = Math.floor(ms / 60000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);
    const years = Math.floor(days / 365.25);
    setDDiffOut(`From: ${dDiffA} → To: ${dDiffB}\n\n${days} days\n${hrs} hours\n${mins} minutes\n${weeks} weeks\n${months} months (~)\n${years} years (~)\n\n${ms.toLocaleString()} ms`);
  };

  const weekNum = () => {
    const d = new Date(wnDate);
    const start = new Date(d.getFullYear(), 0, 1);
    const diff = d.getTime() - start.getTime();
    const day = Math.floor(diff / 86400000);
    const wn = Math.ceil((day + start.getDay() + 1) / 7);
    const totalWeeks = Math.ceil((new Date(d.getFullYear(), 11, 31).getTime() - start.getTime()) / 604800000);
    setWnOut(`Date: ${d.toDateString()}\nWeek number: ${wn}\nYear: ${d.getFullYear()} (${totalWeeks} weeks)\nDay of year: ${day + 1}\nISO week: ${wn}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Date Add/Subtract">
        <Inp label="Date" value={dAddStart} onChange={setDAddStart} type="date" />
        <Inp label="Days" value={dAddDays} onChange={setDAddDays} placeholder="30" />
        <CalcBtn onClick={dateAdd} label="Calculate" />
        <Output value={dAddOut} />
      </Card>
      <Card title="Date Difference Calculator">
        <Inp label="From" value={dDiffA} onChange={setDDiffA} type="date" />
        <Inp label="To" value={dDiffB} onChange={setDDiffB} type="date" />
        <CalcBtn onClick={dateDiff} label="Calculate Difference" />
        <Output value={dDiffOut} />
      </Card>
      <Card title="Week Number Calculator">
        <Inp label="Date" value={wnDate} onChange={setWnDate} type="date" />
        <CalcBtn onClick={weekNum} label="Get Week Number" />
        <Output value={wnOut} />
      </Card>
    </div>
  );
}

function ConvertersTab() {
  const [tsDate, setTsDate] = useState(() => new Date().toISOString().slice(0, 16));
  const [tsOut, setTsOut] = useState('');
  const [tsUnix, setTsUnix] = useState(String(Math.floor(Date.now() / 1000)));
  const [tsUnixOut, setTsUnixOut] = useState('');
  const [msIn, setMsIn] = useState('3600000');
  const [msOut, setMsOut] = useState('');
  const [minIn, setMinIn] = useState('90');
  const [minOut, setMinOut] = useState('');
  const [secIn, setSecIn] = useState('3661');
  const [secOut, setSecOut] = useState('');

  const dateToTs = () => {
    const ms = new Date(tsDate).getTime();
    setTsOut(`UTC ISO: ${new Date(ms).toISOString()}\nUnix (s): ${Math.floor(ms / 1000)}\nUnix (ms): ${ms}\nLocal: ${new Date(ms).toLocaleString()}`);
  };

  const tsToDate = () => {
    const ms = parseInt(tsUnix) * 1000;
    if (isNaN(ms)) { toast.error('Invalid timestamp'); return; }
    setTsUnixOut(`Timestamp: ${tsUnix}\nDate: ${new Date(ms).toISOString()}\nLocal: ${new Date(ms).toLocaleString()}\nUTC: ${new Date(ms).toUTCString()}`);
  };

  const msConvert = () => {
    const ms = parseInt(msIn) || 0;
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    setMsOut(`${ms.toLocaleString()} ms\n\n= ${d}d ${h}h ${m}m ${s}s\n= ${(ms / 1000).toFixed(2)} seconds\n= ${(ms / 60000).toFixed(4)} minutes\n= ${(ms / 3600000).toFixed(6)} hours\n= ${(ms / 86400000).toFixed(6)} days`);
  };

  const minToHrs = () => {
    const m = parseInt(minIn) || 0;
    setMinOut(`${m} minutes\n= ${Math.floor(m / 60)}h ${m % 60}m\n= ${(m / 60).toFixed(2)} hours`);
  };

  const secToTime = () => {
    const s = parseInt(secIn) || 0;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    setSecOut(`${s.toLocaleString()} seconds\n= ${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}\n= ${h}h ${m}m ${sec}s\n= ${(s / 60).toFixed(2)} minutes\n= ${(s / 3600).toFixed(4)} hours`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Date to Timestamp">
        <Inp label="Date" value={tsDate} onChange={setTsDate} type="datetime-local" />
        <CalcBtn onClick={dateToTs} label="Convert to Timestamp" />
        <Output value={tsOut} />
      </Card>
      <Card title="Timestamp to Date">
        <Inp label="Unix (s)" value={tsUnix} onChange={setTsUnix} placeholder="1700000000" />
        <CalcBtn onClick={tsToDate} label="Convert to Date" />
        <Output value={tsUnixOut} />
      </Card>
      <Card title="Milliseconds Converter">
        <Inp label="ms" value={msIn} onChange={setMsIn} placeholder="3600000" />
        <CalcBtn onClick={msConvert} label="Convert" />
        <Output value={msOut} />
      </Card>
      <Card title="Minutes to Hours Converter">
        <Inp label="Minutes" value={minIn} onChange={setMinIn} placeholder="90" />
        <CalcBtn onClick={minToHrs} label="Convert" />
        <Output value={minOut} />
      </Card>
      <Card title="Seconds to Time Converter">
        <Inp label="Seconds" value={secIn} onChange={setSecIn} placeholder="3661" />
        <CalcBtn onClick={secToTime} label="Convert" />
        <Output value={secOut} />
      </Card>
    </div>
  );
}

function TimeMathTab() {
  const [tAddStart, setTAddStart] = useState('09:00');
  const [tAddH, setTAddH] = useState('2');
  const [tAddM, setTAddM] = useState('30');
  const [tAddOut, setTAddOut] = useState('');
  const [tDurStart, setTDurStart] = useState('09:00');
  const [tDurEnd, setTDurEnd] = useState('17:00');
  const [tDurOut, setTDurOut] = useState('');

  const timeAdd = () => {
    const [h, m] = tAddStart.split(':').map(Number);
    const addH = parseInt(tAddH) || 0;
    const addM = parseInt(tAddM) || 0;
    const totalMin = h * 60 + m + addH * 60 + addM;
    const rh = ((totalMin % 1440) + 1440) % 1440;
    const resH = Math.floor(rh / 60);
    const resM = rh % 60;
    const days = Math.floor(totalMin / 1440);
    setTAddOut(`Start: ${tAddStart}\n+ ${addH}h ${addM}m\nResult: ${String(resH).padStart(2, '0')}:${String(resM).padStart(2, '0')}${days ? ` (+${days}d)` : ''}`);
  };

  const timeDur = () => {
    const [sh, sm] = tDurStart.split(':').map(Number);
    const [eh, em] = tDurEnd.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    const diff = ((endMin - startMin) % 1440 + 1440) % 1440;
    const dh = Math.floor(diff / 60);
    const dm = diff % 60;
    setTDurOut(`From: ${tDurStart}\nTo: ${tDurEnd}\nDuration: ${dh}h ${dm}m\n= ${diff} minutes\n= ${(diff / 60).toFixed(2)} hours`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      <Card title="Time Add/Subtract Calculator">
        <Inp label="Time" value={tAddStart} onChange={setTAddStart} type="time" />
        <Inp label="Hours" value={tAddH} onChange={setTAddH} placeholder="2" />
        <Inp label="Minutes" value={tAddM} onChange={setTAddM} placeholder="30" />
        <CalcBtn onClick={timeAdd} label="Calculate" />
        <Output value={tAddOut} />
      </Card>
      <Card title="Time Duration Calculator">
        <Inp label="Start" value={tDurStart} onChange={setTDurStart} type="time" />
        <Inp label="End" value={tDurEnd} onChange={setTDurEnd} type="time" />
        <CalcBtn onClick={timeDur} label="Calculate Duration" />
        <Output value={tDurOut} />
      </Card>
    </div>
  );
}
