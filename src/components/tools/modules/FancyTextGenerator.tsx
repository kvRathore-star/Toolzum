"use client";

import React, { useState } from 'react';
import { Type, Copy, Check, Star, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const SYMBOL_DECORATIONS = [
  { name: 'Star Sparkle', format: (t: string) => `★彡 ${t} 彡★` },
  { name: 'Royal Wings', format: (t: string) => `꧁ ${t} ꧂` },
  { name: 'Swastik Border', format: (t: string) => `卍 ${t} 卍` },
  { name: 'Cute Hearts', format: (t: string) => `♥ ${t} ♥` },
  { name: 'Japanese Corner', format: (t: string) => `『 ${t} 』` },
  { name: 'Diamond Border', format: (t: string) => `◈◇ ${t} ◇◈` },
  { name: 'Brackets', format: (t: string) => `【 ${t} 】` },
  { name: 'Music Note', format: (t: string) => `♫ ${t} ♫` },
];

const FONTS_STYLES = [
  {
    name: 'Double Struck (Outline)',
    map: (char: string) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + 0x1d538 - 0x41);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + 0x1d552 - 0x61);
      return char;
    }
  },
  {
    name: 'Circled',
    map: (char: string) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x24B6);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x24D0);
      return char;
    }
  },
  {
    name: 'Script (Cursive)',
    map: (char: string) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + 0x1d4d0 - 0x41);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + 0x1d4ea - 0x61);
      return char;
    }
  },
  {
    name: 'Gothic (Fraktur)',
    map: (char: string) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + 0x1d504 - 0x41);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + 0x1d51e - 0x61);
      return char;
    }
  },
  {
    name: 'Bold Sans',
    map: (char: string) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + 0x1d5d4 - 0x41);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + 0x1d5ee - 0x61);
      return char;
    }
  },
  {
    name: 'Small Caps',
    map: (char: string) => {
      const smallCapsMap: Record<string, string> = {
        a: 'ᴀ', b: 'ʙ', c: 'ᴄ', d: 'ᴅ', e: 'ᴇ', f: 'ғ', g: 'ɢ', h: 'ʜ', i: 'ɪ', j: 'ᴊ', k: 'ᴋ', l: 'ʟ', m: 'ᴍ',
        n: 'ɴ', o: 'ᴏ', p: 'ᴘ', q: 'ǫ', r: 'ʀ', s: 's', t: 'ᴛ', u: 'ᴜ', v: 'ᴠ', w: 'ᴡ', x: 'x', y: 'ʏ', z: 'ᴢ'
      };
      return smallCapsMap[char.toLowerCase()] || char;
    }
  },
  {
    name: 'Strikethrough',
    map: (char: string) => char + '\u0336'
  },
  {
    name: 'Underline',
    map: (char: string) => char + '\u0332'
  }
];

export default function FancyTextGenerator() {
  const [inputText, setInputText] = useState('Cool Name');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const applyFontStyle = (text: string, mapFn: (c: string) => string) => {
    return text.split('').map(mapFn).join('');
  };

  const handleCopy = (text: string, key: string) => {
    clipboardWrite(text);
    setCopiedKey(key);
    toast.success('Copied style!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-6 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Type className="w-6 h-6 text-[var(--accent)]" />
          Fancy Font & Text Stylizer
        </h2>
        <p className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mt-1">
          Type your text to generate stylized fonts, bubble letters, cursive scripts, and brackets. Copy instantly for Instagram, X, or Discord.
        </p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-[var(--text-primary)]">Input Text</label>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-indigo-500 rounded-xl px-4 py-3.5 text-lg text-[var(--text-primary)] outline-none"
          />
        </div>

        {inputText && (
          <div className="space-y-8">
            {/* Font modifications */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                <Type className="w-4 h-4 text-[var(--accent)]" />
                Unicode Alphabets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FONTS_STYLES.map((font, idx) => {
                  const output = applyFontStyle(inputText, font.map);
                  const key = `font-${idx}`;
                  const isCopied = copiedKey === key;
                  return (
                    <div key={key} className="p-4 bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-[var(--text-secondary)] block">{font.name}</span>
                        <span className="text-base font-medium text-zinc-900 dark:text-[var(--text-primary)]">{output}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(output, key)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-white dark:bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:border-zinc-300'
                        }`}
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Symbol decorations */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                <Star className="w-4 h-4 text-[var(--accent)]" />
                Decorations & Symbols
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SYMBOL_DECORATIONS.map((decor, idx) => {
                  const output = decor.format(inputText);
                  const key = `decor-${idx}`;
                  const isCopied = copiedKey === key;
                  return (
                    <div key={key} className="p-4 bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-[var(--text-secondary)] block">{decor.name}</span>
                        <span className="text-base font-medium text-zinc-900 dark:text-[var(--text-primary)]">{output}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(output, key)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-white dark:bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:border-zinc-300'
                        }`}
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}