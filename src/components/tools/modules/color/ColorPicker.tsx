"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ac } from '../miscToolColors';
import { Input } from '../MiscToolsShared';

export default function ColorPicker() {
  const clr = ac('ColorPicker');
  const [color, setColor] = useState('#ff6b6b');

  const hexToRgb = (hex: string): [number, number, number] | null => {
    const m = hex.replace('#', '').match(/^([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/);
    if (!m) return null;
    let h = m[1]!;
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  };
  const rgb = hexToRgb(color);
  const rgbStr = rgb ? `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})` : '—';
  const hslStr = (() => {
    if (!rgb) return '—';
    const [r, g, b] = rgb.map(v => v / 255) as [number, number, number];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return `hsl(0, 0%, ${Math.round(l * 100)}%)`;
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return `hsl(${Math.round(h * 60)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  })();
  const luminance = (c: [number, number, number]) => {
    const f = (v: number) => { const s = v / 255; return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  const contrast = (a: [number, number, number], b: [number, number, number]) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
    return (hi + 0.05) / (lo + 0.05);
  };
  const contrastWhite = rgb ? contrast(rgb, [255, 255, 255]).toFixed(2) : '—';
  const contrastBlack = rgb ? contrast(rgb, [0, 0, 0]).toFixed(2) : '—';

  const presets = [
    { label: 'Red', apply: () => { setColor('#ff6b6b'); } },
    { label: 'Blue', apply: () => { setColor('#3b82f6'); } },
    { label: 'Green', apply: () => { setColor('#10b981'); } },
    { label: 'Purple', apply: () => { setColor('#8b5cf6'); } },
    { label: 'Random', apply: () => { setColor('#' + Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')); } },
  ];

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p, i) => (
          <button key={i} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-pink-400 transition-colors">{p.label}</button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Color Picker</h2>
          <div className="flex gap-4 items-center">
            <input aria-label="Color Picker" type="color" value={color} onChange={e => setColor(e.target.value)} className="w-16 h-16 rounded-lg cursor-pointer" />
            <Input label="Hex color" value={color} onChange={v => setColor(v.startsWith("#") ? v : "#" + v)} />
          </div>
          <div className="w-full h-24 rounded-lg border" style={{ backgroundColor: color }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            <div className="flex items-center justify-between gap-2 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2">
              <span className="font-mono text-[var(--text-primary)] truncate">{rgbStr}</span>
              <button onClick={() => { navigator.clipboard.writeText(rgbStr); toast.success('RGB copied!'); }} className="px-2 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0">Copy</button>
            </div>
            <div className="flex items-center justify-between gap-2 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg px-3 py-2">
              <span className="font-mono text-[var(--text-primary)] truncate">{hslStr}</span>
              <button onClick={() => { navigator.clipboard.writeText(hslStr); toast.success('HSL copied!'); }} className="px-2 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors shrink-0">Copy</button>
            </div>
          </div>
          <p className="text-xs text-[var(--text-secondary)]">Contrast ratio (WCAG text): <span className="font-mono font-bold text-[var(--text-primary)]">{contrastWhite}:1</span> vs white · <span className="font-mono font-bold text-[var(--text-primary)]">{contrastBlack}:1</span> vs black (4.5:1+ passes AA)</p>
          <div className="flex gap-2 flex-wrap">
            {color && (
              <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(color)}`} download="color.txt" className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-sm font-medium transition-colors inline-block">
                Download
              </a>
            )}
            <button onClick={() => { navigator.clipboard.writeText(color); toast.success('Hex copied!'); }} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              Copy
            </button>
          </div>
      </div>
    </>
  );
}
