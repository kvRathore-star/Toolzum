"use client";
import React, { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import { CalculatorShell } from '../shared/CalculatorShell';

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

const labelCls = "text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider";

export default function NatoPhoneticConverter() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'to' | 'from'>('to');
  const [output, setOutput] = useState('');

  const convert = () => {
    if (!input.trim()) {
      setOutput('');
      return;
    }
    setOutput(mode === 'to' ? toNato(input) : fromNato(input));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-in fade-in duration-500">
      <CalculatorShell
        title="NATO Phonetic Converter"
        icon={<ArrowLeftRight className="w-5 h-5" />}
        result={output}
        onCalculate={convert}
        calculateLabel="Convert"
        resultLabel="Conversion Result"
        accent="sky"
        downloadData={output}
        downloadFilename="nato-conversion.txt"
        presets={[
          { label: 'Text → NATO', apply: () => { setMode('to'); setInput(''); setOutput(''); } },
          { label: 'NATO → Text', apply: () => { setMode('from'); setInput(''); setOutput(''); } },
        ]}
        customResult={
          output ? (
            <div className="relative">
              <textarea
                value={output}
                readOnly
                placeholder="Result will appear here..."
                className="w-full h-[180px] bg-[var(--bg-overlay)]/50 border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono"
              />
            </div>
          ) : undefined
        }
      >
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Mode</label>
            <div className="flex bg-[var(--bg-surface)] rounded-xl p-1 mt-1.5">
              <button
                onClick={() => setMode('to')}
                className={`flex-1 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'to'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                Text → NATO
              </button>
              <button
                onClick={() => setMode('from')}
                className={`flex-1 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'from'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                NATO → Text
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>Input</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={mode === 'to' ? 'Type text here...' : 'Paste NATO words here...'}
              className="w-full h-[180px] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono mt-1.5"
            />
          </div>
        </div>
      </CalculatorShell>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5">
        <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">NATO Phonetic Alphabet Reference</h3>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 text-xs">
          {Object.entries(NATO_MAP).map(([letter, word]) => (
            <div
              key={letter}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-[var(--bg-overlay)]/50"
            >
              <span className="font-bold text-sky-600 dark:text-sky-400 w-4 text-center">{letter}</span>
              <span className="text-[var(--text-secondary)] truncate">{word}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
