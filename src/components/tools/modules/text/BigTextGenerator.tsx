"use client";

import React, { useMemo, useState } from 'react';
import { Heading, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const ASCII_ALPHABET: Record<string, string[]> = {
  'A': ['  ██  ', ' ████ ', '██  ██', '██████', '██  ██', '██  ██', '██  ██'],
  'B': ['█████ ', '██  ██', '█████ ', '██  ██', '██  ██', '█████ ', '█████ '],
  'C': [' █████', '██    ', '██    ', '██    ', '██    ', '██    ', ' █████'],
  'D': ['█████ ', '██  ██', '██  ██', '██  ██', '██  ██', '██  ██', '█████ '],
  'E': ['██████', '██    ', '█████ ', '██    ', '██    ', '██    ', '██████'],
  'F': ['██████', '██    ', '█████ ', '██    ', '██    ', '██    ', '██    '],
  'G': [' █████', '██    ', '██    ', '██ ███', '██  ██', '██  ██', ' █████'],
  'H': ['██  ██', '██  ██', '██  ██', '██████', '██  ██', '██  ██', '██  ██'],
  'I': ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  ', '  ██  ', '██████'],
  'J': ['██████', '   ██ ', '   ██ ', '   ██ ', '   ██ ', '██ ██ ', ' ███  '],
  'K': ['██  ██', '██ ██ ', '████  ', '███   ', '████  ', '██ ██ ', '██  ██'],
  'L': ['██    ', '██    ', '██    ', '██    ', '██    ', '██    ', '██████'],
  'M': ['██   ██', '████ ██', '███████', '██ █ ██', '██   ██', '██   ██', '██   ██'],
  'N': ['██   ██', '████ ██', '███████', '██ ████', '██  ███', '██   ██', '██   ██'],
  'O': [' █████ ', '██   ██', '██   ██', '██   ██', '██   ██', '██   ██', ' █████ '],
  'P': ['██████ ', '██   ██', '██   ██', '██████ ', '██     ', '██     ', '██     '],
  'Q': [' █████ ', '██   ██', '██   ██', '██   ██', '██ ████', '██  ██ ', ' ██████'],
  'R': ['██████ ', '██   ██', '██   ██', '██████ ', '██ ██  ', '██  ██ ', '██   ██'],
  'S': [' ██████', '██     ', '██     ', ' █████ ', '     ██', '     ██', '██████ '],
  'T': ['██████', '  ██  ', '  ██  ', '  ██  ', '  ██  ', '  ██  ', '  ██  '],
  'U': ['██   ██', '██   ██', '██   ██', '██   ██', '██   ██', '██   ██', ' █████ '],
  'V': ['██   ██', '██   ██', '██   ██', '██   ██', ' ██ ██ ', ' ██ ██ ', '  ███  '],
  'W': ['██   ██', '██   ██', '██   ██', '██ █ ██', '███████', '████ ██', '██   ██'],
  'X': ['██   ██', '██   ██', ' ██ ██ ', '  ███  ', ' ██ ██ ', '██   ██', '██   ██'],
  'Y': ['██   ██', '██   ██', ' ██ ██ ', '  ███  ', '   ██  ', '   ██  ', '   ██  '],
  'Z': ['██████', '    ██', '   ██ ', '  ██  ', ' ██   ', '██    ', '██████'],
  ' ': ['      ', '      ', '      ', '      ', '      ', '      ', '      '],
  '0': [' █████ ', '██   ██', '██ ████', '████ ██', '██   ██', '██   ██', ' █████ '],
  '1': ['   ██  ', '  ███  ', '   ██  ', '   ██  ', '   ██  ', '   ██  ', ' ██████'],
  '2': [' █████ ', '██   ██', '    ██ ', '  ███  ', ' ██    ', '██     ', '███████'],
  '3': ['██████ ', '     ██', '     ██', '  ████ ', '     ██', '     ██', '██████ '],
  '4': ['    ██ ', '   ███ ', '  ████ ', ' ██ ██ ', '████████', '   ██  ', '   ██  '],
  '5': ['███████', '██     ', '██████ ', '     ██', '     ██', '██   ██', ' █████ '],
  '6': [' █████ ', '██     ', '██     ', '██████ ', '██   ██', '██   ██', ' █████ '],
  '7': ['███████', '     ██', '    ██ ', '   ██  ', '  ██   ', ' ██    ', ' ██    '],
  '8': [' █████ ', '██   ██', '██   ██', ' █████ ', '██   ██', '██   ██', ' █████ '],
  '9': [' █████ ', '██   ██', '██   ██', ' ██████', '     ██', '     ██', ' █████ '],
};

const STYLES = [
  {
    id: 'ascii',
    label: 'ASCII Block',
    apply: (t: string) => {
      const chars = t.toUpperCase().split('');
      const lines = ['', '', '', '', '', '', ''];
      for (const c of chars) {
        const block = ASCII_ALPHABET[c] || ASCII_ALPHABET[' '];
        for (let i = 0; i < 7; i++) {
          lines[i] += block[i] + ' ';
        }
      }
      return lines.join('\n');
    },
  },
  {
    id: 'bubble',
    label: 'Bubble Text',
    apply: (t: string) => {
      const map: Record<string, string> = { 'a': 'ⓐ', 'b': 'ⓑ', 'c': 'ⓒ', 'd': 'ⓓ', 'e': 'ⓔ', 'f': 'ⓕ', 'g': 'ⓖ', 'h': 'ⓗ', 'i': 'ⓘ', 'j': 'ⓙ', 'k': 'ⓚ', 'l': 'ⓛ', 'm': 'ⓜ', 'n': 'ⓝ', 'o': 'ⓞ', 'p': 'ⓟ', 'q': 'ⓠ', 'r': 'ⓡ', 's': 'ⓢ', 't': 'ⓣ', 'u': 'ⓤ', 'v': 'ⓥ', 'w': 'ⓦ', 'x': 'ⓧ', 'y': 'ⓨ', 'z': 'ⓩ', 'A': 'Ⓐ', 'B': 'Ⓑ', 'C': 'Ⓒ', 'D': 'Ⓓ', 'E': 'Ⓔ', 'F': 'Ⓕ', 'G': 'Ⓖ', 'H': 'Ⓗ', 'I': 'Ⓘ', 'J': 'Ⓙ', 'K': 'Ⓚ', 'L': 'Ⓛ', 'M': 'Ⓜ', 'N': 'Ⓝ', 'O': 'Ⓞ', 'P': 'Ⓟ', 'Q': 'Ⓠ', 'R': 'Ⓡ', 'S': 'Ⓢ', 'T': 'Ⓣ', 'U': 'Ⓤ', 'V': 'Ⓥ', 'W': 'Ⓦ', 'X': 'Ⓧ', 'Y': 'Ⓨ', 'Z': 'Ⓩ', '0': '⓪', '1': '①', '2': '②', '3': '③', '4': '④', '5': '⑤', '6': '⑥', '7': '⑦', '8': '⑧', '9': '⑨' };
      return t.split('').map(c => map[c] || c).join(' ');
    },
  },
  {
    id: 'math-bold',
    label: 'Math Bold',
    apply: (t: string) => {
      const map: Record<string, string> = { 'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦', 'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳', 'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌', 'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙', '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗' };
      return t.split('').map(c => map[c] || c).join('');
    },
  },
];

export default function BigTextGenerator() {
  const [text, setText] = useState('');
  const [activeStyle, setActiveStyle] = useState(STYLES[0].id);

  const activeStyleObj = STYLES.find(s => s.id === activeStyle) || STYLES[0];

  const output = useMemo(() => {
    if (!text) return '';
    return activeStyleObj.apply(text);
  }, [text, activeStyleObj]);

  const handleCopy = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied big text!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
          <Heading className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Big Text Generator</h3>
        </div>

        <div className="space-y-1">
          <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Your Text</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type something to make it BIG..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => setActiveStyle(style.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeStyle === style.id
                  ? 'bg-[var(--accent-ink)] text-white shadow-md'
                  : 'bg-[var(--bg-overlay)] text-[var(--text-muted)] hover:bg-[var(--border-subtle)] border border-[var(--border-subtle)]'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[var(--text-muted)] font-bold uppercase">Output</label>
          </div>
          <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 min-h-[120px] overflow-x-auto">
            {output ? (
              <pre className="text-[var(--accent)] text-xs leading-tight font-mono whitespace-pre">{output}</pre>
            ) : (
              <p className="text-[var(--text-muted)] text-sm italic">Your big text will appear here...</p>
            )}
          </div>
          <button onClick={handleCopy} disabled={!output} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-bold py-2.5 rounded-xl text-sm flex items-center justify-center gap-1.5 cursor-pointer">
            <Copy className="w-4 h-4" /> Copy Big Text
          </button>
        </div>
      </div>
    </div>
  );
}
