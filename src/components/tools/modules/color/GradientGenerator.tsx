"use client";
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ac } from '../miscToolColors';

export default function GradientGenerator() {
  const clr = ac('GradientGenerator');
  const [colors, setColors] = useState(['#3b82f6', '#8b5cf6', '#ec4899']);
  const [type, setType] = useState<'linear' | 'radial' | 'conic'>('linear');
  const [direction, setDirection] = useState('to right');
  const [positions, setPositions] = useState<number[]>([0, 50, 100]);

  const addColor = () => setColors([...colors, `#${Math.floor(Math.random()*0xffffff).toString(16).padStart(6,'0')}`]);
  const removeColor = (i: number) => colors.length > 2 && setColors(colors.filter((_, idx) => idx !== i));
  const updateColor = (i: number, color: string) => { const n = [...colors]; n[i] = color; setColors(n); };
  const updatePosition = (i: number, pos: number) => { const n = [...positions]; n[i] = Math.max(0, Math.min(100, pos)); setPositions(n); };

  const gradient = `${type}-gradient(${type === 'linear' ? direction : type === 'radial' ? 'circle at center' : ''}, ${colors.map((c, i) => `${c} ${positions[i]}%`).join(', ')})`;

  const presets = [
    { label: 'Sunset', apply: () => { setColors(['#ff6b35', '#f7c59f', '#efefd0']); setType('linear'); setDirection('to right'); setPositions([0, 50, 100]); } },
    { label: 'Ocean', apply: () => { setColors(['#0077b6', '#00b4d8', '#90e0ef']); setType('linear'); setDirection('to bottom right'); setPositions([0, 50, 100]); } },
    { label: 'Forest', apply: () => { setColors(['#2d6a4f', '#40916c', '#52b788']); setType('radial'); setPositions([0, 50, 100]); } },
    { label: 'Rainbow', apply: () => { setColors(['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#8f00ff']); setType('linear'); setDirection('to right'); setPositions([0, 16, 33, 50, 66, 83, 100]); } },
    { label: 'Simple', apply: () => { setColors(['#3b82f6', '#8b5cf6']); setType('linear'); setDirection('to right'); setPositions([0, 100]); } },
  ];

  const directions = ['to right', 'to left', 'to top', 'to bottom', 'to top right', 'to top left', 'to bottom right', 'to bottom left'];

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-4">
        {presets.map((p, i) => (
          <button key={i} onClick={p.apply} className="px-3 py-1.5 text-xs font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-pink-400 transition-colors">{p.label}</button>
        ))}
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[var(--text-primary)]">Gradient Generator</h2>
          <div className="flex gap-2 flex-wrap items-center">
            <label className="block text-sm font-medium text-[var(--text-secondary)]">Type</label>
            <select aria-label="Type" value={type} onChange={e => { setType(e.target.value as any); setPositions(colors.map((_, i) => Math.round(i * 100 / (colors.length - 1)))); }}
              className="bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-pink-500/50">
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
              <option value="conic">Conic</option>
            </select>
            {type === 'linear' && (
              <select aria-label="Conic" value={direction} onChange={e => setDirection(e.target.value)}
                className="bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-pink-500/50">
                {directions.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {colors.map((c, i) => (
              <div key={i} className="flex items-center gap-1">
                <input type="color" value={c} onChange={e => updateColor(i, e.target.value)} className="w-8 h-8 rounded cursor-pointer border border-zinc-300 dark:border-zinc-700" />
                <input type="range" min={0} max={100} value={positions[i]} onChange={e => updatePosition(i, Number(e.target.value))}
                  className="w-24 accent-pink-500" />
                <span className="text-xs text-[var(--text-muted)] w-10 text-right">{positions[i]}%</span>
                {colors.length > 2 && <button className="text-xs text-red-500 hover:text-red-600" onClick={() => removeColor(i)}>×</button>}
              </div>
            ))}
            <button onClick={addColor} className="px-3 py-1.5 text-sm font-medium bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-lg text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-pink-400 transition-colors">+ Add</button>
          </div>

          <div className="w-full h-48 rounded-xl border border-zinc-300 dark:border-zinc-700" style={{ background: gradient }} />

          <div className="flex gap-2 flex-wrap">
            <code className="flex-1 bg-[var(--bg-surface)] border border-zinc-300 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 font-mono text-xs break-all">{gradient}</code>
            <button onClick={() => { navigator.clipboard.writeText(gradient); toast.success('CSS copied!'); }} className="px-4 py-2.5 bg-pink-600 hover:bg-pink-500 text-white font-bold rounded-xl text-sm transition-colors">Copy CSS</button>
          </div>

          <div className="bg-[var(--bg-surface)] rounded-xl p-3 border border-zinc-200 dark:border-zinc-700">
            <div className="text-xs text-[var(--text-secondary)] mb-2">Color Stops</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {colors.map((c, i) => (
                <div key={i} className="p-2 rounded-lg text-center flex flex-col items-center" style={{ backgroundColor: c, color: '#ffffff' }}>
                  <input type="color" value={c} onChange={e => updateColor(i, e.target.value)} className="w-8 h-8 rounded cursor-pointer border-none bg-transparent" />
                  <div className="font-mono">{c.toUpperCase()}</div>
                  <input type="range" min={0} max={100} value={positions[i]} onChange={e => updatePosition(i, Number(e.target.value))}
                    className="w-full accent-pink-500 mt-1" />
                  <span className="text-[10px]">{positions[i]}%</span>
                </div>
              ))}
            </div>
          </div>

          {gradient && (
            <a href={`data:text/plain;charset=utf-8,${encodeURIComponent(gradient)}`} download="gradient.css" className="px-5 py-2.5 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-sm font-medium transition-colors inline-block">
              Download CSS
            </a>
          )}
      </div>
    </>
  );
}
