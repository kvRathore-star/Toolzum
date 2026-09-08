"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ac } from '../miscToolColors';
import { Input } from '../MiscToolsShared';

export default function ColorPicker() {
  const clr = ac('ColorPicker');
  const [color, setColor] = useState('#ff6b6b');

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
            <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-16 h-16 rounded-lg cursor-pointer" />
            <Input label="Hex color" value={color} onChange={v => setColor(v.startsWith("#") ? v : "#" + v)} />
          </div>
          <div className="w-full h-24 rounded-lg border" style={{ backgroundColor: color }} />
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
