"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function BorderCssGenerator() {
  const [borderRadius, setBorderRadius] = useState(12);
  const [borderWidth, setBorderWidth] = useState(1);
  const [borderColor, setBorderColor] = useState('#e4e4e7');
  const [borderStyle, setBorderStyle] = useState('solid');
  const [borderOutput, setBorderOutput] = useState('');

  return (
    <div className="max-w-lg mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-5 rounded-2xl space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Border Radius: {borderRadius}px</label>
            <input type="range" min={0} max={50} value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="text-xs text-zinc-500 block mb-1">Border Width: {borderWidth}px</label>
            <input type="range" min={0} max={10} value={borderWidth} onChange={e => setBorderWidth(Number(e.target.value))} className="w-full" />
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="w-10 h-8 rounded cursor-pointer" />
          <select value={borderStyle} onChange={e => setBorderStyle(e.target.value)} className="flex-1 bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500">
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="double">Double</option>
            <option value="groove">Groove</option>
            <option value="ridge">Ridge</option>
          </select>
        </div>
        <div className="h-20 rounded-xl flex items-center justify-center bg-zinc-50 dark:bg-black" style={{ borderRadius: `${borderRadius}px`, border: `${borderWidth}px ${borderStyle} ${borderColor}` }}>
          <span className="text-xs text-zinc-400">Preview</span>
        </div>
        <button onClick={() => { const css = `border: ${borderWidth}px ${borderStyle} ${borderColor}; border-radius: ${borderRadius}px;`; setBorderOutput(css); clipboardWrite(css); toast.success('CSS copied!'); }}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold py-2.5 rounded-xl transition-all">Copy CSS</button>
        {borderOutput && <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400">{borderOutput}</p>}
      </div>
    </div>
  );
}
