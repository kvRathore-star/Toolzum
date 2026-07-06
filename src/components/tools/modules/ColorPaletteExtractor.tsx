"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Download, Palette, Copy, Check, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface ColorInfo {
  hex: string;
  rgb: { r: number; g: number; b: number };
  hsl: { h: number; s: number; l: number };
  weight: number;
  name: string;
}

const COLOR_NAMES: Record<string, string> = {
  'ff0000': 'Red', '00ff00': 'Green', '0000ff': 'Blue', 'ffff00': 'Yellow',
  'ff00ff': 'Magenta', '00ffff': 'Cyan', '000000': 'Black', 'ffffff': 'White',
  '808080': 'Gray', 'ffa500': 'Orange', '800080': 'Purple', '008000': 'Dark Green',
  'ffc0cb': 'Pink', 'a52a2a': 'Brown', 'f0f8ff': 'Alice Blue', 'faebd7': 'Antique White',
};

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => Math.round(c).toString(16).padStart(2, '0')).join('');
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.replace('#', '');
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function getColorName(hex: string): string {
  const key = hex.replace('#', '').toLowerCase();
  return COLOR_NAMES[key] || 'Custom';
}

function extractPaletteFromCanvas(canvas: HTMLCanvasElement, colorCount: number): ColorInfo[] {
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const colorMap = new Map<string, number>();

  for (let i = 0; i < data.length; i += 16) {
    const r = Math.round(data[i] / 16) * 16;
    const g = Math.round(data[i + 1] / 16) * 16;
    const b = Math.round(data[i + 2] / 16) * 16;
    const a = data[i + 3];
    if (a < 128) continue;
    const key = `${r},${g},${b}`;
    colorMap.set(key, (colorMap.get(key) || 0) + 1);
  }

  const sorted = [...colorMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, colorCount);

  const total = sorted.reduce((s, [, c]) => s + c, 0);
  return sorted.map(([key, count]) => {
    const [r, g, b] = key.split(',').map(Number);
    const hex = rgbToHex(r, g, b);
    return {
      hex,
      rgb: { r, g, b },
      hsl: rgbToHsl(r, g, b),
      weight: Math.round((count / total) * 1000) / 10,
      name: getColorName(hex),
    };
  });
}

