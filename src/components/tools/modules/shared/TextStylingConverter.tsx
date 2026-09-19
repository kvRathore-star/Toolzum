"use client";

import React, { useState, useMemo } from 'react';
import { Type, Copy, Check, Star } from 'lucide-react';
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

const FONT_STYLES = [
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

const CURSIVE_MAP: Record<string, string> = {
  'a': '\u{1D4EA}', 'b': '\u{1D4EB}', 'c': '\u{1D4EC}', 'd': '\u{1D4ED}', 'e': '\u{1D4EE}', 'f': '\u{1D4EF}', 'g': '\u{1D4F0}', 'h': '\u{1D4F1}',
  'i': '\u{1D4F2}', 'j': '\u{1D4F3}', 'k': '\u{1D4F4}', 'l': '\u{1D4F5}', 'm': '\u{1D4F6}', 'n': '\u{1D4F7}', 'o': '\u{1D4F8}', 'p': '\u{1D4F9}',
  'q': '\u{1D4FA}', 'r': '\u{1D4FB}', 's': '\u{1D4FC}', 't': '\u{1D4FD}', 'u': '\u{1D4FE}', 'v': '\u{1D4FF}', 'w': '\u{1D500}', 'x': '\u{1D501}',
  'y': '\u{1D502}', 'z': '\u{1D503}',
  'A': '\u{1D4D0}', 'B': '\u{1D4D1}', 'C': '\u{1D4D2}', 'D': '\u{1D4D3}', 'E': '\u{1D4D4}', 'F': '\u{1D4D5}', 'G': '\u{1D4D6}', 'H': '\u{1D4D7}',
  'I': '\u{1D4D8}', 'J': '\u{1D4D9}', 'K': '\u{1D4DA}', 'L': '\u{1D4DB}', 'M': '\u{1D4DC}', 'N': '\u{1D4DD}', 'O': '\u{1D4DE}', 'P': '\u{1D4DF}',
  'Q': '\u{1D4E0}', 'R': '\u{1D4E1}', 'S': '\u{1D4E2}', 'T': '\u{1D4E3}', 'U': '\u{1D4E4}', 'V': '\u{1D4E5}', 'W': '\u{1D4E6}', 'X': '\u{1D4E7}',
  'Y': '\u{1D4E8}', 'Z': '\u{1D4E9}'
};

const ZALGO_UP = [
  '\u030d', '\u030e', '\u0304', '\u0305', '\u0306', '\u0307', '\u0308', '\u0309', '\u030a', '\u030b', '\u030c',
  '\u030f', '\u0311', '\u0312', '\u0313', '\u0314', '\u031a', '\u031b', '\u031c', '\u031d', '\u031e', '\u031f',
  '\u0320', '\u032d', '\u0330', '\u0331', '\u033e', '\u0357', '\u0358', '\u035d', '\u035e', '\u0360', '\u0361',
  '\u0362', '\u0363', '\u0364', '\u0365', '\u0366', '\u0367', '\u0368', '\u0369', '\u036a', '\u036b', '\u036c',
  '\u036d', '\u036e', '\u036f', '\u033d', '\u0300', '\u0301', '\u0302', '\u0303'
];
const ZALGO_DOWN = [
  '\u0316', '\u0317', '\u0318', '\u0319', '\u031c', '\u031d', '\u031e', '\u031f', '\u0320', '\u0321', '\u0322',
  '\u0323', '\u0324', '\u0325', '\u0326', '\u0327', '\u0328', '\u0329', '\u032a', '\u032b', '\u032c', '\u032e',
  '\u032f', '\u0330', '\u0331', '\u0332', '\u0333', '\u0339', '\u033a', '\u033b', '\u033c', '\u0345', '\u0347',
  '\u0348', '\u0349', '\u034d', '\u034e', '\u0353', '\u0354', '\u0355', '\u0356', '\u0359', '\u035a', '\u035b',
  '\u035c', '\u035f', '\u0362', '\u0300', '\u0301', '\u0302', '\u0303'
];
const ZALGO_MID = [
  '\u0315', '\u0334', '\u0335', '\u0336', '\u0337', '\u0338', '\u0358', '\u0320', '\u0338', '\u035c', '\u035d'
];

function FancyView() {
  const [inputText, setInputText] = useState('Cool Name');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const applyFontStyle = (text: string, mapFn: (c: string) => string) => text.split('').map(mapFn).join('');

  const handleCopy = (text: string, key: string) => {
    clipboardWrite(text);
    setCopiedKey(key);
    toast.success('Copied style!');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <>
      <div className="bg-[var(--bg-overlay)] p-6 border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <Type className="w-6 h-6 text-[var(--accent)]" />
          Fancy Font & Text Stylizer
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Type your text to generate stylized fonts, bubble letters, cursive scripts, and brackets. Copy instantly for Instagram, X, or Discord.
        </p>
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
        <div className="space-y-2">
          <label htmlFor="lbl-textstylingconverter-input-text" className="block text-sm font-bold text-[var(--text-primary)]">Input Text</label>
          <input id="lbl-textstylingconverter-input-text" aria-label="Input Text" type="text" value={inputText} onChange={e => setInputText(e.target.value)}
            className="w-full bg-[var(--bg-overlay)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent)] rounded-xl px-4 py-3.5 text-lg text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
        </div>
        {inputText && (
          <div className="space-y-8">
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                <Type className="w-4 h-4 text-[var(--accent)]" /> Unicode Alphabets
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {FONT_STYLES.map((font, idx) => {
                  const output = applyFontStyle(inputText, font.map);
                  const key = `font-${idx}`;
                  return (
                    <div key={key} className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-[var(--text-secondary)] block">{font.name}</span>
                        <span className="text-base font-medium text-[var(--text-primary)]">{output}</span>
                      </div>
                      <button aria-label={`Copy ${font.name} style`} onClick={() => handleCopy(output, key)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer ${copiedKey === key ? 'bg-emerald-700/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-subtle)]'}`}>
                        {copiedKey === key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-xs text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1">
                <Star className="w-4 h-4 text-[var(--accent)]" /> Decorations & Symbols
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SYMBOL_DECORATIONS.map((decor, idx) => {
                  const output = decor.format(inputText);
                  const key = `decor-${idx}`;
                  return (
                    <div key={key} className="p-4 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-[var(--text-secondary)] block">{decor.name}</span>
                        <span className="text-base font-medium text-[var(--text-primary)]">{output}</span>
                      </div>
                      <button aria-label={`Copy ${decor.name} style`} onClick={() => handleCopy(output, key)}
                        className={`p-2.5 rounded-lg border transition-all cursor-pointer ${copiedKey === key ? 'bg-emerald-700/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-white dark:bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--border-subtle)]'}`}>
                        {copiedKey === key ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function CursiveView() {
  const [input, setInput] = useState('Type your text here to make it cursive');
  const cursive = input.split('').map(char => CURSIVE_MAP[char] || char).join('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!cursive) return;
    clipboardWrite(cursive);
    setCopied(true);
    toast.success('Copied cursive text!');
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <Type className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Unicode Cursive Text Generator</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
        <div className="space-y-2">
          <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">English Plaintext</span>
          <textarea aria-label="English Plaintext" value={input} onChange={e => setInput(e.target.value)}
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none" />
        </div>
        <div className="flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Cursive Unicode Output</span>
            <textarea aria-label="Cursive Unicode Output" value={cursive} readOnly
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--accent)] font-serif text-lg h-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none" />
          </div>
          <button onClick={handleCopy}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-3.5 rounded-xl text-xs cursor-pointer">
            {copied ? 'Copied!' : 'Copy Cursive Text'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ZalgoView() {
  const [input, setInput] = useState('');
  const [intensity, setIntensity] = useState(8);
  const [goUp, setGoUp] = useState(true);
  const [goMid, setGoMid] = useState(true);
  const [goDown, setGoDown] = useState(true);

  const getRand = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  const output = useMemo(() => {
    if (!input) return '';
    let result = '';
    for (const char of input) {
      if (char === '\n' || char === ' ') { result += char; continue; }
      result += char;
      const counts = Math.floor(Math.random() * intensity) + 1;
      for (let i = 0; i < counts; i++) {
        if (goUp && Math.random() > 0.3) result += getRand(ZALGO_UP);
        if (goMid && Math.random() > 0.4) result += getRand(ZALGO_MID);
        if (goDown && Math.random() > 0.3) result += getRand(ZALGO_DOWN);
      }
    }
    return result;
  }, [input, intensity, goUp, goMid, goDown]);

  const loadSample = () => { setInput("This text is corrupt and cursed! Join the darkness."); toast.success("Loaded sample text!"); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-6 space-y-6 h-fit">
        <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)] pb-2">
          Zalgo Parameters
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Cursed Level (1-20)</label>
            <span className="text-sm font-extrabold text-red-500">{intensity}</span>
          </div>
          <input aria-label="Cursed Level (1-20)" type="range" min={1} max={20} value={intensity} onChange={e => setIntensity(Number(e.target.value))}
            className="w-full h-2 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-lg appearance-none cursor-pointer accent-red-600 mt-2" />
        </div>
        <div className="space-y-3 pt-2">
          {[{ label: 'Stack Above (Upwards)', v: goUp, s: setGoUp },
            { label: 'Stack Middle (Cross through)', v: goMid, s: setGoMid },
            { label: 'Stack Below (Downwards)', v: goDown, s: setGoDown },
          ].map(({ label, v, s }) => (
            <label key={label} className="flex items-center gap-2 cursor-pointer text-sm text-[var(--text-primary)] font-semibold select-none">
              <input type="checkbox" checked={v} onChange={e => s(e.target.checked)}
                className="rounded border-[var(--border-subtle)] dark:border-zinc-800 text-red-600 focus:ring-red-500 h-4 w-4" />
              {label}
            </label>
          ))}
        </div>
        <button onClick={loadSample}
          className="w-full bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] dark:text-white font-bold py-3 rounded-xl transition-all active:scale-95 text-sm cursor-pointer">
          Load Sample Text
        </button>
      </div>
      <div className="lg:col-span-2 space-y-6 flex flex-col h-auto">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl flex flex-col h-[200px]">
          <div className="px-4 py-3 bg-black/20 border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)] flex justify-between items-center shrink-0">
            <span className="text-[var(--text-primary)] text-sm font-bold uppercase tracking-wider">Normal Input Text</span>
            <button onClick={() => setInput('')} className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 font-semibold cursor-pointer">Clear</button>
          </div>
          <textarea aria-label="Clear" value={input} onChange={e => setInput(e.target.value)} placeholder="Type or paste standard text here..."
            className="flex-1 p-4 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono text-sm text-[var(--text-primary)]" />
        </div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl flex flex-col h-[250px] overflow-hidden">
          <div className="px-4 py-3 bg-black/20 border-b border-[var(--border-subtle)] dark:border-[var(--border-subtle)] flex justify-between items-center shrink-0">
            <span className="text-[var(--text-primary)] text-sm font-bold uppercase tracking-wider">Cursed Zalgo Output</span>
            <button onClick={() => { if (output) { clipboardWrite(output).then(ok => { if (ok) toast.success('Copied!'); else toast.error('Copy blocked by the browser — select the text manually.'); }); } }} disabled={!output}
              className="text-xs text-[var(--accent)] hover:text-blue-700 dark:hover:text-blue-400 font-semibold disabled:opacity-50 cursor-pointer">Copy</button>
          </div>
          <textarea aria-label="Cursed text will creep here..." value={output} readOnly placeholder="Cursed text will creep here..."
            className="flex-1 p-4 bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-sans text-lg text-red-500 dark:text-red-400 overflow-y-auto" />
        </div>
      </div>
    </div>
  );
}

export const STYLING_SLUGS = ["fancy-text-generator", "cursive-text-generator", "zalgo-text-generator"] as const;

export default function TextStylingConverter({ slug }: { slug: string }) {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {slug === 'text-style-generator' && <FancyView />}
      {slug === 'fancy-text-generator' && <FancyView />}
      {slug === 'cursive-text-generator' && <CursiveView />}
      {slug === 'zalgo-text-generator' && <ZalgoView />}
    </div>
  );
}
