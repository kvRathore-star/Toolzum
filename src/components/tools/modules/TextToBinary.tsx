"use client";

import React, { useState } from 'react';
import { Type, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function TextToBinary() {
  const [text, setText] = useState('');
  const [binary, setBinary] = useState('');

  const convertToBinary = () => {
    if (!text) {
      setBinary('');
      return;
    }

    try {
      const output = text
        .split('')
        .map(char => {
          const bin = char.charCodeAt(0).toString(2);
          return '0'.repeat(8 - bin.length) + bin;
        })
        .join(' ');
      
      setBinary(output);
    } catch (err) {
      toast.error('Failed to convert text');
    }
  };

  const handleCopy = () => {
    if (!binary) return;
    clipboardWrite(binary);
    toast.success('Copied binary string!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Type className="w-5 h-5 text-indigo-500" />
          Text to Binary Converter
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Convert standard ASCII or UTF-8 text characters into binary 8-bit block code representation.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl space-y-4">
          <span className="text-xs text-zinc-400 font-bold uppercase block">Text Input</span>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type standard text here..."
            className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white h-60 outline-none text-xs resize-none"
          />
          <button onClick={convertToBinary} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <RefreshCw className="w-4 h-4" /> Convert to Binary
          </button>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-xs text-zinc-400 font-bold uppercase">Binary Output</span>
              {binary && (
                <button onClick={handleCopy} className="p-1.5 text-zinc-500 hover:text-white border border-zinc-800 rounded-lg" aria-label="Copy"><Copy className="w-4 h-4" /></button>
              )}
            </div>
            <textarea
              value={binary}
              readOnly
              placeholder="Binary output code bytes will appear here..."
              className="w-full flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-emerald-400 font-mono h-60 outline-none text-xs resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}