"use client";
import React, { useRef, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

const MAX_DIMENSION = 1400;
const CHROMA_THRESHOLD = 90;

function hexToRgb(hex: string) {
  const v = parseInt(hex.replace('#', ''), 16);
  return { r: (v >> 16) & 255, g: (v >> 8) & 255, b: v & 255 };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function scaleImage(img: HTMLImageElement): { width: number; height: number } {
  let { width, height } = img;
  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }
  return { width, height };
}

function applyChromaKey(
  ctx: CanvasRenderingContext2D,
  keyR: number,
  keyG: number,
  keyB: number,
  threshold: number,
) {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const dr = data[i] - keyR;
    const dg = data[i + 1] - keyG;
    const db = data[i + 2] - keyB;
    const dist = Math.sqrt(dr * dr + dg * dg + db * db);
    if (dist < threshold) {
      data[i + 3] = 0;
    } else if (dist < threshold * 1.8) {
      data[i + 3] = Math.round(((dist - threshold) / (threshold * 0.8)) * 255);
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

function drawGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  dir: string,
  c1: string,
  c2: string,
) {
  let gradient: CanvasGradient;
  if (dir === 'radial') {
    gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) / 2);
  } else if (dir === 'horizontal') {
    gradient = ctx.createLinearGradient(0, 0, w, 0);
  } else {
    gradient = ctx.createLinearGradient(0, 0, 0, h);
  }
  gradient.addColorStop(0, c1);
  gradient.addColorStop(1, c2);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, w, h);
}

interface UploadZoneProps {
  label: string;
  onFile: (file: File) => void;
  currentSrc?: string;
  accept?: string;
}

