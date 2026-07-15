"use client";

import React, { useState, useEffect, useRef } from 'react';
import NextImage from "next/image";
import { FileUploader } from '../FileUploader';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

const FPS_OPTIONS = [10, 15, 24, 30];
const WIDTH_OPTIONS = [320, 480, 640, 800];

export default function ApngToGif() {
  const [file, setFile] = useState<File | null>(null);
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(320);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ frames: number; dims: string } | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  const ffmpegRef = useRef(new FFmpeg());

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const loadFFmpeg = async () => {
    if (ffmpegLoaded) return;
    const ffmpeg = ffmpegRef.current;
    ffmpeg.on('progress', ({ progress }) => {
      setProgress(progress * 100);
    });
    await ffmpeg.load();
    setFfmpegLoaded(true);
  };

  const processApng = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) await loadFFmpeg();

      await ffmpeg.writeFile('input.png', await fetchFile(file));

      const scale = `${width}:-1`;
      const filter = `fps=${fps},scale=${scale}:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;

      toast("Converting APNG to GIF...");
      await ffmpeg.exec(['-i', 'input.png', '-vf', filter, '-loop', '0', 'output.gif']);

      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data as unknown as BlobPart], { type: 'image/gif' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));

      toast.success("Conversion complete!");
    } catch (e) {
      console.error(e);
      toast.error("Conversion failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = async (f: File) => {
    setFile(f);
    setOutputUrl(null);
    setFileInfo(null);

    const ffmpeg = ffmpegRef.current;
    if (!ffmpeg.loaded) await loadFFmpeg();

    try {
      await ffmpeg.writeFile('probe.png', await fetchFile(f));
      await ffmpeg.exec(['-i', 'probe.png']);
      const stderr = '';

      const dimMatch = stderr.match(/(\d+x\d+)/);
      const dims = dimMatch ? dimMatch[1] : 'unknown';

      const frameMatch = stderr.match(/(\d+)\s*frames?/i);
      const frames = frameMatch ? parseInt(frameMatch[1]) : 1;

      setFileInfo({ frames, dims });
      await ffmpeg.deleteFile('probe.png');
    } catch {
      setFileInfo({ frames: 1, dims: 'unknown' });
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>ANPG to GIF:</strong> Convert animated PNGs to universally compatible GIF format.
        </div>
        <FileUploader
          accept="image/png,image/apng"
          onFileSelect={handleFileSelect}
          title="Upload APNG"
          subtitle="Animated PNG files"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">
            {(file.size / 1024 / 1024).toFixed(2)} MB
            {fileInfo && <span className="ml-3 text-blue-500">| {fileInfo.dims} | {fileInfo.frames} frames</span>}
          </p>
        </div>
        <button
          onClick={() => { setFile(null); setOutputUrl(null); setFileInfo(null); }}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px]">
          <NextImage
            unoptimized={true}
            loading="lazy"
            src={URL.createObjectURL(file)}
            alt="Original APNG"
            className="max-h-[300px] object-contain rounded-lg"
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
            <h4 className="text-zinc-900 dark:text-white font-medium">Settings</h4>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Frame Rate</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {FPS_OPTIONS.map(v => (
                  <button
                    key={v}
                    onClick={() => setFps(v)}
                    className={`py-2 text-xs font-bold border rounded-lg transition-all ${
                      fps === v
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-blue-300'
                    }`}
                  >
                    {v} FPS
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Output Width</label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {WIDTH_OPTIONS.map(v => (
                  <button
                    key={v}
                    onClick={() => setWidth(v)}
                    className={`py-2 text-xs font-bold border rounded-lg transition-all ${
                      width === v
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700 hover:border-blue-300'
                    }`}
                  >
                    {v}px
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={processApng}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
            >
              {isProcessing && (
                <div
                  className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="relative z-10">
                {isProcessing ? `Converting ${Math.round(progress)}%` : "Convert to GIF"}
              </span>
            </button>

            {!isProcessing && (
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                APNGs offer better compression and alpha channel support, but GIF remains the most compatible format across all platforms and browsers.
              </p>
            )}
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-400 mb-4">GIF Ready!</h4>
              <NextImage
                unoptimized={true}
                loading="lazy"
                src={outputUrl}
                alt="Generated GIF"
                className="w-full max-h-[200px] object-contain rounded-lg mb-6"
              />
              <button
                onClick={() => downloadOrShare(outputUrl, `${file.name.split('.')[0]}.gif`)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download GIF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
