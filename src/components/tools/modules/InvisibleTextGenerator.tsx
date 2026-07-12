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
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <Type className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Zero-Width Invisible Text Generator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        <div className="space-y-4 flex flex-col justify-center">
          <span className="text-[10px] text-zinc-400 font-bold uppercase block border-b border-[var(--border-subtle)] pb-2">Generate Payload size</span>
          
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => generateInvisible(5)} className="py-2.5 bg-zinc-800 text-[var(--text-muted)] rounded-lg hover:bg-zinc-700 font-bold cursor-pointer">5 Bytes</button>
            <button onClick={() => generateInvisible(20)} className="py-2.5 bg-zinc-800 text-[var(--text-muted)] rounded-lg hover:bg-zinc-700 font-bold cursor-pointer">20 Bytes</button>
            <button onClick={() => generateInvisible(100)} className="py-2.5 bg-zinc-800 text-[var(--text-muted)] rounded-lg hover:bg-zinc-700 font-bold cursor-pointer">100 Bytes</button>
          </div>
          
          <p className="text-[10px] text-zinc-500 leading-relaxed">
            Zero-width space codes (U+200B) are completely invisible, rendering as blank spacing, but are registered as string inputs to bypass required username or text inputs fields.
          </p>
        </div>

        <div className="bg-zinc-50 dark:bg-black/30 rounded-2xl p-6 border border-zinc-800 flex flex-col justify-between min-h-[160px] space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase block">Preview (Blank Space)</span>
            <div className="border border-zinc-800 p-4 rounded-xl font-mono text-center text-zinc-400 select-all min-h-[50px] bg-black/40">
              {output}
              <span className="text-[9px] text-zinc-600 block mt-1">(Select text block above to verify clipboard content size)</span>
            </div>
          </div>
          <button onClick={handleCopy} className="w-full bg-[var(--accent)] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            Copy Invisible Bytes
          </button>
        </div>
      </div>
    </div>
  );
}
