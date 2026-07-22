"use client";

import React, { useState } from 'react';
import { Type, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function ReverseTextGenerator() {
  const [input, setInput] = useState('Mirror and invert this text string');
  const [reversed, setReversed] = useState('');
  const [upsideDown, setUpsideDown] = useState(false);

  const flipMap: Record<string, string> = {
    'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ',
    'i': 'ı', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd',
    'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x',
    'y': 'ʎ', 'z': 'z',
    'A': '∀', 'B': '𐐒', 'C': 'Ɔ', 'D': '◖', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁', 'H': 'H',
    'I': 'I', 'J': 'ſ', 'K': 'ʞ', 'L': '˥', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ',
    'Q': 'Ό', 'R': 'ᴚ', 'S': 'S', 'T': '⊥', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X',
    'Y': '⅄', 'Z': 'Z'
  };

  const processText = () => {
    let result = input.split('').reverse().join('');
    if (upsideDown) {
      result = result
        .split('')
        .map(char => flipMap[char] || char)
        .join('');
    }
    setReversed(result);
  };

  React.useEffect(() => {
    processText();
  }, [input, upsideDown]);

  const handleCopy = () => {
    if (!reversed) return;
    clipboardWrite(reversed);
    toast.success('Copied processed text!');
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <Type className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Reverse & Flip Text Generator</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        <div className="space-y-4">
          <div className="space-y-1">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Plaintext input</span>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type string to flip..."
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-40 outline-none resize-none"
            />
          </div>

          <label className="flex items-center gap-1.5 cursor-pointer text-[var(--text-muted)] font-semibold select-none">
            <input type="checkbox" checked={upsideDown} onChange={e => setUpsideDown(e.target.checked)} className="rounded text-[var(--accent)]" />
            Flip Text Upside-Down (Unicode inversion)
          </label>
        </div>

        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Output result</span>
            <textarea
              value={reversed}
              readOnly
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--accent)] font-mono text-sm h-40 outline-none resize-none"
            />
          </div>
          <button onClick={handleCopy} className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            Copy Reversed Text
          </button>
        </div>
      </div>
    </div>
  );
}
