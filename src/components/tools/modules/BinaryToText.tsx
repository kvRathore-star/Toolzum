"use client";

import React, { useState } from 'react';
import { Type, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function BinaryToText() {
  const [binary, setBinary] = useState('');
  const [text, setText] = useState('');

  const convertToText = () => {
    if (!binary.trim()) {
      setText('');
      return;
    }

    try {
      // Remove spaces or delimiters
      const cleanBinary = binary.replace(/\s+/g, '');
      if (!/^[01]+$/.test(cleanBinary)) {
        toast.error('Invalid binary format. Input must contain only 0s and 1s.');
        return;
      }

      if (cleanBinary.length % 8 !== 0) {
        toast.error('Binary digits must be in full 8-bit multiples.');
        return;
      }

      let output = '';
      for (let i = 0; i < cleanBinary.length; i += 8) {
        const byte = cleanBinary.slice(i, i + 8);
        output += String.fromCharCode(parseInt(byte, 2));
      }
      
      setText(output);
      toast.success('Successfully translated binary code!');
    } catch (err) {
      toast.error('Failed to parse binary representation');
    }
  };

  const handleCopy = () => {
    if (!text) return;
    clipboardWrite(text);
    toast.success('Copied text!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Type className="w-5 h-5 text-indigo-500" />
          Binary to Text Translator
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Translate 8-bit binary stream blocks back into readable standard text code representations.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl space-y-4">
          <span className="text-xs text-zinc-400 font-bold uppercase block">Binary Input</span>
          <textarea
            value={binary}
            onChange={e => setBinary(e.target.value)}
            placeholder="Enter binary blocks (e.g. 01001000 01000101 01001100 01001100 01001111)..."
            className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white font-mono h-60 outline-none text-xs resize-none"
          />
          <button onClick={convertToText} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Convert to Text
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-bold uppercase">Text Output</span>
              {text && (
                <button onClick={handleCopy} className="p-1.5 text-zinc-500 hover:text-white border border-zinc-800 rounded-lg" aria-label="Copy"><Copy className="w-4 h-4" /></button>
              )}
            </div>
            <textarea
              value={text}
              readOnly
              placeholder="Translated plain text will appear here..."
              className="w-full flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white h-60 outline-none text-xs resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}