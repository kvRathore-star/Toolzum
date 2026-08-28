"use client";

import React, { useMemo, useState } from 'react';
import { Heading } from 'lucide-react';
import { CalculatorShell } from '../shared/CalculatorShell';

const labelCls = "text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider";
const inputCls = "w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2";

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

  const presets = STYLES.map(style => ({
    label: style.label,
    apply: () => setActiveStyle(style.id),
  }));

  const customResult = output ? (
    <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 min-h-[120px] overflow-x-auto">
      <pre className="text-[var(--accent)] text-xs leading-tight font-mono whitespace-pre">{output}</pre>
    </div>
  ) : (
    <p className="text-[var(--text-muted)] text-sm italic">Your big text will appear here...</p>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <CalculatorShell
        title="Big Text Generator"
        icon={<Heading className="w-5 h-5" />}
        result={output}
        onCalculate={() => {}}
        calculateLabel="Generate"
        presets={presets}
        resultLabel="Big Text Output"
        accent="purple"
        customResult={customResult}
      >
        <div className="space-y-1">
          <label className={labelCls}>Your Text</label>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type something to make it BIG..."
            className={`${inputCls} h-24 resize-none`}
          />
        </div>
      </CalculatorShell>
    </div>
  );
}
