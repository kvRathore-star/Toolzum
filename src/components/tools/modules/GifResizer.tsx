"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../FileUploader';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

type Interpolation = 'lanczos' | 'bilinear' | 'neighbor';

const PRESETS = [100, 150, 200, 320, 480, 640];
const INTERPOLATION_LABELS: Record<Interpolation, string> = {
  lanczos: 'Lanczos (best)',
  bilinear: 'Bilinear (fast)',
  neighbor: 'Nearest (pixel art)',
};

export default function GifResizer() {
  const [file, setFile] = useState<File | null>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [interpolation, setInterpolation] = useState<Interpolation>('lanczos');
  const [gifInfo, setGifInfo] = useState<{ width: number; height: number; frameCount: number; fileSize: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploadedUrl(url);
    const loadInfo = async () => {
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const w = bytes[6] | (bytes[7] << 8);
        const h = bytes[8] | (bytes[9] << 8);
        let frames = 0;
        let i = 13;
        const packed = bytes[10];
        if (packed & 0x80) {
          i += 3 * (1 << ((packed & 0x07) + 1));
        }
        while (i < bytes.length) {
          if (bytes[i] === 0x2C) {
            frames++;
            i += 9;
            const lctPacked = bytes[i];
            i++;
            if (lctPacked & 0x80) {
              i += 3 * (1 << ((lctPacked & 0x07) + 1));
            }
            i++;
            while (i < bytes.length && bytes[i] !== 0x00) {
              i += 1 + bytes[i];
            }
            i++;
          } else if (bytes[i] === 0x21) {
            i++;
            i++;
            while (i < bytes.length && bytes[i] !== 0x00) {
              i += 1 + bytes[i];
            }
            i++;
          } else if (bytes[i] === 0x3B) {
            break;
          } else {
            i++;
          }
        }
        setGifInfo({ width: w, height: h, frameCount: frames || 1, fileSize: file.size });
        setWidth(w);
        setHeight(h);
      } catch {
        setGifInfo({ width: 0, height: 0, frameCount: 1, fileSize: file.size });
      }
    };
    loadInfo();
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const loadFfmpeg = async () => {
    if (ffmpegLoaded) return;
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress(Math.round(p * 100));
    });
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setFfmpegLoaded(true);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainAspect && gifInfo && gifInfo.width > 0) {
      setHeight(Math.round((val / gifInfo.width) * gifInfo.height));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
  };

  const processResize = async () => {
    if (!file || !gifInfo || !width || !height) return;
    setIsProcessing(true);
    setProgress(0);
    setOutputUrl(null);

    try {
      const ffmpeg = ffmpegRef.current;
      await loadFfmpeg();
      await ffmpeg.writeFile('input.gif', await fetchFile(file));

      const flagsMap: Record<Interpolation, string> = {
        lanczos: 'lanczos',
        bilinear: 'bilinear',
        neighbor: 'neighbor',
      };
      const vf = `-vf=scale=${width}:${height}:flags=${flagsMap[interpolation]}`;

      await ffmpeg.exec(['-i', 'input.gif', vf, 'output.gif']);
      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data as unknown as BlobPart], { type: 'image/gif' });
      setOutputUrl(URL.createObjectURL(blob));
      await ffmpeg.deleteFile('output.gif');
      await ffmpeg.deleteFile('input.gif');
      toast.success('GIF resized successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Resize failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
          <strong>Resize animated GIFs</strong> while preserving animation and quality.
        </div>
        <FileUploader
          accept="image/gif"
          onFileSelect={(f) => setFile(f)}
          title="Upload GIF"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          {gifInfo && (
            <p className="text-zinc-500 dark:text-zinc-500 text-xs mt-1">
              {gifInfo.width}×{gifInfo.height} · {gifInfo.frameCount} frame{gifInfo.frameCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => { setFile(null); setOutputUrl(null); setGifInfo(null); setUploadedUrl(null); setWidth(0); setHeight(0); }}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
        >
          Change GIF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
            <h4 className="text-zinc-900 dark:text-white font-medium">Resize Settings</h4>

            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-2">Width (px)</label>
              <input
                type="number"
                min="1"
                value={width}
                onChange={(e) => handleWidthChange(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2 mt-3 flex-wrap">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleWidthChange(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      width === p
                        ? 'bg-emerald-500 text-white'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {p}px
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-2">Height (px)</label>
              <input
                type="number"
                min="1"
                value={height}
                onChange={(e) => handleHeightChange(Math.max(1, Number(e.target.value)))}
                disabled={maintainAspect}
                className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 rounded-xl text-zinc-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={maintainAspect}
                onChange={(e) => setMaintainAspect(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                Maintain aspect ratio
              </span>
            </label>

            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-2">Interpolation</label>
              <div className="flex gap-2">
                {(['lanczos', 'bilinear', 'neighbor'] as Interpolation[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setInterpolation(m)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      interpolation === m
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {INTERPOLATION_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={processResize}
              disabled={isProcessing || !width || !height}
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
            >
              {isProcessing && (
                <div
                  className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="relative z-10">
                {isProcessing ? `Resizing ${Math.round(progress)}%` : 'Resize GIF'}
              </span>
            </button>
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-400 mb-4">Resized!</h4>
              <img src={outputUrl} alt="Resized GIF" className="w-full max-h-[200px] object-contain rounded-lg mb-6 mx-auto" />
              <button
                onClick={() => downloadOrShare(outputUrl, `${file.name.split('.')[0]}-resized.gif`)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download Resized GIF
              </button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {uploadedUrl && (
            <div className="bg-white dark:bg-black border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[240px]">
              <img
                src={uploadedUrl}
                alt="Original GIF"
                className="max-h-[240px] object-contain rounded-lg"
              />
            </div>
          )}

          {outputUrl && (
            <div className="bg-white dark:bg-black border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[240px]">
              <img
                src={outputUrl}
                alt="Resized GIF"
                className="max-h-[240px] object-contain rounded-lg"
              />
            </div>
          )}

          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-4 rounded-xl space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">Dimensions</p>
            <div className="space-y-1">
              <p>Original: <span className="text-zinc-900 dark:text-zinc-100">{gifInfo?.width}×{gifInfo?.height}</span></p>
              <p>New: <span className="text-zinc-900 dark:text-zinc-100">{width}×{height}</span></p>
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl space-y-2 text-sm text-blue-400">
            <p className="font-medium text-blue-300">About Resizing</p>
            <ul className="space-y-1 text-blue-400/80">
              <li>• Lanczos offers the best quality for most GIFs</li>
              <li>• Bilinear is faster but softer</li>
              <li>• Nearest neighbor preserves pixel art sharpness</li>
              <li>• All processing happens locally — nothing is uploaded</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
