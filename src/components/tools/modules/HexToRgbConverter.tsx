"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

export default function HexToRgbConverter() {
  const [hex, setHex] = useState('3B82F6');
  const [rgbVal, setRgbVal] = useState('59, 130, 246');
  const [hslVal, setHslVal] = useState('217, 91%, 60%');
  const [cmykVal, setCmykVal] = useState('76, 47, 0, 4');

  // Sync state
  const [colorHex, setColorHex] = useState('#3B82F6');

  // Convert Hex to RGB
  const hexToRgb = (hexStr: string): { r: number; g: number; b: number } | null => {
    const clean = hexStr.replace('#', '').trim();
    if (clean.length === 3) {
      const r = parseInt(clean[0] + clean[0], 16);
      const g = parseInt(clean[1] + clean[1], 16);
      const b = parseInt(clean[2] + clean[2], 16);
      return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
    } else if (clean.length === 6) {
      const r = parseInt(clean.substring(0, 2), 16);
      const g = parseInt(clean.substring(2, 4), 16);
      const b = parseInt(clean.substring(4, 6), 16);
      return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
    }
    return null;
  };

  // Convert RGB to Hex
  const rgbToHex = (r: number, g: number, b: number): string => {
    const clamp = (val: number) => Math.max(0, Math.min(255, val));
    const rs = clamp(r).toString(16).padStart(2, '0').toUpperCase();
    const gs = clamp(g).toString(16).padStart(2, '0').toUpperCase();
    const bs = clamp(b).toString(16).padStart(2, '0').toUpperCase();
    return `${rs}${gs}${bs}`;
  };

  // Convert RGB to HSL
  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  // Convert HSL to RGB
  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r = l, g = l, b = l;

    if (s !== 0) {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  // Convert RGB to CMYK
  const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    r /= 255;
    g /= 255;
    b /= 255;
    const k = 1 - Math.max(r, g, b);
    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }
    const c = (1 - r - k) / (1 - k);
    const m = (1 - g - k) / (1 - k);
    const y = (1 - b - k) / (1 - k);
    return {
      c: Math.round(c * 100),
      m: Math.round(m * 100),
      y: Math.round(y * 100),
      k: Math.round(k * 100)
    };
  };

  // Convert CMYK to RGB
  const cmykToRgb = (c: number, m: number, y: number, k: number): { r: number; g: number; b: number } => {
    c /= 100;
    m /= 100;
    y /= 100;
    k /= 100;
    return {
      r: Math.round(255 * (1 - c) * (1 - k)),
      g: Math.round(255 * (1 - m) * (1 - k)),
      b: Math.round(255 * (1 - y) * (1 - k))
    };
  };

  // Propagate calculations from RGB
  const updateColorsFromRgb = (r: number, g: number, b: number) => {
    const cleanHex = rgbToHex(r, g, b);
    setHex(cleanHex);
    setColorHex(`#${cleanHex}`);

    const hsl = rgbToHsl(r, g, b);
    setHslVal(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);

    const cmyk = rgbToCmyk(r, g, b);
    setCmykVal(`${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHex(val);
    const parsedRgb = hexToRgb(val);
    if (parsedRgb) {
      setRgbVal(`${parsedRgb.r}, ${parsedRgb.g}, ${parsedRgb.b}`);
      updateColorsFromRgb(parsedRgb.r, parsedRgb.g, parsedRgb.b);
    }
  };

  const handleRgbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRgbVal(val);
    const parts = val.split(',').map(p => parseInt(p.trim(), 10));
    if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
      updateColorsFromRgb(parts[0], parts[1], parts[2]);
    }
  };

  const handleHslChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setHslVal(val);
    const parts = val.replace(/%/g, '').split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 3 && parts.every(p => !isNaN(p))) {
      const rgb = hslToRgb(parts[0], parts[1], parts[2]);
      setHex(rgbToHex(rgb.r, rgb.g, rgb.b));
      setRgbVal(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
      setColorHex(`#${rgbToHex(rgb.r, rgb.g, rgb.b)}`);
      const cmyk = rgbToCmyk(rgb.r, rgb.g, rgb.b);
      setCmykVal(`${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k}`);
    }
  };

  const handleCmykChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCmykVal(val);
    const parts = val.split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 4 && parts.every(p => !isNaN(p) && p >= 0 && p <= 100)) {
      const rgb = cmykToRgb(parts[0], parts[1], parts[2], parts[3]);
      setHex(rgbToHex(rgb.r, rgb.g, rgb.b));
      setRgbVal(`${rgb.r}, ${rgb.g}, ${rgb.b}`);
      setColorHex(`#${rgbToHex(rgb.r, rgb.g, rgb.b)}`);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
      setHslVal(`${hsl.h}, ${hsl.s}%, ${hsl.l}%`);
    }
  };

  const copyFormat = async (format: string, label: string) => {
    try {
      await clipboardWrite(format);
      toast.success(`${label} copied to clipboard!`);
    } catch {
      toast.error("Failed to copy color.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Banner */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400 text-sm space-y-1">
        <h4 className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
          🎨 Interactive Color Space Converter
        </h4>
        <p className="text-zinc-600 dark:text-zinc-400">
          Input color specs in HEX, RGB, HSL, or CMYK. All fields synchronize automatically, providing a live visual preview color swatch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Swatch Display */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl p-6 flex flex-col justify-center items-center gap-4">
          <div 
            className="w-full h-44 rounded-xl border border-zinc-300 dark:border-zinc-800 shadow-inner transition-colors duration-200"
            style={{ backgroundColor: colorHex }}
          />
          <div className="text-center">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Current Preview Swatch</span>
            <strong className="text-lg font-mono text-zinc-900 dark:text-white">{colorHex}</strong>
          </div>
        </div>

        {/* Inputs Panels */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl p-6 md:col-span-2 space-y-4">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider border-b border-zinc-200 dark:border-white/5 pb-2">
            Color Formats
          </h4>

          {/* Hex */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">HEX Value</label>
            <div className="flex items-center bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 font-mono text-sm">
              <span className="text-zinc-400 mr-1 select-none">#</span>
              <input
                type="text"
                value={hex}
                onChange={handleHexChange}
                className="flex-1 bg-transparent text-zinc-900 dark:text-white outline-none"
              />
              <button
                onClick={() => copyFormat(`#${hex}`, 'HEX')}
                className="text-xs text-blue-500 hover:text-blue-400 font-bold ml-2 shrink-0"
              >
                Copy
              </button>
            </div>
          </div>

          {/* RGB */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">RGB (R, G, B)</label>
            <div className="flex items-center bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 font-mono text-sm">
              <input
                type="text"
                value={rgbVal}
                onChange={handleRgbChange}
                className="flex-1 bg-transparent text-zinc-900 dark:text-white outline-none"
              />
              <button
                onClick={() => copyFormat(`rgb(${rgbVal})`, 'RGB')}
                className="text-xs text-blue-500 hover:text-blue-400 font-bold ml-2 shrink-0"
              >
                Copy
              </button>
            </div>
          </div>

          {/* HSL */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">HSL (H, S%, L%)</label>
            <div className="flex items-center bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 font-mono text-sm">
              <input
                type="text"
                value={hslVal}
                onChange={handleHslChange}
                className="flex-1 bg-transparent text-zinc-900 dark:text-white outline-none"
              />
              <button
                onClick={() => copyFormat(`hsl(${hslVal})`, 'HSL')}
                className="text-xs text-blue-500 hover:text-blue-400 font-bold ml-2 shrink-0"
              >
                Copy
              </button>
            </div>
          </div>

          {/* CMYK */}
          <div className="space-y-1 relative">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">CMYK (C, M, Y, K)</label>
            <div className="flex items-center bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2 font-mono text-sm">
              <input
                type="text"
                value={cmykVal}
                onChange={handleCmykChange}
                className="flex-1 bg-transparent text-zinc-900 dark:text-white outline-none"
              />
              <button
                onClick={() => copyFormat(`cmyk(${cmykVal})`, 'CMYK')}
                className="text-xs text-blue-500 hover:text-blue-400 font-bold ml-2 shrink-0"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

