"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { createDownloadBlob } from '@/utils/blob';
import { useFFmpeg } from '@/hooks/useFFmpeg';

type OutputFormat = 'webp' | 'webm' | 'both';
type FpsOption = 'auto' | 10 | 15 | 24 | 30;

export default function GifToWebpWebm() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('both');
  const [quality, setQuality] = useState(80);
  const [fps, setFps] = useState<FpsOption>('auto');
  const [loopCount, setLoopCount] = useState(0);
  const [preserveAlpha, setPreserveAlpha] = useState(true);
  const [gifInfo, setGifInfo] = useState<{ width: number; height: number; frameCount: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputUrl2, setOutputUrl2] = useState<string | null>(null);

  const { isLoaded, loadFFmpeg, progress } = useFFmpeg();

  useEffect(() => {
    if (!file) return;
    const loadInfo = async () => {
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const width = bytes[6] | (bytes[7] << 8);
        const height = bytes[8] | (bytes[9] << 8);
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
        setGifInfo({ width, height, frameCount: frames || 1 });
      } catch {
        setGifInfo({ width: 0, height: 0, frameCount: 1 });
      }
    };
    loadInfo();
  }, [file]);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (outputUrl2) URL.revokeObjectURL(outputUrl2);
    };
  }, [outputUrl, outputUrl2]);

  const processConversion = async () => {
    if (!file || !gifInfo) return;
    setIsProcessing(true);
    setOutputUrl(null);
    setOutputUrl2(null);

    try {
      const { fetchFile } = await import('@ffmpeg/util');
      const ffmpeg = await loadFFmpeg();
      if (!ffmpeg) {
        toast.error('Failed to load FFmpeg engine.');
        return;
      }
      await ffmpeg.writeFile('input.gif', await fetchFile(file));

      const scale = `scale=${gifInfo.width}:${gifInfo.height}:flags=lanczos`;
      const fpsFilter = fps === 'auto' ? '' : `fps=${fps},`;
      const vf = `-vf=${fpsFilter}${scale}`;
      const loop = loopCount === 0 ? '-loop=0' : `-loop=${loopCount}`;

      if (outputFormat === 'webp' || outputFormat === 'both') {
        toast('Creating animated WebP...');
        await ffmpeg.exec([
          '-i', 'input.gif', vf,
          '-c:v', 'libwebp_anim',
          '-quality', String(quality),
          loop,
          'output.webp',
        ]);
        const data = await ffmpeg.readFile('output.webp');
        const blob = createDownloadBlob(data, 'image/webp');
        setOutputUrl(URL.createObjectURL(blob));
        await ffmpeg.deleteFile('output.webp');
      }

      if (outputFormat === 'webm' || outputFormat === 'both') {
        toast('Creating WebM video...');
        const pixFmt = preserveAlpha ? 'yuva420p' : 'yuv420p';
        await ffmpeg.exec([
          '-i', 'input.gif', vf,
          '-c:v', 'libvpx-vp9', '-b:v', '0',
          '-crf', '30', '-pix_fmt', pixFmt,
          'output.webm',
        ]);
        const data = await ffmpeg.readFile('output.webm');
        const blob = createDownloadBlob(data, 'video/webm');
        const url = URL.createObjectURL(blob);
        if (outputFormat === 'both') {
          setOutputUrl2(url);
        } else {
          setOutputUrl(url);
        }
        await ffmpeg.deleteFile('output.webm');
      }

      await ffmpeg.deleteFile('input.gif');
      toast.success('Conversion complete!');
    } catch (e) {
      console.error(e);
      toast.error('Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-700 dark:text-emerald-400 text-sm">
          <strong>Modern GIF replacement:</strong> Convert animated GIFs to WebP (animated image, ~10x smaller) or WebM (video, even better compression) — entirely in your browser.
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
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          {gifInfo && (
            <p className="text-[var(--text-secondary)] dark:text-[var(--text-secondary)] text-xs mt-1">
              {gifInfo.width}×{gifInfo.height} · {gifInfo.frameCount} frame{gifInfo.frameCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => { setFile(null); setOutputUrl(null); setOutputUrl2(null); setGifInfo(null); }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change GIF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-5">
            <h4 className="text-[var(--text-primary)] font-medium">Settings</h4>

            <div>
              <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Output Format</label>
              <div className="flex gap-2">
                {(['webp', 'webm', 'both'] as OutputFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setOutputFormat(fmt)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      outputFormat === fmt
                        ? 'bg-emerald-700 text-white shadow-lg'
                        : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    {fmt === 'webp' ? 'WebP' : fmt === 'webm' ? 'WebM' : 'Both'}
                  </button>
                ))}
              </div>
            </div>

            {(outputFormat === 'webp' || outputFormat === 'both') && (
              <div>
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">
                  WebP Quality: {quality}
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                  <span>Smaller</span>
                  <span>Better</span>
                </div>
              </div>
            )}

            {(outputFormat === 'webm' || outputFormat === 'both') && (
              <div>
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Frame Rate</label>
                <div className="flex gap-2 flex-wrap">
                  {(['auto', 10, 15, 24, 30] as FpsOption[]).map((f) => (
                    <button
                      key={String(f)}
                      onClick={() => setFps(f)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        fps === f
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                      }`}
                    >
                      {f === 'auto' ? 'Auto' : `${f} fps`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(outputFormat === 'webp' || outputFormat === 'both') && (
              <div>
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">
                  Loop Count <span className="text-[var(--text-muted)]">(0 = infinite)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  value={loopCount}
                  onChange={(e) => setLoopCount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-4 py-2.5 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl text-[var(--text-primary)] text-sm focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            {(outputFormat === 'webm' || outputFormat === 'both') && (
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={preserveAlpha}
                  onChange={(e) => setPreserveAlpha(e.target.checked)}
                  className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">
                  Preserve transparency <span className="text-[var(--text-muted)]">(WebP only — WebM ignores this)</span>
                </span>
              </label>
            )}

            <button
              onClick={processConversion}
              disabled={isProcessing || !isLoaded}
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
            >
              {isProcessing && (
                <div
                  className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="relative z-10">
                {isProcessing
                  ? `${outputFormat === 'both' ? 'Converting' : 'Converting'} ${Math.round(progress)}%`
                  : `Convert to ${outputFormat === 'both' ? 'WebP + WebM' : outputFormat.toUpperCase()}`}
              </span>
            </button>
          </div>

          {(outputUrl || outputUrl2) && (
            <div className="space-y-4">
              {outputUrl && (
                <div className="p-6 bg-emerald-700/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
                  <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-4">WebP Ready!</h4>
                  {outputFormat !== 'both' ? (
                    <img src={outputUrl} alt="Converted WebP" className="w-full max-h-[200px] object-contain rounded-lg mb-6 mx-auto" />
                  ) : (
                    <img src={outputUrl} alt="Converted WebP" className="w-full max-h-[160px] object-contain rounded-lg mb-4 mx-auto" />
                  )}
                  {outputFormat !== 'webm' && (
                    <button
                      onClick={() => downloadOrShare(outputUrl, `${file.name.split('.')[0]}.webp`)}
                      className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
                    >
                      Download WebP
                    </button>
                  )}
                </div>
              )}
              {outputUrl2 && (
                <div className="p-6 bg-emerald-700/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
                  <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-4">WebM Ready!</h4>
                  <video src={outputUrl2} controls autoPlay loop className="w-full max-h-[200px] rounded-lg mb-6" />
                  <button
                    onClick={() => downloadOrShare(outputUrl2, `${file.name.split('.')[0]}.webm`)}
                    className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
                  >
                    Download WebM
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[240px]">
            <img
              src={URL.createObjectURL(file)}
              alt="Original GIF"
              className="max-h-[240px] object-contain rounded-lg"
            />
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl space-y-2 text-sm text-blue-700 dark:text-blue-400">
            <p className="font-medium text-blue-300">Why convert?</p>
            <ul className="space-y-1 text-blue-700 dark:text-blue-400/80">
              <li>• WebP animated images are typically <strong>~10× smaller</strong> than GIF</li>
              <li>• WebM video offers even better compression with alpha support</li>
              <li>• Modern browsers support WebP and WebM natively</li>
              <li>• All processing happens locally — nothing is uploaded</li>
            </ul>
          </div>

          <div className="bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] p-4 rounded-xl space-y-2 text-sm text-zinc-600 dark:text-[var(--text-muted)]">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">File Comparison</p>
            <div className="space-y-1">
              <p>Original GIF: <span className="text-zinc-900 dark:text-zinc-100 font-medium">{(file.size / 1024).toFixed(1)} KB</span></p>
              {gifInfo && (
                <p>Dimensions: <span className="text-zinc-900 dark:text-zinc-100">{gifInfo.width}×{gifInfo.height}</span></p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
