"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileUploader } from '@/components/tools/FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { fetchFile } from '@ffmpeg/util';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { EmptyState } from '@/components/EmptyState';

const BANDS = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
const BAND_LABELS = ['31Hz', '62Hz', '125Hz', '250Hz', '500Hz', '1kHz', '2kHz', '4kHz', '8kHz', '16kHz'];

const PRESETS: Record<string, number[]> = {
  Flat: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  'Bass Boost': [6, 6, 4, 3, 1, 0, 0, 0, 0, 0],
  Rock: [4, 4, 3, 1, 0, 0, 1, 3, 4, 4],
  Pop: [1, 2, 3, 4, 3, 0, 2, 3, 4, 3],
  Jazz: [3, 3, 2, 1, 0, 1, 2, 3, 4, 4],
  Classical: [4, 3, 2, 1, 0, 0, 1, 2, 3, 4],
  'Vocal Boost': [-1, -1, 0, 1, 2, 4, 5, 4, 2, 1],
  'Treble Boost': [0, 0, 0, 0, 0, 0, 0, 2, 4, 6],
};

const PRESET_NAMES = Object.keys(PRESETS);

const OUTPUT_FORMATS = ['mp3', 'wav', 'm4a', 'flac', 'ogg'] as const;

const OUTPUT_MIME: Record<string, string> = {
  mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4',
  flac: 'audio/flac', ogg: 'audio/ogg',
};

const ACCEPT_STRING = 'audio/mpeg,audio/wav,audio/mp4,audio/flac,audio/ogg,.mp3,.wav,.m4a,.flac,.ogg';

