"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '@/components/tools/FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { fetchFile } from '@ffmpeg/util';
import { createDownloadBlob } from '@/utils/blob';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { useEnterToSubmit } from '@/lib/keyboard';

type OutputFormat = 'mp3' | 'wav' | 'm4a' | 'flac' | 'ogg';

interface Preset {
  name: string;
  threshold: number;
  ratio: number;
  attack: number;
  release: number;
  makeup: number;
  knee: number;
}

const PRESETS: Preset[] = [
  { name: 'Podcast', threshold: -24, ratio: 4, attack: 5, release: 50, makeup: 3, knee: 2.5 },
  { name: 'Music', threshold: -20, ratio: 2.5, attack: 10, release: 100, makeup: 2, knee: 5 },
  { name: 'Limiter', threshold: -6, ratio: 20, attack: 1, release: 20, makeup: 0, knee: 0 },
  { name: 'Voice Over', threshold: -30, ratio: 3, attack: 3, release: 30, makeup: 4, knee: 1.5 },
  { name: 'Custom', threshold: -24, ratio: 4, attack: 5, release: 50, makeup: 3, knee: 2.5 },
];

const OUTPUT_FORMATS: { value: OutputFormat; label: string; mime: string; ext: string }[] = [
  { value: 'mp3', label: 'MP3', mime: 'audio/mpeg', ext: 'mp3' },
  { value: 'wav', label: 'WAV', mime: 'audio/wav', ext: 'wav' },
  { value: 'm4a', label: 'M4A (AAC)', mime: 'audio/mp4', ext: 'm4a' },
  { value: 'flac', label: 'FLAC', mime: 'audio/flac', ext: 'flac' },
  { value: 'ogg', label: 'OGG', mime: 'audio/ogg', ext: 'ogg' },
];

function simulateGainReduction(threshold: number, ratio: number, knee: number): number {
  const effectiveRatio = Math.max(ratio, 1);
  const reduction = Math.min(Math.abs(threshold) * (1 - 1 / effectiveRatio) + knee * 0.3, 40);
  return Math.min(Math.round(reduction * 2.5), 100);
}

