"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../../FileUploader';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { createDownloadBlob } from '@/utils/blob';
import { useFFmpeg } from '@/hooks/useFFmpeg';

type FilterVal = boolean | { enabled: boolean; [k: string]: boolean | number };

interface Filters {
  grayscale: boolean;
  sepia: boolean;
  negative: boolean;
  vintage: boolean;
  cool: boolean;
  warm: boolean;
  pixelate: { enabled: boolean; blockSize: number };
  edgeDetect: boolean;
  emboss: boolean;
  oilPaint: { enabled: boolean; size: number };
  cartoon: boolean;
  gaussianBlur: { enabled: boolean; radius: number };
  motionBlur: boolean;
  radial: boolean;
  vignette: { enabled: boolean; intensity: number };
  brightness: { enabled: boolean; value: number };
  contrast: { enabled: boolean; value: number };
  saturation: { enabled: boolean; value: number };
}

const D: Filters = {
  grayscale: false, sepia: false, negative: false, vintage: false, cool: false, warm: false,
  pixelate: { enabled: false, blockSize: 10 },
  edgeDetect: false, emboss: false,
  oilPaint: { enabled: false, size: 3 },
  cartoon: false,
  gaussianBlur: { enabled: false, radius: 2 },
  motionBlur: false, radial: false,
  vignette: { enabled: false, intensity: 50 },
  brightness: { enabled: false, value: 0 },
  contrast: { enabled: false, value: 1 },
  saturation: { enabled: false, value: 1 },
};

function filterStr(f: Filters): string {
  const p: string[] = [];
  if (f.grayscale) p.push('colorchannelmixer=.3:.4:.3:0:.3:.4:.3:0:.3:.4:.3');
  if (f.sepia) p.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
  if (f.negative) p.push('negate');
  if (f.vintage) p.push('curves=vintage');
  if (f.cool) p.push('colortemperature=4500');
  if (f.warm) p.push('colortemperature=6500');
  if (f.pixelate.enabled) p.push(`pixelate=block_size=${f.pixelate.blockSize}`);
  if (f.edgeDetect) p.push('edgedetect=mode=colormix:high=0.5');
  if (f.emboss) p.push('emboss');
  if (f.oilPaint.enabled) p.push(`oil=${f.oilPaint.size}`);
  if (f.cartoon) p.push('edgedetect=mode=canny:low=0.2:high=0.4');
  if (f.gaussianBlur.enabled) p.push(`boxblur=lr=${f.gaussianBlur.radius}:lp=1`);
  if (f.motionBlur) p.push('tmix=frames=3');
  if (f.radial) p.push('gblur=sigma=5');
  if (f.vignette.enabled) p.push(`vignette=PI*${f.vignette.intensity}/100`);
  if (f.brightness.enabled) p.push(`eq=brightness=${f.brightness.value.toFixed(2)}`);
  if (f.contrast.enabled) p.push(`eq=contrast=${f.contrast.value.toFixed(2)}`);
  if (f.saturation.enabled) p.push(`eq=saturation=${f.saturation.value.toFixed(2)}`);
  return p.join(',');
}

