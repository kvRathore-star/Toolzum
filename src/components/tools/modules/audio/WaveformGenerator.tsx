"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '@/components/tools/FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { fetchFile } from '@ffmpeg/util';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { EmptyState } from '@/components/EmptyState';

type WaveformStyle = 'bars' | 'line' | 'filled' | 'circular';

const STYLE_OPTIONS: { value: WaveformStyle; label: string }[] = [
  { value: 'bars', label: 'Bars' },
  { value: 'line', label: 'Line' },
  { value: 'filled', label: 'Filled' },
  { value: 'circular', label: 'Circular' },
];

function downsample(data: Float32Array, target: number): Float32Array {
  const result = new Float32Array(target);
  const block = data.length / target;
  for (let i = 0; i < target; i++) {
    const start = Math.floor(i * block);
    const end = Math.floor((i + 1) * block);
    let sum = 0;
    for (let j = start; j < end; j++) sum += Math.abs(data[j]);
    result[i] = (end - start) > 0 ? sum / (end - start) : 0;
  }
  let max = 0;
  for (let i = 0; i < target; i++) if (result[i] > max) max = result[i];
  if (max > 0) for (let i = 0; i < target; i++) result[i] /= max;
  return result;
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

function renderWaveform(
  ctx: CanvasRenderingContext2D,
  smp: Float32Array,
  style: WaveformStyle,
  w: number,
  h: number,
  color: string,
  bgColor: string,
  gradColor: string,
  borderRadius: number,
  mirror: boolean,
  useGradient: boolean,
  transparentBg: boolean,
) {
  const n = smp.length;
  if (n === 0) return;

  ctx.clearRect(0, 0, w, h);
  if (!transparentBg) {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
  }

  const getFill = (i: number, total: number) => {
    if (!useGradient || total < 2) return color;
    const g = ctx.createLinearGradient(0, 0, w, 0);
    g.addColorStop(0, color);
    g.addColorStop(1, gradColor);
    return g;
  };

  if (style === 'bars') {
    const count = Math.min(n, 256);
    const bw = w / count;
    const gap = Math.max(1, bw * 0.12);
    const aw = bw - gap;
    const rr = Math.min(borderRadius, aw / 2);
    for (let i = 0; i < count; i++) {
      const v = Math.abs(smp[Math.floor((i / count) * n)]);
      const bh = Math.max(1, v * h);
      ctx.fillStyle = getFill(i, count);
      if (mirror) {
        const half = Math.max(1, bh / 2);
        roundRect(ctx, i * bw + gap / 2, h / 2 - half, aw, half * 2, rr);
      } else {
        roundRect(ctx, i * bw + gap / 2, h - bh, aw, bh, rr);
      }
      ctx.fill();
    }
  } else if (style === 'line') {
    ctx.beginPath();
    for (let i = 0; i < n; i++) {
      const v = smp[i];
      if (mirror) {
        const x = (i / (n - 1)) * w;
        const y = h / 2 - v * (h / 2);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      } else {
        const x = (i / (n - 1)) * w;
        const y = h / 2 + v * (h / 2);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
    }
    ctx.strokeStyle = useGradient ? getFill(0, 1) : color;
    ctx.lineWidth = 2;
    ctx.stroke();
    if (mirror) {
      ctx.beginPath();
      for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * w;
        const y = h / 2 + Math.abs(smp[i]) * (h / 2);
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.globalAlpha = 0.3;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  } else if (style === 'filled') {
    const baseY = mirror ? h / 2 : h;
    ctx.beginPath();
    ctx.moveTo(0, baseY);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * w;
      const v = Math.abs(smp[i]);
      ctx.lineTo(x, mirror ? baseY - v * (h / 2) : baseY - v * h);
    }
    ctx.lineTo(w, baseY);
    ctx.closePath();
    ctx.fillStyle = useGradient ? getFill(0, 1) : color;
    ctx.fill();
    if (mirror) {
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      for (let i = 0; i < n; i++) {
        const x = (i / (n - 1)) * w;
        ctx.lineTo(x, h / 2 + Math.abs(smp[i]) * (h / 2));
      }
      ctx.lineTo(w, h / 2);
      ctx.closePath();
      ctx.globalAlpha = 0.25;
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  } else if (style === 'circular') {
    const count = Math.min(n, 180);
    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(cx, cy) - 24;
    const minR = maxR * 0.12;
    const rr = Math.min(borderRadius, (2 * Math.PI * maxR) / count / 4);
    ctx.save();
    ctx.translate(cx, cy);
    for (let i = 0; i < count; i++) {
      const v = Math.abs(smp[Math.floor((i / count) * n)]);
      const r1 = minR;
      const r2 = minR + v * (maxR - minR);
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      const bw = (2 * Math.PI * (r1 + r2) / 2) / count * 0.7;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = getFill(i, count);
      roundRect(ctx, -bw / 2, r1, bw, r2 - r1, rr);
      ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

export default function WaveformGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [style, setStyle] = useState<WaveformStyle>('bars');
  const [waveformColor, setWaveformColor] = useState('#6366f1');
  const [bgColor, setBgColor] = useState('#1e1e2e');
  const [gradientColor, setGradientColor] = useState('#a78bfa');
  const [width, setWidth] = useState(1200);
  const [height, setHeight] = useState(300);
  const [borderRadius, setBorderRadius] = useState(2);
  const [mirror, setMirror] = useState(false);
  const [useGradient, setUseGradient] = useState(false);
  const [transparentBg, setTransparentBg] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [hasSamples, setHasSamples] = useState(false);

  const { loadFFmpeg } = useFFmpeg();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cachedRef = useRef<Float32Array | null>(null);
  const outUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (outUrlRef.current) URL.revokeObjectURL(outUrlRef.current);
    };
  }, []);

  const updateOutput = (url: string | null) => {
    if (outUrlRef.current) URL.revokeObjectURL(outUrlRef.current);
    outUrlRef.current = url;
    setOutputUrl(url);
  };

  const draw = (samples: Float32Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    renderWaveform(ctx, samples, style, width, height, waveformColor, bgColor, gradientColor, borderRadius, mirror, useGradient, transparentBg);
    canvas.toBlob((blob) => {
      if (blob) updateOutput(URL.createObjectURL(blob));
    });
  };

  const generate = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      if (!cachedRef.current) {
        const ff = await loadFFmpeg();
        if (!ff) {
          toast.error('Failed to load FFmpeg engine.');
          return;
        }
        const inputName = `wg_${Date.now()}`;
        await ff.writeFile(inputName, await fetchFile(file));
        await ff.exec(['-i', inputName, '-ac', '1', '-ar', '22050', '-f', 'f32le', 'wg_out.raw']);
        const raw = await ff.readFile('wg_out.raw');
        const pcm = new Float32Array(raw as unknown as ArrayBufferLike);
        cachedRef.current = downsample(pcm, 2048);
        await ff.deleteFile(inputName);
        await ff.deleteFile('wg_out.raw');
        setHasSamples(true);
      }
      draw(cachedRef.current);
      toast.success('Waveform generated!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate waveform.');
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!cachedRef.current) return;
    const t = setTimeout(() => draw(cachedRef.current!), 80);
    return () => clearTimeout(t);
  }, [style, waveformColor, bgColor, gradientColor, width, height, borderRadius, mirror, useGradient, transparentBg]);

  const needsFfmpeg = !cachedRef.current;

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Waveform Generator</h3>
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-[var(--text-secondary)]">Generate beautiful waveform visualizations from any audio file. All processing happens locally.</p>

        {!file ? (
          <FileUploader
            accept="audio/*"
            onFileSelect={(f) => {
              setFile(f);
              cachedRef.current = null;
              setHasSamples(false);
              updateOutput(null);
            }}
            title="Upload Audio File"
            subtitle="MP3, WAV, FLAC, OGG, M4A and more"
          />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
              <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[70%]">{file.name}</div>
              <button onClick={() => { setFile(null); cachedRef.current = null; setHasSamples(false); updateOutput(null); }} className="text-[10px] text-red-500 hover:underline shrink-0">Remove</button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {STYLE_OPTIONS.map((opt) => (
                <button key={opt.value} onClick={() => setStyle(opt.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-semibold transition-all border ${
                    style === opt.value
                      ? 'bg-indigo-500 text-white border-indigo-500'
                      : 'bg-[var(--bg-overlay)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-zinc-300'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-[var(--text-muted)] mb-1 block">Waveform Color</label>
                <input aria-label="Waveform Color" type="color" value={waveformColor} onChange={e => setWaveformColor(e.target.value)}
                  className="w-full h-9 rounded-xl cursor-pointer bg-[var(--bg-overlay)] border border-[var(--border-subtle)]" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[var(--text-muted)] mb-1 block">Background Color</label>
                <input aria-label="Background Color" type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                  className="w-full h-9 rounded-xl cursor-pointer bg-[var(--bg-overlay)] border border-[var(--border-subtle)]" />
              </div>
              {useGradient && (
                <div>
                  <label className="text-[10px] font-semibold text-[var(--text-muted)] mb-1 block">Gradient Color</label>
                  <input aria-label="Gradient Color" type="color" value={gradientColor} onChange={e => setGradientColor(e.target.value)}
                    className="w-full h-9 rounded-xl cursor-pointer bg-[var(--bg-overlay)] border border-[var(--border-subtle)]" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-[var(--text-muted)] mb-1 block">Width: {width}px</label>
                <input type="range" min={800} max={4000} step={50} value={width} aria-label="Width" onChange={e => setWidth(Number(e.target.value))}
                  className="w-full accent-indigo-500" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-[var(--text-muted)] mb-1 block">Height: {height}px</label>
                <input type="range" min={100} max={800} step={10} value={height} aria-label="Height" onChange={e => setHeight(Number(e.target.value))}
                  className="w-full accent-indigo-500" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={useGradient} onChange={e => setUseGradient(e.target.checked)}
                  className="rounded accent-indigo-500" />
                <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Gradient</span>
              </label>
              {(style === 'bars' || style === 'circular') && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Radius: {borderRadius}px</span>
                  <input type="range" min={0} max={30} value={borderRadius} onChange={e => setBorderRadius(Number(e.target.value))}
                    className="w-20 accent-indigo-500" />
                </label>
              )}
              {(style === 'line' || style === 'filled') && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={mirror} onChange={e => setMirror(e.target.checked)}
                    className="rounded accent-indigo-500" />
                  <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Mirror</span>
                </label>
              )}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={transparentBg} onChange={e => setTransparentBg(e.target.checked)}
                  className="rounded accent-indigo-500" />
                <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Transparent BG</span>
              </label>
            </div>

            <button onClick={generate} disabled={isProcessing}
              className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:bg-zinc-300 dark:disabled:bg-zinc-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
              {isProcessing ? (
                <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" /><path fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" className="opacity-75" /></svg> Processing...</>
              ) : needsFfmpeg ? (
                'Generate Waveform'
              ) : (
                'Update Waveform'
              )}
            </button>

            {(outputUrl || hasSamples) && (
              <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-overlay)]">
                <canvas ref={canvasRef} className="w-full h-auto" style={{ maxHeight: '400px', objectFit: 'contain' }} />
              </div>
            )}

            {outputUrl ? (
              <button onClick={() => downloadOrShare(outputUrl, `waveform_${file.name.replace(/\.[^/.]+$/, '')}.png`)}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Download PNG
              </button>
            ) : (
              <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
                <EmptyState
                  title="Waveform image will appear here"
                  message="Upload audio above to visualize."
                />
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Tip:</strong> Adjust style, colors, and dimensions to match your brand. Bars work great for music visualizers, Line for podcasts, and Circular for social media covers.</p>
        </div>
      </div>
    </div>
  );
}
