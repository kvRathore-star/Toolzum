"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Mode = 'hex-to-ascii' | 'ascii-to-hex';

export default function HexAsciiConverter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<Mode>('ascii-to-hex');
  const [delimiter, setDelimiter] = useState(' ');

  const convert = (val: string, m: Mode) => {
    if (!val.trim()) { setOutput(''); return; }
    try {
      if (m === 'ascii-to-hex') {
        setOutput(Array.from(val).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(delimiter));
      } else {
        const clean = val.replace(/\s+/g, '');
        if (!/^[0-9a-fA-F]*$/.test(clean)) { setOutput(''); toast.error('Invalid hex input'); return; }
        setOutput(clean.match(/.{1,2}/g)?.map(b => String.fromCharCode(parseInt(b, 16))).join('') || '');
      }
    } catch { setOutput(''); toast.error('Conversion failed'); }
  };

  const handleInput = (val: string) => { setInput(val); convert(val, mode); };

  const swap = () => {
    const newMode = mode === 'hex-to-ascii' ? 'ascii-to-hex' : 'hex-to-ascii';
    setMode(newMode);
    if (output) { setInput(output); convert(output, newMode); }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
          <button onClick={() => { setMode('ascii-to-hex'); convert(input, 'ascii-to-hex'); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'ascii-to-hex' ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>ASCII → Hex</button>
          <button onClick={() => { setMode('hex-to-ascii'); convert(input, 'hex-to-ascii'); }} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${mode === 'hex-to-ascii' ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>Hex → ASCII</button>
        </div>
        <button onClick={swap} className="text-xs text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">⇄ Swap</button>
        {mode === 'ascii-to-hex' && (
          <select value={delimiter} onChange={e => { setDelimiter(e.target.value); if (input) convert(input, mode); }} className="text-xs bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 outline-none">
            <option value=" ">Space</option>
            <option value="">None</option>
            <option value=",">Comma</option>
            <option value=":">Colon</option>
          </select>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea value={input} onChange={e => handleInput(e.target.value)} placeholder={mode === 'ascii-to-hex' ? 'Type ASCII text...' : 'Type hex bytes (e.g. 48 65 6C 6C 6F)...'} className="w-full h-[200px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono focus:border-[var(--accent)] transition-colors" />
        <div className="relative">
          <textarea value={output} readOnly placeholder="Result..." className="w-full h-[200px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none resize-none font-mono" />
          {output && <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="absolute top-3 right-3 text-[10px] text-[var(--text-muted)] hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-[var(--bg-surface)] px-2 py-1 rounded border border-[var(--border-subtle)] transition-colors">Copy</button>}
        </div>
      </div>
    </div>
  );
}
