"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Calendar, Clock, Hourglass, Clipboard } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'date' | 'convert' | 'time';

export default function TimeToolkit() {
  const [tab, setTab] = useState<Tab>('date');
  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${tab === v ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
      <Icon className="w-4 h-4" /> {label}
    </button>
  );
  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-800/50 p-1.5 rounded-xl w-fit">
        <TabBtn v="date" label="Date Math" icon={Calendar} />
        <TabBtn v="convert" label="Converters" icon={Clock} />
        <TabBtn v="time" label="Time Math" icon={Hourglass} />
      </div>
      {tab === 'date' && <DateMathTab />}
      {tab === 'convert' && <ConvertersTab />}
      {tab === 'time' && <TimeMathTab />}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
      <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{title}</h5>
      {children}
    </div>
  );
}

function Inp({ label, value, onChange, placeholder, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-500">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
    </div>
  );
}

function Output({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div className="relative">
      <pre className="text-sm font-mono bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl p-4 text-emerald-600 dark:text-emerald-400 break-all whitespace-pre-wrap max-h-48 overflow-y-auto">{value}</pre>
      <button onClick={() => { clipboardWrite(value); toast.success('Copied!'); }} className="mt-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1"><Clipboard className="w-3 h-3" /> Copy</button>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title="Date Add/Subtract">
        <Inp label="Date" value={dAddStart} onChange={setDAddStart} type="date" />
        <Inp label="Days" value={dAddDays} onChange={setDAddDays} placeholder="30" />
        <button onClick={dateAdd} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Calculate</button>
        <Output value={dAddOut} />
      </Card>
      <Card title="Date Difference Calculator">
        <Inp label="From" value={dDiffA} onChange={setDDiffA} type="date" />
        <Inp label="To" value={dDiffB} onChange={setDDiffB} type="date" />
        <button onClick={dateDiff} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Calculate Difference</button>
        <Output value={dDiffOut} />
      </Card>
      <Card title="Week Number Calculator">
        <Inp label="Date" value={wnDate} onChange={setWnDate} type="date" />
        <button onClick={weekNum} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Get Week Number</button>
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card title="Date to Timestamp">
        <Inp label="Date" value={tsDate} onChange={setTsDate} type="datetime-local" />
        <button onClick={dateToTs} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert to Timestamp</button>
        <Output value={tsOut} />
      </Card>
      <Card title="Timestamp to Date">
        <Inp label="Unix (s)" value={tsUnix} onChange={setTsUnix} placeholder="1700000000" />
        <button onClick={tsToDate} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert to Date</button>
        <Output value={tsUnixOut} />
      </Card>
      <Card title="Milliseconds Converter">
        <Inp label="ms" value={msIn} onChange={setMsIn} placeholder="3600000" />
        <button onClick={msConvert} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        <Output value={msOut} />
      </Card>
      <Card title="Minutes to Hours Converter">
        <Inp label="Minutes" value={minIn} onChange={setMinIn} placeholder="90" />
        <button onClick={minToHrs} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Convert</button>
        <Output value={minOut} />
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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card title="Time Add/Subtract Calculator">
        <Inp label="Time" value={tAddStart} onChange={setTAddStart} type="time" />
        <Inp label="Hours" value={tAddH} onChange={setTAddH} placeholder="2" />
        <Inp label="Minutes" value={tAddM} onChange={setTAddM} placeholder="30" />
        <button onClick={timeAdd} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Calculate</button>
        <Output value={tAddOut} />
      </Card>
      <Card title="Time Duration Calculator">
        <Inp label="Start" value={tDurStart} onChange={setTDurStart} type="time" />
        <Inp label="End" value={tDurEnd} onChange={setTDurEnd} type="time" />
        <button onClick={timeDur} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-all">Calculate Duration</button>
        <Output value={tDurOut} />
      </Card>
    </div>
  );
}
