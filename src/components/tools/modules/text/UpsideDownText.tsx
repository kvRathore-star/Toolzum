"use client";

import React, { useState, useMemo } from 'react';
import { Type, Copy, RotateCcw, ArrowUpDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const FLIP_MAP: Record<string, string> = {
  'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ı', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
  'A': '∀', 'B': 'B', 'C': 'Ɔ', 'D': 'D', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁', 'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'K', 'L': '⅂', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Ό', 'R': 'R', 'S': 'S', 'T': '┴', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
  '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
  '.': '˙', ',': ',', '?': '¿', '!': '¡', '"': '„', "'": ',', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', '_': '‾', ';': '؛', ':': '꞉', '@': '⸙', '#': '⸘', '$': '$', '%': '%', '+': '+', '-': '-', '*': '*', '/': '/', '=': '='
};

function flipText(text: string, mode: 'flip' | 'mirror'): string {
  if (mode === 'mirror') {
    return [...text].map(c => FLIP_MAP[c] || c).join('');
  }
  return [...text].map(c => FLIP_MAP[c] || c).reverse().join('');
}

export default function UpsideDownText() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'flip' | 'mirror'>('flip');

  const output = useMemo(() => flipText(text, mode), [text, mode]);

  const handleCopy = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied to clipboard!');
  };

  const handleClear = () => setText('');

  const [originalChars, flippedChars] = useMemo(() => {
    if (!text) return [[], []];
    const orig = text.split('');
    const flipp = mode === 'flip' ? [...text].map(c => FLIP_MAP[c] || c).reverse() : text.split('').map(c => FLIP_MAP[c] || c);
    return [orig, flipp];
  }, [text, mode]);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
          <RotateCcw className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Upside Down Text Generator</h3>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Your Text</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type or paste text to flip upside down..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-28 outline-none resize-none text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Flip Mode</label>
          <div className="flex gap-2">
            {[
              { id: 'flip', label: 'Flip Upside Down', desc: 'Reverses + flips each character (abc → oʃǝɥʎ)', icon: <RotateCcw className="w-4 h-4" /> },
              { id: 'mirror', label: 'Mirror Only', desc: 'Flips each character in place without reversal (abc → ɐqɔ)', icon: <ArrowUpDown className="w-4 h-4" /> },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as 'flip' | 'mirror')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                  mode === m.id
                    ? 'bg-[var(--accent-ink)] text-white shadow-md'
                    : 'bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  {m.icon}
                  <span>{m.label}</span>
                </div>
                <div className="text-xs opacity-70 mt-0.5">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Upside Down Text</label>
            {output && <span className="text-xs text-[var(--text-muted)]">{output.length} chars</span>}
          </div>
          <div className="relative">
            <textarea
              value={output}
              readOnly
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-28 outline-none resize-none text-sm break-all"
            />
            {output && (
              <button
                onClick={handleCopy}
                className="absolute top-2 right-2 px-3 py-1 text-xs bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white rounded-lg transition-colors"
              >
                Copy
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-[var(--border-subtle)]">
          <button onClick={handleClear} className="flex-1 bg-[var(--bg-overlay)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] font-bold py-2.5 rounded-xl transition-colors">
            Clear
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-[var(--text-secondary)]">
        <h4 className="font-bold text-[var(--text-primary)] mb-2">Character Mapping Preview</h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-1 text-xs max-h-40 overflow-auto">
          {Object.entries(FLIP_MAP).slice(0, 60).map(([orig, flipped]) => (
            <div key={orig} className="flex items-center justify-center p-1 bg-[var(--bg-elevated)] rounded">
              <span className="text-[var(--text-primary)]">{orig}</span>
              <span className="mx-1 text-[var(--accent)]">→</span>
              <span className="text-[var(--accent)] font-mono">{flipped}</span>
            </div>
          ))}
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          Flip Upside Down = reverse + flip each character. Mirror = flip each character in place.
          All processing is 100% client-side. No data leaves your browser.
        </p>
      </div>
    </div>
  );
}