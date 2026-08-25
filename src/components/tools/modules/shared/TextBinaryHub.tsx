"use client";

import React, { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { getErrorMessage } from '@/utils/error';

export const MODES = ["text-to-binary", "binary-to-text"] as const;
type Mode = (typeof MODES)[number];

const toBinary = (s: string) =>
  Array.from(s).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');

const fromBinary = (s: string) =>
  s.split(/[\s,]+/).filter(Boolean).map(b => {
    if (!/^[01]+$/.test(b)) throw new Error(`Invalid binary group: "${b}"`);
    return String.fromCharCode(parseInt(b, 2));
  }).join('');

const MODE_CONFIG: Record<Mode, {
  name: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  outputLabel: string;
  convert: (i: string) => string;
}> = {
  "text-to-binary": {
    name: "Text → Binary",
    description: "Convert plain text to its binary (base-2) representation, byte by byte, with visible byte-boundary separators.",
    inputLabel: "Text Input",
    inputPlaceholder: "Hello world",
    outputLabel: "Binary Output",
    convert: toBinary,
  },
  "binary-to-text": {
    name: "Binary → Text",
    description: "Decode space- or comma-separated binary strings back into readable text.",
    inputLabel: "Binary Input",
    inputPlaceholder: "01001000 01100101 01101100 01101100 01101111",
    outputLabel: "Decoded Text",
    convert: fromBinary,
  },
};

export default function TextBinaryHub({ slug: defaultSlug }: { slug: string; description?: string }) {
  const [mode, setMode] = useState<Mode>(MODES.includes(defaultSlug as Mode) ? defaultSlug as Mode : "text-to-binary");
  const [input, setInput] = useState('');
  const [copied, setCopied] = useState(false);
  const config = MODE_CONFIG[mode];

  const presets = [
    { label: 'Hello World', apply: () => { setInput('Hello World'); } },
    { label: 'ABC', apply: () => { setInput('ABC'); } },
    { label: 'Sample Binary', apply: () => { setInput('01001000 01100101 01101100 01101100 01101111'); } },
  ];

  const output = useMemo(() => {
    if (!input.trim()) return '';
    try { return config.convert(input); }
    catch (e: unknown) { return `Error: ${getErrorMessage(e)}`; }
  }, [input, config]);

  const handleCopy = () => {
    clipboardWrite(output); setCopied(true); toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = mode === 'text-to-binary' ? 'binary.txt' : 'text.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>
      <div className="flex bg-white dark:bg-black p-1 rounded-xl border border-[var(--border-subtle)] w-fit">
        {MODES.map(s => (
          <button key={s} onClick={() => { setMode(s); setInput(''); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === s ? 'bg-blue-600 text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
            }`}>
            {MODE_CONFIG[s].name}
          </button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">{config.name}</h2>
        <p className="text-xs text-[var(--text-secondary)]">{config.description}</p>
        <div className="space-y-1">
          <span className="text-xs text-[var(--text-secondary)] font-medium">{config.inputLabel}</span>
          <textarea rows={6} value={input} onChange={e => setInput(e.target.value)} placeholder={config.inputPlaceholder}
            className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs font-mono text-[var(--text-primary)] outline-none focus:border-[var(--accent)] resize-y min-h-[80px]" />
        </div>
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--text-secondary)]">{config.outputLabel}</span>
              <div className="flex gap-2">
                <button onClick={handleCopy} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleDownload} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">
                  Download
                </button>
              </div>
            </div>
            <pre className="text-xs font-mono bg-[var(--bg-surface)] rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap max-h-64 overflow-y-auto">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
