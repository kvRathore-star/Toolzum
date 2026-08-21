"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { createDownloadBlob } from '@/utils/blob';
import { useFFmpeg } from '@/hooks/useFFmpeg';

type Strength = 'minimal' | 'moderate' | 'strong' | 'extreme';
type Method = 'regular' | 'quick';
type CropMode = 'keep' | 'borders';
type OutputFormat = 'mp4' | 'webm';

const strengthConfig: Record<Strength, number> = {
  minimal: 2,
  moderate: 4,
  strong: 6,
  extreme: 10,
};

export default function VideoStabilizer() {
  const [file, setFile] = useState<File | null>(null);
  const [strength, setStrength] = useState<Strength>('moderate');
  const [method, setMethod] = useState<Method>('regular');
  const [smoothing, setSmoothing] = useState(15);
  const [cropMode, setCropMode] = useState<CropMode>('keep');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp4');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const { ffmpeg, isLoaded, loadFFmpeg } = useFFmpeg();

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const processVideo = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setOutputUrl(null);

    try {
      const ffmpeg = await loadFFmpeg();
      if (!ffmpeg) {
        toast.error('Failed to load FFmpeg engine.');
        return;
      }
      ffmpeg.on('progress', ({ progress }) => {
        setProgress(Math.round(progress * 100));
      });

      const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      await ffmpeg.writeFile(`input.${ext}`, await fetchFile(file));

      const shakiness = strengthConfig[strength];
      const zoom = cropMode === 'keep' ? 5 : 1;
      const outExt = outputFormat === 'webm' ? 'webm' : 'mp4';
      const outMime = outputFormat === 'webm' ? 'video/webm' : 'video/mp4';

      if (method === 'quick') {
        toast('Running quick stabilization...');
        await ffmpeg.exec([
          '-i', `input.${ext}`,
          '-vf', `deshake=rx=64:ry=64:blocksize=32:edge=blank`,
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '22',
          '-c:a', 'aac',
          `output.${outExt}`,
        ]);
      } else {
        toast('Pass 1/2: Analyzing motion...');
        await ffmpeg.exec([
          '-i', `input.${ext}`,
          '-vf', `vidstabdetect=shakiness=${shakiness}:accuracy=10:result=transforms.trf`,
          '-f', 'null',
          '-',
        ]);

        toast('Pass 2/2: Applying stabilization...');
        setProgress(50);
        await ffmpeg.exec([
          '-i', `input.${ext}`,
          '-vf', `vidstabtransform=input=transforms.trf:zoom=${zoom}:optalgo=gauss:smoothing=${smoothing}`,
          '-c:v', 'libx264',
          '-preset', 'fast',
          '-crf', '22',
          '-c:a', 'aac',
          `output.${outExt}`,
        ]);
      }

      const data = await ffmpeg.readFile(`output.${outExt}`);
      const url = URL.createObjectURL(createDownloadBlob(data, outMime));
      setOutputUrl(url);
      toast.success('Stabilization complete!');
    } catch (e) {
      console.error(e);
      toast.error('Stabilization failed. Try a different method or lower strength.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
          <strong>vidstab:</strong> Reduces camera shake in videos using ffmpeg's vidstab
          deshake filter. Available in Regular (two-pass) and Quick (single-pass) modes.
          Processing happens entirely in your browser — no uploads.
        </div>
        <FileUploader
          accept="video/*"
          onFileSelect={(f) => setFile(f)}
          title="Upload Video"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        <button
          onClick={() => { setFile(null); setOutputUrl(null); }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change Video
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px]">
          <video
            key={outputUrl || file.name}
            src={outputUrl ? outputUrl : URL.createObjectURL(file)}
            controls
            className="w-full max-h-[350px] rounded-lg"
          />
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
            <h4 className="text-[var(--text-primary)] font-medium">Stabilizer Settings</h4>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Strength</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['minimal', 'moderate', 'strong', 'extreme'] as Strength[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStrength(s)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                        strength === s
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setMethod('regular')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      method === 'regular'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    Regular (Two-Pass)
                  </button>
                  <button
                    onClick={() => setMethod('quick')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      method === 'quick'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    Quick (Single-Pass)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">
                  Smoothing Window: {smoothing} frames
                </label>
                <input
                  type="range"
                  min={5}
                  max={30}
                  value={smoothing}
                  onChange={(e) => setSmoothing(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-1">
                  <span>5 (less smooth)</span>
                  <span>30 (more smooth)</span>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Crop Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setCropMode('keep')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      cropMode === 'keep'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    Keep All (Zoom)
                  </button>
                  <button
                    onClick={() => setCropMode('borders')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      cropMode === 'borders'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    Black Borders Visible
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)] mb-2">Output Format</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setOutputFormat('mp4')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      outputFormat === 'mp4'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    MP4
                  </button>
                  <button
                    onClick={() => setOutputFormat('webm')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      outputFormat === 'webm'
                        ? 'bg-amber-500 text-white shadow-md'
                        : 'bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-surface)]'
                    }`}
                  >
                    WebM
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={processVideo}
              disabled={isProcessing || !isLoaded}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
            >
              {isProcessing && (
                <div
                  className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="relative z-10">
                {isProcessing
                  ? method === 'regular' && progress < 50
                    ? `Analyzing ${progress}%`
                    : `Stabilizing ${progress}%`
                  : 'Stabilize Video'}
              </span>
            </button>
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-700/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-4">Video Stabilized!</h4>
              <video src={outputUrl} controls autoPlay className="w-full max-h-[200px] rounded-lg mb-6" />
              <button
                onClick={() => downloadOrShare(outputUrl, `stabilized_${file.name}`)}
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