function UploadZone({ label, onFile, currentSrc, accept }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) onFile(file);
      else toast.error('Please drop an image file');
    },
    [onFile],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${
        dragging
          ? 'border-blue-400 bg-blue-50'
          : currentSrc
            ? 'border-green-300 bg-green-50/30'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
      }`}
    >
      {currentSrc ? (
        <div className="flex flex-col items-center gap-2">
          <img src={currentSrc} alt="" className="max-h-32 max-w-full rounded-lg object-contain shadow-sm" />
          <span className="text-xs text-green-700">Uploaded</span>
        </div>
      ) : (
        <>
          <svg className="mb-2 h-10 w-10 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p className="text-sm text-gray-600">{label}</p>
          <p className="mt-1 text-xs text-gray-400">Click or drag & drop</p>
        </>
      )}
      <input ref={inputRef} type="file" accept={accept || 'image/*'} className="hidden" onChange={handleChange} />
    </div>
  );
}

export default function BgChanger() {
  const [fgDataUrl, setFgDataUrl] = useState<string | null>(null);
  const [bgDataUrl, setBgDataUrl] = useState<string | null>(null);
  const [bgType, setBgType] = useState<'color' | 'gradient' | 'image'>('color');
  const [solidColor, setSolidColor] = useState('#4A90D9');
  const [gradDir, setGradDir] = useState<'horizontal' | 'vertical' | 'radial'>('horizontal');
  const [gradColor1, setGradColor1] = useState('#667eea');
  const [gradColor2, setGradColor2] = useState('#764ba2');
  const [chromaColor, setChromaColor] = useState('#00b140');
  const [threshold, setThreshold] = useState(CHROMA_THRESHOLD);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<'png' | 'jpeg'>('png');
  const [processing, setProcessing] = useState(false);

  const previewRef = useRef<HTMLCanvasElement>(null);
  const offRef = useRef<HTMLCanvasElement>(null);

  const handleFgFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setFgDataUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleBgFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setBgDataUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const reset = useCallback(() => {
    setFgDataUrl(null);
    setBgDataUrl(null);
    setBgType('color');
    setSolidColor('#4A90D9');
    setGradDir('horizontal');
    setGradColor1('#667eea');
    setGradColor2('#764ba2');
    setChromaColor('#00b140');
    setThreshold(CHROMA_THRESHOLD);
    setResultUrl(null);
    setFormat('png');
  }, []);

  const process = useCallback(async () => {
    if (!fgDataUrl) return;
    setProcessing(true);
    try {
      const fgImg = await loadImage(fgDataUrl);
      const dims = scaleImage(fgImg);
      const w = dims.width;
      const h = dims.height;

      const offCanvas = offRef.current!;
      offCanvas.width = w;
      offCanvas.height = h;
      const offCtx = offCanvas.getContext('2d')!;

      offCtx.drawImage(fgImg, 0, 0, w, h);

      const key = hexToRgb(chromaColor);
      applyChromaKey(offCtx, key.r, key.g, key.b, threshold);

      const bgCanvas = document.createElement('canvas');
      bgCanvas.width = w;
      bgCanvas.height = h;
      const bgCtx = bgCanvas.getContext('2d')!;

      if (bgType === 'color') {
        bgCtx.fillStyle = solidColor;
        bgCtx.fillRect(0, 0, w, h);
      } else if (bgType === 'gradient') {
        drawGradient(bgCtx, w, h, gradDir, gradColor1, gradColor2);
      } else if (bgType === 'image' && bgDataUrl) {
        const bgImg = await loadImage(bgDataUrl);
        bgCtx.drawImage(bgImg, 0, 0, w, h);
      } else if (bgType === 'image') {
        bgCtx.fillStyle = '#ffffff';
        bgCtx.fillRect(0, 0, w, h);
      }

      bgCtx.drawImage(offCanvas, 0, 0);

      const url = bgCanvas.toDataURL('image/png');
      setResultUrl(url);

      const preview = previewRef.current;
      if (preview) {
        preview.width = w;
        preview.height = h;
        const pCtx = preview.getContext('2d')!;
        pCtx.drawImage(bgCanvas, 0, 0);
      }
    } catch {
      toast.error('Failed to process image');
    }
    setProcessing(false);
  }, [fgDataUrl, bgDataUrl, bgType, solidColor, gradDir, gradColor1, gradColor2, chromaColor, threshold]);

  useEffect(() => {
    if (fgDataUrl) process();
  }, [process, fgDataUrl]);

  const handleDownload = useCallback(() => {
    if (!resultUrl) return;
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      if (format === 'jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const link = document.createElement('a');
      link.download = `bg-changed.${format === 'jpeg' ? 'jpg' : 'png'}`;
      link.href = canvas.toDataURL(`image/${format === 'jpeg' ? 'jpeg' : 'png'}`);
      link.click();
      toast.success('Image downloaded');
    };
    img.src = resultUrl;
  }, [resultUrl, format]);

  const btnClass =
    'rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <canvas ref={offRef} className="hidden" />

      <div className="grid gap-6 md:grid-cols-2">
        <UploadZone label="Upload foreground image" onFile={handleFgFile} currentSrc={fgDataUrl || undefined} />
        {bgType === 'image' && (
          <UploadZone label="Upload background image" onFile={handleBgFile} currentSrc={bgDataUrl || undefined} />
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Background Settings</h3>

        <div className="flex flex-wrap gap-2">
          {(['color', 'gradient', 'image'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setBgType(t)}
              className={`${btnClass} ${
                bgType === t ? 'bg-blue-600 text-white shadow-sm' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t === 'color' ? 'Solid Color' : t === 'gradient' ? 'Gradient' : 'Image'}
            </button>
          ))}
        </div>

        {bgType === 'color' && (
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600">Color:</label>
            <input
              type="color"
              value={solidColor}
              onChange={(e) => setSolidColor(e.target.value)}
              className="h-10 w-16 cursor-pointer rounded border"
            />
            <span className="text-xs text-gray-500 font-mono">{solidColor}</span>
          </div>
        )}

        {bgType === 'gradient' && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(['horizontal', 'vertical', 'radial'] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setGradDir(d)}
                  className={`${btnClass} ${
                    gradDir === d
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">Stop 1:</label>
                <input type="color" value={gradColor1} onChange={(e) => setGradColor1(e.target.value)} className="h-9 w-14 cursor-pointer rounded border" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs text-gray-600">Stop 2:</label>
                <input type="color" value={gradColor2} onChange={(e) => setGradColor2(e.target.value)} className="h-9 w-14 cursor-pointer rounded border" />
              </div>
            </div>
            <div
              className="h-10 w-full rounded-lg border"
              style={{ background: `linear-gradient(${gradDir === 'horizontal' ? 'to right' : gradDir === 'vertical' ? 'to bottom' : ''}, ${gradColor1}, ${gradColor2})` }}
            />
          </div>
        )}

        <div className="border-t border-gray-100 pt-4 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Chroma-key Settings</h4>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Key color:</label>
              <input type="color" value={chromaColor} onChange={(e) => setChromaColor(e.target.value)} className="h-9 w-14 cursor-pointer rounded border" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-600">Threshold: {threshold}</label>
              <input
                type="range"
                min={10}
                max={250}
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-28"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800">Preview</h3>
        <div className="flex items-center justify-center rounded-lg bg-gray-50 p-4 min-h-[260px]">
          {resultUrl ? (
            <canvas
              ref={previewRef}
              className="max-w-full max-h-[500px] rounded-lg shadow-md object-contain"
            />
          ) : (
            <p className="text-sm text-gray-400">Upload a foreground image to see preview</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={reset}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>

        <div className="flex items-center gap-3">
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as 'png' | 'jpeg')}
            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
          >
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
          <button
            onClick={handleDownload}
            disabled={!resultUrl || processing}
            className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {processing ? 'Processing…' : 'Download'}
          </button>
        </div>
      </div>
    </div>
  );
}