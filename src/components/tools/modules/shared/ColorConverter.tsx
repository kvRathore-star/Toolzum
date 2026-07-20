"use client";

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";

const hexToRgb = (hex: string) => {
  const c = hex.replace('#', '');
  if (c.length !== 6 && c.length !== 3) return null;
  const full = c.length === 3 ? c.split('').map(x => x + x).join('') : c;
  const n = parseInt(full, 16);
  if (isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
};

const rgbToHex = (r: number, g: number, b: number) =>
  '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('');

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0, l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    switch (mx) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
};

const hslToRgb = (h: number, s: number, l: number) => {
  s /= 100; l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; } else if (h < 120) { r = x; g = c; } else if (h < 180) { g = c; b = x; } else if (h < 240) { g = x; b = c; } else if (h < 300) { r = x; b = c; } else { r = c; b = x; }
  return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
};

type ColorMode = {
  slug: string;
  name: string;
  description: string;
  convert: (input: string) => string;
};

const MODES: Record<string, ColorMode> = {
  "color-converter": {
    slug: "color-converter", name: "Color Converter",
    description: "Convert between HEX, RGB, and HSL color formats",
    convert: (i) => {
      const t = i.trim();
      if (t.startsWith('#')) {
        const rgb = hexToRgb(t);
        if (!rgb) return 'Invalid HEX color';
        const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
        return `HEX: ${t}\nRGB: ${rgb.r}, ${rgb.g}, ${rgb.b}\nHSL: ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
      }
      const m = t.match(/(\d+)/g);
      if (m && m.length >= 3) {
        const [r, g, b] = m.map(Number);
        if (r > 255 || g > 255 || b > 255) return 'Invalid RGB values (0-255)';
        const hsl = rgbToHsl(r, g, b);
        return `HEX: ${rgbToHex(r, g, b)}\nRGB: ${r}, ${g}, ${b}\nHSL: ${hsl.h}°, ${hsl.s}%, ${hsl.l}%`;
      }
      return 'Paste a HEX (#ff0000) or RGB (255, 0, 0) color';
    },
  },
  "hex-to-rgb-converter": {
    slug: "hex-to-rgb-converter", name: "HEX → RGB Converter",
    description: "Convert hex color codes to RGB values instantly",
    convert: (i) => {
      const rgb = hexToRgb(i.trim());
      if (!rgb) return 'Invalid HEX color. Use format: #ff0000 or #f00';
      return `RGB(${rgb.r}, ${rgb.g}, ${rgb.b})`;
    },
  },
};

export default function ColorConverter({ slug }: { slug: string }) {
  const mode = MODES[slug];
  const [input, setInput] = useState('#3b82f6');
  const [output, setOutput] = useState('');

  if (!mode) return <div className="text-red-500">Unknown color mode: {slug}</div>;

  const handleConvert = () => {
    setOutput(mode.convert(input));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{mode.name}</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{mode.description}</p>
        <input type="text" value={input} onChange={e => setInput(e.target.value)}
          className="w-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono text-zinc-900 dark:text-white outline-none focus:border-blue-500" />
        <button onClick={handleConvert}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 rounded-lg text-sm transition-all active:scale-[0.98]">
          Convert
        </button>
        {output && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">Output</span>
              <button onClick={() => { clipboardWrite(output); toast.success('Copied!'); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium">Copy</button>
            </div>
            <pre className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 rounded-lg p-3 text-emerald-600 dark:text-emerald-400 whitespace-pre-wrap">{output}</pre>
          </div>
        )}
      </div>
    </div>
  );
}
