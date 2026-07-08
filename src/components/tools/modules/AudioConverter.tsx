"use client";

import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Music, Upload, Download, Loader2, ArrowRight } from 'lucide-react';
import { usePresetContext } from '@/context/WorkflowPresetContext';

const FORMATS = ['mp3', 'wav', 'ogg', 'flac'] as const;
type Format = typeof FORMATS[number];

const FORMAT_LABELS: Record<Format, string> = {
  mp3: 'MP3 (MPEG Audio)',
  wav: 'WAV (PCM Audio)',
  ogg: 'OGG (Vorbis)',
  flac: 'FLAC (Lossless)',
};

const FORMAT_ACCEPT: Record<Format, string> = {
  mp3: '.mp3',
  wav: '.wav',
  ogg: '.ogg',
  flac: '.flac',
};

const FORMAT_EXTENSIONS: Record<Format, string> = {
  mp3: 'mp3',
  wav: 'wav',
  ogg: 'ogg',
  flac: 'flac',
};

export default function AudioConverter() {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();
  const [file, setFile] = useState<File | null>(null);
  const [inputFormat, setInputFormat] = useState<Format>('mp3');
  const [outputFormat, setOutputFormat] = useState<Format>('wav');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const { registerConfig } = usePresetContext();

  useEffect(() => {
    registerConfig(
      () => ({ outputFormat, inputFormat }),
      (cfg) => {
        if (cfg.outputFormat && FORMATS.includes(cfg.outputFormat as Format)) setOutputFormat(cfg.outputFormat as Format);
        if (cfg.inputFormat && FORMATS.includes(cfg.inputFormat as Format)) setInputFormat(cfg.inputFormat as Format);
      },
    );
  }, [registerConfig, outputFormat, inputFormat]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setOutputUrl(null);
      if (!isLoaded) await loadFFmpeg();
    }
  };

  const processAudio = async () => {
    if (!file || !ffmpeg || !isLoaded) return;
    if (inputFormat === outputFormat) {
      toast.error('Input and output formats are the same');
      return;
    }

    setIsProcessing(true);
    try {
      const inputName = `input_${file.name.replace(/\s+/g, '_')}`;
      const outputName = `output.${FORMAT_EXTENSIONS[outputFormat]}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(['-i', inputName, outputName]);

      const data = await ffmpeg.readFile(outputName);
      const mimeTypes: Record<Format, string> = { mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac' };
      const blob = new Blob([data as unknown as BlobPart], { type: mimeTypes[outputFormat] });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      toast.success(`Converted to ${outputFormat.toUpperCase()} successfully!`);
    } catch (e) {
      console.error(e);
      toast.error('Failed to convert audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  const ext = file?.name.split('.').pop()?.toLowerCase() as Format | undefined;
  const detectedFormat = ext && FORMATS.includes(ext) ? ext : null;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Music className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Audio Converter</h3>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Convert between MP3, WAV, OGG, and FLAC formats. All processing happens locally — your files never leave your device.</p>

        {!file ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
            <input type="file" accept=".mp3,.wav,.ogg,.flac" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-zinc-500 flex flex-col items-center">
              <Upload className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-2" />
              Select Audio File
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</div>
                <div className="text-[10px] text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button onClick={() => { setFile(null); setOutputUrl(null); }} className="text-[10px] text-red-500 hover:underline">Remove</button>
            </div>

            {detectedFormat && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/30 rounded-xl px-3 py-2">
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Detected format: <strong>{detectedFormat.toUpperCase()}</strong></p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">From</label>
                <select value={inputFormat} onChange={e => setInputFormat(e.target.value as Format)}
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none">
                  {FORMATS.map(f => <option key={f} value={f}>{FORMAT_LABELS[f]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">To</label>
                <select value={outputFormat} onChange={e => setOutputFormat(e.target.value as Format)}
                  className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none">
                  {FORMATS.map(f => <option key={f} value={f} disabled={f === inputFormat}>{FORMAT_LABELS[f]}</option>)}
                </select>
              </div>
            </div>

            {(!isLoaded || isLoading) && (
              <div className="text-center text-zinc-500 py-4 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                <span className="text-[10px]">Loading FFmpeg Engine... (may take a moment)</span>
              </div>
            )}

            {isLoaded && !outputUrl && !isProcessing && (
              <button onClick={processAudio}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-50"
                disabled={inputFormat === outputFormat}>
                <ArrowRight className="w-4 h-4" /> Convert to {outputFormat.toUpperCase()}
              </button>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Converting...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            {outputUrl && (
              <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <audio controls className="w-full" src={outputUrl}></audio>
                <a href={outputUrl} download={`converted.${FORMAT_EXTENSIONS[outputFormat]}`}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                  <Download className="w-4 h-4" /> Download {outputFormat.toUpperCase()}
                </a>
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Batch convert multiple files at once, higher bitrate options (320kbps), presets for podcasts/audiobooks, audio normalization, volume booster.</p>
        </div>
      </div>
    </div>
  );
}
