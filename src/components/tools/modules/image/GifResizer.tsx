"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { createDownloadBlob } from '@/utils/blob';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { EmptyState } from '@/components/EmptyState';

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
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  const { isLoaded, loadFFmpeg, progress } = useFFmpeg();

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preview uploaded file and parse its metadata
    setUploadedUrl(url);
    const loadInfo = async () => {
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const w = (bytes[6] ?? 0) | ((bytes[7] ?? 0) << 8);
        const h = (bytes[8] ?? 0) | ((bytes[9] ?? 0) << 8);
        let frames = 0;
        let i = 13;
        const packed = bytes[10] ?? 0;
        if (packed & 0x80) {
          i += 3 * (1 << ((packed & 0x07) + 1));
        }
        while (i < bytes.length) {
          if (bytes[i] === 0x2C) {
            frames++;
            i += 9;
            const lctPacked = bytes[i] ?? 0;
            i++;
            if (lctPacked & 0x80) {
              i += 3 * (1 << ((lctPacked & 0x07) + 1));
            }
            i++;
            while (i < bytes.length && bytes[i] !== 0x00) {
              i += 1 + (bytes[i] ?? 0);
            }
            i++;
          } else if (bytes[i] === 0x21) {
            i++;
            i++;
            while (i < bytes.length && bytes[i] !== 0x00) {
              i += 1 + (bytes[i] ?? 0);
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
    setOutputUrl(null);

    try {
      const ffmpeg = await loadFFmpeg();
      if (!ffmpeg) {
        toast.error('Failed to load FFmpeg engine.');
        return;
      }
      await ffmpeg.writeFile('input.gif', await fetchFile(file));

      const flagsMap: Record<Interpolation, string> = {
        lanczos: 'lanczos',
        bilinear: 'bilinear',
        neighbor: 'neighbor',
      };
      const vf = `-vf=scale=${width}:${height}:flags=${flagsMap[interpolation]}`;

      await ffmpeg.exec(['-i', 'input.gif', vf, 'output.gif']);
      const data = await ffmpeg.readFile('output.gif');
      const blob = createDownloadBlob(data, 'image/gif');
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
        <div className="bg-gradient-to-r from-emerald-500/10 to-[var(--accent-ink)]/10 border border-emerald-500/20 p-4 rounded-xl text-[var(--accent)] text-sm">
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
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          {gifInfo && (
            <p className="text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-xs mt-1">
              {gifInfo.width}×{gifInfo.height} · {gifInfo.frameCount} frame{gifInfo.frameCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => { setFile(null); setOutputUrl(null); setGifInfo(null); setUploadedUrl(null); setWidth(0); setHeight(0); }}
          className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change GIF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-5">
            <h4 className="text-[var(--text-primary)] font-medium">Resize Settings</h4>

            <div>
              <label htmlFor="lbl-gifresizer-width-px" className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-2">Width (px)</label>
              <input id="lbl-gifresizer-width-px" aria-label="Width (px)"
                type="number"
                min="1"
                value={width}
                onChange={(e) => handleWidthChange(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-2.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-2 mt-3 flex-wrap">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => handleWidthChange(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      width === p
                        ? 'bg-emerald-700 text-white'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'
                    }`}
                  >
                    {p}px
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="lbl-gifresizer-height-px" className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-2">Height (px)</label>
              <input id="lbl-gifresizer-height-px" aria-label="Height (px)"
                type="number"
                min="1"
                value={height}
                onChange={(e) => handleHeightChange(Math.max(1, Number(e.target.value)))}
                disabled={maintainAspect}
                className="w-full px-4 py-2.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={maintainAspect}
                onChange={(e) => setMaintainAspect(e.target.checked)}
                className="w-5 h-5 rounded border-[var(--border-subtle)] dark:border-[var(--border-subtle)] text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
                Maintain aspect ratio
              </span>
            </label>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] mb-2">Interpolation</label>
              <div className="flex gap-2">
                {(['lanczos', 'bilinear', 'neighbor'] as Interpolation[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setInterpolation(m)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      interpolation === m
                        ? 'bg-emerald-700 text-white shadow-lg'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-overlay)]'
                    }`}
                  >
                    {INTERPOLATION_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={processResize}
              disabled={isProcessing || !width || !height || !isLoaded}
              className="w-full bg-gradient-to-r from-emerald-600 to-[var(--accent-ink)] hover:from-emerald-500 hover:to-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
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

          {outputUrl ? (
            <div className="p-6 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-[var(--accent)] mb-4">Resized!</h4>
              <img src={outputUrl} alt="Resized GIF" className="w-full max-h-[200px] object-contain rounded-lg mb-6 mx-auto" />
              <button
                onClick={() => downloadOrShare(outputUrl, `${file.name.split('.')[0]}-resized.gif`)}
                className="w-full bg-white text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download Resized GIF
              </button>
            </div>
          ) : (
            <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
              <EmptyState
                title="Resized GIF will appear here"
                message="Upload a GIF above to resize."
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {uploadedUrl && (
            <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[240px]">
              <img
                src={uploadedUrl}
                alt="Original GIF"
                className="max-h-[240px] object-contain rounded-lg"
              />
            </div>
          )}

          {outputUrl ? (
            <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[240px]">
              <img
                src={outputUrl}
                alt="Resized GIF"
                className="max-h-[240px] object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
              <EmptyState
                title="Resized preview will appear here"
                message="Upload a GIF above to resize."
              />
            </div>
          )}

          <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] p-4 rounded-xl space-y-2 text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">
            <p className="font-medium text-[var(--text-primary)]">Dimensions</p>
            <div className="space-y-1">
              <p>Original: <span className="text-[var(--text-primary)]">{gifInfo?.width}×{gifInfo?.height}</span></p>
              <p>New: <span className="text-[var(--text-primary)]">{width}×{height}</span></p>
            </div>
          </div>

          <div className="bg-[var(--accent)]/5 border border-[var(--accent)]/10 p-4 rounded-xl space-y-2 text-sm text-[var(--accent)]">
            <p className="font-medium text-[var(--accent)]">About Resizing</p>
            <ul className="space-y-1 text-[var(--accent)]/80">
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