export default function AudioCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [threshold, setThreshold] = useState(-24);
  const [ratio, setRatio] = useState(4);
  const [attack, setAttack] = useState(5);
  const [release, setRelease] = useState(50);
  const [makeup, setMakeup] = useState(3);
  const [knee, setKnee] = useState(2.5);
  const [preset, setPreset] = useState('Custom');
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('mp3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const { isLoaded, isLoading, loadFFmpeg, progress } = useFFmpeg();
  const originalUrl = useRef<string | null>(null);

  useEffect(() => {
    if (file) {
      if (originalUrl.current) URL.revokeObjectURL(originalUrl.current);
      originalUrl.current = URL.createObjectURL(file);
    }
    return () => {
      if (originalUrl.current) URL.revokeObjectURL(originalUrl.current);
    };
  }, [file]);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const applyPreset = (p: string) => {
    setPreset(p);
    const found = PRESETS.find(pr => pr.name === p);
    if (found) {
      setThreshold(found.threshold);
      setRatio(found.ratio);
      setAttack(found.attack);
      setRelease(found.release);
      setMakeup(found.makeup);
      setKnee(found.knee);
    }
  };

  const processAudio = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      toast.loading('Loading compressor engine...');
      const ffmpeg = await loadFFmpeg();
      toast.dismiss();
      if (!ffmpeg) {
        toast.error('Failed to load FFmpeg engine.');
        return;
      }
      const inputName = `input_${file.name.replace(/\s+/g, '_')}`;
      const fmt = OUTPUT_FORMATS.find(f => f.value === outputFormat)!;
      const outputName = `output.${fmt.ext}`;

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const filter = `acompressor=threshold=${threshold}:ratio=${ratio}:attack=${attack}:release=${release}:knee=${knee}:makeup=${makeup}`;
      await ffmpeg.exec(['-i', inputName, '-af', filter, outputName]);

      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(createDownloadBlob(data, fmt.mime));
      setOutputUrl(url);

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      toast.success('Compression complete!');
    } catch (e) {
      console.error(e);
      toast.error('Compression failed. Try different settings.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = useEnterToSubmit(processAudio);

  const gainReduction = simulateGainReduction(threshold, ratio, knee);
  const sliderClass = (val: number, min: number, max: number) =>
    ((val - min) / (max - min)) * 100;

  if (!file) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
          <strong>Dynamic Range Compression:</strong> Reduce the volume gap between quiet and loud parts of your audio. All processing happens locally in your browser.
        </div>
        <FileUploader
          accept="audio/*"
          onFileSelect={(_f: File) => {
            setFile(_f);
            setOutputUrl(null);
          }}
          title="Upload Audio File"
          subtitle="Supports MP3, WAV, M4A, FLAC, OGG (20MB free, 50MB signed in)"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-700 dark:text-amber-400 text-sm">
        <strong>Dynamic Range Compression:</strong> Reduce the volume gap between quiet and loud parts of your audio. All processing happens locally in your browser.
      </div>

      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 truncate">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          onClick={() => { setFile(null); setOutputUrl(null); }}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg shrink-0 ml-4"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-[var(--text-primary)] font-medium">Compressor Settings</h4>
            <div className="flex gap-1.5 flex-wrap">
              {PRESETS.map(p => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p.name)}
                  className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all ${
                    preset === p.name
                      ? 'bg-amber-500 text-white'
                      : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <SliderControl label="Threshold" value={threshold} min={-60} max={0} step={1} unit="dB" onChange={setThreshold} />
            <SliderControl label="Ratio" value={ratio} min={1} max={20} step={0.5} unit=":1" onChange={setRatio} />
            <SliderControl label="Attack" value={attack} min={1} max={100} step={1} unit="ms" onChange={setAttack} />
            <SliderControl label="Release" value={release} min={10} max={1000} step={10} unit="ms" onChange={setRelease} />
            <SliderControl label="Makeup Gain" value={makeup} min={0} max={20} step={0.5} unit="dB" onChange={setMakeup} />
            <SliderControl label="Knee" value={knee} min={0} max={10} step={0.5} unit="dB" onChange={setKnee} />
          </div>

          <div>
            <label className="text-[10px] font-semibold text-[var(--text-muted)] mb-2 block">Output Format</label>
            <div className="flex gap-2 flex-wrap">
              {OUTPUT_FORMATS.map(fmt => (
                <button
                  key={fmt.value}
                  onClick={() => setOutputFormat(fmt.value)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                    outputFormat === fmt.value
                      ? 'bg-amber-500 text-white'
                      : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  {fmt.label}
                </button>
              ))}
            </div>
          </div>

          {!isLoaded && !isLoading && !isProcessing && (
            <button
              onClick={processAudio}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-[0.98]"
            >
              Load Engine & Compress
            </button>
          )}

          {(isLoading || (!isLoaded && isProcessing)) && (
            <div className="text-center text-[var(--text-secondary)] py-4 flex flex-col items-center gap-2">
              <svg className="w-5 h-5 animate-spin text-amber-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              <span className="text-[10px]">Loading FFmpeg Engine...</span>
            </div>
          )}

          {isLoaded && !isProcessing && !outputUrl && (
            <button
              onClick={processAudio}
              onKeyDown={handleKeyDown}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-[0.98] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label={isProcessing ? 'Compressing audio...' : 'Compress audio'}
            >
              Compress Audio
            </button>
          )}

          {isProcessing && isLoaded && (
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                <span>Processing...</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full h-4 overflow-hidden relative">
                <div
                  className="bg-gradient-to-r from-amber-400 to-amber-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(gainReduction + 20, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[9px] text-[var(--text-muted)]">
                <span>Estimated Gain Reduction: {gainReduction}%</span>
                <span>Applying compression filter...</span>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="bg-[var(--bg-overlay)] rounded-xl p-3 border border-[var(--border-subtle)]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-semibold text-[var(--text-secondary)]">Gain Reduction</span>
                <span className="text-[10px] font-mono text-amber-500 font-bold">{gainReduction}%</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full h-6 overflow-hidden">
                <div
                  className="h-full transition-all duration-300 rounded-full"
                  style={{
                    width: `${gainReduction}%`,
                    background: gainReduction > 70
                      ? 'linear-gradient(90deg, #fbbf24, #ef4444)'
                      : gainReduction > 40
                      ? 'linear-gradient(90deg, #34d399, #fbbf24)'
                      : 'linear-gradient(90deg, #34d399, #22c55e)',
                  }}
                />
              </div>
              <p className="text-[9px] text-[var(--text-muted)] mt-1.5">
                Estimated compression based on threshold ({threshold}dB), ratio ({ratio}:1) and knee ({knee}dB)
              </p>
            </div>
          )}
        </div>

        <div className="space-y-5">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl">
            <h4 className="text-[var(--text-primary)] font-medium mb-3">Original</h4>
            <audio controls className="w-full" src={originalUrl.current || undefined} />
          </div>

          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-5 rounded-2xl shadow-xl">
            <h4 className="text-[var(--text-primary)] font-medium mb-3">Compressed</h4>
            {outputUrl ? (
              <>
                <audio controls className="w-full mb-4" src={outputUrl} />
                <button
                  onClick={() => {
                    const fmt = OUTPUT_FORMATS.find(f => f.value === outputFormat)!;
                    downloadOrShare(outputUrl, `compressed_${file.name.replace(/\.[^.]+$/, '')}.${fmt.ext}`);
                  }}
                  className="w-full bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-zinc-900 dark:text-zinc-100 hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] font-bold px-4 py-3 rounded-xl text-xs transition-all focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                  aria-label={`Download compressed audio as ${OUTPUT_FORMATS.find(f => f.value === outputFormat)!.label}`}
                >
                  Download {OUTPUT_FORMATS.find(f => f.value === outputFormat)!.label}
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-[var(--text-muted)]">
                <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                <p className="text-xs">Compress your audio to preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-4">
        <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]">
          <strong>What is compression?</strong> Audio compression reduces dynamic range — it makes quiet sounds louder and loud sounds quieter. <strong>Threshold</strong> sets when compression starts. <strong>Ratio</strong> controls how much compression is applied. <strong>Attack/Release</strong> determine how fast compression responds. <strong>Makeup Gain</strong> boosts the overall level after compression. <strong>Knee</strong> smooths the transition into compression.
        </p>
      </div>
    </div>
  );
}

function SliderControl({ label, value, min, max, step, unit, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <label className="text-[10px] font-semibold text-[var(--text-muted)]">{label}</label>
        <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">{value}{unit}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-[var(--bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:active:scale-110"
          style={{
            background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${pct}%, #e4e4e7 ${pct}%, #e4e4e7 100%)`,
          }}
        />
      </div>
    </div>
  );
}
