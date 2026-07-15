"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileUploader } from '@/components/tools/FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

export default function BgChanger() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [bgMode, setBgMode] = useState<'color' | 'gradient' | 'image' | 'transparent'>('color');
  const [pickedColor, setPickedColor] = useState<string | null>(null);
  const [replacementColor, setReplacementColor] = useState('#10b981');
  const [gradientColors, setGradientColors] = useState({ from: '#6366f1', to: '#ec4899', direction: 90 });
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(30);
  const [smoothEdges, setSmoothEdges] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpeg' | 'webp'>('png');

  const processCanvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const bgInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const clearAll = () => {
    setSourceImage(null);
    setPickedColor(null);
    setOutputUrl(null);
    setBgImage(null);
  };

  const handleFileSelect = (_file: File, dataUrl: string) => {
    setSourceImage(dataUrl);
    setPickedColor(null);
    setOutputUrl(null);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setBgImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number) => {
    return '#' + [r, g, b].map(v => Math.round(v).toString(16).padStart(2, '0')).join('');
  };

  const handleImageClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round((e.clientX - rect.left) * (canvas.width / rect.width));
    const y = Math.round((e.clientY - rect.top) * (canvas.height / rect.height));
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
    setPickedColor(hex);
    toast.success(`Sampled color: ${hex}`);
  };

  const autoDetectBackground = () => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    if (w === 0 || h === 0) return;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;
    const sampleStep = Math.max(1, Math.floor(Math.min(w, h) / 40));
    const edgeColors: { r: number; g: number; b: number }[] = [];

    for (let x = 0; x < w; x += sampleStep) {
      for (const y of [0, h - 1]) {
        const idx = (y * w + x) * 4;
        edgeColors.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }
    for (let y = 0; y < h; y += sampleStep) {
      for (const x of [0, w - 1]) {
        const idx = (y * w + x) * 4;
        edgeColors.push({ r: data[idx], g: data[idx + 1], b: data[idx + 2] });
      }
    }

    const buckets = new Map<string, { sumR: number; sumG: number; sumB: number; count: number }>();
    for (const c of edgeColors) {
      const key = `${Math.round(c.r / 32)},${Math.round(c.g / 32)},${Math.round(c.b / 32)}`;
      const bkt = buckets.get(key) || { sumR: 0, sumG: 0, sumB: 0, count: 0 };
      bkt.sumR += c.r;
      bkt.sumG += c.g;
      bkt.sumB += c.b;
      bkt.count++;
      buckets.set(key, bkt);
    }

    let bestKey = '';
    let bestCount = 0;
    for (const [key, bkt] of buckets) {
      if (bkt.count > bestCount) {
        bestCount = bkt.count;
        bestKey = key;
      }
    }

    if (!bestKey) return;
    const bkt = buckets.get(bestKey)!;
    const r = Math.round(bkt.sumR / bkt.count);
    const g = Math.round(bkt.sumG / bkt.count);
    const b = Math.round(bkt.sumB / bkt.count);
    const hex = rgbToHex(r, g, b);
    setPickedColor(hex);
    toast.success(`Auto-detected: ${hex}`);
  };

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  };

  const processImage = async () => {
    if (!sourceImage) {
      toast.error('Upload an image first');
      return;
    }
    if (!pickedColor) {
      toast.error('Click on the background color in the preview or use auto-detect');
      return;
    }
    setIsProcessing(true);
    try {
      const img = await loadImage(sourceImage);
      const canvas = processCanvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const { r: pr, g: pg, b: pb } = hexToRgb(pickedColor);
      const maxDist = Math.sqrt(255 * 255 * 3);
      const threshold = (tolerance / 100) * maxDist;

      for (let i = 0; i < data.length; i += 4) {
        const dr = data[i] - pr;
        const dg = data[i + 1] - pg;
        const db = data[i + 2] - pb;
        const dist = Math.sqrt(dr * dr + dg * dg + db * db);

        if (dist < threshold) {
          if (smoothEdges) {
            const ratio = dist / threshold;
            if (ratio > 0.6) {
              data[i + 3] = Math.round((1 - (ratio - 0.6) / 0.4) * 255);
            } else {
              data[i + 3] = 0;
            }
          } else {
            data[i + 3] = 0;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const outCanvas = document.createElement('canvas');
      outCanvas.width = canvas.width;
      outCanvas.height = canvas.height;
      const outCtx = outCanvas.getContext('2d')!;

      if (bgMode === 'color') {
        outCtx.fillStyle = replacementColor;
        outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);
      } else if (bgMode === 'gradient') {
        const rad = (gradientColors.direction * Math.PI) / 180;
        const w = outCanvas.width;
        const h = outCanvas.height;
        const len = Math.sqrt(w * w + h * h) / 2;
        const cx = w / 2 + Math.cos(rad) * len;
        const cy = h / 2 + Math.sin(rad) * len;
        const grad = outCtx.createLinearGradient(
          w / 2 - Math.cos(rad) * len,
          h / 2 - Math.sin(rad) * len,
          cx, cy
        );
        grad.addColorStop(0, gradientColors.from);
        grad.addColorStop(1, gradientColors.to);
        outCtx.fillStyle = grad;
        outCtx.fillRect(0, 0, outCanvas.width, outCanvas.height);
      } else if (bgMode === 'image' && bgImage) {
        const bgImg = await loadImage(bgImage);
        outCtx.drawImage(bgImg, 0, 0, outCanvas.width, outCanvas.height);
      }

      outCtx.drawImage(canvas, 0, 0);

      const mimeType = outputFormat === 'jpeg' ? 'image/jpeg' : `image/${outputFormat}`;
      const dataUrl = outCanvas.toDataURL(mimeType, 0.92);
      const blob = await (await fetch(dataUrl)).blob();
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success('Background replaced!');
    } catch (e: any) {
      toast.error(e.message || 'Processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const drawForPick = useCallback(() => {
    if (!sourceImage || !displayCanvasRef.current) return;
    const img = new Image();
    img.onload = () => {
      const canvas = displayCanvasRef.current!;
      const maxDim = 400;
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = sourceImage;
  }, [sourceImage]);

  useEffect(() => {
    drawForPick();
  }, [drawForPick]);

  const downloadOutput = () => {
    if (!outputUrl) return;
    const ext = outputFormat === 'jpeg' ? 'jpg' : outputFormat;
    downloadOrShare(outputUrl, `bg_changed.${ext}`);
  };

  if (!sourceImage) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>How it works:</strong> Upload your image, then click on the background color to sample it. The tool removes matching pixels and lets you replace the background with a color, gradient, or another image. Best results with solid-color backgrounds.
        </div>
        <FileUploader
          accept="image/jpeg,image/png"
          onFileSelect={handleFileSelect}
          title="Upload Image"
          subtitle="JPG or PNG — solid backgrounds work best"
        />
      </div>
    );
  }

  const gradientPreviewStyle = {
    background: `linear-gradient(${gradientColors.direction}deg, ${gradientColors.from}, ${gradientColors.to})`,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-600 dark:text-amber-400 text-sm">
        <strong>How it works:</strong> This tool uses color-based detection. Click on the background color in the preview to sample which color to remove, then choose a replacement. For solid backgrounds, try the auto-detect button below.
      </div>

      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">Background Changer</h3>
        </div>
        <button onClick={clearAll} className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg transition-colors">
          Change Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-zinc-900 dark:text-white font-medium border-b border-zinc-100 dark:border-zinc-800 pb-2">Settings</h4>

          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Background type</label>
            <div className="grid grid-cols-4 gap-2">
              {(['color', 'gradient', 'image', 'transparent'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => {
                    setBgMode(mode);
                    if (mode === 'transparent') setOutputFormat('png');
                  }}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold transition-all border ${
                    bgMode === mode
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-300'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {bgMode === 'color' && (
            <div className="space-y-2">
              <label className="text-xs text-zinc-500">Replacement color</label>
              <div className="flex items-center gap-3">
                <input type="color" value={replacementColor} onChange={e => setReplacementColor(e.target.value)}
                  className="w-12 h-12 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer shrink-0" />
                <span className="text-xs font-mono text-zinc-500">{replacementColor}</span>
              </div>
            </div>
          )}

          {bgMode === 'gradient' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">From</label>
                  <input type="color" value={gradientColors.from}
                    onChange={e => setGradientColors(p => ({ ...p, from: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500">To</label>
                  <input type="color" value={gradientColors.to}
                    onChange={e => setGradientColors(p => ({ ...p, to: e.target.value }))}
                    className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer" />
                </div>
              </div>
              <div className="h-8 rounded-lg border border-zinc-200 dark:border-zinc-700" style={gradientPreviewStyle} />
              <div className="space-y-1">
                <label className="text-xs text-zinc-500 flex justify-between">
                  <span>Direction</span>
                  <span className="font-mono">{gradientColors.direction}°</span>
                </label>
                <input type="range" min={0} max={360} value={gradientColors.direction}
                  onChange={e => setGradientColors(p => ({ ...p, direction: Number(e.target.value) }))}
                  className="w-full accent-blue-500" />
              </div>
            </div>
          )}

          {bgMode === 'image' && (
            <div className="space-y-2">
              <label className="text-xs text-zinc-500">Background image</label>
              <button onClick={() => bgInputRef.current?.click()}
                className="w-full py-8 px-4 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-sm text-zinc-500 hover:border-blue-400 transition-colors flex flex-col items-center gap-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {bgImage ? 'Change background image' : 'Upload a background image'}
              </button>
              <input ref={bgInputRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
              {bgImage && (
                <div className="flex items-center gap-2 p-2 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <img src={bgImage} alt="bg" className="w-8 h-8 rounded object-cover" />
                  <span className="text-[10px] text-zinc-500 truncate">Background image loaded</span>
                  <button onClick={() => setBgImage(null)} className="ml-auto text-[10px] text-red-500 hover:text-red-400">Remove</button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-500">Color detection</label>
              <button onClick={autoDetectBackground}
                className="text-[10px] font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Auto-detect from edges
              </button>
            </div>
            {pickedColor ? (
              <div className="flex items-center gap-3 p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <div className="w-8 h-8 rounded-lg border-2 border-zinc-300 shrink-0" style={{ backgroundColor: pickedColor }} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">Sampled background</p>
                  <p className="text-xs font-mono text-zinc-500">{pickedColor}</p>
                </div>
                <button onClick={() => setPickedColor(null)}
                  className="text-xs text-red-500 hover:text-red-400 font-medium shrink-0">Reset</button>
              </div>
            ) : (
              <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                <p className="text-xs text-zinc-400">Click on the image preview or use auto-detect</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs text-zinc-500 flex justify-between">
              <span>Tolerance</span>
              <span className="font-mono">{tolerance}%</span>
            </label>
            <input type="range" min={0} max={100} value={tolerance}
              onChange={e => setTolerance(Number(e.target.value))}
              className="w-full accent-blue-500" />
            <p className="text-[10px] text-zinc-400">Higher values remove a wider range of similar colors</p>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs text-zinc-500">Edge smoothing</span>
              <p className="text-[10px] text-zinc-400">Soften transition at removal boundaries</p>
            </div>
            <input type="checkbox" checked={smoothEdges} onChange={e => setSmoothEdges(e.target.checked)}
              className="rounded border-zinc-300 text-blue-600 focus:ring-blue-500" />
          </label>

          <div className="space-y-2">
            <label className="text-xs text-zinc-500">Output format</label>
            <div className="grid grid-cols-3 gap-2">
              {(['png', 'jpeg', 'webp'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setOutputFormat(fmt)}
                  disabled={bgMode === 'transparent' && fmt !== 'png'}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    outputFormat === fmt
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                      : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  } disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={processImage}
            disabled={isProcessing || !pickedColor}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            {isProcessing ? (
              <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Processing...</>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            )}
            {isProcessing ? 'Processing...' : 'Replace Background'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
            <h4 className="text-zinc-900 dark:text-white font-medium border-b border-zinc-100 dark:border-zinc-800 pb-2">Preview</h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-medium text-zinc-400 mb-2 text-center uppercase tracking-wider">Original</p>
                <div className="relative">
                  <canvas
                    ref={displayCanvasRef}
                    onClick={handleImageClick}
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-crosshair bg-zinc-50 dark:bg-zinc-800"
                  />
                  <div className="absolute bottom-1 left-1 bg-black/60 text-[8px] text-white px-1.5 py-0.5 rounded">
                    Click to sample
                  </div>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-medium text-zinc-400 mb-2 text-center uppercase tracking-wider">Result</p>
                {outputUrl ? (
                  <img src={outputUrl} alt="Result"
                    className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800"
                  />
                ) : (
                  <div className="w-full rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 flex flex-col items-center justify-center gap-2"
                    style={{ aspectRatio: '1 / 1' }}>
                    <svg className="w-8 h-8 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="text-xs text-zinc-400 text-center px-2">Sample a color and click replace</p>
                  </div>
                )}
              </div>
            </div>

            {outputUrl && (
              <button onClick={downloadOutput}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download {outputFormat.toUpperCase()}
              </button>
            )}
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl">
            <h5 className="text-[10px] font-bold text-zinc-500 uppercase mb-2">Tips</h5>
            <ul className="text-[10px] text-zinc-500 space-y-1 list-disc list-inside">
              <li>Click on the background color in the preview image to sample it</li>
              <li>Use auto-detect for solid, uniform backgrounds</li>
              <li>Increase tolerance to remove colors similar to the sampled color</li>
              <li>Enable edge smoothing for softer transitions</li>
              <li>For complex backgrounds, consider using a dedicated background removal tool</li>
            </ul>
          </div>
        </div>
      </div>

      <canvas ref={processCanvasRef} className="hidden" />
    </div>
  );
}
