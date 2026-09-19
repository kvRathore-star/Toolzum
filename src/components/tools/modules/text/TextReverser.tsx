"use client";

import React, { useState, useMemo } from 'react';
import { Type, Copy, ArrowUpDown, RotateCcw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function TextReverser() {
  const [text, setText] = useState('');
  const [mode, setMode] = useState<'reverse' | 'words' | 'lines' | 'flip'>('reverse');

  const output = useMemo(() => {
    if (!text) return '';
    
    switch (mode) {
      case 'reverse':
        return [...text].reverse().join('');
      case 'words':
        return text.split(/\s+/).filter(Boolean).reverse().join(' ');
      case 'lines':
        return text.split('\n').filter(Boolean).reverse().join('\n');
      case 'flip':
        return text.split('').map(c => {
          const flipMap: Record<string, string> = {
            'a': 'ɐ', 'b': 'q', 'c': 'ɔ', 'd': 'p', 'e': 'ǝ', 'f': 'ɟ', 'g': 'ƃ', 'h': 'ɥ', 'i': 'ı', 'j': 'ɾ', 'k': 'ʞ', 'l': 'l', 'm': 'ɯ', 'n': 'u', 'o': 'o', 'p': 'd', 'q': 'b', 'r': 'ɹ', 's': 's', 't': 'ʇ', 'u': 'n', 'v': 'ʌ', 'w': 'ʍ', 'x': 'x', 'y': 'ʎ', 'z': 'z',
            'A': '∀', 'B': 'B', 'C': 'Ɔ', 'D': 'D', 'E': 'Ǝ', 'F': 'Ⅎ', 'G': '⅁', 'H': 'H', 'I': 'I', 'J': 'ſ', 'K': 'K', 'L': '⅂', 'M': 'W', 'N': 'N', 'O': 'O', 'P': 'Ԁ', 'Q': 'Ό', 'R': 'R', 'S': 'S', 'T': '┴', 'U': '∩', 'V': 'Λ', 'W': 'M', 'X': 'X', 'Y': '⅄', 'Z': 'Z',
            '0': '0', '1': 'Ɩ', '2': 'ᄅ', '3': 'Ɛ', '4': 'ㄣ', '5': 'ϛ', '6': '9', '7': 'ㄥ', '8': '8', '9': '6',
            '.': '˙', ',': ',', '?': '¿', '!': '¡', '"': '„', "'": ',', '(': ')', ')': '(', '[': ']', ']': '[', '{': '}', '}': '{', '<': '>', '>': '<', '&': '⅋', '_': '‾', ';': '؛', ':': '꞉'
          };
          return flipMap[c] || c;
        }).reverse().join('');
      default:
        return text;
    }
  }, [text, mode]);

  const handleCopy = () => {
    if (!output) return;
    clipboardWrite(output).then(ok => { if (ok) toast.success('Copied to clipboard!'); else toast.error('Copy blocked by the browser — select the text manually.'); });
  };

  const handleClear = () => {
    setText('');
  };

  const modes = [
    { id: 'reverse', label: 'Reverse Characters', desc: 'abc → cba', icon: <RotateCcw className="w-4 h-4" /> },
    { id: 'words', label: 'Reverse Words', desc: 'hello world → world hello', icon: <ArrowUpDown className="w-4 h-4" /> },
    { id: 'lines', label: 'Reverse Lines', desc: 'line1\nline2 → line2\nline1', icon: <Type className="w-4 h-4" /> },
    { id: 'flip', label: 'Flip Upside Down', desc: 'hello → oʃǝɥʎ', icon: <RotateCcw className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
          <Type className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Text Reverser</h3>
        </div>

        <div className="space-y-1">
          <label htmlFor="lbl-textreverser-your-text" className="text-xs text-[var(--text-muted)] font-bold uppercase">Your Text</label>
          <textarea id="lbl-textreverser-your-text" aria-label="Your Text"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type or paste text to reverse..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Mode</label>
          <div className="flex flex-wrap gap-2">
            {modes.map(m => (
              <button
                key={m.id}
                onClick={() => setMode(m.id as 'reverse' | 'words' | 'lines' | 'flip')}
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
            <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Output</label>
            {output && <span className="text-xs text-[var(--text-muted)]">{output.length} chars</span>}
          </div>
          <div className="relative">
            <textarea aria-label="Reversed text"
              value={output}
              readOnly
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none text-sm break-all"
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
        <h4 className="font-bold text-[var(--text-primary)] mb-2">How it works</h4>
        <ul className="space-y-1 list-disc list-inside">
          <li><strong>Reverse Characters:</strong> Flips the entire string character by character</li>
          <li><strong>Reverse Words:</strong> Keeps words intact but reverses their order</li>
          <li><strong>Reverse Lines:</strong> Reverses the order of lines, preserving line content</li>
          <li><strong>Flip Upside Down:</strong> Uses Unicode flipped characters + reversal for a true flip effect</li>
        </ul>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          All processing happens in your browser. No data is sent to any server.
        </p>
      </div>
    </div>
  );
}