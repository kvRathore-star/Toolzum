"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const presets = [
  { label: 'Body text', fontSize: 16, lineHeight: 1.6, letterSpacing: 0, fontWeight: 400, textAlign: 'left' as const },
  { label: 'Heading', fontSize: 36, lineHeight: 1.2, letterSpacing: -0.5, fontWeight: 700, textAlign: 'left' as const },
  { label: 'Caption', fontSize: 12, lineHeight: 1.4, letterSpacing: 0.5, fontWeight: 400, textAlign: 'center' as const },
  { label: 'Quote', fontSize: 20, lineHeight: 1.8, letterSpacing: 0, fontWeight: 300, textAlign: 'center' as const },
];

const fontWeights = [
  { label: 'Light', value: 300 },
  { label: 'Regular', value: 400 },
  { label: 'Medium', value: 500 },
  { label: 'Semibold', value: 600 },
  { label: 'Bold', value: 700 },
];

const alignments = [
  { label: 'L', value: 'left' as const, title: 'Left' },
  { label: 'C', value: 'center' as const, title: 'Center' },
  { label: 'R', value: 'right' as const, title: 'Right' },
  { label: 'J', value: 'justify' as const, title: 'Justify' },
];

export default function TypographyPreview() {
  const [text, setText] = useState('The quick brown fox jumps over the lazy dog');
  const [fontSize, setFontSize] = useState(16);
  const [lineHeight, setLineHeight] = useState(1.5);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [fontWeight, setFontWeight] = useState(400);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');

  const cssOutput = `font-size: ${fontSize}px;\nline-height: ${lineHeight};\nletter-spacing: ${letterSpacing}px;\nfont-weight: ${fontWeight};\ntext-align: ${textAlign};`;

  const copyCss = () => {
    clipboardWrite(cssOutput);
    toast.success('CSS copied!');
  };

  const downloadCss = () => {
    const blob = new Blob([cssOutput], { type: 'text/css' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'typography.css';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Downloaded!');
  };

  const applyPreset = (p: typeof presets[0]) => {
    setFontSize(p.fontSize);
    setLineHeight(p.lineHeight);
    setLetterSpacing(p.letterSpacing);
    setFontWeight(p.fontWeight);
    setTextAlign(p.textAlign);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap gap-2">
          {presets.map((p) => (
            <button key={p.label} onClick={() => applyPreset(p)} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              {p.label}
            </button>
          ))}
        </div>

        <textarea value={text} onChange={e => setText(e.target.value)} aria-label="Preview text"
          className="w-full h-20 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)] resize-y" />

        <div className="grid grid-cols-2 gap-4">
          {[
            { l: 'Font Size', v: fontSize, s: setFontSize, min: 12, max: 72, unit: 'px' },
            { l: 'Line Height', v: lineHeight, s: setLineHeight, min: 1.0, max: 3.0, step: 0.1 },
            { l: 'Letter Spacing', v: letterSpacing, s: setLetterSpacing, min: -5, max: 10, unit: 'px' },
          ].map(({ l, v, s, min, max, step, unit }) => (
            <div key={l}>
              <label className="text-xs text-[var(--text-secondary)] block mb-1">{l}: {v}{unit || ''}</label>
              <input type="range" min={min} max={max} step={step || 1} value={v} onChange={e => s(step === 0.1 ? parseFloat(e.target.value) : Number(e.target.value))} className="w-full" />
            </div>
          ))}
          <div>
            <label className="text-xs text-[var(--text-secondary)] block mb-1">Text Align</label>
            <div className="flex gap-1">
              {alignments.map((a) => (
                <button key={a.value} onClick={() => setTextAlign(a.value)} title={a.title} className={`flex-1 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors ${textAlign === a.value ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)]'}`}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="text-xs text-[var(--text-secondary)] block mb-1">Font Weight: {fontWeight}</label>
          <div className="flex flex-wrap gap-1">
            {fontWeights.map((w) => (
              <button key={w.value} onClick={() => setFontWeight(w.value)} className={`px-3 py-1 text-xs font-medium rounded-lg transition-colors ${fontWeight === w.value ? 'bg-blue-600 text-white' : 'bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-secondary)]'}`}>
                {w.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)]" style={{ fontSize: `${fontSize}px`, lineHeight, letterSpacing: `${letterSpacing}px`, fontWeight, textAlign }}>
          {text || 'Preview text'}
        </div>

        <pre className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-secondary)] whitespace-pre-wrap">{cssOutput}</pre>

        <div className="flex gap-3">
          <button onClick={copyCss} className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl transition-all">Copy CSS</button>
          <button onClick={downloadCss} className="flex-1 px-4 py-2.5 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 text-[var(--text-primary)] text-sm font-bold rounded-xl transition-all hover:text-[var(--accent)]">Download CSS</button>
        </div>
      </div>
    </div>
  );
}
