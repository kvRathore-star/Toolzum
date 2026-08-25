"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeftRight, Copy, Trash2, Download } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

const MORSE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
  'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
  'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', '/': '-..-.',
  '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...', ';': '-.-.-.',
  '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-', '"': '.-..-.',
  '$': '...-..-', '@': '.--.-.', "'": '.----.',
};

const MORSE_REV: Record<string, string> = {};
for (const [k, v] of Object.entries(MORSE)) MORSE_REV[v] = k;

const LETTERS_ORDER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const NUMS_ORDER = '0123456789';

function textToMorse(text: string): string {
  return text
    .toUpperCase()
    .split('')
    .map(c => MORSE[c] || c)
    .join(' ')
    .replace(/\s{3,}/g, ' / ')
    .trim();
}

function morseToText(morse: string): string {
  const words = morse.split('/');
  return words
    .map(word => {
      const chars = word.trim().split(/\s+/);
      return chars.map(c => MORSE_REV[c] || c).join('');
    })
    .join(' ');
}

const PUNCTUATION_DISPLAY: [string, string][] = [
  ['.', '.-.-.-'], [',', '--..--'], ['?', '..--..'], ['!', '-.-.--'],
  ['/', '-..-.'], ['(', '-.--.'], [')', '-.--.-'], ['&', '.-...'],
  [':', '---...'], [';', '-.-.-.'], ['=', '-...-'], ['+', '.-.-.'],
  ['-', '-....-'], ['_', '..--._'], ['"', '.-..-.'], ["'", '.----.'],
  ['$', '...-..-'], ['@', '.--.-.'],
];

export default function MorseCodeTranslator() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const presets = [
    { label: 'SOS', apply: () => { setInput('SOS'); setMode('encode'); setOutput('... --- ...'); } },
    { label: 'Hello World', apply: () => { setInput('Hello World'); setMode('encode'); handleInputChange('Hello World'); } },
    { label: 'Morse Reference', apply: () => { document.querySelector('details')?.setAttribute('open', ''); } },
  ];

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'morse-output.txt';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const handleInputChange = useCallback((value: string) => {
    setInput(value);
    if (!value.trim()) {
      setOutput('');
      return;
    }
    try {
      const result = mode === 'encode' ? textToMorse(value) : morseToText(value);
      setOutput(result);
    } catch {
      setOutput('');
    }
  }, [mode]);

  const toggleMode = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode';
    setMode(newMode);
    setInput(output);
    setOutput(input);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
  };

  const copyOutput = () => {
    if (!output) return;
    clipboardWrite(output);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="max-w-2xl mx-auto animate-in fade-in duration-500 space-y-6">
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p) => (
          <button key={p.label} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={toggleMode}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-elevated)] hover:bg-[var(--bg-overlay)] transition-colors text-sm font-medium"
        >
          <ArrowLeftRight className="w-4 h-4" style={{ color: '#0891b2' }} />
          <span>{mode === 'encode' ? 'Text → Morse' : 'Morse → Text'}</span>
        </button>
        <div className="flex items-center gap-2">
          {output && (
            <>
              <button
                onClick={copyOutput}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ backgroundColor: '#0891b2', color: 'white' }}
              >
                <Copy className="w-3.5 h-3.5" />
                Copy
              </button>
              <button
                onClick={downloadOutput}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download
              </button>
            </>
          )}
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {mode === 'encode' ? 'Text Input' : 'Morse Code Input'}
          </label>
          <textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={mode === 'encode' ? 'Type your text here...' : 'Enter Morse code (use space between letters, / between words)...'}
            className="w-full h-40 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-sm font-mono resize-none outline-none focus:ring-2 focus:ring-[#0891b2]/40 transition-all placeholder:text-[var(--text-muted)]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
            {mode === 'encode' ? 'Morse Code Output' : 'Text Output'}
          </label>
          <textarea
            value={output}
            readOnly
            placeholder="Translation will appear here..."
            className="w-full h-40 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] text-sm font-mono resize-none outline-none cursor-default"
          />
        </div>
      </div>

      <details className="group">
        <summary className="cursor-pointer text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors select-none">
          Morse Code Reference Table
        </summary>
        <div className="mt-4 p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
            {LETTERS_ORDER.split('').map((letter) => (
              <div
                key={letter}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-mono hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <span className="font-bold w-4 text-center">{letter}</span>
                <span style={{ color: '#0891b2' }}>{MORSE[letter]}</span>
              </div>
            ))}
            {NUMS_ORDER.split('').map((num) => (
              <div
                key={num}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-mono hover:bg-[var(--bg-overlay)] transition-colors"
              >
                <span className="font-bold w-4 text-center">{num}</span>
                <span style={{ color: '#0891b2' }}>{MORSE[num]}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <p className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2">Punctuation</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1">
              {PUNCTUATION_DISPLAY.map(([char, code]) => (
                <div
                  key={char}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-mono hover:bg-[var(--bg-overlay)] transition-colors"
                >
                  <span className="font-bold w-4 text-center">{char}</span>
                  <span style={{ color: '#0891b2' }}>{code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </details>
    </div>
  );
}