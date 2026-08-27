"use client";

import React, { useState } from 'react';
import { FileText, Copy, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function BrailleTranslator() {
  const [text, setText] = useState('');
  const [braille, setBraille] = useState('');

  const brailleMap: Record<string, string> = {
    'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓',
    'i': '⠊', 'j': '⠚', 'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏',
    'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞', 'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭',
    'y': '⠽', 'z': '⠵', ' ': ' ', '0': '⠚', '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙',
    '5': '⠑', '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊'
  };

  const reverseBrailleMap = Object.entries(brailleMap).reduce((acc, [key, val]) => {
    acc[val] = key;
    return acc;
  }, {} as Record<string, string>);

  const translateToBraille = () => {
    if (!text.trim()) {
      setBraille('');
      return;
    }
    const result = text
      .toLowerCase()
      .split('')
      .map(char => brailleMap[char] || char)
      .join('');
    setBraille(result);
  };

  const translateToText = () => {
    if (!braille.trim()) {
      setText('');
      return;
    }
    const result = braille
      .split('')
      .map(char => reverseBrailleMap[char] || char)
      .join('');
    setText(result.toUpperCase());
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-[var(--accent)]" />
          English to Braille Translator
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Convert alphabet text into standard Grade 1 Braille cell symbols or translate Braille back into text.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl space-y-4">
          <span className="text-xs text-[var(--text-muted)] font-bold uppercase block">English Plaintext</span>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && translateToBraille()}
            placeholder="Type standard text here..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-xs resize-none"
          />
          <div className="grid grid-cols-2 gap-4">
            <button onClick={translateToBraille} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              Translate to Braille →
            </button>
            <button onClick={() => { clipboardWrite(text); toast.success('Copied text!'); }} className="border border-zinc-800 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              Copy Text
            </button>
          </div>
        </div>

        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl space-y-4">
          <span className="text-xs text-[var(--text-muted)] font-bold uppercase block">Braille Characters Output</span>
          <textarea
            value={braille}
            onChange={e => setBraille(e.target.value)}
            placeholder="Braille cells output (e.g. ⠓⠑⠇⠇⠕)..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--accent)] font-serif h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-lg resize-none"
          />
          <div className="grid grid-cols-2 gap-4">
            <button onClick={translateToText} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              ← Translate to Text
            </button>
            <button onClick={() => { clipboardWrite(braille); toast.success('Copied Braille!'); }} className="border border-zinc-800 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
              Copy Braille
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}