export default function AudioEqualizer() {
  const [file, setFile] = useState<File | null>(null);
  const [bands, setBands] = useState<number[]>([...PRESETS.Flat!]);
  const [preset, setPreset] = useState('Flat');
  const [outputFormat, setOutputFormat] = useState<typeof OUTPUT_FORMATS[number]>('mp3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { isLoaded, isLoading, loadFFmpeg, progress } = useFFmpeg();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [outputUrl, previewUrl]);

  useEffect(() => {
    if (!isProcessing) return;
    const el = document.getElementById('eq-progress');
    if (el) el.style.width = `${progress}%`;
    const tl = document.getElementById('eq-progress-text');
    if (tl) tl.textContent = `${progress}%`;
  }, [progress, isProcessing]);

  const getGainAtFreq = useCallback((f: number, f0: number, gain: number, bw = 1.0) => {
    if (gain === 0) return 0;
    const x = Math.log2(f / f0) / bw;
    return gain * Math.exp(-x * x * 4);
  }, []);

  const drawCurve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 16, bottom: 20, left: 36, right: 12 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    const minFreq = 20;
    const maxFreq = 20000;
    const minLog = Math.log(minFreq);
    const maxLog = Math.log(maxFreq);

    const freqToX = (f: number) => pad.left + (Math.log(f) - minLog) / (maxLog - minLog) * plotW;
    const gainToY = (g: number) => pad.top + (12 - g) / 24 * plotH;

    ctx.clearRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.lineWidth = 1;
    ctx.font = '9px system-ui';
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.textAlign = 'right';

    for (let dB = -12; dB <= 12; dB += 6) {
      const y = gainToY(dB);
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
      ctx.fillText(`${dB > 0 ? '+' : ''}${dB}`, pad.left - 4, y + 3);
    }

    const gridFreqs = [31, 62, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
    ctx.strokeStyle = 'rgba(0,0,0,0.06)';
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(0,0,0,0.3)';

    for (const f of gridFreqs) {
      const x = freqToX(f);
      ctx.beginPath();
      ctx.moveTo(x, pad.top);
      ctx.lineTo(x, pad.top + plotH);
      ctx.stroke();
      ctx.fillText(f >= 1000 ? `${f / 1000}k` : `${f}`, x, h - 4);
    }

    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad.left, gainToY(0));
    ctx.lineTo(w - pad.right, gainToY(0));
    ctx.stroke();

    const steps = 200;
    const combined: number[] = new Array(steps).fill(0);
    const freqs: number[] = [];

    for (let j = 0; j < steps; j++) {
      freqs.push(minFreq * Math.exp((Math.log(maxFreq / minFreq) * j) / (steps - 1)));
    }

    for (let i = 0; i < BANDS.length; i++) {
      const gain = bands[i]!;
      if (gain === 0) continue;
      const f0 = BANDS[i]!;
      const curve: { x: number; y: number }[] = [];
      for (let j = 0; j < steps; j++) {
        const g = getGainAtFreq(freqs[j]!, f0, gain);
        combined[j]! += g;
        curve.push({ x: freqToX(freqs[j]!), y: gainToY(g) });
      }
      ctx.strokeStyle = 'rgba(168,85,247,0.12)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(curve[0]!.x, Math.max(pad.top, Math.min(pad.top + plotH, curve[0]!.y)));
      for (let j = 1; j < steps; j++) {
        ctx.lineTo(curve[j]!.x, Math.max(pad.top, Math.min(pad.top + plotH, curve[j]!.y)));
      }
      ctx.stroke();
    }

    const finalCurve: { x: number; y: number }[] = [];
    if (combined.some(v => v !== 0)) {
      for (let j = 0; j < steps; j++) {
        const f = minFreq * Math.exp((Math.log(maxFreq / minFreq) * j) / (steps - 1));
        const x = freqToX(f);
        const y = gainToY(Math.max(-12, Math.min(12, combined[j]!)));
        finalCurve.push({ x, y });
      }
    } else {
      for (let j = 0; j < steps; j++) {
        const f = minFreq * Math.exp((Math.log(maxFreq / minFreq) * j) / (steps - 1));
        const x = freqToX(f);
        const y = gainToY(0);
        finalCurve.push({ x, y });
      }
    }

    ctx.beginPath();
    ctx.moveTo(finalCurve[0]!.x, finalCurve[0]!.y);
    for (let j = 1; j < steps; j++) {
      ctx.lineTo(finalCurve[j]!.x, Math.max(pad.top, Math.min(pad.top + plotH, finalCurve[j]!.y)));
    }
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(finalCurve[0]!.x, finalCurve[0]!.y);
    for (let j = 1; j < steps; j++) {
      ctx.lineTo(finalCurve[j]!.x, Math.max(pad.top, Math.min(pad.top + plotH, finalCurve[j]!.y)));
    }
    ctx.strokeStyle = 'rgba(168,85,247,0.08)';
    ctx.lineWidth = 6;
    ctx.stroke();
  }, [bands, getGainAtFreq]);

  useEffect(() => {
    drawCurve();
  }, [drawCurve]);

  const handleFileSelect = (f: File, _dataUrl: string) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreviewUrl(url);
    setOutputUrl(null);
    setBands([...PRESETS.Flat!]);
    setPreset('Flat');
    loadFFmpeg();
  };
  const handleReset = () => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setOutputUrl(null);
    setBands([...PRESETS.Flat!]);
    setPreset('Flat');
  };

  const applyPreset = (name: string) => {
    const p = PRESETS[name];
    if (!p) return;
    setPreset(name);
    setBands([...p]);
  };

  const updateBand = (index: number, value: number) => {
    const next = [...bands];
    next[index] = value;
    setBands(next);
    const match = PRESET_NAMES.find(n => PRESETS[n]!.every((v, i) => v === next[i]));
    setPreset(match ?? '');
  };

  const processAudio = async () => {
    if (!file || !isLoaded) {
      toast.error('Audio engine not ready.');
      return;
    }
    setIsProcessing(true);
    try {
      const ff = await loadFFmpeg();
      if (!ff) {
        toast.error('Audio engine not ready.');
        return;
      }
      const ext = file.name.split('.').pop() || 'mp3';
      const inputName = `input.${ext}`;
      const outputName = `output.${outputFormat}`;

      await ff.writeFile(inputName, await fetchFile(file));

      const filterParts = bands
        .map((g, i) => (g !== 0 ? `equalizer=f=${BANDS[i]}:width_type=o:width=1.0:g=${g}` : null))
        .filter(Boolean) as string[];

      if (filterParts.length > 0) {
        await ff.exec([
          '-i', inputName,
          '-af', filterParts.join(','),
          outputName,
        ]);
      } else {
        await ff.exec(['-i', inputName, '-c', 'copy', outputName]);
      }

      const data = await ff.readFile(outputName);
      const blob = new Blob([data as BlobPart], { type: OUTPUT_MIME[outputFormat] });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));

      await ff.deleteFile(inputName);
      await ff.deleteFile(outputName);
      toast.success('Equalized successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Failed to process audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Audio Equalizer</h3>
        </div>
        <div className="overflow-hidden space-y-5">
          <p className="text-xs text-[var(--text-secondary)]">
            Adjust frequency bands with a 10-band graphic equalizer. All processing happens locally in your browser.
          </p>
          <FileUploader
            accept={ACCEPT_STRING}
            onFileSelect={handleFileSelect}
            title="Upload Audio File"
            subtitle="MP3, WAV, M4A, FLAC, OGG"
          />
          {isLoading && (
            <div className="flex items-center justify-center gap-2 py-3 text-xs text-[var(--text-muted)]">
              <svg className="w-4 h-4 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Loading audio engine...
            </div>
          )}
          <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/30 rounded-xl p-3">
            <p className="text-[10px] text-violet-600 dark:text-violet-400">
              <strong>Pro:</strong> Fine-tune your audio with precise EQ control. Save custom presets, compare before/after, and export in any format.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Audio Equalizer</h3>
      </div>

      <div className="overflow-hidden space-y-5">
        <div className="flex items-center justify-between p-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{file.name}</div>
              <div className="text-[10px] text-[var(--text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
            </div>
          </div>
          <button onClick={handleReset} disabled={isProcessing}
            className="text-[10px] text-red-500 hover:underline flex-shrink-0 disabled:opacity-40">
            Remove
          </button>
        </div>

        {!isLoaded && !isLoading && (
          <button onClick={loadFFmpeg}
            className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-2.5 rounded-xl text-xs">
            Load Audio Engine
          </button>
        )}

        {isLoading && (
          <div className="flex items-center justify-center gap-2 py-4 text-xs text-[var(--text-muted)]">
            <svg className="w-4 h-4 animate-spin text-violet-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading audio engine...
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {PRESET_NAMES.map(name => (
            <button key={name} onClick={() => applyPreset(name)}
              className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all
                ${preset === name
                  ? 'bg-violet-500 text-white border-violet-500'
                  : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)]'
                }`}>
              {name}
            </button>
          ))}
        </div>

        <div className="w-full h-44 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full" />
        </div>

        <div className="overflow-x-auto -mx-5 px-5 pb-2">
          <div className="flex justify-between gap-1 min-w-[480px]">
            {BANDS.map((freq, i) => (
              <div key={freq} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-[9px] font-semibold text-[var(--text-muted)]">{BAND_LABELS[i]}</span>
                <input aria-label={BAND_LABELS[i]}
                  type="range"
                  min="-12"
                  max="12"
                  step="1"
                  value={bands[i]}
                  onChange={e => updateBand(i, Number(e.target.value))}
                  className="h-28 w-5 cursor-pointer accent-violet-500"
                  style={{ writingMode: 'vertical-lr', direction: 'ltr' }}
                />
                <span className={`text-[10px] font-mono font-semibold
                  ${bands[i]! > 0 ? 'text-emerald-500' : bands[i]! < 0 ? 'text-red-700 dark:text-red-400' : 'text-[var(--text-muted)]'}`}>
                  {bands[i]! > 0 ? '+' : ''}{bands[i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-2">
            <label htmlFor="lbl-audioequalizer-output" className="text-[10px] font-semibold text-[var(--text-muted)]">Output:</label>
            <select id="lbl-audioequalizer-output" aria-label="Output:" value={outputFormat} onChange={e => setOutputFormat(e.target.value as typeof OUTPUT_FORMATS[number])}
              className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
              {OUTPUT_FORMATS.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
            </select>
          </div>

          {!isProcessing && !outputUrl && isLoaded && (
            <button onClick={processAudio}
              className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all active:scale-[0.98]">
              Apply Equalizer
            </button>
          )}

          {isProcessing && (
            <div className="flex items-center gap-3 flex-1">
              <div className="flex-1 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-full h-2 overflow-hidden">
                <div id="eq-progress" className="bg-violet-500 h-full transition-all duration-300" style={{ width: '0%' }}></div>
              </div>
              <span id="eq-progress-text" className="text-[10px] font-semibold text-violet-500 w-8 text-right">0%</span>
            </div>
          )}
        </div>

        {(previewUrl || outputUrl) && (
          <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
            {previewUrl && (
              <div>
                <div className="text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                  Original
                </div>
                <audio controls className="w-full h-9" src={previewUrl}></audio>
              </div>
            )}
            {outputUrl ? (
              <div role="status">
                <div className="text-[10px] font-semibold text-emerald-500 mb-1.5 flex items-center gap-1.5">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Equalized ({outputFormat.toUpperCase()})
                </div>
                <audio controls className="w-full h-9" src={outputUrl}></audio>
              </div>
            ) : (
              <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
                <EmptyState
                  title="Equalized audio will appear here"
                  message="Upload audio above to equalize."
                />
              </div>
            )}
            {outputUrl && (
              <button onClick={() => downloadOrShare(outputUrl, `equalized_${file.name.replace(/\.[^/.]+$/, '')}.${outputFormat}`)}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {outputFormat.toUpperCase()}
              </button>
            )}
          </div>
        )}

        <div className="bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800/30 rounded-xl p-3">
          <p className="text-[10px] text-violet-600 dark:text-violet-400">
            <strong>Pro:</strong> Fine-tune your audio with precise EQ control. Save custom presets, compare before/after, and export in any format.
          </p>
        </div>
      </div>
    </div>
  );
}
