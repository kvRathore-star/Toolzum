"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { fetchFile } from '@ffmpeg/util';
import JSZip from 'jszip';
import { useFFmpeg } from '@/hooks/useFFmpeg';

interface GifInfo {
  width: number;
  height: number;
  frameCount: number;
  fileSize: number;
  durationMs: number;
}

function parseGifInfo(buffer: ArrayBuffer): GifInfo {
  const view = new Uint8Array(buffer);
  const width = view[6] | (view[7] << 8);
  const height = view[8] | (view[9] << 8);
  let frameCount = 0;
  let durationMs = 0;
  for (let i = 0; i < view.length - 8; i++) {
    if (view[i] === 0x21 && view[i + 1] === 0xF9 && view[i + 2] === 0x04) {
      frameCount++;
      const delayCs = view[i + 4] | (view[i + 5] << 8);
      durationMs += delayCs * 10;
    }
  }
  if (frameCount === 0) {
    for (let i = 0; i < view.length; i++) {
      if (view[i] === 0x2C) frameCount++;
    }
  }
  if (durationMs === 0 && frameCount > 0) durationMs = frameCount * 100;
  return { width, height, frameCount, fileSize: buffer.byteLength, durationMs };
}

export default function GifEditor() {
  const [file, setFile] = useState<File | null>(null);
  const [gifInfo, setGifInfo] = useState<GifInfo | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [resizeWidth, setResizeWidth] = useState<number | ''>('');
  const [resizeHeight, setResizeHeight] = useState<number | ''>('');
  const [keepAspect, setKeepAspect] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isReversed, setIsReversed] = useState(false);
  const [paletteColors, setPaletteColors] = useState(0);

  const [extractedFrameUrls, setExtractedFrameUrls] = useState<string[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  const { ffmpeg, isLoaded, loadFFmpeg, progress } = useFFmpeg();

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      extractedFrameUrls.forEach(u => URL.revokeObjectURL(u));
    };
  }, []);

  const handleFileSelect = async (selectedFile: File, dataUrl: string) => {
    try {
      extractedFrameUrls.forEach(u => URL.revokeObjectURL(u));
      setExtractedFrameUrls([]);
      if (outputUrl) { URL.revokeObjectURL(outputUrl); setOutputUrl(null); }
      const buffer = await selectedFile.arrayBuffer();
      const info = parseGifInfo(buffer);
      setGifInfo(info);
      setResizeWidth(info.width);
      setResizeHeight(info.height);
      setSpeedMultiplier(1);
      setIsReversed(false);
      setPaletteColors(0);
      setOutputSize(null);
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      setOriginalUrl(dataUrl);
      setFile(selectedFile);
    } catch (e) {
      toast.error("Failed to parse GIF. The file may be corrupted.");
    }
  };

  const clearAll = () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    extractedFrameUrls.forEach(u => URL.revokeObjectURL(u));
    setFile(null);
    setGifInfo(null);
    setOriginalUrl(null);
    setOutputUrl(null);
    setOutputSize(null);
    setIsProcessing(false);
    setExtractedFrameUrls([]);
  };

  const handleWidthChange = (val: string) => {
    const n = val === '' ? '' : Math.max(1, parseInt(val) || 1);
    setResizeWidth(n);
    if (keepAspect && gifInfo && typeof n === 'number') {
      setResizeHeight(Math.round(n * (gifInfo.height / gifInfo.width)));
    }
  };

  const handleHeightChange = (val: string) => {
    const n = val === '' ? '' : Math.max(1, parseInt(val) || 1);
    setResizeHeight(n);
    if (keepAspect && gifInfo && typeof n === 'number') {
      setResizeWidth(Math.round(n * (gifInfo.width / gifInfo.height)));
    }
  };

  const toggleKeepAspect = () => {
    const next = !keepAspect;
    setKeepAspect(next);
    if (next && gifInfo && typeof resizeWidth === 'number') {
      setResizeHeight(Math.round(resizeWidth * (gifInfo.height / gifInfo.width)));
    }
  };

  const buildFilters = (): string | null => {
    const parts: string[] = [];
    if (resizeWidth && gifInfo && (resizeWidth !== gifInfo.width || (resizeHeight && resizeHeight !== gifInfo.height))) {
      if (keepAspect || !resizeHeight) {
        parts.push(`scale=${resizeWidth}:-1:flags=lanczos`);
      } else {
        parts.push(`scale=${resizeWidth}:${resizeHeight}:flags=lanczos`);
      }
    }
    if (speedMultiplier !== 1) parts.push(`setpts=PTS/${speedMultiplier}`);
    if (isReversed) parts.push('reverse');
    if (parts.length === 0 && !paletteColors) return null;
    let chain = parts.join(',');
    if (paletteColors) {
      const stats = paletteColors < 256 ? 'diff' : 'single';
      const pal = `split[s0][s1];[s0]palettegen=stats_mode=${stats}:max_colors=${paletteColors}[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5`;
      chain = chain ? `${chain},${pal}` : pal;
    }
    return chain;
  };

  const processGif = async () => {
    if (!file || !gifInfo) return;
    setIsProcessing(true);
    setOutputUrl(null);
    setOutputSize(null);
    try {
      const ff = await loadFFmpeg();
      if (!ff) {
        toast.error('Failed to load FFmpeg engine.');
        return;
      }
      await ff.writeFile('input.gif', await fetchFile(file));
      const filters = buildFilters();
      const args = ['-i', 'input.gif', '-ignore_loop', '0'];
      if (filters) args.push('-vf', filters);
      args.push('-loop', '0', 'output.gif');
      await ff.exec(args);
      const data = await ff.readFile('output.gif');
      const blob = new Blob([new Uint8Array(data as unknown as ArrayBuffer)], { type: 'image/gif' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setOutputSize(blob.size);
      toast.success("GIF processed successfully!");
    } catch (e) {
      console.error(e);
      toast.error("Failed to process GIF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const extractFrames = async () => {
    if (!file) return;
    setIsExtracting(true);
    try {
      extractedFrameUrls.forEach(u => URL.revokeObjectURL(u));
      setExtractedFrameUrls([]);
      const ff = await loadFFmpeg();
      if (!ff) {
        toast.error('Failed to load FFmpeg engine.');
        return;
      }
      await ff.writeFile('input.gif', await fetchFile(file));
      await ff.exec(['-i', 'input.gif', '-vsync', '0', 'frame_%04d.png']);
      const urls: string[] = [];
      const zip = new JSZip();
      let idx = 0;
      while (true) {
        try {
          const name = `frame_${String(idx).padStart(4, '0')}.png`;
          const data = await ff.readFile(name);
          const raw = new Uint8Array(data as unknown as ArrayBuffer);
          const blob = new Blob([raw], { type: 'image/png' });
          urls.push(URL.createObjectURL(blob));
          zip.file(`frame_${idx + 1}.png`, raw);
          await ff.deleteFile(name);
          idx++;
        } catch { break; }
      }
      setExtractedFrameUrls(urls);
      if (urls.length === 0) { toast.error("No frames could be extracted."); return; }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      const baseName = file.name.replace(/\.gif$/i, '');
      downloadOrShare(zipUrl, `${baseName}_frames.zip`);
      toast.success(`${urls.length} frames extracted!`);
      setTimeout(() => { if (zipUrl) { try { URL.revokeObjectURL(zipUrl); } catch {} } }, 10000);
    } catch (e) {
      console.error(e);
      toast.error("Failed to extract frames.");
    } finally {
      setIsExtracting(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>Edit GIFs in Browser:</strong> Resize, speed up/slow down, reverse, optimize colors, or extract frames from animated GIFs. All processing runs locally via WebAssembly.
        </div>
        <FileUploader
          accept="image/gif"
          onFileSelect={handleFileSelect}
          title="Upload GIF to Edit"
          subtitle="Drag & drop an animated GIF here"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[var(--bg-surface)] rounded-lg overflow-hidden flex-shrink-0">
            {originalUrl && (
              <img src={originalUrl} alt="" className="w-full h-full object-cover" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{file.name}</h3>
            <p className="text-zinc-600 dark:text-[var(--text-muted)] text-[11px]">
              {gifInfo && `${gifInfo.width}x${gifInfo.height} • ${gifInfo.frameCount} frame${gifInfo.frameCount !== 1 ? 's' : ''} • ${(gifInfo.fileSize / 1024).toFixed(1)} KB • ${(gifInfo.durationMs / 1000).toFixed(2)}s`}
            </p>
          </div>
        </div>
        <button onClick={clearAll} className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg">Change File</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">Operations</h4>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Resize</label>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-[9px] text-[var(--text-secondary)]">Width</label>
                <input type="number" min={1} value={resizeWidth} onChange={e => handleWidthChange(e.target.value)} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)]" />
              </div>
              <button onClick={toggleKeepAspect} className={`mt-5 p-2 rounded-lg border transition-colors ${keepAspect ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-muted)]'}`} title="Keep aspect ratio">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={keepAspect ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"} /></svg>
              </button>
              <div className="flex-1">
                <label className="text-[9px] text-[var(--text-secondary)]">Height</label>
                <input type="number" min={1} value={keepAspect ? (typeof resizeWidth === 'number' && gifInfo ? Math.round(resizeWidth * (gifInfo.height / gifInfo.width)) : resizeHeight) : resizeHeight} onChange={e => handleHeightChange(e.target.value)} disabled={keepAspect} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-sm text-[var(--text-primary)] disabled:opacity-40" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Speed</label>
            <div className="grid grid-cols-5 gap-1.5">
              {[0.25, 0.5, 1, 2, 4].map(v => (
                <button key={v} onClick={() => setSpeedMultiplier(v)} className={`py-2 text-[10px] font-bold border rounded-lg transition-colors ${speedMultiplier === v ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>
                  {v === 1 ? '1x' : `${v}x`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Reverse</span>
            <button onClick={() => setIsReversed(!isReversed)} className={`relative w-11 h-6 rounded-full transition-colors ${isReversed ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'}`}>
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isReversed ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Optimize Palette</label>
            <div className="grid grid-cols-4 gap-1.5">
              {[0, 32, 64, 128, 256].filter(v => v !== 0 || paletteColors === 0).map(v => (
                <button key={v} onClick={() => setPaletteColors(v)} className={`py-2 text-[10px] font-bold border rounded-lg transition-colors ${paletteColors === v ? 'bg-blue-600 border-blue-500 text-white' : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)]'}`}>
                  {v === 0 ? 'Off' : `${v}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={processGif} disabled={isProcessing || !isLoaded} className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50">
              {isProcessing ? `Processing ${progress}%` : 'Apply Changes'}
            </button>
            <button onClick={extractFrames} disabled={isExtracting || isProcessing || !isLoaded} className="bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold py-3.5 px-4 rounded-xl text-xs transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              {isExtracting ? '...' : 'Frames'}
            </button>
          </div>

          {isProcessing && (
            <div className="w-full bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full h-2 overflow-hidden">
              <div className="bg-blue-500 h-full transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
            <div className="p-3 border-b border-[var(--border-subtle)] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Original</span>
            </div>
            <div className="bg-[radial-gradient(#ccc_1px,transparent_1px)] dark:bg-[radial-gradient(#333_1px,transparent_1px)] bg-[length:20px_20px] p-4 flex items-center justify-center min-h-[200px]">
              {originalUrl && <img src={originalUrl} alt="Original GIF" className="max-w-full max-h-[250px] object-contain rounded-lg" />}
            </div>
          </div>

          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden">
              <div className="p-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Processed</span>
                </div>
                {outputSize && <span className="text-[10px] bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded font-bold">{(outputSize / 1024).toFixed(1)} KB</span>}
              </div>
              <div className="bg-[radial-gradient(#ccc_1px,transparent_1px)] dark:bg-[radial-gradient(#333_1px,transparent_1px)] bg-[length:20px_20px] p-4 flex items-center justify-center min-h-[200px]">
                <img src={outputUrl} alt="Processed GIF" className="max-w-full max-h-[250px] object-contain rounded-lg" />
              </div>
              <div className="p-4 border-t border-[var(--border-subtle)]">
                <button onClick={() => downloadOrShare(outputUrl, `edited_${file.name}`)} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                  Download Edited GIF
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[200px] text-[var(--text-muted)]">
              <svg className="w-10 h-10 mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs">Processed GIF will appear here</p>
            </div>
          )}
        </div>
      </div>

      {extractedFrameUrls.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{extractedFrameUrls.length} Frames Extracted</h4>
            <button onClick={() => { extractedFrameUrls.forEach(u => URL.revokeObjectURL(u)); setExtractedFrameUrls([]); }} className="text-[10px] text-red-500 hover:underline">Clear</button>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[400px] overflow-y-auto">
            {extractedFrameUrls.map((url, i) => (
              <div key={i} className="bg-[var(--bg-overlay)] rounded-lg overflow-hidden border border-[var(--border-subtle)]">
                <img src={url} alt={`Frame ${i + 1}`} className="w-full aspect-square object-contain" />
                <div className="text-center text-[9px] text-[var(--text-secondary)] py-1 border-t border-[var(--border-subtle)]">#{i + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