const CATEGORIES: { label: string; key: string; filters: { key: string; label: string; hasParam?: boolean; paramLabel?: string; paramMin?: number; paramMax?: number; paramStep?: number }[] }[] = [
  {
    label: 'Color', key: 'color',
    filters: [
      { key: 'grayscale', label: 'Grayscale' },
      { key: 'sepia', label: 'Sepia' },
      { key: 'negative', label: 'Negative' },
      { key: 'vintage', label: 'Vintage' },
      { key: 'cool', label: 'Cool' },
      { key: 'warm', label: 'Warm' },
    ],
  },
  {
    label: 'Artistic', key: 'artistic',
    filters: [
      { key: 'pixelate', label: 'Pixelate', hasParam: true, paramLabel: 'Block Size', paramMin: 2, paramMax: 50, paramStep: 1 },
      { key: 'edgeDetect', label: 'Edge Detect' },
      { key: 'emboss', label: 'Emboss' },
      { key: 'oilPaint', label: 'Oil Paint', hasParam: true, paramLabel: 'Size', paramMin: 1, paramMax: 5, paramStep: 1 },
      { key: 'cartoon', label: 'Cartoon' },
    ],
  },
  {
    label: 'Blur', key: 'blur',
    filters: [
      { key: 'gaussianBlur', label: 'Gaussian', hasParam: true, paramLabel: 'Radius', paramMin: 1, paramMax: 20, paramStep: 1 },
      { key: 'motionBlur', label: 'Motion' },
      { key: 'radial', label: 'Radial' },
    ],
  },
  {
    label: 'Lighting', key: 'lighting',
    filters: [
      { key: 'vignette', label: 'Vignette', hasParam: true, paramLabel: 'Intensity', paramMin: 10, paramMax: 200, paramStep: 5 },
      { key: 'brightness', label: 'Brightness', hasParam: true, paramLabel: 'Value', paramMin: -100, paramMax: 100, paramStep: 5 },
      { key: 'contrast', label: 'Contrast', hasParam: true, paramLabel: 'Value', paramMin: 0, paramMax: 300, paramStep: 5 },
      { key: 'saturation', label: 'Saturation', hasParam: true, paramLabel: 'Value', paramMin: 0, paramMax: 300, paramStep: 5 },
    ],
  },
];

const FORMATS = ['mp4', 'webm', 'gif'] as const;

