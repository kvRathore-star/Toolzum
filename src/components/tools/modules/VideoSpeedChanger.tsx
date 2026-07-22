"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../FileUploader';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

export default function VideoSpeedChanger() {
  const [file, setFile] = useState<File | null>(null);
  const [speed, setSpeed] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [originalDuration, setOriginalDuration] = useState(0);

  const ffmpegRef = useRef(new FFmpeg());
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setOutputUrl(null);
    setOriginalDuration(0);
  };

  const handleMetadata = () => {
    if (videoRef.current) {
      setOriginalDuration(videoRef.current.duration);
    }
  };

  const handleReset = () => {
    setFile(null);
    setOutputUrl(null);
    setOriginalDuration(0);
    setSpeed(1);
  };

  const presets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4];

  const buildAtempoChain = (s: number): string => {
    if (s >= 0.5 && s <= 2) return `atempo=${s}`;
    const filters: string[] = [];
    let target = s;
    while (target > 2) {
      filters.push('atempo=2.0');
      target /= 2;
    }
    while (target < 0.5) {
      filters.push('atempo=0.5');
      target /= 0.5;
    }
    filters.push(`atempo=${target}`);
    return filters.join(',');
  };

  const processVideo = async () => {
    if (!file) return;
    if (speed === 1) {
      toast.error('Speed is already 1x. Adjust the slider first.');
      return;
    }
    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) {
        ffmpeg.on('progress', ({ progress }) => {
          setProgress(Math.round(progress * 100));
        });
        await ffmpeg.load();
        setFfmpegLoaded(true);
      }

      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
      const mimeMap: Record<string, string> = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        mov: 'video/quicktime',
        avi: 'video/x-msvideo',
      };
      const mimeType = mimeMap[ext] || file.type || 'video/mp4';
      const inputName = `input.${ext}`;
      const outputName = `output.${ext}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const atempoChain = buildAtempoChain(speed);
      toast(`Changing speed to ${speed}x...`);

      const args = [
        '-i', inputName,
        '-filter_complex', `setpts=PTS/${speed}`,
        '-af', atempoChain,
        outputName,
      ];

      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as unknown as BlobPart], { type: mimeType });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);

      toast.success(`Speed changed to ${speed}x!`);
    } catch (e) {
      console.error(e);
      toast.error('Speed change failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const outputDuration = originalDuration > 0 ? originalDuration / speed : 0;

  const formatDuration = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>Speed Changer:</strong> Speed up or slow down video playback using FFmpeg in your browser. All processing happens locally via WebAssembly — nothing is uploaded.
        </div>
        <FileUploader
          accept="video/*"
          onFileSelect={handleFileSelect}
          title="Upload Video"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          onClick={handleReset}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px]">
          <video
            ref={videoRef}
            src={URL.createObjectURL(file)}
            controls
            onLoadedMetadata={handleMetadata}
            className="w-full max-h-[350px] rounded-lg"
          />
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
            <h4 className="text-[var(--text-primary)] font-medium">Speed Settings</h4>

            <div>
              <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">
                Speed: <span className="font-bold text-[var(--text-primary)]">{speed}x</span>
              </label>
              <input
                type="range"
                min="0.1"
                max="10"
                step="0.1"
                value={speed}
                onChange={(e) => setSpeed(parseFloat(e.target.value))}
                className="w-full accent-blue-500"
              />
              <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
                <span>0.1x</span>
                <span>10x</span>
              </div>
            </div>

            <div>
              <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Presets</label>
              <div className="flex flex-wrap gap-2">
                {presets.map((p) => (
                  <button
                    key={p}
                    onClick={() => setSpeed(p)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      speed === p
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    {p}x
                  </button>
                ))}
              </div>
            </div>

            {originalDuration > 0 && (
              <div className="bg-[var(--bg-overlay)]/50 p-3 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)] space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-[var(--text-muted)]">Original Duration</span>
                  <span className="text-zinc-900 dark:text-zinc-100 font-mono">{formatDuration(originalDuration)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-600 dark:text-[var(--text-muted)]">Estimated Output</span>
                  <span className="text-blue-500 font-mono">{formatDuration(outputDuration)}</span>
                </div>
              </div>
            )}

            <button
              onClick={processVideo}
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
                {isProcessing ? `Processing ${progress}%` : `Change Speed to ${speed}x`}
              </span>
            </button>
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-400 mb-4">Speed Changed!</h4>
              <video src={outputUrl} controls autoPlay className="w-full max-h-[200px] rounded-lg mb-6" />
              <button
                onClick={() => downloadOrShare(outputUrl, `speed_${speed}x_${file.name}`)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download Video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
