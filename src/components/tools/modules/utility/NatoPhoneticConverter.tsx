"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeftRight, Copy } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

const NATO_MAP: Record<string, string> = {
  'A':'Alpha','B':'Bravo','C':'Charlie','D':'Delta','E':'Echo','F':'Foxtrot','G':'Golf',
  'H':'Hotel','I':'India','J':'Juliett','K':'Kilo','L':'Lima','M':'Mike','N':'November',
  'O':'Oscar','P':'Papa','Q':'Quebec','R':'Romeo','S':'Sierra','T':'Tango','U':'Uniform',
  'V':'Victor','W':'Whiskey','X':'X-ray','Y':'Yankee','Z':'Zulu',
  '0':'Zero','1':'One','2':'Two','3':'Three','4':'Four','5':'Five','6':'Six','7':'Seven','8':'Eight','9':'Nine',
};

const NATO_REV: Record<string, string> = {};
for (const [k, v] of Object.entries(NATO_MAP)) {
  NATO_REV[v.toUpperCase()] = k;
}

function toNato(text: string): string {
  return text.toUpperCase().split('').map(c => NATO_MAP[c] || c).join(' ');
}

function fromNato(text: string): string {
  return text.split(/\s+/).map(w => {
    const clean = w.toUpperCase().replace(/[^A-Z-]/g, '');
    return NATO_REV[clean] || w;
  }).join('');
}

export default function NatoPhoneticConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'to' | 'from'>('to');

  const output = input ? (mode === 'to' ? toNato(input) : fromNato(input)) : '';

  const copy = (txt: string) => {
    clipboardWrite(txt);
    toast.success('Copied to clipboard!');
  };

  const toggleMode = () => setMode(m => m === 'to' ? 'from' : 'from');

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
          <button
            onClick={() => setMode('to')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'to'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Text → NATO
          </button>
          <button
            onClick={() => setMode('from')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              mode === 'from'
                ? 'bg-[var(--accent)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            NATO → Text
          </button>
        </div>
        <button
          onClick={toggleMode}
          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          Swap
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <textarea aria-label="NATO conversion input"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={mode === 'to' ? 'Type text here...' : 'Paste NATO words here...'}
          className="w-full h-[180px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono"
        />
        <div className="relative">
          <textarea
            value={output}
            readOnly aria-label="Result"
            placeholder="Result will appear here..."
            className="w-full h-[180px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono"
          />
          {output && (
            <button
              onClick={() => copy(output)}
              className="absolute top-3 right-3 flex items-center gap-1 text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-[var(--bg-surface)] px-2.5 py-1.5 rounded-lg border border-[var(--border-subtle)] hover:shadow-sm transition-all"
            >
              <Copy className="w-3 h-3" />
              Copy
            </button>
          )}
        </div>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
        <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">NATO Phonetic Alphabet Reference</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs">
          {Object.entries(NATO_MAP).map(([letter, word]) => (
            <div
              key={letter}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--bg-overlay)]/50"
            >
              <span className="font-bold text-blue-600 dark:text-blue-400 w-4 text-center">{letter}</span>
              <span className="text-[var(--text-secondary)] truncate">{word}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}