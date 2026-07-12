"use client";

import React, { useState } from 'react';
import { Type, Copy, Check, RefreshCw, Star, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const SYMBOL_WRAPPERS = [
  { name: 'Swastik Border', format: (t: string) => `卍 ${t} 卍` },
  { name: 'Royal Wings', format: (t: string) => `꧁ ${t} ꧂` },
  { name: 'Indian Diamond', format: (t: string) => `◈◇ ${t} ◇◈` },
  { name: 'Decorative Bracket', format: (t: string) => `【 ${t} 】` },
  { name: 'Star Emblem', format: (t: string) => `★彡 ${t} 彡★` },
  { name: 'Infinity Love', format: (t: string) => `∞ ${t} ∞` },
  { name: 'Double Arrow', format: (t: string) => `«« ${t} »»` },
  { name: 'Japanese Corner', format: (t: string) => `『 ${t} 』` },
];

const UNICODE_FONTS = [
  {
    name: 'Double Struck (Outline)',
    map: (char: string) => {
      const offsetUpper = 0x1d538 - 0x41;
      const offsetLower = 0x1d552 - 0x61;
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + offsetUpper);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + offsetLower);
      return char;
    }
  },
  {
    name: 'Circled Letters',
    map: (char: string) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x24B6);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x24D0);
      return char;
    }
  },
  {
    name: 'Squared Letters',
    map: (char: string) => {
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code - 65 + 0x1F130);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code - 97 + 0x1F130); // Squares are usually upper-only
      return char;
    }
  },
  {
    name: 'Script (Cursive)',
    map: (char: string) => {
      const offsetUpper = 0x1d4d0 - 0x41;
      const offsetLower = 0x1d4ea - 0x61;
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + offsetUpper);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + offsetLower);
      return char;
    }
  },
  {
    name: 'Bold Serif',
    map: (char: string) => {
      const offsetUpper = 0x1d400 - 0x41;
      const offsetLower = 0x1d41a - 0x61;
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + offsetUpper);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + offsetLower);
      return char;
    }
  },
  {
    name: 'Gothic / Fraktur',
    map: (char: string) => {
      const offsetUpper = 0x1d504 - 0x41;
      const offsetLower = 0x1d51e - 0x61;
      const code = char.charCodeAt(0);
      if (code >= 65 && code <= 90) return String.fromCodePoint(code + offsetUpper);
      if (code >= 97 && code <= 122) return String.fromCodePoint(code + offsetLower);
      return char;
    }
  }
];

export default function RegionalFontGenerator() {
  const [inputText, setInputText] = useState('जय हिन्द');
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);

  const applyUnicodeFont = (text: string, mapFn: (c: string) => string) => {
    return text.split('').map(mapFn).join('');
  };

  const handleCopy = (text: string, idxKey: string) => {
    clipboardWrite(text);
    setCopiedIndex(idxKey);
    toast.success('Copied text to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Type className="w-6 h-6 text-indigo-500" />
          Hindi & Regional Font Stylizer
        </h2>
        <p className="text-sm text-[var(--text-secondary)] dark:text-zinc-400 mt-1">
          Convert regional text (Hindi, Tamil, Telugu, etc.) or English names into decorative fonts and royal status styles suitable for bio, social media profiles, and messages.
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-2">
          <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">
            Enter Input Text (English or Unicode Script)
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. जय हिन्द or Royal King"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black border-2 border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl px-4 py-3.5 text-lg text-zinc-900 dark:text-white outline-none"
            />
          </div>
        </div>

        {inputText && (
          <div className="space-y-6">
            {/* Symbol wrappers */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Star className="w-4 h-4 text-indigo-500" />
                Royal Brackets & Indian Ornaments
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SYMBOL_WRAPPERS.map((item, idx) => {
                  const output = item.format(inputText);
                  const key = `wrapper-${idx}`;
                  const isCopied = copiedIndex === key;
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] text-[var(--text-secondary)] block">{item.name}</span>
                        <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">{output}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(output, key)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-[var(--text-secondary)] dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
                        }`}
                      >
                        {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Unicode Fonts */}
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Type className="w-4 h-4 text-indigo-500" />
                Unicode Stylings (Latin Characters)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {UNICODE_FONTS.map((font, idx) => {
                  const output = applyUnicodeFont(inputText, font.map);
                  const key = `font-${idx}`;
                  const isCopied = copiedIndex === key;
                  return (
                    <div
                      key={key}
                      className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <span className="text-[10px] text-[var(--text-secondary)] block">{font.name}</span>
                        <span className="text-base font-medium text-zinc-900 dark:text-zinc-100">{output}</span>
                      </div>
                      <button
                        onClick={() => handleCopy(output, key)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-[var(--text-secondary)] dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-600'
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
