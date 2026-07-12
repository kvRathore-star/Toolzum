"use client";

import React, { useState } from 'react';
import { Type, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function CursiveTextGenerator() {
  const [input, setInput] = useState('Type your text here to make it cursive');
  const [cursive, setCursive] = useState('');

  const cursiveMap: Record<string, string> = {
    'a': '𝓪', 'b': '𝓫', 'c': '𝓬', 'd': '𝓭', 'e': '𝓮', 'f': '𝓯', 'g': '𝓰', 'h': '𝓱',
    'i': '𝓲', 'j': '𝓳', 'k': '𝓴', 'l': '𝓵', 'm': '𝓶', 'n': '𝓷', 'o': '𝓸', 'p': '𝓹',
    'q': '𝓺', 'r': '𝓻', 's': '𝓼', 't': '𝓽', 'u': '𝓾', 'v': '𝓿', 'w': '𝔀', 'x': '𝔁',
    'y': '𝔂', 'z': '𝔃',
    'A': '𝓐', 'B': '𝓑', 'C': '𝓒', 'D': '𝓓', 'E': '𝓔', 'F': '𝓕', 'G': '𝓖', 'H': '𝓗',
    'I': '𝓘', 'J': '𝓵', 'K': '𝓚', 'L': '𝓛', 'M': '𝓜', 'N': '𝓝', 'O': '𝓞', 'P': '𝓟',
    'Q': '𝓠', 'R': '𝓡', 'S': '𝓢', 'T': '𝓣', 'U': '𝓤', 'V': '𝓥', 'W': '𝓦', 'X': '𝓧',
    'Y': '𝓨', 'Z': '𝓩'
  };

  const generateCursive = () => {
    if (!input.trim()) {
      setCursive('');
      return;
    }
    const result = input
      .split('')
      .map(char => cursiveMap[char] || char)
      .join('');
    setCursive(result);
  };

  React.useEffect(() => {
    generateCursive();
  }, [input]);

  const handleCopy = () => {
    if (!cursive) return;
    clipboardWrite(cursive);
    toast.success('Copied cursive text!');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <Type className="w-5 h-5 text-indigo-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Unicode Cursive Text Generator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        <div className="space-y-2">
          <span className="text-[10px] text-zinc-400 font-bold uppercase block">English Plaintext</span>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type text to convert..."
            className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white h-40 outline-none resize-none"
          />
        </div>

        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] text-zinc-400 font-bold uppercase block">Cursive Unicode Output</span>
            <textarea
              value={cursive}
              readOnly
              placeholder="Cursive text will appear here..."
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-indigo-400 font-serif text-lg h-40 outline-none resize-none"
            />
          </div>
          <button onClick={handleCopy} className="w-full bg-[var(--accent)] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            Copy Cursive Text
          </button>
        </div>
      </div>
    </div>
  );
}
