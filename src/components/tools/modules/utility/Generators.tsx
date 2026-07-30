"use client";
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Copy, Download, History, RotateCcw, RefreshCw, Shuffle, User, CreditCard, Key, Hash, Braces, Sigma, Ticket, Image as ImageIcon, BarChart3, Users, Palette, DollarSign, TrendingUp, Eye, List } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import QRCodeLib from 'qrcode';
import { downloadOrShare } from '@/utils/nativeShare';

function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffleArray<T>(arr: T[]): T[] { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="w-full bg-[var(--bg-overlay)] rounded-[var(--radius-2xl)] border border-[var(--border-subtle)] p-6">
      <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", rows, min, max }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; rows?: number; min?: number; max?: number;
}) {
  const cls = "w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50";
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">{label}</label>
      {rows ? (
        <textarea className={cls + " resize-y"} rows={rows} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
      ) : (
        <input className={cls} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} min={min} max={max} />
      )}
    </div>
  );
}

// === 1. RandomPasswordGenerator ===
export function RandomPasswordGenerator() {
  const [length, setLength] = useState(16);
  const [upper, setUpper] = useState(true); const [lower, setLower] = useState(true); const [digits, setDigits] = useState(true); const [symbols, setSymbols] = useState(true);
  const [excludeSimilar, setExcludeSimilar] = useState(false);
  const [result, setResult] = useState(''); const [history, setHistory] = useState<string[]>([]);

  const entropy = (() => { let pool = 0; if (upper) pool += 26; if (lower) pool += 26; if (digits) pool += 10; if (symbols) pool += 20; return pool > 0 ? Math.round(length * Math.log2(pool)) : 0; })();
  const strength = entropy >= 80 ? 'Strong' : entropy >= 50 ? 'Good' : entropy >= 30 ? 'Fair' : 'Weak';
  const strengthColor = entropy >= 80 ? 'text-emerald-500' : entropy >= 50 ? 'text-amber-500' : 'text-red-500';

  const generate = () => { let chars = ''; if (upper) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; if (lower) chars += 'abcdefghijklmnopqrstuvwxyz'; if (digits) chars += '0123456789'; if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'; if (excludeSimilar) chars = chars.replace(/[il1Lo0O]/g, ''); if (!chars) return; let pwd = ''; for (let i = 0; i < length; i++) pwd += chars[randInt(0, chars.length - 1)]; setResult(pwd); };

  const addToHistory = () => { if (result) { setHistory(prev => [result, ...prev].slice(0, 10)); toast.success('Added to history'); } };

  return (
    <Section title="Random Password Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Length ({length})</label><input type="range" min={4} max={128} value={length} onChange={e => setLength(Number(e.target.value))} className="w-full accent-emerald-500" /></div>
          <div className="flex flex-wrap gap-3"><label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={upper} onChange={e => setUpper(e.target.checked)} className="accent-emerald-500" />Uppercase</label><label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={lower} onChange={e => setLower(e.target.checked)} className="accent-emerald-500" />Lowercase</label><label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={digits} onChange={e => setDigits(e.target.checked)} className="accent-emerald-500" />Digits</label><label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={symbols} onChange={e => setSymbols(e.target.checked)} className="accent-emerald-500" />Symbols</label><label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={excludeSimilar} onChange={e => setExcludeSimilar(e.target.checked)} className="accent-emerald-500" />Exclude Similar</label></div>
          <div className="flex gap-2"><button onClick={generate} className="px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-sm transition-colors">Generate Password</button><button onClick={() => { if (result) { clipboardWrite(result); toast.success('Copied!'); } }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" title="Copy"><Copy size={16} /></button><button onClick={addToHistory} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors" title="Save"><History size={16} /></button></div>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col justify-center items-center min-h-[160px]">
          {result ? (<><p className="text-2xl font-mono font-bold text-[var(--text-primary)] break-all text-center">{result}</p><div className="flex items-center gap-2 mt-3"><span className="text-xs text-[var(--text-muted)]">{entropy} bits entropy</span><span className={`text-xs font-bold ${strengthColor}`}>{strength}</span></div></>) : (<p className="text-[var(--text-muted)] text-sm">Enter options and generate</p>)}
        </div>
      </div>
      {history.length > 0 && (<div className="border-t border-[var(--border-subtle)] pt-4"><div className="flex items-center justify-between mb-3"><h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">History</h4><button onClick={() => setHistory([])} className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"><RotateCcw size={12} /> Clear</button></div><div className="space-y-1 max-h-[200px] overflow-y-auto">{history.map((h, i) => (<div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-xs font-mono"><span>{h}</span><button onClick={() => { clipboardWrite(h); toast.success('Copied!'); }} className="text-[var(--accent)] hover:underline"><Copy size={12} /></button></div>))}</div></div>)}
    </Section>
  );
}

// === 2. RandomNumberGenerator ===
export function RandomNumberGenerator() {
  const [min, setMin] = useState('1'); const [max, setMax] = useState('100'); const [count, setCount] = useState('5'); const [unique, setUnique] = useState(false); const [sort, setSort] = useState(false);
  const [result, setResult] = useState<number[]>([]); const [history, setHistory] = useState<{ nums: number[]; timestamp: string }[]>([]);
  const generate = () => {
    const mn = parseInt(min); const mx = parseInt(max); const c = parseInt(count);
    if (isNaN(mn) || isNaN(mx) || isNaN(c)) return;
    const pool = mx - mn + 1; const nums: number[] = [];
    if (unique && c > pool) { for (let i = 0; i < pool; i++) nums.push(mn + i); }
    else if (unique) { const avail = Array.from({ length: pool }, (_, i) => mn + i); const sh = shuffleArray(avail); nums.push(...sh.slice(0, c)); }
    else { for (let i = 0; i < c; i++) nums.push(randInt(mn, mx)); }
    if (sort) nums.sort((a, b) => a - b);
    setResult(nums);
  };

  return (
    <Section title="Random Number Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3"><Input label="Min" type="number" value={min} onChange={v => setMin(v)} /><Input label="Max" type="number" value={max} onChange={v => setMax(v)} /><Input label="Count" type="number" value={count} onChange={v => setCount(v)} /></div>
          <div className="flex gap-4 text-sm text-[var(--text-secondary)]"><label className="flex items-center gap-2"><input type="checkbox" checked={unique} onChange={e => setUnique(e.target.checked)} className="accent-violet-500" />Unique</label><label className="flex items-center gap-2"><input type="checkbox" checked={sort} onChange={e => setSort(e.target.checked)} className="accent-violet-500" />Sorted</label></div>
          <div className="flex gap-2"><button onClick={generate} className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-colors">Generate</button></div>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col justify-center min-h-[160px]">
          {result.length > 0 ? (<><p className="text-lg font-mono font-bold text-[var(--text-primary)] break-all">{result.join(', ')}</p><p className="text-xs text-[var(--text-muted)] mt-2">{result.length} numbers · {sort ? 'sorted' : 'unsorted'} · {unique ? 'unique' : 'repeatable'}</p><div className="flex gap-1 mt-2"><button onClick={() => { clipboardWrite(result.join(', ')); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button><button onClick={() => { const blob = new Blob([result.join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'random-numbers.csv'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Download size={14} /></button></div></>) : (<p className="text-[var(--text-muted)] text-sm">Set range and generate</p>)}
        </div>
      </div>
    </Section>
  );
}

// === 3. RandomStringGenerator ===
const STRING_PRESETS = [
  { name: 'API Key (32)', length: 32, charset: 'alphanumeric' }, { name: 'Session (64)', length: 64, charset: 'hex' }, { name: 'Short ID (8)', length: 8, charset: 'alphanumeric' }, { name: 'OTP (6)', length: 6, charset: 'numeric' },
];
export function RandomStringGenerator() {
  const [length, setLength] = useState(12); const [charset, setCharset] = useState('alphanumeric'); const [result, setResult] = useState('');
  const generate = () => {
    let chars = '';
    switch (charset) { case 'alpha': chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'; break; case 'numeric': chars = '0123456789'; break; case 'hex': chars = '0123456789abcdef'; break; case 'hex-upper': chars = '0123456789ABCDEF'; break; case 'uuid': setResult(crypto.randomUUID()); return; default: chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; }
    let s = ''; for (let i = 0; i < length; i++) s += chars[randInt(0, chars.length - 1)]; setResult(s);
  };

  return (
    <Section title="Random String Generator">
      <div className="flex flex-wrap gap-2">{STRING_PRESETS.map(p => (<button key={p.name} onClick={() => { setLength(p.length); setCharset(p.charset); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.name}</button>))}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Input label="Length" type="number" value={String(length)} onChange={v => setLength(Number(v))} />
          <div className="mb-3">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Charset</label>
            <select value={charset} onChange={e => setCharset(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"><option value="alphanumeric">Alphanumeric</option><option value="alpha">Alphabetic</option><option value="numeric">Numeric</option><option value="hex">Hex (lowercase)</option><option value="hex-upper">Hex (uppercase)</option><option value="uuid">UUID v4</option></select>
          </div>
          <div className="flex gap-2"><button onClick={generate} className="px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-sm transition-colors">Generate</button></div>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col justify-center items-center min-h-[120px]">{result ? (<><p className="text-lg font-mono font-bold text-[var(--text-primary)] break-all text-center">{result}</p><p className="text-xs text-[var(--text-muted)] mt-1">{result.length} chars</p><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors mt-2"><Copy size={14} /></button></>) : (<p className="text-[var(--text-muted)] text-sm">Generate a random string</p>)}</div>
      </div>
    </Section>
  );
}

// === 4. RandomColorGenerator ===
export function RandomColorGenerator() {
  const [count, setCount] = useState(5); const [format, setFormat] = useState('hex'); const [colors, setColors] = useState<string[]>([]);
  const generate = () => {
    const c: string[] = [];
    for (let i = 0; i < count; i++) { const r = randInt(0, 255); const g = randInt(0, 255); const b = randInt(0, 255); if (format === 'hex') c.push(`#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`); else if (format === 'rgb') c.push(`rgb(${r}, ${g}, ${b})`); else c.push(`hsl(${randInt(0, 360)}, ${randInt(50, 100)}%, ${randInt(40, 60)}%)`); }
    setColors(c);
  };

  return (
    <Section title="Random Color Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} /><div className="mb-3"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Format</label><select value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"><option value="hex">Hex</option><option value="rgb">RGB</option><option value="hsl">HSL</option></select></div></div>
          <button onClick={generate} className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-sm transition-colors">Generate Colors</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[120px]">
          {colors.length > 0 ? (<div className="flex flex-wrap gap-3 justify-center">{colors.map((c, i) => (<div key={i} className="flex flex-col items-center gap-1"><div className="w-14 h-14 rounded-xl border border-zinc-300 dark:border-zinc-600 shadow-sm" style={{ backgroundColor: c }} /><span className="text-[10px] font-mono text-[var(--text-muted)]">{c}</span><button onClick={() => { clipboardWrite(c); toast.success('Copied!'); }} className="text-[10px] text-[var(--accent)] hover:underline">Copy</button></div>))}</div>) : (<p className="text-[var(--text-muted)] text-sm text-center">Generate random colors</p>)}
        </div>
      </div>
    </Section>
  );
}

// === 5. RandomTeamGenerator ===
export function RandomTeamGenerator() {
  const [input, setInput] = useState('Alice\nBob\nCharlie\nDiana\nEve\nFrank'); const [numTeams, setNumTeams] = useState(2); const [teams, setTeams] = useState<string[][]>([]);
  const generate = () => { const names = input.split('\n').map(s => s.trim()).filter(Boolean); const shuffled = shuffleArray(names); const t: string[][] = Array.from({ length: numTeams }, () => []); shuffled.forEach((name, i) => t[i % numTeams].push(name)); setTeams(t); };
  const teamColors = ['text-emerald-500', 'text-violet-500', 'text-amber-500', 'text-blue-500', 'text-pink-500', 'text-cyan-500'];

  return (
    <Section title="Random Team Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Input label="Names (one per line)" value={input} onChange={v => setInput(v)} rows={6} />
          <Input label="Number of Teams" type="number" value={String(numTeams)} onChange={v => setNumTeams(Number(v))} />
          <button onClick={generate} className="px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-sm transition-colors"><Shuffle className="w-4 h-4 inline mr-1" />Generate Teams</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">
          {teams.length > 0 ? (<div className="space-y-3">{teams.map((team, i) => (<div key={i} className="p-3 bg-[var(--bg-surface)] rounded-xl"><div className={`text-sm font-bold ${teamColors[i % teamColors.length]} mb-1`}>Team {i + 1} · {team.length} members</div><div className="text-xs text-[var(--text-secondary)]">{team.join(', ')}</div></div>))}</div>) : (<p className="text-[var(--text-muted)] text-sm">Enter names and generate teams</p>)}
        </div>
      </div>
    </Section>
  );
}

// === 6. RandomPickerGenerator ===
export function RandomPickerGenerator() {
  const [input, setInput] = useState('Option A\nOption B\nOption C\nOption D'); const [count, setCount] = useState(1); const [allowRepeat, setAllowRepeat] = useState(false); const [result, setResult] = useState<string[]>([]);
  const pick = () => { const items = input.split('\n').map(s => s.trim()).filter(Boolean); if (!items.length) return; if (allowRepeat) { const picked: string[] = []; for (let i = 0; i < count; i++) picked.push(randItem(items)); setResult(picked); } else { const shuffled = shuffleArray(items); setResult(shuffled.slice(0, Math.min(count, items.length))); } };

  return (
    <Section title="Random Picker Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Input label="Items (one per line)" value={input} onChange={v => setInput(v)} rows={5} />
          <Input label="Pick Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={allowRepeat} onChange={e => setAllowRepeat(e.target.checked)} className="accent-violet-500" />Allow repeats</label>
          <button onClick={pick} className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl text-sm transition-colors"><Shuffle className="w-4 h-4 inline mr-1" />Pick</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col justify-center items-center min-h-[160px]">{result.length > 0 ? (<div className="text-center"><p className="text-3xl font-extrabold text-violet-500">{result.join(', ')}</p><button onClick={() => { clipboardWrite(result.join(', ')); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors mt-3"><Copy size={14} /></button></div>) : (<p className="text-[var(--text-muted)] text-sm">Add items and pick</p>)}</div>
      </div>
    </Section>
  );
}

// === 7. RandomDecisionMaker (unified — replaces DecisionMaker & YesNoPicker) ===
export function RandomDecisionMaker() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('Yes\nNo\nMaybe');
  const [choice, setChoice] = useState('');
  const [spinning, setSpinning] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [history, setHistory] = useState<string[]>([]);

  const decide = () => {
    const items = options.split('\n').map(s => s.trim()).filter(Boolean);
    if (items.length === 0) return;
    setSpinning(true);
    setChoice('');
    let i = 0;
    const interval = setInterval(() => {
      setChoice(items[i % items.length]);
      i++;
      if (i > items.length * 5) {
        clearInterval(interval);
        setSpinning(false);
        const final = items[Math.floor(Math.random() * items.length)];
        setChoice(final);
        const label = question.trim() ? `Q: ${question} → ${final}` : final;
        setHistory(prev => [label, ...prev].slice(0, 10));
      }
    }, 80);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !choice) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cx = canvas.width / 2, cy = canvas.height / 2, r = 70;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = '#3b82f6';
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(choice, cx, cy);
  }, [choice]);

  return (
    <Section title="Random Decision Maker">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Input label="What are you deciding? (optional)" value={question} onChange={v => setQuestion(v)} placeholder="e.g. Should I go out tonight?" />
          <Input label="Options (one per line)" value={options} onChange={v => setOptions(v)} rows={5} />
          <button onClick={decide} disabled={spinning} className={`px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors ${spinning ? 'opacity-60' : ''}`}>{spinning ? 'Spinning...' : 'Decide'}</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col justify-center items-center min-h-[160px]">
          <canvas ref={canvasRef} width={160} height={160} className="max-w-full" />
          {choice && <button onClick={() => { clipboardWrite(choice); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors mt-3"><Copy size={14} /></button>}
        </div>
      </div>
      {history.length > 0 && (<div className="border-t border-[var(--border-subtle)] pt-4"><div className="flex items-center justify-between mb-3"><h4 className="text-sm font-bold text-[var(--text-secondary)] uppercase">History</h4><button onClick={() => setHistory([])} className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent)]"><RotateCcw size={12} /> Clear</button></div><div className="space-y-1">{history.map((h, i) => (<div key={i} className="p-2 bg-[var(--bg-surface)] rounded-lg text-xs text-[var(--text-secondary)]">{h}</div>))}</div></div>)}
    </Section>
  );
}

// === 8. RandomUsernameGenerator ===
const ADJECTIVES = ['Swift', 'Brave', 'Clever', 'Mighty', 'Silent', 'Golden', 'Shadow', 'Crimson', 'Frost', 'Storm', 'Azure', 'Ember', 'Neon', 'Stealth', 'Blaze'];
const NOUNS = ['Fox', 'Wolf', 'Eagle', 'Bear', 'Hawk', 'Owl', 'Tiger', 'Dragon', 'Phoenix', 'Raven', 'Lion', 'Panther', 'Falcon', 'Cobra', 'Viper'];
export function RandomUsernameGenerator() {
  const [pattern, setPattern] = useState('adj-noun'); const [includeNum, setIncludeNum] = useState(false); const [count, setCount] = useState(5); const [results, setResults] = useState<string[]>([]);
  const generate = () => { const usernames: string[] = []; for (let i = 0; i < count; i++) { let u = ''; switch (pattern) { case 'adj-noun': u = `${randItem(ADJECTIVES)}${randItem(NOUNS)}`; break; case 'noun-num': u = `${randItem(NOUNS)}${randInt(10, 999)}`; break; case 'adj-noun-num': u = `${randItem(ADJECTIVES)}${randItem(NOUNS)}${randInt(10, 999)}`; break; case 'word-word': u = `${randItem(ADJECTIVES)}${randItem(NOUNS)}`.toLowerCase(); break; } if (includeNum) u += randInt(10, 999); usernames.push(u); } setResults(usernames); };

  return (
    <Section title="Random Username Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Pattern</label>
            <select value={pattern} onChange={e => setPattern(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"><option value="adj-noun">Adjective + Noun</option><option value="noun-num">Noun + Number</option><option value="adj-noun-num">Adjective + Noun + Number</option><option value="word-word">word-word (lowercase)</option></select>
          </div>
          <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
          <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={includeNum} onChange={e => setIncludeNum(e.target.checked)} className="accent-indigo-500" />Append random number</label>
          <button onClick={generate} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors">Generate Usernames</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[160px]">{results.length > 0 ? (<div className="space-y-1">{results.map((u, i) => (<div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm"><span className="font-mono">{u}</span><button onClick={() => { clipboardWrite(u); toast.success('Copied!'); }} className="text-xs text-indigo-500 hover:underline"><Copy size={12} /></button></div>))}<button onClick={() => { clipboardWrite(results.join('\n')); toast.success('Copied all!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-2">Copy All</button></div>) : (<p className="text-[var(--text-muted)] text-sm">Generate usernames</p>)}</div>
      </div>
    </Section>
  );
}

// === 9. RandomUUIDGenerator ===
export function RandomUUIDGenerator() {
  const [version, setVersion] = useState('v4'); const [count, setCount] = useState(1); const [results, setResults] = useState<string[]>([]);
  const generate = () => { const uuids: string[] = []; for (let i = 0; i < count; i++) { if (version === 'v4') uuids.push(crypto.randomUUID()); else { const arr = new Uint8Array(16); crypto.getRandomValues(arr); arr[6] = (arr[6] & 0x0f) | 0x70; arr[8] = (arr[8] & 0x3f) | 0x80; const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join(''); uuids.push(`${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`); } } setResults(uuids); };

  return (
    <Section title="Random UUID Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><div className="mb-3"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Version</label><select value={version} onChange={e => setVersion(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"><option value="v4">UUID v4 (Random)</option><option value="v7">UUID v7 (Time-Ordered)</option></select></div><Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} /></div>
          <button onClick={generate} className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition-colors">Generate UUIDs</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[160px]">{results.length > 0 ? (<div className="space-y-1 max-h-[300px] overflow-y-auto">{results.map((u, i) => (<div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-xs font-mono"><span>{u}</span><button onClick={() => { clipboardWrite(u); toast.success('Copied!'); }} className="text-cyan-500 hover:underline"><Copy size={12} /></button></div>))}<button onClick={() => { clipboardWrite(results.join('\n')); toast.success('Copied all!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-2">Copy All</button></div>) : (<p className="text-[var(--text-muted)] text-sm">Generate UUIDs</p>)}</div>
      </div>
    </Section>
  );
}

// === 10. RandomTokenGenerator ===
export function RandomTokenGenerator() {
  const [format, setFormat] = useState('hex'); const [length, setLength] = useState(32); const [result, setResult] = useState('');
  const generate = () => { const bytes = new Uint8Array(Math.ceil(length * (format === 'base64' ? 0.75 : 0.5))); crypto.getRandomValues(bytes); if (format === 'hex') setResult(Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, length)); else if (format === 'base64') setResult(btoa(String.fromCharCode(...bytes)).replace(/=+$/, '').slice(0, length)); else { const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; let s = ''; for (let i = 0; i < length; i++) s += chars[randInt(0, chars.length - 1)]; setResult(s); } };
  const entropy = Math.round(length * Math.log2(format === 'hex' ? 16 : format === 'base64' ? 64 : 62));

  return (
    <Section title="Random Token Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><div className="mb-3"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Format</label><select value={format} onChange={e => setFormat(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"><option value="hex">Hex</option><option value="base64">Base64</option><option value="alphanumeric">Alphanumeric</option></select></div><Input label="Length" type="number" value={String(length)} onChange={v => setLength(Number(v))} /></div>
          <button onClick={generate} className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm transition-colors">Generate Token</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col justify-center items-center min-h-[120px]">{result ? (<><p className="text-lg font-mono font-bold text-[var(--text-primary)] break-all text-center">{result}</p><p className="text-xs text-[var(--text-muted)] mt-2">{entropy} bits entropy</p><div className="flex gap-1 mt-2"><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button><button onClick={() => { const blob = new Blob([result], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `token.${format}`; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Download size={14} /></button></div></>) : (<p className="text-[var(--text-muted)] text-sm">Generate a secure token</p>)}</div>
      </div>
    </Section>
  );
}

// === 11. LoremIpsumGenerator ===
const LOREM_WORDS = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];
export function LoremIpsumGenerator() {
  const [type, setType] = useState('paragraphs'); const [count, setCount] = useState(3); const [result, setResult] = useState(''); const [startLorem, setStartLorem] = useState(true);
  const generate = () => {
    const sentences: string[] = []; const total = type === 'words' ? count : type === 'sentences' ? count : count * 4;
    for (let i = 0; i < total; i++) { const len = randInt(5, 15); const words: string[] = []; for (let j = 0; j < len; j++) words.push(randItem(LOREM_WORDS)); words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1); sentences.push(words.join(' ') + '.'); }
    if (type === 'words') { let text = sentences.slice(0, count).join(' ').toLowerCase(); setResult(text); }
    else if (type === 'sentences') setResult(sentences.join(' '));
    else { const paras: string[] = []; for (let i = 0; i < count; i++) { let p = sentences.slice(i * 4, (i + 1) * 4).join(' '); if (i === 0 && startLorem) p = 'Lorem ipsum dolor sit amet, ' + p.charAt(0).toLowerCase() + p.slice(1); paras.push(p); } setResult(paras.join('\n\n')); }
  };

  return (
    <Section title="Lorem Ipsum Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3"><div className="mb-3"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Type</label><select value={type} onChange={e => setType(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"><option value="paragraphs">Paragraphs</option><option value="sentences">Sentences</option><option value="words">Words</option></select></div><Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} /></div>
          {type === 'paragraphs' && <label className="flex items-center gap-2 text-sm text-[var(--text-secondary)]"><input type="checkbox" checked={startLorem} onChange={e => setStartLorem(e.target.checked)} className="accent-blue-500" />Start with "Lorem ipsum..."</label>}
          <div className="flex gap-2"><button onClick={generate} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-colors">Generate</button></div>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">{result ? (<><textarea readOnly value={result} rows={8} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 font-sans text-xs leading-relaxed resize-none" /><div className="flex gap-1 mt-2"><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button><button onClick={() => { const blob = new Blob([result], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'lorem-ipsum.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Download size={14} /></button></div></>) : (<p className="text-[var(--text-muted)] text-sm">Generate placeholder text</p>)}</div>
      </div>
    </Section>
  );
}

// === 12. DummyTextGenerator ===
export function DummyTextGenerator() {
  const [length, setLength] = useState(200); const [result, setResult] = useState('');
  const generate = () => { let text = ''; while (text.length < length) { text += randItem(LOREM_WORDS) + ' '; } setResult(text.slice(0, length).replace(/^./, c => c.toUpperCase()).replace(/\s+\S*$/, '') + '.'); };

  return (
    <Section title="Dummy Text Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="space-y-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Character Length ({length})</label><input type="range" min={10} max={5000} step={10} value={length} onChange={e => setLength(Number(e.target.value))} className="w-full accent-sky-500" /><input type="number" min={10} max={5000} value={length} onChange={e => setLength(Number(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50" /></div>
          <button onClick={generate} className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-sm transition-colors">Generate Text</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">{result ? (<><textarea readOnly value={result} rows={6} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 font-sans text-xs leading-relaxed resize-none" /><div className="flex items-center justify-between mt-2"><span className="text-xs text-[var(--text-muted)]">{result.length} chars</span><div className="flex gap-1"><button onClick={() => { clipboardWrite(result); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button><button onClick={() => { const blob = new Blob([result], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'dummy-text.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Download size={14} /></button></div></div></>) : (<p className="text-[var(--text-muted)] text-sm">Generate dummy text</p>)}</div>
      </div>
    </Section>
  );
}

// === 13. FakeDataGenerator ===
const FIRST_NAMES = ['Aarav', 'Priya', 'Vikram', 'Ananya', 'Rohit', 'Sneha', 'Arjun', 'Neha', 'Karan', 'Isha', 'Rahul', 'Pooja', 'Amit', 'Divya', 'Sachin'];
const LAST_NAMES = ['Sharma', 'Verma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Joshi', 'Reddy', 'Nair', 'Das', 'Mishra', 'Agarwal', 'Mehta', 'Chopra', 'Malhotra'];
const DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'example.org', 'mail.com'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'];
const STREETS = ['Main St', 'Park Ave', 'Oak Lane', 'Maple Dr', 'Cedar Blvd', 'Elm St', 'Pine Rd', 'Lake View', 'Hill Rd', 'River Rd'];
type Field = 'name' | 'email' | 'phone' | 'address';
export function FakeDataGenerator() {
  const [count, setCount] = useState(5); const [fields, setFields] = useState<Field[]>(['name', 'email', 'phone', 'address']); const [data, setData] = useState<Record<string, string>[]>([]);
  const toggleField = (f: Field) => setFields(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);
  const generate = () => { const entries: Record<string, string>[] = []; for (let i = 0; i < count; i++) { const fn = randItem(FIRST_NAMES); const ln = randItem(LAST_NAMES); const entry: Record<string, string> = {}; if (fields.includes('name')) entry.Name = `${fn} ${ln}`; if (fields.includes('email')) entry.Email = `${fn.toLowerCase()}.${ln.toLowerCase()}${randInt(1, 99)}@${randItem(DOMAINS)}`; if (fields.includes('phone')) entry.Phone = `+91 ${randInt(70000, 99999)} ${randInt(10000, 99999)}`; if (fields.includes('address')) entry.Address = `${randInt(1, 999)} ${randItem(STREETS)}, ${randItem(CITIES)} - ${randInt(100001, 999999)}`; entries.push(entry); } setData(entries); };
  const toCSV = () => { if (!data.length) return ''; const headers = Object.keys(data[0]); return [headers.join(','), ...data.map(r => headers.map(h => `"${(r[h] || '').replace(/"/g, '""')}"`).join(','))].join('\n'); };

  return (
    <Section title="Fake Data Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
          <div className="flex flex-wrap gap-2"><span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider w-full">Fields</span>{(['name', 'email', 'phone', 'address'] as Field[]).map(f => (<button key={f} onClick={() => toggleField(f)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${fields.includes(f) ? 'bg-emerald-500/10 border-emerald-400 text-emerald-500' : 'bg-[var(--bg-surface)] border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)]'}`}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>))}</div>
          <button onClick={generate} className="px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-sm transition-colors">Generate Data</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">{data.length > 0 ? (<div className="space-y-1 max-h-[300px] overflow-y-auto">{data.map((d, i) => (<div key={i} className="p-3 bg-[var(--bg-surface)] rounded-xl text-xs leading-relaxed">{Object.entries(d).map(([k, v]) => (<div key={k}><span className="font-bold text-[var(--text-secondary)]">{k}:</span> {v}</div>))}</div>))}<div className="flex gap-1 mt-2"><button onClick={() => { clipboardWrite(JSON.stringify(data, null, 2)); toast.success('Copied as JSON!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button><button onClick={() => { const csv = toCSV(); if (!csv) return; const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'fake-data.csv'; a.click(); URL.revokeObjectURL(url); toast.success('CSV downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Download size={14} /></button></div></div>) : (<p className="text-[var(--text-muted)] text-sm">Generate fake data</p>)}</div>
      </div>
    </Section>
  );
}

// === 14. FakeIdentityGenerator ===
export function FakeIdentityGenerator() {
  const [identity, setIdentity] = useState<any>(null);
  const generate = () => { const fn = randItem(FIRST_NAMES); const ln = randItem(LAST_NAMES); setIdentity({ name: `${fn} ${ln}`, email: `${fn.toLowerCase()}.${ln.toLowerCase()}${randInt(1, 99)}@${randItem(DOMAINS)}`, phone: `+91 ${randInt(70000, 99999)} ${randInt(10000, 99999)}`, address: `${randInt(1, 999)} ${randItem(STREETS)}, ${randItem(CITIES)} - ${randInt(100001, 999999)}`, dob: `${randInt(1, 28)}/${randInt(1, 12)}/${randInt(1970, 2002)}`, occupation: randItem(['Engineer', 'Doctor', 'Teacher', 'Designer', 'Developer', 'Manager', 'Consultant', 'Analyst']) }); };

  return (
    <Section title="Fake Identity Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <button onClick={generate} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-colors"><RefreshCw className="w-4 h-4 inline mr-1" />Generate Identity</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">{identity ? (<div className="space-y-3"><div className="flex justify-center"><div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">{identity.name.split(' ').map((w: string) => w[0]).join('')}</div></div><div className="p-4 bg-[var(--bg-surface)] rounded-xl text-sm space-y-1.5">{[['Name', identity.name], ['Email', identity.email], ['Phone', identity.phone], ['Address', identity.address], ['DOB', identity.dob], ['Occupation', identity.occupation]].map(([k, v]) => (<div key={k as string} className="flex justify-between"><span className="font-bold text-[var(--text-secondary)]">{k as string}</span><span className="text-[var(--text-primary)]">{v as string}</span></div>))}</div><button onClick={() => { clipboardWrite(JSON.stringify(identity, null, 2)); toast.success('Copied as JSON!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Copy as JSON</button></div>) : (<p className="text-[var(--text-muted)] text-sm">Generate a random identity</p>)}</div>
      </div>
    </Section>
  );
}

// === 15. FakeCreditCardGenerator ===
const CARD_TYPES = [
  { name: 'Visa', prefix: '4', len: 16 }, { name: 'Mastercard', prefix: '5', len: 16 }, { name: 'Amex', prefix: '34', len: 15 }, { name: 'Discover', prefix: '6011', len: 16 }, { name: 'RuPay', prefix: '60', len: 16 },
];
function luhnCheck(num: string): boolean { let sum = 0; let alt = false; for (let i = num.length - 1; i >= 0; i--) { let d = parseInt(num[i]); if (alt) { d *= 2; if (d > 9) d -= 9; } sum += d; alt = !alt; } return sum % 10 === 0; }
function genCardNum(prefix: string, len: number): string { let num = prefix; for (let i = num.length; i < len - 1; i++) num += randInt(0, 9); for (let c = 0; c <= 9; c++) { if (luhnCheck(num + c)) return num + c; } return num + '0'; }
export function FakeCreditCardGenerator() {
  const [count, setCount] = useState(3); const [cards, setCards] = useState<{ type: string; number: string; expiry: string; cvv: string }[]>([]);
  const generate = () => { const c: typeof cards = []; for (let i = 0; i < count; i++) { const t = randItem(CARD_TYPES); c.push({ type: t.name, number: genCardNum(t.prefix, t.len), expiry: `${String(randInt(1, 12)).padStart(2, '0')}/${randInt(25, 30)}`, cvv: String(randInt(100, 999)) }); } setCards(c); };
  const cardColors: Record<string, string> = { Visa: 'from-blue-600 to-blue-800', Mastercard: 'from-orange-500 to-red-600', Amex: 'from-cyan-600 to-blue-700', Discover: 'from-orange-400 to-yellow-600', RuPay: 'from-emerald-600 to-teal-700' };

  return (
    <Section title="Fake Credit Card Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
          <button onClick={generate} className="px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-sm transition-colors">Generate Cards</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[200px]">{cards.length > 0 ? (<div className="space-y-3 max-h-[350px] overflow-y-auto">{cards.map((c, i) => (<div key={i} className={`p-4 rounded-xl bg-gradient-to-br ${cardColors[c.type] || 'from-zinc-600 to-zinc-800'} text-white shadow-md`}><div className="flex justify-between items-start"><span className="text-xs font-medium opacity-80">{c.type}</span><span className="text-[10px] opacity-60">CVV: {c.cvv}</span></div><div className="text-lg font-mono tracking-wider mt-3">{c.number.replace(/(\d{4})(?=\d)/g, '$1 ')}</div><div className="flex justify-between mt-3 text-xs opacity-80"><span>Expires: {c.expiry}</span></div></div>))}<button onClick={() => { clipboardWrite(cards.map(c => `${c.number}|${c.expiry}|${c.cvv}`).join('\n')); toast.success('Copied all!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Copy All</button></div>) : (<p className="text-[var(--text-muted)] text-sm">Generate test card numbers</p>)}</div>
      </div>
    </Section>
  );
}

// === 16. SequenceGenerator ===
export function SequenceGenerator() {
  const [type, setType] = useState('arithmetic'); const [start, setStart] = useState('1'); const [diff, setDiff] = useState('2'); const [count, setCount] = useState('10'); const [result, setResult] = useState<number[]>([]);
  const generate = () => { const s = parseFloat(start); const d = parseFloat(diff); const c = parseInt(count); if (isNaN(s) || isNaN(d) || isNaN(c)) return; const seq: number[] = []; if (type === 'arithmetic') { for (let i = 0; i < c; i++) seq.push(s + i * d); } else if (type === 'geometric') { for (let i = 0; i < c; i++) seq.push(s * Math.pow(d, i)); } else { for (let i = 0; i < c; i++) seq.push(s + i + (i * d)); } setResult(seq); };
  const sum = result.reduce((a, b) => a + b, 0);

  return (
    <Section title="Sequence Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Type</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"><option value="arithmetic">Arithmetic</option><option value="geometric">Geometric</option><option value="custom">Custom (n + n*r)</option></select>
          </div>
          <div className="grid grid-cols-3 gap-3"><Input label="Start" type="number" value={start} onChange={v => setStart(v)} /><Input label="Diff/Ratio" type="number" value={diff} onChange={v => setDiff(v)} /><Input label="Count" type="number" value={count} onChange={v => setCount(v)} /></div>
          <button onClick={generate} className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-sm transition-colors">Generate Sequence</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[120px]">{result.length > 0 ? (<><p className="text-sm font-mono font-bold text-[var(--text-primary)] break-all">{result.join(', ')}</p><p className="text-xs text-[var(--text-muted)] mt-2">Sum: {sum.toLocaleString()} · Count: {result.length}</p><div className="flex gap-1 mt-2"><button onClick={() => { clipboardWrite(result.join(', ')); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button><button onClick={() => { const blob = new Blob([result.join('\n')], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'sequence.csv'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Download size={14} /></button></div></>) : (<p className="text-[var(--text-muted)] text-sm">Generate a number sequence</p>)}</div>
      </div>
    </Section>
  );
}

// === 17. BarcodeGenerator ===
const BARCODE_PATTERNS: Record<string, string[]> = { 'UPC-A': ['3211', '2221', '2122', '1411', '1132', '1231', '1114', '1312', '1213', '3112'], 'EAN-13': ['3211', '2221', '2122', '1411', '1132', '1231', '1114', '1312', '1213', '3112'], 'Code128': ['212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213'], 'Code39': ['111221211', '211211112', '112211112', '211112112', '111212112', '112112112', '211121112', '111121212', '211111122', '112111122'] };
export function BarcodeGenerator() {
  const [input, setInput] = useState('123456789012'); const [type, setType] = useState('UPC-A'); const svgRef = useRef<SVGSVGElement>(null);
  const renderBarcode = () => { const patterns = BARCODE_PATTERNS[type] || BARCODE_PATTERNS['UPC-A']; const digits = input.replace(/\D/g, '').split('').slice(0, 12); const barWidth = 2; const height = 80; let x = 20; const bars: { x: number; w: number }[] = []; bars.push({ x, w: barWidth }); x += barWidth; bars.push({ x, w: barWidth * 2 }); x += barWidth * 2; for (const d of digits) { const p = patterns[parseInt(d)] || patterns[0]; for (const c of p) { bars.push({ x, w: parseInt(c) * barWidth }); x += parseInt(c) * barWidth; } } bars.push({ x, w: barWidth * 2 }); x += barWidth * 2; bars.push({ x, w: barWidth }); const totalWidth = x + 20; return (<svg ref={svgRef} width={totalWidth} height={height + 30} xmlns="http://www.w3.org/2000/svg" className="mx-auto">{bars.map((b, i) => (<rect key={i} x={b.x} y={10} width={b.w} height={height} fill={i % 2 === 0 ? '#000' : '#fff'} />))}<text x={totalWidth / 2} y={height + 25} textAnchor="middle" fontSize="12" fontFamily="monospace">{input}</text></svg>); };

  return (
    <Section title="Barcode Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4"><div className="mb-3"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Type</label><select value={type} onChange={e => setType(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"><option value="UPC-A">UPC-A</option><option value="EAN-13">EAN-13</option><option value="Code128">Code 128</option><option value="Code39">Code 39</option></select></div><Input label="Data" value={input} onChange={v => setInput(v)} /></div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col items-center justify-center min-h-[160px]">{input ? (<div className="overflow-auto w-full flex justify-center">{renderBarcode()}<button onClick={() => { const svg = svgRef.current; if (!svg) return; const clone = svg.cloneNode(true) as SVGSVGElement; const serializer = new XMLSerializer(); const source = serializer.serializeToString(clone); const blob = new Blob([source], { type: 'image/svg+xml' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'barcode.svg'; a.click(); URL.revokeObjectURL(url); toast.success('SVG downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors mt-2"><Download size={14} /></button></div>) : (<p className="text-[var(--text-muted)] text-sm">Enter data to generate barcode</p>)}</div>
      </div>
    </Section>
  );
}

// === 18. QrCodeGenerator ===
export function QrCodeGenerator() {
  const [text, setText] = useState('https://toolzum.com'); const [errorCorrection, setErrorCorrection] = useState('M'); const [dataUrl, setDataUrl] = useState(''); const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (!text.trim()) return; const canvas = canvasRef.current; if (!canvas) return; QRCodeLib.toCanvas(canvas, text.trim(), { width: 280, margin: 2, color: { dark: '#000000', light: '#ffffff' }, errorCorrectionLevel: errorCorrection as 'L' | 'M' | 'Q' | 'H' }).then(() => { setDataUrl(canvas.toDataURL('image/png')); }).catch(() => {}); }, [text, errorCorrection]);

  return (
    <Section title="QR Code Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4"><Input label="Text / URL" value={text} onChange={v => setText(v)} placeholder="Enter text or URL..." /><div className="mb-3"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Error Correction</label><select value={errorCorrection} onChange={e => setErrorCorrection(e.target.value)} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50"><option value="L">Low (7%)</option><option value="M">Medium (15%)</option><option value="Q">Quartile (25%)</option><option value="H">High (30%)</option></select></div></div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col items-center justify-center min-h-[200px]"><canvas ref={canvasRef} className="hidden" />{dataUrl ? (<><img src={dataUrl} alt="QR Code" className="rounded-xl border border-[var(--border-subtle)] shadow-sm max-w-[200px]" /><div className="flex gap-2 mt-3"><button onClick={() => downloadOrShare(dataUrl, `qrcode_${Date.now()}.png`)} className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-sm transition-colors">Download PNG</button><button onClick={() => { clipboardWrite(text); toast.success('Text copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button></div></>) : (<p className="text-[var(--text-muted)] text-sm">Enter text to generate QR code</p>)}</div>
      </div>
    </Section>
  );
}

// === 19. CouponCodeGenerator ===
const COUPON_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const COUPON_PRESETS = [
  { name: 'Standard', pattern: 'XXXX-XXXX-XXXX' }, { name: 'Short', pattern: 'XXXX-XXXX' }, { name: 'With Year', pattern: '2026-XXXX-XXXX' }, { name: 'Alphanumeric', pattern: 'XXXXXXXXXXXX' },
];
export function CouponCodeGenerator() {
  const [pattern, setPattern] = useState('XXXX-XXXX-XXXX'); const [count, setCount] = useState(5); const [codes, setCodes] = useState<string[]>([]);
  const generate = () => { const cs: string[] = []; for (let c = 0; c < count; c++) { let code = ''; for (const ch of pattern) { if (ch === 'X') code += COUPON_CHARS[randInt(0, COUPON_CHARS.length - 1)]; else code += ch; } cs.push(code); } setCodes(cs); };

  return (
    <Section title="Coupon Code Generator">
      <div className="flex flex-wrap gap-2">{COUPON_PRESETS.map(p => (<button key={p.name} onClick={() => setPattern(p.pattern)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.name}</button>))}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Input label="Pattern (X = random char)" value={pattern} onChange={v => setPattern(v)} />
          <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
          <button onClick={generate} className="px-4 py-2.5 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-xl text-sm transition-colors">Generate Coupons</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[160px]">{codes.length > 0 ? (<div className="space-y-1 max-h-[250px] overflow-y-auto">{codes.map((c, i) => (<div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm font-mono"><span className="tracking-wide">{c}</span><button onClick={() => { clipboardWrite(c); toast.success('Copied!'); }} className="text-xs text-emerald-500 hover:underline"><Copy size={12} /></button></div>))}<div className="flex gap-1 mt-2"><button onClick={() => { clipboardWrite(codes.join('\n')); toast.success('Copied all!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Copy All</button><button onClick={() => { const blob = new Blob([codes.join('\n')], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'coupon-codes.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Download size={14} /></button></div></div>) : (<p className="text-[var(--text-muted)] text-sm">Generate coupon codes</p>)}</div>
      </div>
    </Section>
  );
}

// === 20. SerialNumberGenerator ===
const SERIAL_PRESETS = [
  { name: 'Standard', format: 'XXXX-XXXX-XXXX-XXXX' }, { name: 'Product Key', format: 'XXXXX-XXXXX-XXXXX-XXXXX' }, { name: 'Hex', format: 'XXXXXXXX-XXXXXXXX' }, { name: 'Numeric', format: '9999-9999-9999' },
];
export function SerialNumberGenerator() {
  const [format, setFormat] = useState('XXXX-XXXX-XXXX-XXXX'); const [count, setCount] = useState(5); const [serials, setSerials] = useState<string[]>([]);
  const generate = () => { const ss: string[] = []; for (let c = 0; c < count; c++) { let s = ''; for (const ch of format) { if (ch === 'X') s += '0123456789ABCDEF'[randInt(0, 15)]; else if (ch === '9') s += randInt(0, 9).toString(); else if (ch === 'A') s += COUPON_CHARS[randInt(0, COUPON_CHARS.length - 1)]; else s += ch; } ss.push(s); } setSerials(ss); };

  return (
    <Section title="Serial Number Generator">
      <div className="flex flex-wrap gap-2">{SERIAL_PRESETS.map(p => (<button key={p.name} onClick={() => setFormat(p.format)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">{p.name}</button>))}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Input label="Format (X=hex, 9=digit, A=alphanum)" value={format} onChange={v => setFormat(v)} />
          <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
          <button onClick={generate} className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl text-sm transition-colors">Generate Serials</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[160px]">{serials.length > 0 ? (<div className="space-y-1 max-h-[250px] overflow-y-auto">{serials.map((s, i) => (<div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm font-mono"><span className="tracking-wide">{s}</span><button onClick={() => { clipboardWrite(s); toast.success('Copied!'); }} className="text-xs text-cyan-500 hover:underline"><Copy size={12} /></button></div>))}<div className="flex gap-1 mt-2"><button onClick={() => { clipboardWrite(serials.join('\n')); toast.success('Copied all!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Copy All</button><button onClick={() => { const blob = new Blob([serials.join('\n')], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'serials.txt'; a.click(); URL.revokeObjectURL(url); toast.success('Downloaded!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Download size={14} /></button></div></div>) : (<p className="text-[var(--text-muted)] text-sm">Generate serial numbers</p>)}</div>
      </div>
    </Section>
  );
}

// === 21. NicknameGenerator ===
const NICKNAME_PARTS = ['Star', 'Shadow', 'Light', 'Blaze', 'Storm', 'Frost', 'Crystal', 'Thunder', 'Dark', 'Wild', 'Fire', 'Ice', 'Iron', 'Steel', 'Silver', 'Gold', 'Mystic', 'Phantom', 'Neon', 'Cyber'];
const NICKNAME_PATTERNS = [
  { name: 'Adjective+Part+Num', get: () => `${randItem(ADJECTIVES).toLowerCase()}${randItem(NICKNAME_PARTS).toLowerCase()}${randInt(1, 99)}` },
  { name: 'Color+Animal', get: () => `${randItem(['Red', 'Blue', 'Dark', 'Gold', 'Silver', 'Neon', 'Ice', 'Fire'])}${randItem(['Wolf', 'Fox', 'Bear', 'Hawk', 'Lion', 'Viper', 'Puma', 'Elk'])}` },
  { name: 'Random Word', get: () => randItem(NICKNAME_PARTS) + randItem(ADJECTIVES) + randInt(10, 999) },
  { name: 'Gamer Tag', get: () => `xX${randItem(ADJECTIVES)}${randItem(NOUNS)}${randInt(1, 99)}Xx` },
];
export function NicknameGenerator() {
  const [patternIdx, setPatternIdx] = useState(0); const [count, setCount] = useState(10); const [results, setResults] = useState<string[]>([]);
  const generate = () => { const n: string[] = []; for (let i = 0; i < count; i++) n.push(NICKNAME_PATTERNS[patternIdx].get()); setResults(n); };

  return (
    <Section title="Nickname Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="mb-3">
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Pattern</label>
            <select value={patternIdx} onChange={e => setPatternIdx(Number(e.target.value))} className="w-full bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50">{NICKNAME_PATTERNS.map((p, i) => (<option key={i} value={i}>{p.name}</option>))}</select>
          </div>
          <Input label="Count" type="number" value={String(count)} onChange={v => setCount(Number(v))} />
          <button onClick={generate} className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-sm transition-colors">Generate Nicknames</button>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col min-h-[160px]">{results.length > 0 ? (<div className="space-y-1 max-h-[250px] overflow-y-auto">{results.map((n, i) => (<div key={i} className="flex items-center justify-between p-2 bg-[var(--bg-surface)] rounded-lg text-sm"><span>{n}</span><button onClick={() => { clipboardWrite(n); toast.success('Copied!'); }} className="text-xs text-pink-500 hover:underline"><Copy size={12} /></button></div>))}<button onClick={() => { clipboardWrite(results.join('\n')); toast.success('Copied all!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mt-2">Copy All</button></div>) : (<p className="text-[var(--text-muted)] text-sm">Generate creative nicknames</p>)}</div>
      </div>
    </Section>
  );
}

// === 22. AvatarGenerator ===
export function AvatarGenerator() {
  const [name, setName] = useState('John Doe'); const [bgColor, setBgColor] = useState('#4F46E5'); const [textColor, setTextColor] = useState('#FFFFFF'); const [size, setSize] = useState(120); const [shape, setShape] = useState('rounded');
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '?';
  const svgRef = useRef<SVGSVGElement>(null);
  const shapes: Record<string, number> = { rounded: 0.2, circle: 0.5, square: 0 };

  return (
    <Section title="Avatar Generator">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <Input label="Name" value={name} onChange={v => setName(v)} placeholder="Enter a name..." />
          <div className="flex gap-3"><div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Background</label><input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border border-zinc-300 dark:border-zinc-700" /></div><div className="flex-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Text</label><input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-full h-10 rounded-xl cursor-pointer border border-zinc-300 dark:border-zinc-700" /></div></div>
          <div className="space-y-1"><label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Size: {size}px</label><input type="range" min={40} max={200} value={size} onChange={e => setSize(Number(e.target.value))} className="w-full accent-indigo-500" /></div>
          <div className="flex gap-2"><span className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider self-center mr-2">Shape:</span>{Object.entries(shapes).map(([k]) => (<button key={k} onClick={() => setShape(k)} className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${shape === k ? 'bg-indigo-500/10 border-indigo-400 text-indigo-500' : 'bg-[var(--bg-surface)] border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)]'}`}>{k.charAt(0).toUpperCase() + k.slice(1)}</button>))}</div>
        </div>
        <div className="bg-[var(--bg-surface)] rounded-xl border border-zinc-300 dark:border-zinc-700 p-4 flex flex-col items-center justify-center min-h-[200px]">
          <svg ref={svgRef} width={size} height={size} viewBox={`0 0 ${size} ${size}`} xmlns="http://www.w3.org/2000/svg"><rect width={size} height={size} rx={size * shapes[shape]} fill={bgColor} /><text x="50%" y="50%" dominantBaseline="central" textAnchor="middle" fill={textColor} fontSize={size * 0.4} fontFamily="sans-serif" fontWeight="bold">{initials}</text></svg>
          <div className="flex gap-2 mt-3"><button onClick={() => { const svg = svgRef.current; if (!svg) return; const clone = svg.cloneNode(true) as SVGSVGElement; const serializer = new XMLSerializer(); const source = serializer.serializeToString(clone); const blob = new Blob([source], { type: 'image/svg+xml' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'avatar.svg'; a.click(); URL.revokeObjectURL(url); toast.success('SVG downloaded!'); }} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs transition-colors">Download SVG</button><button onClick={() => { clipboardWrite(initials); toast.success('Copied!'); }} className="p-1.5 bg-[var(--bg-surface)] hover:bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors"><Copy size={14} /></button></div>
        </div>
      </div>
    </Section>
  );
}
