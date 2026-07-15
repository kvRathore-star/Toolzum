"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '@/components/tools/FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import toast from 'react-hot-toast';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const LEVELS = ['mild', 'moderate', 'strong', 'extreme'] as const;
type Level = typeof LEVELS[number];

const LEVEL_LABELS: Record<Level, string> = {
  mild: 'Mild',
  moderate: 'Moderate',
  strong: 'Strong',
  extreme: 'Extreme',
};

const LEVEL_NF: Record<Level, number> = {
  mild: -25,
  moderate: -35,
  strong: -50,
  extreme: -70,
};

const LEVEL_ANLMDN: Record<Level, number> = {
  mild: 3,
  moderate: 7,
  strong: 12,
  extreme: 18,
};

const OUTPUT_FORMATS = ['mp3', 'wav', 'm4a', 'flac', 'ogg'] as const;
type OutputFormat = typeof OUTPUT_FORMATS[number];

const MIME_TYPES: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  flac: 'audio/flac',
  ogg: 'audio/ogg',
};

export default function NoiseReducer() {
  const [file, setFile] = useState<File | null>(null);
  const [level, setLevel] = useState<Level>('moderate');
  const [useNoiseProfile, setUseNoiseProfile] = useState(false);
  const [noiseStart, setNoiseStart] = useState(0);
  const [noiseEnd, setNoiseEnd] = useState(5);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('wav');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);

  const ffmpegRef = useRef<FFmpeg | null>(null);
  const originalUrlRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    };
  }, [outputUrl]);

  const loadFFmpeg = async () => {
    if (ffmpegRef.current?.loaded) return;
    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      ffmpeg.on('progress', (p) => {
        setProcessingProgress(Math.round(p.progress * 100));
      });

      const base = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const [coreURL, wasmURL] = await Promise.all([
        toBlobURL(`${base}/ffmpeg-core.js`, 'text/javascript'),
        toBlobURL(`${base}/ffmpeg-core.wasm`, 'application/wasm'),
      ]);

      await ffmpeg.load({ coreURL, wasmURL });
      setFfmpegLoaded(true);
    } catch {
      toast.error('Failed to load audio processing engine.');
    }
  };

  const handleFileSelect = async (_file: File, _dataUrl: string) => {
    if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
    setFile(_file);
    setOutputUrl(null);
    setProcessingProgress(0);
    originalUrlRef.current = URL.createObjectURL(_file);
    if (!ffmpegRef.current?.loaded) await loadFFmpeg();
  };

  const removeFile = () => {
    setFile(null);
    setOutputUrl(null);
    setProcessingProgress(0);
    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = null;
    }
  };

  const processAudio = async () => {
    if (!file || !ffmpegRef.current) return;
    setIsProcessing(true);
    setProcessingProgress(0);
    const ffmpeg = ffmpegRef.current;

    try {
      const ts = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const inputName = `input_${ts}_${safeName}`;
      const outputName = `output_${ts}.${outputFormat}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      if (useNoiseProfile) {
        const noiseName = `noise_${ts}.wav`;
        await ffmpeg.exec([
          '-i', inputName,
          '-af', `atrim=start=${noiseStart}:end=${noiseEnd}`,
          '-f', 'wav',
          noiseName,
        ]);
        await ffmpeg.exec([
          '-i', inputName,
          '-af', `anlmdn=s=${LEVEL_ANLMDN[level]}`,
          outputName,
        ]);
        await ffmpeg.deleteFile(noiseName);
      } else {
        await ffmpeg.exec([
          '-i', inputName,
          '-af', `afftdn=nf=${LEVEL_NF[level]}`,
          outputName,
        ]);
      }

      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as unknown as BlobPart], { type: MIME_TYPES[outputFormat] });

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      toast.success('Noise reduction complete!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to process audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m-4 0h8m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Audio Noise Reducer</h3>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Remove background noise using adaptive spectral subtraction and non-local means denoising. All processing is local.</p>

        {!file ? (
          <FileUploader
            accept="audio/*,.mp3,.wav,.m4a,.flac,.ogg,.webm"
            onFileSelect={handleFileSelect}
            title="Upload Audio Recording"
            subtitle="MP3, WAV, M4A, FLAC, OGG, WebM"
          />
        ) : !ffmpegLoaded ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <svg className="w-10 h-10 text-violet-500 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <p className="text-sm text-zinc-500 font-medium">Loading audio engine...</p>
            <p className="text-[10px] text-zinc-400 text-center max-w-xs">Downloading ~30MB WebAssembly core. First load may take a moment.</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div className="min-w-0 flex-1 mr-3">
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{file.name}</div>
                <div className="text-[10px] text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button onClick={removeFile} disabled={isProcessing} className="text-[10px] text-red-500 hover:underline disabled:opacity-50 shrink-0">Remove</button>
            </div>

            <div>
              <label className="text-[10px] font-semibold text-zinc-400 mb-2 block">Noise Reduction Level</label>
              <div className="grid grid-cols-4 gap-2">
                {LEVELS.map(l => (
                  <button
                    key={l}
                    onClick={() => setLevel(l)}
                    disabled={isProcessing}
                    className={`py-2.5 px-2 rounded-xl text-xs font-semibold transition-all ${
                      level === l
                        ? 'bg-violet-500 text-white shadow-md shadow-violet-500/20'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    } disabled:opacity-50`}
                  >
                    {LEVEL_LABELS[l]}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-zinc-400 mt-1.5">{`afftdn nf=${LEVEL_NF[level]}`}</p>
            </div>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useNoiseProfile}
                onChange={e => setUseNoiseProfile(e.target.checked)}
                disabled={isProcessing}
                className="rounded border-zinc-300 dark:border-zinc-700 text-violet-500 focus:ring-violet-500 disabled:opacity-50"
              />
              <div>
                <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Sample noise profile</span>
                <p className="text-[10px] text-zinc-400">Select a noise-only section for targeted removal using non-local means denoising</p>
              </div>
            </label>

            {useNoiseProfile && (
              <div className="grid grid-cols-2 gap-3 pl-7">
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">Noise Start (sec)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={noiseStart}
                    onChange={e => setNoiseStart(Math.max(0, Number(e.target.value)))}
                    disabled={isProcessing}
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-violet-500 disabled:opacity-50"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">{Math.floor(noiseStart / 60)}:{(noiseStart % 60).toFixed(1).padStart(4, '0')}</span>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">Noise End (sec)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={noiseEnd}
                    onChange={e => setNoiseEnd(Math.max(0, Number(e.target.value)))}
                    disabled={isProcessing}
                    className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white outline-none disabled:opacity-50"
                  />
                  <span className="text-[10px] text-zinc-400 mt-1 block">{Math.floor(noiseEnd / 60)}:{(noiseEnd % 60).toFixed(1).padStart(4, '0')}</span>
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">Output Format</label>
              <select
                value={outputFormat}
                onChange={e => setOutputFormat(e.target.value as OutputFormat)}
                disabled={isProcessing}
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none disabled:opacity-50"
              >
                {OUTPUT_FORMATS.map(f => (
                  <option key={f} value={f}>{f.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {!outputUrl && !isProcessing && (
              <button
                onClick={processAudio}
                className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {useNoiseProfile ? 'Sample Noise & Reduce' : 'Reduce Noise'}
              </button>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-semibold text-violet-600 dark:text-violet-400">
                  <span>{useNoiseProfile ? 'Analyzing noise profile & processing...' : 'Reducing noise...'}</span>
                  <span>{processingProgress}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-violet-500 h-full transition-all duration-300 rounded-full" style={{ width: `${processingProgress}%` }}></div>
                </div>
              </div>
            )}

            {outputUrl && originalUrlRef.current && (
              <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-zinc-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-zinc-400 inline-block" />
                      Original
                    </p>
                    <audio controls className="w-full" src={originalUrlRef.current} />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-emerald-500 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                      Processed
                    </p>
                    <audio controls className="w-full" src={outputUrl} />
                  </div>
                </div>
                <button
                  onClick={() => {
                    const base = file.name.replace(/\.[^/.]+$/, '') || 'audio';
                    downloadOrShare(outputUrl, `${base}_denoised.${outputFormat}`);
                  }}
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Download Denoised Audio
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
            <strong>How it works:</strong> Simple mode uses FFmpeg's <code className="text-[9px] px-1 py-0.5 bg-indigo-100 dark:bg-indigo-800/40 rounded">afftdn</code> adaptive frequency-domain noise reduction, automatically estimating stationary noise and suppressing it. Noise profile mode extracts the selected segment for analysis and applies <code className="text-[9px] px-1 py-0.5 bg-indigo-100 dark:bg-indigo-800/40 rounded">anlmdn</code> non-local means denoising for more aggressive reduction. Results vary by recording quality and noise characteristics.
          </p>
        </div>
      </div>
    </div>
  );
}