export default function ColorPaletteExtractor() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [palette, setPalette] = useState<ColorInfo[]>([]);
  const [colorCount, setColorCount] = useState(6);
  const [copiedHex, setCopiedHex] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const processImage = useCallback((img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const maxDim = 300;
    let w = img.naturalWidth, h = img.naturalHeight;
    if (w > maxDim || h > maxDim) {
      const ratio = Math.min(maxDim / w, maxDim / h);
      w = Math.round(w * ratio);
      h = Math.round(h * ratio);
    }
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, w, h);
    setImageUrl(canvas.toDataURL());
    const colors = extractPaletteFromCanvas(canvas, colorCount);
    setPalette(colors);
  }, [colorCount]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Please upload an image file');
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => processImage(img);
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handlePaste = () => {
    navigator.clipboard.read().then(items => {
      for (const item of items) {
        const blob = item.getType('image/png') || item.getType('image/jpeg');
        if (blob) {
          blob.then(b => {
            const img = new Image();
            img.onload = () => processImage(img);
            img.src = URL.createObjectURL(b);
          });
          return;
        }
      }
      toast.error('No image found in clipboard');
    }).catch(() => toast.error('Clipboard access denied'));
  };

  const copyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    toast.success(`Copied ${hex}`);
    setTimeout(() => setCopiedHex(''), 1500);
  };

  const exportPalette = (format: 'css' | 'scss' | 'tailwind') => {
    if (!palette.length) return;
    let output = '';
    if (format === 'css') {
      output = ':root {\n' + palette.map((c, i) => `  --color-${i + 1}: ${c.hex};`).join('\n') + '\n}';
    } else if (format === 'scss') {
      output = palette.map((c, i) => `$color-${i + 1}: ${c.hex};`).join('\n');
    } else {
      output = `// Tailwind config\ncolors: {\n` + palette.map((c, i) => `  '${c.name.toLowerCase().replace(/\s+/g, '-')}-${i + 1}': '${c.hex}',`).join('\n') + '\n}';
    }
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    downloadOrShare(url, `palette.${format === 'tailwind' ? 'js' : format}`);
    toast.success('Palette exported!');
  };

  const handleReanalyze = () => {
    if (!imageUrl) return;
    const img = new Image();
    img.onload = () => processImage(img);
    img.src = imageUrl;
  };

  const luminance = (hex: string) => {
    const { r, g, b } = hexToRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Color Palette Extractor</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Upload any image to extract its dominant colors. No uploads — everything runs locally.</p>

          <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center hover:border-purple-500/50 transition-colors cursor-pointer bg-zinc-50/50 dark:bg-black/20"
            onClick={() => fileInputRef.current?.click()}>
            {imageUrl ? (
              <img src={imageUrl} alt="Uploaded" className="max-h-40 mx-auto rounded-lg shadow-sm" />
            ) : (
              <>
                <Upload className="w-10 h-10 mx-auto mb-2 text-zinc-400" />
                <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Upload an image</p>
                <p className="text-[10px] text-zinc-500 mt-1">JPG, PNG, WebP — or paste from clipboard</p>
              </>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </div>

          <div className="flex gap-2">
            <button onClick={handlePaste} className="flex-1 py-2.5 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-500 hover:border-zinc-400 transition-colors">
              Paste from Clipboard
            </button>
            <button onClick={() => { setImageUrl(null); setPalette([]); }}
              className="py-2.5 px-4 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-500 hover:border-red-400 hover:text-red-500 transition-colors">
              Clear
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-400 uppercase">Number of Colors</label>
            <div className="flex gap-2">
              {[4, 6, 8, 10].map(n => (
                <button key={n} onClick={() => { setColorCount(n); setTimeout(handleReanalyze, 50); }}
                  className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-colors ${
                    colorCount === n
                      ? 'bg-purple-500 text-white border-purple-500'
                      : 'bg-zinc-50 dark:bg-black/30 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400'
                  }`}>
                  {n}
                </button>
              ))}
            </div>
          </div>

          {palette.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Export</span>
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => exportPalette('css')} className="flex-1 py-2 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-semibold text-zinc-500 hover:border-zinc-400 transition-colors">CSS</button>
                <button onClick={() => exportPalette('scss')} className="flex-1 py-2 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-semibold text-zinc-500 hover:border-zinc-400 transition-colors">SCSS</button>
                <button onClick={() => exportPalette('tailwind')} className="flex-1 py-2 bg-zinc-50 dark:bg-black/30 border border-zinc-200 dark:border-zinc-700 rounded-lg text-[10px] font-semibold text-zinc-500 hover:border-zinc-400 transition-colors">Tailwind</button>
              </div>
            </div>
          )}

          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800/30 rounded-xl p-3">
            <p className="text-[10px] text-purple-600 dark:text-purple-400">
              <strong>Pro:</strong> AI color naming, WCAG contrast checking, palette history, team sharing, and auto-generate full design systems from any image.
            </p>
          </div>
        </div>

        <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 shadow-xl">
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 block">Extracted Palette</span>

          {palette.length > 0 ? (
            <div className="space-y-3">
              <div className="flex h-16 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                {palette.map((c, i) => (
                  <div key={i} className="flex-1 relative group cursor-pointer" style={{ backgroundColor: c.hex }}
                    onClick={() => copyHex(c.hex)} title={c.hex}>
                    <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[9px] font-mono font-bold"
                      style={{ color: luminance(c.hex) > 0.5 ? '#000' : '#fff' }}>
                      {copiedHex === c.hex ? <Check className="w-4 h-4" /> : c.hex}
                    </span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {palette.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2.5 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-zinc-800">
                    <div className="w-8 h-8 rounded-lg border border-zinc-200 dark:border-zinc-700 shrink-0" style={{ backgroundColor: c.hex }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-zinc-800 dark:text-white truncate">{c.name || c.hex}</p>
                      <p className="text-[10px] text-zinc-500 font-mono">{c.hex} — {c.weight}%</p>
                    </div>
                    <button onClick={() => copyHex(c.hex)}
                      className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors shrink-0">
                      {copiedHex === c.hex ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-xs text-zinc-500 space-y-1 p-3 bg-zinc-50 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-zinc-800">
                {palette.slice(0, 3).map((c, i) => (
                  <div key={i} className="flex justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-sm border border-zinc-300" style={{ backgroundColor: c.hex }} />
                      {c.name} ({c.hex})
                    </span>
                    <span className="font-mono">HSL ({c.hsl.h}°, {c.hsl.s}%, {c.hsl.l}%)</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 min-h-[300px]">
              <Palette className="w-10 h-10 mb-2 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-medium">Upload an image to extract colors</p>
              <p className="text-[10px] text-zinc-500 mt-1">Extracts dominant colors using canvas pixel sampling</p>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