export default function VideoFilters() {
  const [file, setFile] = useState<File | null>(null);
  const [filters, setFilters] = useState<Filters>(() => ({ ...D, pixelate: { ...D.pixelate }, oilPaint: { ...D.oilPaint }, gaussianBlur: { ...D.gaussianBlur }, vignette: { ...D.vignette }, brightness: { ...D.brightness }, contrast: { ...D.contrast }, saturation: { ...D.saturation } }));
  const [outputFormat, setOutputFormat] = useState<'mp4' | 'webm' | 'gif'>('mp4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const { ffmpeg, isLoaded, loadFFmpeg, progress } = useFFmpeg();
  const thumbTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadCalled = useRef(false);

  const getVal = (k: string): FilterVal => filters[k as keyof Filters];

  const isEnabled = (k: string): boolean => {
    const v = getVal(k);
    return typeof v === 'boolean' ? v : v.enabled;
  };

  const toggle = (k: string) => {
    setFilters((prev) => {
      const v = prev[k as keyof Filters];
      if (typeof v === 'boolean') return { ...prev, [k]: !v };
      return { ...prev, [k]: { ...(v as object), enabled: !(v as { enabled: boolean }).enabled } as Filters[keyof Filters] };
    });
  };

  const setParam = (k: string, param: string, val: number) => {
    setFilters((prev) => {
      const v = prev[k as keyof Filters];
      if (typeof v === 'object') {
        return { ...prev, [k]: { ...v, [param]: val } };
      }
      return prev;
    });
  };

  const mapParam = (k: string): [string, number] => {
    const v = getVal(k) as { enabled: boolean; [k: string]: boolean | number };
    const key = k === 'pixelate' ? 'blockSize' : k === 'oilPaint' ? 'size' : k === 'gaussianBlur' ? 'radius' : k === 'vignette' ? 'intensity' : 'value';
    return [key, v[key] as number];
  };

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    };
  }, [outputUrl, thumbnailUrl]);

  useEffect(() => {
    if (!file || loadCalled.current) return;
    loadCalled.current = true;
    (async () => {
      try {
        const ff = await loadFFmpeg();
        if (!ff) return;
        const inputName = `in_${Date.now()}`;
        await ff.writeFile(inputName, await fetchFile(file));
        await ff.exec(['-i', inputName, '-vframes', '1', '-q:v', '2', 'thumb.png']);
        const data = await ff.readFile('thumb.png');
        const blob = createDownloadBlob(data, 'image/png');
        const url = URL.createObjectURL(blob);
        setThumbnailUrl(url);
        await ff.deleteFile(inputName);
        await ff.deleteFile('thumb.png');
      } catch {
        toast.error('Failed to load video.');
      }
    })();
  }, [file]);

  useEffect(() => {
    if (!file || !isLoaded) return;
    if (thumbTimer.current) clearTimeout(thumbTimer.current);
    thumbTimer.current = setTimeout(() => {
      generateThumbnail();
    }, 1000);
    return () => { if (thumbTimer.current) clearTimeout(thumbTimer.current); };
  }, [filters]);

  const generateThumbnail = async () => {
    if (!file || !ffmpeg?.loaded) return;
    try {
      const ff = ffmpeg;
      const inputName = `thumb_in_${Date.now()}`;
      const vf = filterStr(filters);
      await ff.writeFile(inputName, await fetchFile(file));
      if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
      setThumbnailUrl(null);
      const args = ['-i', inputName, '-vframes', '1', '-q:v', '2'];
      if (vf) args.push('-vf', vf);
      args.push('thumb_out.png');
      await ff.exec(args);
      const data = await ff.readFile('thumb_out.png');
      const blob = createDownloadBlob(data, 'image/png');
      const url = URL.createObjectURL(blob);
      setThumbnailUrl(url);
      await ff.deleteFile(inputName);
      await ff.deleteFile('thumb_out.png');
    } catch {
      // silent — preview is optional
    }
  };

  const processVideo = async () => {
    if (!file || !ffmpeg?.loaded) return;
    setIsProcessing(true);
    try {
      const ff = ffmpeg;
      const inputName = `proc_in_${Date.now()}`;
      const vf = filterStr(filters);
      await ff.writeFile(inputName, await fetchFile(file));

      const ext = outputFormat;
      const outputName = `output.${ext}`;
      let paletteName: string | null = null;

      const args = ['-i', inputName];
      if (vf) args.push('-vf', vf);

      if (ext === 'gif') {
        paletteName = `palette_${Date.now()}.png`;
        await ff.exec(['-i', inputName, '-vf', vf ? `${vf},fps=10,palettegen=stats_mode=diff` : 'fps=10,palettegen=stats_mode=diff', paletteName]);
        args.push('-i', paletteName, '-filter_complex', vf ? `[0:v]${vf},fps=10[x];[x][1:v]paletteuse` : 'fps=10[x];[x][1:v]paletteuse');
      }

      args.push(outputName);
      await ff.exec(args);
      const data = await ff.readFile(outputName);
      const mime = ext === 'mp4' ? 'video/mp4' : ext === 'webm' ? 'video/webm' : 'image/gif';
      const blob = createDownloadBlob(data, mime);
      const url = URL.createObjectURL(blob);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(url);

      await ff.deleteFile(inputName);
      await ff.deleteFile(outputName);
      if (paletteName) await ff.deleteFile(paletteName);

      toast.success('Filters applied!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to apply filters. Try different settings.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-violet-500/10 border border-violet-500/20 p-4 rounded-xl text-violet-400 text-sm">
          <strong>Video Filters:</strong> Apply visual effects like grayscale, sepia, pixelate, blur, vignette, and more. All processing happens in your browser.
        </div>
        <FileUploader
          accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
          onFileSelect={(f) => { setFile(f); setOutputUrl(null); setThumbnailUrl(null); }}
          title="Upload Video"
        />
      </div>
    );
  }

  const boolBtn = (k: string, label: string) => (
    <button
      key={k}
      onClick={() => toggle(k)}
      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
        isEnabled(k)
          ? 'bg-violet-600 text-white border-violet-500 shadow-md'
          : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]'
      }`}
    >
      {label}
    </button>
  );

  const paramBtn = (cfg: { key: string; label: string; hasParam?: boolean; paramLabel?: string; paramMin?: number; paramMax?: number; paramStep?: number }) => {
    const on = isEnabled(cfg.key);
    return (
      <div key={cfg.key} className="space-y-1.5">
        <button
          onClick={() => toggle(cfg.key)}
          className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all ${
            on
              ? 'bg-violet-600 text-white border-violet-500 shadow-md'
              : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]'
          }`}
        >
          {cfg.label}
        </button>
        {on && cfg.hasParam && (() => {
          const [pk, pv] = mapParam(cfg.key);
          const mn = cfg.paramMin ?? 0;
          const mx = cfg.paramMax ?? 100;
          const displayVal = cfg.key === 'brightness' ? Math.round(((pv as number) + 1) * 50) : cfg.key === 'contrast' || cfg.key === 'saturation' ? Math.round((pv as number) * 100) : pv;
          const actualVal = (v: number) => {
            if (cfg.key === 'brightness') return v / 50 - 1;
            if (cfg.key === 'contrast' || cfg.key === 'saturation') return v / 100;
            return v;
          };
          return (
            <div className="flex items-center gap-2">
              <input
                type="range"
                min={cfg.key === 'brightness' || cfg.key === 'contrast' || cfg.key === 'saturation' ? 0 : mn}
                max={cfg.key === 'brightness' ? 200 : cfg.key === 'contrast' || cfg.key === 'saturation' ? 300 : mx}
                step={cfg.paramStep ?? 1}
                value={displayVal}
                onChange={(e) => setParam(cfg.key, pk, actualVal(Number(e.target.value)))}
                className="flex-1 h-1 accent-violet-600"
              />
              <span className="text-[10px] font-mono text-[var(--text-secondary)] w-8 text-right">{displayVal}</span>
            </div>
          );
        })()}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          onClick={() => { setFile(null); setOutputUrl(null); setThumbnailUrl(null); setFilters({ ...D, pixelate: { ...D.pixelate }, oilPaint: { ...D.oilPaint }, gaussianBlur: { ...D.gaussianBlur }, vignette: { ...D.vignette }, brightness: { ...D.brightness }, contrast: { ...D.contrast }, saturation: { ...D.saturation } }); loadCalled.current = false; }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change Video
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl flex items-center justify-center min-h-[250px]">
            {thumbnailUrl ? (
              <img src={thumbnailUrl} alt="Preview" className="w-full max-h-[350px] rounded-lg object-contain" />
            ) : (
              <div className="text-[var(--text-muted)] text-sm">Generating preview...</div>
            )}
          </div>
          <button
            onClick={generateThumbnail}
            disabled={!isLoaded}
            className="w-full text-sm text-violet-600 dark:text-violet-400 border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/40 font-semibold px-4 py-2.5 rounded-xl transition-all disabled:opacity-40"
          >
            Refresh Preview
          </button>
        </div>

        <div className="space-y-5">
          {CATEGORIES.map((cat) => (
            <div key={cat.key} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl space-y-3">
              <h4 className="text-[var(--text-primary)] font-semibold text-sm">{cat.label}</h4>
              <div className="flex flex-wrap gap-2">
                {cat.filters.map((cfg) =>
                  cfg.hasParam ? paramBtn(cfg) : boolBtn(cfg.key, cfg.label)
                )}
              </div>
            </div>
          ))}

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl space-y-3">
            <h4 className="text-[var(--text-primary)] font-semibold text-sm">Output</h4>
            <div className="flex gap-2">
              {FORMATS.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setOutputFormat(fmt)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all uppercase ${
                    outputFormat === fmt
                      ? 'bg-violet-600 text-white border-violet-500 shadow-md'
                      : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
            <button
              onClick={processVideo}
              disabled={isProcessing || !isLoaded}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
            >
              {isProcessing && (
                <div className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300" style={{ width: `${progress}%` }} />
              )}
              <span className="relative z-10">
                {isProcessing ? `Applying Filters ${Math.round(progress)}%` : 'Apply Filters'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {outputUrl && (
        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 shadow-xl max-w-2xl mx-auto">
          <h4 className="text-xl font-bold text-emerald-400 mb-4 text-center">Filtered Video Ready!</h4>
          {outputFormat === 'gif' ? (
            <img src={outputUrl} alt="Filtered GIF" className="w-full max-h-[300px] rounded-lg mb-6 object-contain" />
          ) : (
            <video src={outputUrl} controls autoPlay className="w-full max-h-[300px] rounded-lg mb-6" />
          )}
          <button
            onClick={() => downloadOrShare(outputUrl, `filtered_${file.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`)}
            className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
          >
            Download
          </button>
        </div>
      )}
    </div>
  );
}
