"use client";
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Calculator, Timer, Clock } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'eval' | 'eta' | 'chrono';

const MATH_BUTTONS = [
  ['7','8','9','/','C'],
  ['4','5','6','*','('],
  ['1','2','3','-',')'],
  ['0','.','±','+','**'],
  ['sin','cos','tan','log','√'],
  ['π','e','^2','^3','='],
];

export default function MathTools() {
  const [tab, setTab] = useState<Tab>('eval');
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const [etaDist, setEtaDist] = useState('100');
  const [etaSpeed, setEtaSpeed] = useState('60');
  const [etaUnit, setEtaUnit] = useState<'km' | 'mi'>('km');
  const [etaStart, setEtaStart] = useState('');
  const [etaResult, setEtaResult] = useState('');

  const [chronoRunning, setChronoRunning] = useState(false);
  const [chronoTime, setChronoTime] = useState(0);
  const [laps, setLaps] = useState<number[]>([]);
  const chronoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const evaluate = useCallback((e: string) => {
    try {
      if (!e.trim()) { setResult(''); return; }
      const sanitized = e.replace(/√(\d*\.?\d+)/g, 'Math.sqrt($1)').replace(/π/g, 'Math.PI').replace(/sin\(/g, 'Math.sin(').replace(/cos\(/g, 'Math.cos(').replace(/tan\(/g, 'Math.tan(').replace(/log\(/g, 'Math.log(').replace(/\^2/g, '**2').replace(/\^3/g, '**3');
      const fn = new Function('return (' + sanitized + ')');
      const r = fn();
      setResult(r !== undefined && !isNaN(r) ? String(r) : '');
    } catch { setResult(''); }
  }, []);

  const appendToExpr = (val: string) => {
    if (val === 'C') { setExpr(''); setResult(''); return; }
    if (val === '±') { setExpr(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev); return; }
    if (val === '=') {
      if (result) {
        setHistory(prev => [`${expr} = ${result}`, ...prev].slice(0, 20));
        setExpr(result);
        setResult('');
        evaluate(result);
      }
      return;
    }
    if (val === '√') { setExpr(prev => prev + '√('); return; }
    if (val === 'π') { setExpr(prev => prev + 'π'); return; }
    if (val === 'e') { setExpr(prev => prev + 'Math.E'); return; }
    setExpr(prev => prev + val);
  };

  useEffect(() => { if (expr) evaluate(expr); else setResult(''); }, [expr, evaluate]);

  useEffect(() => {
    if (chronoRunning) {
      const start = Date.now() - chronoTime;
      chronoRef.current = setInterval(() => setChronoTime(Date.now() - start), 10);
    } else if (chronoRef.current) {
      clearInterval(chronoRef.current);
      chronoRef.current = null;
    }
    return () => { if (chronoRef.current) clearInterval(chronoRef.current); };
  }, [chronoRunning, chronoTime]);

  const computeETA = useCallback(() => {
    const d = parseFloat(etaDist);
    const s = parseFloat(etaSpeed);
    if (isNaN(d) || isNaN(s) || s <= 0) { setEtaResult(''); return; }
    const hours = d / s;
    const hh = Math.floor(hours);
    const mm = Math.round((hours - hh) * 60);
    let out = `${hh}h ${mm}m`;
    if (etaStart) {
      const [sh, sm] = etaStart.split(':').map(Number);
      const startMin = sh * 60 + sm;
      const totalMin = startMin + hh * 60 + mm;
      const ah = Math.floor(totalMin / 60) % 24;
      const am = totalMin % 60;
      out += ` (arrival ~${String(ah).padStart(2, '0')}:${String(am).padStart(2, '0')})`;
    }
    setEtaResult(out);
  }, [etaDist, etaSpeed, etaStart]);

  useEffect(() => { computeETA(); }, [computeETA]);

  const formatTime = (ms: number) => {
    const totalCs = Math.floor(ms / 10);
    const cs = totalCs % 100;
    const totalSec = Math.floor(totalCs / 100);
    const sec = totalSec % 60;
    const totalMin = Math.floor(totalSec / 60);
    const min = totalMin % 60;
    const hr = Math.floor(totalMin / 60);
    return `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
  };

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  const TabBtn = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold rounded-lg transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
        <TabBtn v="eval" label="Evaluator" icon={Calculator} />
        <TabBtn v="eta" label="ETA" icon={Timer} />
        <TabBtn v="chrono" label="Chronometer" icon={Clock} />
      </div>

      {tab === 'eval' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
            <input ref={inputRef} value={expr} onChange={e => setExpr(e.target.value)} placeholder="Type or tap buttons..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-lg text-zinc-900 dark:text-white outline-none font-mono text-right" />
            <div className={`text-right text-lg font-bold font-mono transition-colors ${result ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>{result || '0'}</div>
            <div className="grid grid-cols-6 gap-1.5">
              {MATH_BUTTONS.flat().map(btn => (
                <button key={btn} onClick={() => appendToExpr(btn)} className={`py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${btn === '=' ? 'bg-blue-600 text-white hover:bg-blue-700 col-span-1' : btn === 'C' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'} ${btn === '=' ? '' : ''}`}>{btn}</button>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-3">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase">History</h3>
            {history.length === 0 ? <p className="text-xs text-zinc-400">No calculations yet.</p> : (
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {history.map((h, i) => (
                  <div key={i} className="text-xs font-mono text-zinc-600 dark:text-zinc-400 py-1 border-b border-zinc-100 dark:border-zinc-800">{h}</div>
                ))}
              </div>
            )}
            {history.length > 0 && <button onClick={() => { setHistory([]); toast.success('History cleared!'); }} className="text-[10px] text-zinc-400 hover:text-zinc-600 underline">Clear</button>}
          </div>
        </div>
      )}

      {tab === 'eta' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Distance ({etaUnit === 'km' ? 'km' : 'mi'})</label>
              <input value={etaDist} onChange={e => setEtaDist(e.target.value)} type="number" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Speed ({etaUnit === 'km' ? 'km/h' : 'mph'})</label>
              <input value={etaSpeed} onChange={e => setEtaSpeed(e.target.value)} type="number" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1">
              <button onClick={() => setEtaUnit('km')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${etaUnit === 'km' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>km/h</button>
              <button onClick={() => setEtaUnit('mi')} className={`px-3 py-1.5 text-xs font-bold rounded-lg ${etaUnit === 'mi' ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500'}`}>mph</button>
            </div>
            <div className="flex-1" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-zinc-400 uppercase block mb-1">Start Time (optional, HH:MM)</label>
            <input value={etaStart} onChange={e => setEtaStart(e.target.value)} placeholder="e.g. 14:30" className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
          </div>
          {etaResult && (
            <div className="bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 font-mono">{etaResult}</p>
              <button onClick={() => copy(etaResult, 'ETA')} className="mt-2 text-[10px] text-indigo-400 hover:underline">Copy</button>
            </div>
          )}
        </div>
      )}

      {tab === 'chrono' && (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 space-y-4 text-center">
          <div className="text-4xl font-bold font-mono text-blue-600 dark:text-blue-400 tracking-wider py-4">{formatTime(chronoTime)}</div>
          <div className="flex justify-center gap-3">
            <button onClick={() => setChronoRunning(prev => !prev)} className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${chronoRunning ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}>{chronoRunning ? 'Pause' : 'Start'}</button>
            <button onClick={() => { setChronoRunning(false); setChronoTime(0); setLaps([]); toast.success('Reset'); }} className="px-6 py-2.5 text-xs font-bold bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-colors cursor-pointer">Reset</button>
            <button onClick={() => { if (chronoRunning) { setLaps(prev => [chronoTime, ...prev]); } }} disabled={!chronoRunning} className={`px-6 py-2.5 text-xs font-bold rounded-xl transition-colors cursor-pointer ${chronoRunning ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400'}`}>Lap</button>
          </div>
          {laps.length > 0 && (
            <div className="max-h-[200px] overflow-y-auto space-y-0.5">
              {laps.map((lap, i) => (
                <div key={i} className="flex justify-between items-center py-1.5 px-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-xs">
                  <span className="text-zinc-400 font-mono">Lap {laps.length - i}</span>
                  <span className="font-mono text-zinc-900 dark:text-white font-bold">{formatTime(lap)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
