"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../FileUploader';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

export default function GifToApng() {
  const [file, setFile] = useState<File | null>(null);
  const [gifInfo, setGifInfo] = useState<{ width: number; height: number; frameCount: number; fileSize: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputSize, setOutputSize] = useState(0);
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

  const processConversion = async () => {
    if (!file || !gifInfo) return;
    setIsProcessing(true);
    setProgress(0);
    setOutputUrl(null);
    setOutputSize(0);

    try {
      const ffmpeg = ffmpegRef.current;
      await loadFfmpeg();
      await ffmpeg.writeFile('input.gif', await fetchFile(file));

      const vf = `-vf=fps=10,scale=${gifInfo.width}:${gifInfo.height}:flags=lanczos`;
      await ffmpeg.exec(['-i', 'input.gif', vf, '-c:v', 'apng', 'output.png']);
      const data = await ffmpeg.readFile('output.png');
      const blob = new Blob([data as unknown as BlobPart], { type: 'image/png' });
      setOutputSize(blob.size);
      setOutputUrl(URL.createObjectURL(blob));
      await ffmpeg.deleteFile('output.png');
      await ffmpeg.deleteFile('input.gif');
      toast.success('APNG created successfully!');
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
        <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 p-4 rounded-xl text-emerald-400 text-sm">
          <strong>APNG supports 24-bit colors and 8-bit alpha transparency</strong> — better quality than GIF.
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
          onClick={() => { setFile(null); setOutputUrl(null); setGifInfo(null); setUploadedUrl(null); }}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
        >
          Change GIF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-5">
            <h4 className="text-zinc-900 dark:text-white font-medium">Convert to APNG</h4>

            <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <p>Your GIF will be converted to animated PNG format.</p>
              <ul className="space-y-1">
                <li>• 24-bit colors vs GIF's 8-bit palette</li>
                <li>• 8-bit alpha transparency support</li>
                <li>• Better compression for photographic content</li>
              </ul>
            </div>

            <button
              onClick={processConversion}
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
                {isProcessing ? `Converting ${Math.round(progress)}%` : 'Convert to APNG'}
              </span>
            </button>
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-400 mb-4">APNG Ready!</h4>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-xs text-zinc-400 mb-2">Original (GIF)</p>
                  <p className="text-sm text-zinc-200">{(gifInfo!.fileSize / 1024).toFixed(1)} KB</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 mb-2">APNG</p>
                  <p className="text-sm text-zinc-200">{(outputSize / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              {outputSize > 0 && gifInfo!.fileSize > 0 && (
                <p className="text-sm text-zinc-400 mb-4">
                  Size change: <span className={outputSize < gifInfo!.fileSize ? 'text-emerald-400' : 'text-amber-400'}>
                    {outputSize < gifInfo!.fileSize ? '-' : '+'}{Math.round(Math.abs((1 - outputSize / gifInfo!.fileSize) * 100))}%
                  </span>
                </p>
              )}
              <button
                onClick={() => downloadOrShare(outputUrl, `${file.name.split('.')[0]}.png`)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download APNG
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
                alt="Converted APNG"
                className="max-h-[240px] object-contain rounded-lg"
              />
            </div>
          )}

          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-white/5 p-4 rounded-xl space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">File Comparison</p>
            <div className="space-y-1">
              <p>Original GIF: <span className="text-zinc-900 dark:text-zinc-100 font-medium">{gifInfo ? (gifInfo.fileSize / 1024).toFixed(1) : 0} KB</span></p>
              {gifInfo && (
                <p>Dimensions: <span className="text-zinc-900 dark:text-zinc-100">{gifInfo.width}×{gifInfo.height}</span></p>
              )}
              <p>Frames: <span className="text-zinc-900 dark:text-zinc-100">{gifInfo?.frameCount || 0}</span></p>
            </div>
          </div>

          <div className="bg-blue-500/5 border border-blue-500/10 p-4 rounded-xl space-y-2 text-sm text-blue-400">
            <p className="font-medium text-blue-300">Why APNG?</p>
            <ul className="space-y-1 text-blue-400/80">
              <li>• Full 24-bit color support (16.7M colors)</li>
              <li>• 8-bit alpha transparency for smooth compositing</li>
              <li>• Backward compatible — degrades to single PNG frame</li>
              <li>• All processing happens locally — nothing is uploaded</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
