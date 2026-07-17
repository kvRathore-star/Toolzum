"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function TypographyPreview() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [fontWeight, setFontWeight] = useState(400);

  const copyCss = () => {
    const css = `font-size: ${fontSize}px; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}px; font-weight: ${fontWeight};`;
    clipboardWrite(css);
    toast.success('CSS copied!');
  };

  return (
    <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
        <textarea value={text} onChange={e => setText(e.target.value)}
          className="w-full h-20 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs outline-none focus:border-blue-500 resize-y" />
        <div className="grid grid-cols-2 gap-4">
          {[
            { l: 'Font Size', v: fontSize, s: setFontSize, min: 8, max: 72 },
            { l: 'Line Height', v: lineHeight, s: setLineHeight, min: 0.5, max: 3, step: 0.1 },
            { l: 'Letter Spacing', v: letterSpacing, s: setLetterSpacing, min: -5, max: 10 },
            { l: 'Font Weight', v: fontWeight, s: setFontWeight, min: 100, max: 900, step: 100 },
          ].map(({ l, v, s, min, max, step }) => (
            <div key={l}>
              <label className="text-xs text-zinc-500 block mb-1">{l}: {v}</label>
              <input type="range" min={min} max={max} step={step || 1} value={v} onChange={e => s(step === 0.1 ? parseFloat(e.target.value) : Number(e.target.value))} className="w-full" />
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800" style={{ fontSize: `${fontSize}px`, lineHeight, letterSpacing: `${letterSpacing}px`, fontWeight }}>
          {text || 'Preview text'}
        </div>
        <button onClick={copyCss} className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Copy Typography CSS</button>
      </div>
    </div>
  );
}
