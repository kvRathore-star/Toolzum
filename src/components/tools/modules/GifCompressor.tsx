"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../FileUploader';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

export default function GifCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [colors, setColors] = useState(128);
  const [dithering, setDithering] = useState<'floyd' | 'none'>('floyd');
  const [lossTolerance, setLossTolerance] = useState(30);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [gifInfo, setGifInfo] = useState<{ width: number; height: number; frameCount: number; fileSize: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
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
        setGifInfo({ width, height, frameCount: frames || 1, fileSize: file.size });
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

  const estimatedSize = (() => {
    if (!gifInfo) return 0;
    const ratio = colors / 256;
    return Math.round(gifInfo.fileSize * (ratio * 0.6 + 0.1));
  })();

  const processCompression = async () => {
    if (!file || !gifInfo) return;
    setIsProcessing(true);
    setProgress(0);
    setOutputUrl(null);
    setOutputSize(0);

    try {
      const ffmpeg = ffmpegRef.current;
      await loadFfmpeg();
      await ffmpeg.writeFile('input.gif', await fetchFile(file));

      const dedupFilter = removeDuplicates ? 'mpdecimate,setpts=N/FRAME_RATE/TB,' : '';
      const ditherOpt = dithering === 'floyd' ? 'dither=bayer:bayer_scale=5' : 'dither=none';
      const vf = `-vf=${dedupFilter}fps=10,scale=${gifInfo.width}:${gifInfo.height}:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=${colors}:stats_mode=diff[s0];[s1][s0]paletteuse=${ditherOpt}`;

      await ffmpeg.exec([
        '-i', 'input.gif', vf,
        '-lossless', lossTolerance > 50 ? '0' : '1',
        'output.gif',
      ]);
      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data as unknown as BlobPart], { type: 'image/gif' });
      setOutputSize(blob.size);
      setOutputUrl(URL.createObjectURL(blob));
      await ffmpeg.deleteFile('output.gif');
      await ffmpeg.deleteFile('input.gif');
      toast.success('GIF compressed successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Compression failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
          <strong>Reduce GIF size by up to 80%</strong> by optimizing colors and removing duplicate frames.
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
          onClick={() => { setFile(null); setOutputUrl(null); setGifInfo(null); setUploadedUrl(null); }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change GIF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-5">
            <h4 className="text-[var(--text-primary)] font-medium">Compression Settings</h4>

            <div>
              <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">
                Colors: {colors}
              </label>
              <input
                type="range"
                min="2"
                max="256"
                value={colors}
                onChange={(e) => setColors(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>2 colors</span>
                <span>256 colors</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Dithering</label>
              <div className="flex gap-2">
                {(['floyd', 'none'] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDithering(d)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      dithering === d
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    {d === 'floyd' ? 'Floyd-Steinberg' : 'None'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">
                Loss Tolerance: {lossTolerance}
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={lossTolerance}
                onChange={(e) => setLossTolerance(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>Lossless</span>
                <span>Lossy</span>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={removeDuplicates}
                onChange={(e) => setRemoveDuplicates(e.target.checked)}
                className="w-5 h-5 rounded border-zinc-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">
                Remove duplicate frames
              </span>
            </label>

            <button
              onClick={processCompression}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
            >
              {isProcessing && (
                <div
                  className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="relative z-10">
                {isProcessing ? `Compressing ${Math.round(progress)}%` : 'Compress GIF'}
              </span>
            </button>
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-400 mb-4">Compressed!</h4>
              <img src={outputUrl} alt="Compressed GIF" className="w-full max-h-[200px] object-contain rounded-lg mb-6 mx-auto" />
              <div className="text-sm text-[var(--text-muted)] mb-4">
                <p>Original: <span className="text-zinc-200">{(gifInfo!.fileSize / 1024).toFixed(1)} KB</span></p>
                <p>Compressed: <span className="text-zinc-200">{(outputSize / 1024).toFixed(1)} KB</span></p>
                <p className="text-emerald-400 font-medium">
                  {gifInfo!.fileSize > 0 ? `-${Math.round((1 - outputSize / gifInfo!.fileSize) * 100)}%` : ''}
                </p>
              </div>
              <button
                onClick={() => downloadOrShare(outputUrl, `${file.name.split('.')[0]}-compressed.gif`)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download Compressed GIF
              </button>
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

          {outputUrl && (
            <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[240px]">
              <img
                src={outputUrl}
                alt="Compressed GIF"
                className="max-h-[240px] object-contain rounded-lg"
              />
            </div>
          )}

          <div className="bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] p-4 rounded-xl space-y-2 text-sm text-zinc-600 dark:text-[var(--text-muted)]">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">Size Estimate</p>
            <div className="space-y-1">
              <p>Original: <span className="text-zinc-900 dark:text-zinc-100 font-medium">{gifInfo ? (gifInfo.fileSize / 1024).toFixed(1) : 0} KB</span></p>
              <p>Estimated: <span className="text-zinc-900 dark:text-zinc-100 font-medium">{(estimatedSize / 1024).toFixed(1)} KB</span></p>
              {gifInfo && gifInfo.fileSize > 0 && (
                <p className="text-emerald-400">
                  ~{Math.round((1 - estimatedSize / gifInfo.fileSize) * 100)}% smaller
                </p>
              )}
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl space-y-2 text-sm text-blue-400">
            <p className="font-medium text-blue-300">Optimization Tips</p>
            <ul className="space-y-1 text-blue-400/80">
              <li>• Lower colors = smaller file, but may reduce quality</li>
              <li>• Dithering helps smooth color transitions</li>
              <li>• Removing duplicate frames reduces animation size</li>
              <li>• All processing happens locally — nothing is uploaded</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
