"use client";

import React, { useState } from 'react';
import { Type, Copy, Check, Code, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

interface FontOption {
  name: string;
  family: string;
  importUrl: string;
  css: string;
}

const FONTS_LIST: FontOption[] = [
  { name: 'Inter (Sans-serif)', family: 'Inter', importUrl: '@import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap\');', css: 'font-family: \'Inter\', sans-serif;' },
  { name: 'Playfair Display (Serif)', family: 'Playfair Display', importUrl: '@import url(\'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap\');', css: 'font-family: \'Playfair Display\', serif;' },
  { name: 'Fira Code (Monospace)', family: 'Fira Code', importUrl: '@import url(\'https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;700&display=swap\');', css: 'font-family: \'Fira Code\', monospace;' },
  { name: 'Pacifico (Handwritten)', family: 'Pacifico', importUrl: '@import url(\'https://fonts.googleapis.com/css2?family=Pacifico&display=swap\');', css: 'font-family: \'Pacifico\', cursive;' },
  { name: 'Outfit (Modern)', family: 'Outfit', importUrl: '@import url(\'https://fonts.googleapis.com/css2?family=Outfit:wght@400;700&display=swap\');', css: 'font-family: \'Outfit\', sans-serif;' },
  { name: 'Montserrat (Geometric)', family: 'Montserrat', importUrl: '@import url(\'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap\');', css: 'font-family: \'Montserrat\', sans-serif;' },
];

export default function FontGenerator() {
  const [text, setText] = useState('Google Fonts Preview');
  const [selectedFont, setSelectedFont] = useState<FontOption>(FONTS_LIST[0]);
  const [copied, setCopied] = useState(false);

  const handleCopyCSS = () => {
    const code = `${selectedFont.importUrl}\n\n.my-text {\n  ${selectedFont.css}\n}`;
    clipboardWrite(code);
    setCopied(true);
    toast.success('CSS snippets copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Google fonts style sheets loaded dynamically */}
      <style>{FONTS_LIST.map(f => f.importUrl).join('\n')}</style>

      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <Code className="w-6 h-6 text-indigo-500" />
          Google Font Previewer & Code Generator
        </h2>
        <p className="text-sm text-[var(--text-secondary)] dark:text-zinc-400 mt-1">
          Type custom text, preview typography styles using Google Fonts, and copy ready-to-use CSS declarations for web integration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side settings */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300">Preview Text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-zinc-900 dark:text-white outline-none"
            />
          </div>

          <div className="space-y-3">
            <span className="text-xs font-bold text-[var(--text-secondary)] block uppercase tracking-wider">Select Font family</span>
            <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
              {FONTS_LIST.map((font) => (
                <button
                  key={font.name}
                  onClick={() => setSelectedFont(font)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedFont.name === font.name
                      ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                      : 'bg-zinc-50 dark:bg-black/35 border-zinc-200 dark:border-zinc-800 text-[var(--text-secondary)] dark:text-zinc-400 hover:border-[var(--border-subtle)] dark:hover:border-[var(--border-subtle)]'
                  }`}
                >
                  {font.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side previews & code */}
        <div className="lg:col-span-2 space-y-6">
          {/* Preview Panel */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-8 rounded-2xl flex items-center justify-center min-h-[180px] overflow-hidden text-center relative">
            <span className="absolute top-3 left-3 text-[10px] text-zinc-500 font-mono">Visual Preview ({selectedFont.family})</span>
            <div 
              style={{ fontFamily: selectedFont.family }} 
              className="text-4xl text-zinc-900 dark:text-white break-words w-full"
            >
              {text || 'Preview text empty'}
            </div>
          </div>

          {/* CSS output panel */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase">CSS Integration Code</span>
              <button
                onClick={handleCopyCSS}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                Copy snippets
              </button>
            </div>

            <pre className="p-4 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-white/5 rounded-xl text-xs font-mono text-zinc-800 dark:text-[var(--text-muted)] overflow-x-auto">
              {`/* 1. Add this import to your CSS file */\n${selectedFont.importUrl}\n\n/* 2. Apply to your elements */\n.custom-text {\n  ${selectedFont.css}\n}`}
            </pre>

            <div className="flex justify-end pt-2 print:hidden">
              <a
                href={`https://fonts.google.com/specimen/${selectedFont.family.replace(/\s+/g, '+')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
              >
                Open Google Fonts Specimen
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}