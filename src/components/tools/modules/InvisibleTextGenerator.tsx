"use client";

import React, { useState } from 'react';
import { Type, Copy, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function InvisibleTextGenerator() {
  const [output, setOutput] = useState('\u200B'.repeat(5));
  const [customLen, setCustomLen] = useState('');

  const generateInvisible = (len: number) => {
    const invisibleChars = '\u200B'.repeat(len);
    setOutput(invisibleChars);
    toast.success(`Generated ${len} zero-width characters!`);
  };

  const handleCopy = () => {
    clipboardWrite(output);
    toast.success('Copied invisible text payload to clipboard!');
  };

  const handleDownload = () => {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invisible-text.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded!');
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <Type className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Zero-Width Invisible Text Generator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        <div className="space-y-4 flex flex-col justify-center">
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block border-b border-[var(--border-subtle)] pb-2">Generate Payload</span>

          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => generateInvisible(5)} className="py-2.5 bg-zinc-800 text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-elevated)] font-bold cursor-pointer">5 Bytes</button>
            <button onClick={() => generateInvisible(20)} className="py-2.5 bg-zinc-800 text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-elevated)] font-bold cursor-pointer">20 Bytes</button>
            <button onClick={() => generateInvisible(100)} className="py-2.5 bg-zinc-800 text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-elevated)] font-bold cursor-pointer">100 Bytes</button>
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              min={1}
              max={10000}
              value={customLen}
              onChange={e => setCustomLen(e.target.value)}
              placeholder="Custom count"
              className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-[var(--text-primary)] outline-none text-xs"
            />
            <button
              onClick={() => { const n = parseInt(customLen); if (n > 0 && n <= 10000) generateInvisible(n); else toast.error('Enter 1-10000'); }}
              className="px-3 py-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-lg font-bold cursor-pointer"
            >
              Generate
            </button>
          </div>

          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
            Zero-width space codes (U+200B) are completely invisible, rendering as blank spacing, but are registered as string inputs to bypass required username or text inputs fields.
          </p>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-zinc-800 flex flex-col justify-between min-h-[200px] space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase block">Preview (Blank Space)</span>
            <div className="border border-zinc-800 p-4 rounded-xl font-mono text-center text-[var(--text-muted)] select-all min-h-[50px] bg-black/40">
              {output}
              <span className="text-[9px] text-zinc-600 block mt-1">({output.length} chars — select text above to verify)</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="flex-1 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button onClick={handleDownload} className="flex-1 bg-[var(--bg-overlay)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 border border-[var(--border-subtle)] cursor-pointer">
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
