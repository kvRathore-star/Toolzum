"use client";

import React, { useState, useEffect } from 'react';
import { Type, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

type Mode = 'text-to-binary' | 'binary-to-text';

export function TextBinaryTool({ defaultMode = 'text-to-binary' }: { defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  useEffect(() => { setMode(defaultMode); setInput(''); setOutput(''); }, [defaultMode]);

  const isTextToBin = mode === 'text-to-binary';

  const convert = () => {
    const val = input.trim();
    if (!val) { setOutput(''); return; }
    try {
      if (isTextToBin) {
        setOutput(val.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' '));
      } else {
        const clean = val.replace(/\s+/g, '');
        if (!/^[01]+$/.test(clean)) { toast.error('Invalid binary — only 0s and 1s allowed.'); return; }
        if (clean.length % 8 !== 0) { toast.error('Binary must be in full 8-bit bytes.'); return; }
        let out = '';
        for (let i = 0; i < clean.length; i += 8) out += String.fromCharCode(parseInt(clean.slice(i, i + 8), 2));
        setOutput(out);
      }
    } catch { toast.error('Conversion failed'); }
  };

  const otherMode: Mode = isTextToBin ? 'binary-to-text' : 'text-to-binary';
  const otherLabel = isTextToBin ? 'Binary to Text' : 'Text to Binary';

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Type className="w-5 h-5 text-[var(--accent)]" />
          {isTextToBin ? 'Text to Binary Converter' : 'Binary to Text Translator'}
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">
          {isTextToBin
            ? 'Convert standard ASCII or UTF-8 text characters into binary 8-bit block code representation.'
            : 'Translate 8-bit binary stream blocks back into readable standard text code representations.'}
        </p>
        <button onClick={() => { setMode(otherMode); setInput(''); setOutput(''); }}
          className="mt-2 text-xs text-[var(--text-secondary)] hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
          Need {otherLabel.toLowerCase().includes('binary') ? 'binary to text' : 'text to binary'} instead? <span className="font-semibold">Switch to {otherLabel} →</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl space-y-4">
          <span className="text-xs text-[var(--text-muted)] font-bold uppercase block">
            {isTextToBin ? 'Text Input' : 'Binary Input'}
          </span>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={isTextToBin ? 'Type standard text here...' : 'Enter binary blocks (e.g. 01001000 01000101...)...'}
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-60 outline-none text-xs resize-none"
          />
          <button onClick={convert} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Convert to {isTextToBin ? 'Binary' : 'Text'}
          </button>
        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-xs text-[var(--text-muted)] font-bold uppercase">
                {isTextToBin ? 'Binary Output' : 'Text Output'}
              </span>
              {output && (
                <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="p-1.5 text-[var(--text-secondary)] hover:text-white border border-zinc-800 rounded-lg" aria-label="Copy"><Copy className="w-4 h-4" /></button>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder={isTextToBin ? 'Binary output code bytes will appear here...' : 'Translated plain text will appear here...'}
              className="w-full flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-emerald-400 font-mono h-60 outline-none text-xs resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TextToBinary() { return <TextBinaryTool defaultMode="text-to-binary" />; }
