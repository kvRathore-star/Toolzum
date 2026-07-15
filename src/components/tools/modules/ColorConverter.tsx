"use client";

import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { clipboardWrite } from "@/lib/clipboard";
import { downloadOrShare } from '@/utils/nativeShare';

const HISTORY_MAX = 10;

const NAMED_COLORS: Record<string, string> = {
  red: 'FF0000', green: '008000', blue: '0000FF', black: '000000',
  white: 'FFFFFF', yellow: 'FFFF00', orange: 'FFA500', purple: '800080',
  pink: 'FFC0CB', brown: 'A52A2A', gray: '808080', cyan: '00FFFF',
  magenta: 'FF00FF', lime: '00FF00', navy: '000080', teal: '008080',
  maroon: '800000', olive: '808000', silver: 'C0C0C0', gold: 'FFD700',
  coral: 'FF7F50', indigo: '4B0082', violet: 'EE82EE', tan: 'D2B48C',
  salmon: 'FA8072', turquoise: '40E0D0', wheat: 'F5DEB3', tomato: 'FF6347',
};

function hexToRgb(h: string) {
  const c = h.replace('#', '').trim();
  if (c.length === 3) {
    const r = parseInt(c[0] + c[0], 16);
    const g = parseInt(c[1] + c[1], 16);
    const b = parseInt(c[2] + c[2], 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  if (c.length === 6) {
    const r = parseInt(c.slice(0, 2), 16);
    const g = parseInt(c.slice(2, 4), 16);
    const b = parseInt(c.slice(4, 6), 16);
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  }
  return null;
}

function rgbToHex(r: number, g: number, b: number) {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return [clamp(r).toString(16).padStart(2, '0'), clamp(g).toString(16).padStart(2, '0'), clamp(b).toString(16).padStart(2, '0')].join('').toUpperCase();
}

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (mx + mn) / 2;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb(h: number, s: number, l: number) {
  h /= 360; s /= 100; l /= 100;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return { r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255), g: Math.round(hue2rgb(p, q, h) * 255), b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255) };
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
  let h = 0;
  const v = mx;
  const s = mx === 0 ? 0 : (mx - mn) / mx;
  if (mx !== mn) {
    const d = mx - mn;
    if (mx === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

function rgbToCmyk(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255;
  const k = 1 - Math.max(r, g, b);
  if (k === 1) return { c: 0, m: 0, y: 0, k: 100 };
  return {
    c: Math.round(((1 - r - k) / (1 - k)) * 100),
    m: Math.round(((1 - g - k) / (1 - k)) * 100),
    y: Math.round(((1 - b - k) / (1 - k)) * 100),
    k: Math.round(k * 100),
  };
}

function cmykToRgb(c: number, m: number, y: number, k: number) {
  c /= 100; m /= 100; y /= 100; k /= 100;
  return {
    r: Math.round(255 * (1 - c) * (1 - k)),
    g: Math.round(255 * (1 - m) * (1 - k)),
    b: Math.round(255 * (1 - y) * (1 - k)),
  };
}

function detectFormat(v: string): string {
  if (/^#?[0-9a-fA-F]{3,6}$/.test(v.trim())) return 'hex';
  if (/^rgb\s*\(/.test(v.trim()) || /^\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}$/.test(v.trim())) return 'rgb';
  if (/^hsl\s*\(/.test(v.trim())) return 'hsl';
  if (/^hsv\s*\(/.test(v.trim())) return 'hsv';
  if (/^cmyk\s*\(/.test(v.trim())) return 'cmyk';
  if (NAMED_COLORS[v.trim().toLowerCase()]) return 'named';
  return 'hex';
}

function parseInput(v: string, fmt: string): { r: number; g: number; b: number } | null {
  const s = v.trim();
  if (fmt === 'hex') return hexToRgb(s);
  if (fmt === 'named') {
    const h = NAMED_COLORS[s.toLowerCase()];
    return h ? hexToRgb(h) : null;
  }
  if (fmt === 'rgb') {
    const nums = s.replace(/^rgb\s*\(|\)$/gi, '').split(',').map(x => parseInt(x.trim(), 10));
    if (nums.length === 3 && nums.every(n => !isNaN(n) && n >= 0 && n <= 255)) return { r: nums[0], g: nums[1], b: nums[2] };
    return null;
  }
  if (fmt === 'hsl') {
    const nums = s.replace(/^hsl\s*\(|\)|%/gi, '').split(',').map(x => parseFloat(x.trim()));
    if (nums.length === 3 && nums.every(n => !isNaN(n))) return hslToRgb(nums[0], nums[1], nums[2]);
    return null;
  }
  if (fmt === 'hsv') {
    const nums = s.replace(/^hsv\s*\(|\)|%/gi, '').split(',').map(x => parseFloat(x.trim()));
    if (nums.length !== 3 || nums.some(n => isNaN(n))) return null;
    const { h, s: sv, v } = { h: nums[0], s: nums[1] / 100, v: nums[2] / 100 };
    const c = v * sv;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
  }
  if (fmt === 'cmyk') {
    const nums = s.replace(/^cmyk\s*\(|\)/gi, '').split(',').map(x => parseFloat(x.trim()));
    if (nums.length === 4 && nums.every(n => !isNaN(n))) return cmykToRgb(nums[0], nums[1], nums[2], nums[3]);
    return null;
  }
  return null;
}

interface ColorResult {
  hex: string;
  rgb: string;
  hsl: string;
  hsv: string;
  cmyk: string;
}

function computeResults(r: number, g: number, b: number): ColorResult {
  const hex = '#' + rgbToHex(r, g, b).toLowerCase();
  const hsl = rgbToHsl(r, g, b);
  const hsv = rgbToHsv(r, g, b);
  const cmyk = rgbToCmyk(r, g, b);
  return {
    hex,
    rgb: `rgb(${r}, ${g}, ${b})`,
    hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
    hsv: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)`,
    cmyk: `cmyk(${cmyk.c}, ${cmyk.m}, ${cmyk.y}, ${cmyk.k})`,
  };
}

export default function ColorConverter() {
  const [inputValue, setInputValue] = useState('#3B82F6');
  const [inputFormat, setInputFormat] = useState('hex');
  const [results, setResults] = useState<ColorResult>(computeResults(59, 130, 246));
  const [colorHistory, setColorHistory] = useState<string[]>(['#3B82F6']);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const blobUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    };
  }, []);

  const handleInputChange = (val: string) => {
    setInputValue(val);
    const fmt = detectFormat(val);
    setInputFormat(fmt);
    const rgb = parseInput(val, fmt);
    if (rgb) {
      setError('');
      const res = computeResults(rgb.r, rgb.g, rgb.b);
      setResults(res);
    } else if (val.trim()) {
      setError('Unable to parse color');
    }
  };

  const handleFormatSelect = (fmt: string) => {
    setInputFormat(fmt);
    const rgb = parseInput(inputValue, fmt);
    if (rgb) {
      setError('');
      setResults(computeResults(rgb.r, rgb.g, rgb.b));
    }
  };

  const addToHistory = (hex: string) => {
    setColorHistory(prev => {
      const next = [hex, ...prev.filter(h => h !== hex)].slice(0, HISTORY_MAX);
      return next;
    });
  };

  const handlePickerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setInputValue(hex);
    setInputFormat('hex');
    const rgb = hexToRgb(hex);
    if (rgb) {
      setError('');
      const res = computeResults(rgb.r, rgb.g, rgb.b);
      setResults(res);
      addToHistory(hex);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await clipboardWrite(text);
      toast.success(`${label} copied!`);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    try {
      const blob = await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/png'));
      if (!blob) { toast.error('Failed to generate image'); return; }
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;
      await downloadOrShare(url, 'color-swatch.png');
    } catch {
      toast.error('Download failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHistorySelect = (hex: string) => {
    setInputValue(hex);
    setInputFormat('hex');
    const rgb = hexToRgb(hex);
    if (rgb) {
      setError('');
      setResults(computeResults(rgb.r, rgb.g, rgb.b));
    }
  };

  const handleClearHistory = () => {
    setColorHistory([]);
    toast.success('History cleared');
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = results.hex;
    ctx.fillRect(0, 0, 200, 80);
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.fillText(results.hex, 8, 16);
  }, [results.hex]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-2xl text-blue-400 text-sm space-y-1">
        <h4 className="font-bold text-zinc-900 dark:text-white">Color Converter</h4>
        <p className="text-zinc-600 dark:text-zinc-400">Convert between Hex, RGB, HSL, HSV, CMYK, and named colors in real-time.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4">
          <div className="w-full h-44 rounded-xl border border-zinc-300 dark:border-zinc-800 shadow-inner transition-colors duration-200" style={{ backgroundColor: results.hex }} />
          <input type="color" value={results.hex} onChange={handlePickerChange} className="w-10 h-10 rounded cursor-pointer border border-zinc-300 dark:border-zinc-700" />
          <div className="text-center">
            <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Preview</span>
            <span className="text-lg font-mono text-zinc-900 dark:text-white">{results.hex}</span>
          </div>
          <button onClick={handleDownload} className="mt-2 text-xs text-blue-500 hover:text-blue-400 font-bold">Download Swatch</button>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl p-6 md:col-span-2 space-y-4">
          <div className="flex items-center gap-3 border-b border-zinc-200 dark:border-white/5 pb-3">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Input</h4>
            <select value={inputFormat} onChange={e => handleFormatSelect(e.target.value)} className="text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 outline-none">
              <option value="hex">Hex</option>
              <option value="rgb">RGB</option>
              <option value="hsl">HSL</option>
              <option value="hsv">HSV</option>
              <option value="cmyk">CMYK</option>
              <option value="named">Named</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">Color Value</label>
            <input type="text" value={inputValue} onChange={e => handleInputChange(e.target.value)} placeholder="#3B82F6, rgb(59,130,246), hsl(217,91%,60%)..." className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 font-mono text-sm text-zinc-900 dark:text-white outline-none" />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['hex', 'rgb', 'hsl', 'hsv', 'cmyk'] as const).map(key => (
              <div key={key} className="space-y-1">
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">{key.toUpperCase()}</label>
                <div className="flex items-center bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 font-mono text-sm">
                  <span className="flex-1 text-zinc-900 dark:text-white truncate">{(results as any)[key]}</span>
                  <button onClick={() => handleCopy((results as any)[key], key.toUpperCase())} className="text-xs text-blue-500 hover:text-blue-400 font-bold ml-2 shrink-0">Copy</button>
                </div>
              </div>
            ))}
          </div>

          {colorHistory.length > 0 && (
            <div className="pt-3 border-t border-zinc-200 dark:border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">History (last {HISTORY_MAX})</span>
                <button onClick={handleClearHistory} className="text-xs text-red-400 hover:text-red-300">Clear</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {colorHistory.map((h, i) => (
                  <button key={i} onClick={() => handleHistorySelect(h)} className="w-7 h-7 rounded-lg border border-zinc-300 dark:border-zinc-700 cursor-pointer hover:scale-110 transition-transform" style={{ backgroundColor: h }} title={h} />
                ))}
              </div>
            </div>
          )}

          <canvas ref={canvasRef} width={200} height={80} className="hidden" />
        </div>
      </div>
    </div>
  );
}
