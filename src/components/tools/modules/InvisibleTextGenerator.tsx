"use client";

import React, { useState } from 'react';
import { Type, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function InvisibleTextGenerator() {
  const [output, setOutput] = useState('\u200B\u200B\u200B\u200B\u200B'); // 5 Zero Width Spaces

  const generateInvisible = (len: number) => {
    // Generates sequence of zero-width spaces (Unicode U+200B)
    const invisibleChars = '\u200B'.repeat(len);
    setOutput(invisibleChars);
    toast.success(`Generated ${len} zero-width characters!`);
  };

  const handleCopy = () => {
    clipboardWrite(output);
    toast.success('Copied invisible text payload to clipboard!');
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <Type className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Zero-Width Invisible Text Generator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        <div className="space-y-4 flex flex-col justify-center">
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block border-b border-[var(--border-subtle)] pb-2">Generate Payload size</span>
          
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => generateInvisible(5)} className="py-2.5 bg-zinc-800 text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-elevated)] font-bold cursor-pointer">5 Bytes</button>
            <button onClick={() => generateInvisible(20)} className="py-2.5 bg-zinc-800 text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-elevated)] font-bold cursor-pointer">20 Bytes</button>
            <button onClick={() => generateInvisible(100)} className="py-2.5 bg-zinc-800 text-[var(--text-muted)] rounded-lg hover:bg-[var(--bg-elevated)] font-bold cursor-pointer">100 Bytes</button>
          </div>
          
          <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
            Zero-width space codes (U+200B) are completely invisible, rendering as blank spacing, but are registered as string inputs to bypass required username or text inputs fields.
          </p>
        </div>

        <div className="bg-[var(--bg-overlay)] rounded-2xl p-6 border border-zinc-800 flex flex-col justify-between min-h-[160px] space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-secondary)] uppercase block">Preview (Blank Space)</span>
            <div className="border border-zinc-800 p-4 rounded-xl font-mono text-center text-[var(--text-muted)] select-all min-h-[50px] bg-black/40">
              {output}
              <span className="text-[9px] text-zinc-600 block mt-1">(Select text block above to verify clipboard content size)</span>
            </div>
          </div>
          <button onClick={handleCopy} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            Copy Invisible Bytes
          </button>
        </div>
      </div>
    </div>
  );
}
