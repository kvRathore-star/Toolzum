"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import NextImage from "next/image";
import { createDownloadBlob } from '@/utils/blob';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { EmptyState } from '@/components/EmptyState';

type Mode = 'gif-to-apng' | 'apng-to-gif';

const FPS_OPTIONS = [10, 15, 24, 30];
const WIDTH_OPTIONS = [320, 480, 640, 800];

export function AnimationConverter({ defaultMode = 'gif-to-apng' }: { defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [file, setFile] = useState<File | null>(null);
  const [gifInfo, setGifInfo] = useState<{ width: number; height: number; frameCount: number; fileSize: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(320);

  const { isLoaded, loadFFmpeg, progress } = useFFmpeg();

  const toApng = mode === 'gif-to-apng';

  useEffect(() => {
    if (!file || !toApng) return;
    const url = URL.createObjectURL(file);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- preview uploaded GIF and parse its metadata
    setUploadedUrl(url);
    const loadInfo = async () => {
      try {
        const buffer = await file.arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const w = bytes[6] | (bytes[7] << 8);
        const h = bytes[8] | (bytes[9] << 8);
        let frames = 0, i = 13;
        const packed = bytes[10];
        if (packed & 0x80) i += 3 * (1 << ((packed & 0x07) + 1));
        while (i < bytes.length) {
          if (bytes[i] === 0x2C) { frames++; i += 9; const lctPacked = bytes[i]; i++; if (lctPacked & 0x80) i += 3 * (1 << ((lctPacked & 0x07) + 1)); i++; while (i < bytes.length && bytes[i] !== 0x00) i += 1 + bytes[i]; i++; }
          else if (bytes[i] === 0x21) { i++; i++; while (i < bytes.length && bytes[i] !== 0x00) i += 1 + bytes[i]; i++; }
          else if (bytes[i] === 0x3B) break;
          else i++;
        }
        setGifInfo({ width: w, height: h, frameCount: frames || 1, fileSize: file.size });
      } catch { setGifInfo({ width: 0, height: 0, frameCount: 1, fileSize: file.size }); }
    };
    loadInfo();
    return () => { URL.revokeObjectURL(url); };
  }, [file, toApng]);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const processConversion = async () => {
    if (!file) return;
    setIsProcessing(true);
    setOutputUrl(null);
    setOutputSize(0);

    try {
      const ffmpeg = await loadFFmpeg();
      if (!ffmpeg) {
        toast.error('Failed to load FFmpeg engine.');
        return;
      }

      if (toApng) {
        await ffmpeg.writeFile('input.gif', await fetchFile(file));
        const vf = `-vf=fps=10,scale=${gifInfo!.width}:${gifInfo!.height}:flags=lanczos`;
        await ffmpeg.exec(['-i', 'input.gif', vf, '-c:v', 'apng', 'output.png']);
        const data = await ffmpeg.readFile('output.png');
        const blob = createDownloadBlob(data, 'image/png');
        setOutputSize(blob.size);
        setOutputUrl(URL.createObjectURL(blob));
        await ffmpeg.deleteFile('output.png');
        await ffmpeg.deleteFile('input.gif');
        toast.success('APNG created!');
      } else {
        const ff = ffmpeg;
        await ff.writeFile('input.png', await fetchFile(file));
        const scale = `${width}:-1`;
        const filter = `fps=${fps},scale=${scale}:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;
        await ff.exec(['-i', 'input.png', '-vf', filter, '-loop', '0', 'output.gif']);
        const data = await ff.readFile('output.gif');
        const blob = createDownloadBlob(data, 'image/gif');
        if (outputUrl) URL.revokeObjectURL(outputUrl);
        setOutputUrl(URL.createObjectURL(blob));
        toast.success('GIF created!');
      }
    } catch (e) {
      console.error(e);
      toast.error('Conversion failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="flex bg-white dark:bg-black p-1 rounded-xl border border-[var(--border-subtle)] w-fit">
          <button
            onClick={() => { setMode('gif-to-apng'); setFile(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'gif-to-apng'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            GIF to APNG
          </button>
          <button
            onClick={() => { setMode('apng-to-gif'); setFile(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'apng-to-gif'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            APNG to GIF
          </button>
        </div>
        <div className={`p-4 rounded-xl text-sm ${toApng ? 'bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 'bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400'}`}>          {toApng
            ? <><strong>APNG supports 24-bit colors and 8-bit alpha transparency</strong> — better quality than GIF.</>
            : <><strong>APNG to GIF:</strong> Convert animated PNGs to universally compatible GIF format.</>}
        </div>
        <FileUploader
          accept={toApng ? "image/gif" : "image/png,image/apng"}
          onFileSelect={(f) => setFile(f)}
          title={toApng ? 'Upload GIF' : 'Upload APNG'}
          subtitle={toApng ? undefined : 'Animated PNG files'}
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
          {gifInfo && toApng && (
            <p className="text-[var(--text-secondary)] text-xs mt-1">{gifInfo.width}×{gifInfo.height} · {gifInfo.frameCount} frame{gifInfo.frameCount !== 1 ? 's' : ''}</p>
          )}
        </div>
        <button onClick={() => { setFile(null); setOutputUrl(null); setGifInfo(null); setUploadedUrl(null); }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change File</button>
      </div>

      <div className="flex bg-white dark:bg-black p-1 rounded-xl border border-[var(--border-subtle)] w-fit">
        <button
          onClick={() => { setMode('gif-to-apng'); setFile(null); setOutputUrl(null); setGifInfo(null); setUploadedUrl(null); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'gif-to-apng'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          GIF to APNG
        </button>
        <button
          onClick={() => { setMode('apng-to-gif'); setFile(null); setOutputUrl(null); setGifInfo(null); setUploadedUrl(null); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'apng-to-gif'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          APNG to GIF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-5">
            <h4 className="text-[var(--text-primary)] font-medium">Convert to {toApng ? 'APNG' : 'GIF'}</h4>

            {toApng ? (
              <div className="bg-[var(--bg-overlay)]/50 rounded-xl p-4 space-y-2 text-sm text-zinc-600 dark:text-[var(--text-muted)]">
                <p>Your GIF will be converted to animated PNG format.</p>
                <ul className="space-y-1">
                  <li>• 24-bit colors vs GIF&apos;s 8-bit palette</li>
                  <li>• 8-bit alpha transparency support</li>
                  <li>• Better compression for photographic content</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Frame Rate</label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {FPS_OPTIONS.map(v => (
                      <button key={v} onClick={() => setFps(v)}
                        className={`py-2 text-xs font-bold border rounded-lg transition-all ${fps === v ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-[var(--bg-overlay)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-blue-300'}`}>{v} FPS</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Output Width</label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {WIDTH_OPTIONS.map(v => (
                      <button key={v} onClick={() => setWidth(v)}
                        className={`py-2 text-xs font-bold border rounded-lg transition-all ${width === v ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-[var(--bg-overlay)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-blue-300'}`}>{v}px</button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <button onClick={processConversion} disabled={isProcessing || !isLoaded}
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden">
              {isProcessing && <div className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300" style={{ width: `${progress}%` }} />}
              <span className="relative z-10">{isProcessing ? `Converting ${Math.round(progress)}%` : `Convert to ${toApng ? 'APNG' : 'GIF'}`}</span>
            </button>
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-700/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-4">{toApng ? 'APNG' : 'GIF'} Ready!</h4>
              {toApng && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div><p className="text-xs text-[var(--text-muted)] mb-2">Original (GIF)</p><p className="text-sm text-zinc-200">{(gifInfo!.fileSize / 1024).toFixed(1)} KB</p></div>
                  <div><p className="text-xs text-[var(--text-muted)] mb-2">{toApng ? 'APNG' : 'GIF'}</p><p className="text-sm text-zinc-200">{(outputSize / 1024).toFixed(1)} KB</p></div>
                </div>
              )}
              {toApng && outputSize > 0 && gifInfo!.fileSize > 0 && (
                <p className="text-sm text-[var(--text-muted)] mb-4">Size change: <span className={outputSize < gifInfo!.fileSize ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}>{outputSize < gifInfo!.fileSize ? '-' : '+'}{Math.round(Math.abs((1 - outputSize / gifInfo!.fileSize) * 100))}%</span></p>
              )}
              <button onClick={() => downloadOrShare(outputUrl, `${file!.name.split('.')[0]}.${toApng ? 'png' : 'gif'}`)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg">Download {toApng ? 'APNG' : 'GIF'}</button>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          {uploadedUrl && toApng && (
            <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[240px]">
              <img src={uploadedUrl} alt="Original" className="max-h-[240px] object-contain rounded-lg" />
            </div>
          )}

          {!toApng && file && (
            <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[240px]">
              <NextImage unoptimized loading="lazy" src={URL.createObjectURL(file)} alt="Original" className="max-h-[300px] object-contain rounded-lg" />
            </div>
          )}

          {outputUrl ? (
            <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[240px]">
              <img src={outputUrl} alt="Converted" className="max-h-[240px] object-contain rounded-lg" />
            </div>
          ) : (
            <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
              <EmptyState
                title="Converted preview will appear here"
                message="Upload a GIF above to convert."
              />
            </div>
          )}

          {toApng && (
            <>
              {gifInfo && (
                <div className="bg-[var(--bg-overlay)] border border-zinc-200 dark:border-[var(--border-subtle)] p-4 rounded-xl space-y-2 text-sm text-zinc-600 dark:text-[var(--text-muted)]">
                  <p className="font-medium text-zinc-800 dark:text-zinc-200">File Info</p>
                  <p>Size: <span className="text-zinc-900 dark:text-zinc-100">{(gifInfo.fileSize / 1024).toFixed(1)} KB</span></p>
                  <p>Dimensions: <span className="text-zinc-900 dark:text-zinc-100">{gifInfo.width}×{gifInfo.height}</span></p>
                  <p>Frames: <span className="text-zinc-900 dark:text-zinc-100">{gifInfo.frameCount}</span></p>
                </div>
              )}
              <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl space-y-2 text-sm text-blue-700 dark:text-blue-400">
                <p className="font-medium text-blue-300">Why APNG?</p>
                <ul className="space-y-1 text-blue-700 dark:text-blue-400/80">
                  <li>• Full 24-bit color support (16.7M colors)</li>
                  <li>• 8-bit alpha transparency for smooth compositing</li>
                  <li>• Backward compatible — degrades to single PNG frame</li>
                  <li>• All processing happens locally</li>
                </ul>
              </div>
            </>
          )}

          {!toApng && !isProcessing && (
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              APNGs offer better compression and alpha channel support, but GIF remains the most compatible format across all platforms and browsers.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GifToApng() { return <AnimationConverter key="gif-to-apng" defaultMode="gif-to-apng" />; }
