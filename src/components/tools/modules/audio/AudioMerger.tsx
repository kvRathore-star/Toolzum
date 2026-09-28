"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { FileUploader } from '@/components/tools/FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { fetchFile } from '@ffmpeg/util';
import { useFFmpeg } from '@/hooks/useFFmpeg';

const FORMATS = ['mp3', 'wav', 'm4a', 'flac', 'ogg'] as const;
type Format = typeof FORMATS[number];

const FORMAT_LABELS: Record<Format, string> = {
  mp3: 'MP3', wav: 'WAV', m4a: 'M4A (AAC)', flac: 'FLAC', ogg: 'OGG Vorbis',
};

const MIME_TYPES: Record<Format, string> = {
  mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', flac: 'audio/flac', ogg: 'audio/ogg',
};

const EXTENSIONS: Record<Format, string> = {
  mp3: 'mp3', wav: 'wav', m4a: 'm4a', flac: 'flac', ogg: 'ogg',
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function AudioMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [order, setOrder] = useState<number[]>([]);
  const [outputFormat, setOutputFormat] = useState<Format>('mp3');
  const [crossfade, setCrossfade] = useState(0);
  const [normalize, setNormalize] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [durations, setDurations] = useState<number[]>([]);

  const { isLoaded, isLoading, loadFFmpeg, progress } = useFFmpeg();
  const addMoreRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    loadFFmpeg();
  }, []);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  useEffect(() => {
    if (files.length === 0) return;
    let cancelled = false;
    (async () => {
      const durs: number[] = [];
      for (const file of files) {
        if (cancelled) return;
        const url = URL.createObjectURL(file);
        await new Promise<void>((resolve) => {
          const audio = new Audio(url);
          audio.onloadedmetadata = () => {
            durs.push(audio.duration);
            URL.revokeObjectURL(url);
            resolve();
          };
          audio.onerror = () => {
            durs.push(0);
            URL.revokeObjectURL(url);
            resolve();
          };
        });
      }
      if (!cancelled) setDurations(durs);
    })();
    return () => { cancelled = true; };
  }, [files]);

  const totalDuration = useMemo(() => {
    if (order.length === 0 || durations.length === 0) return 0;
    const sum = order.reduce((acc, idx) => acc + (durations[idx] || 0), 0);
    const overlap = crossfade * Math.max(0, order.length - 1);
    return Math.max(0, sum - overlap);
  }, [durations, order, crossfade]);

  const addFiles = (newFiles: File[]) => {
    if (newFiles.length === 0) return;
    const valid = newFiles.filter((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      return ext && (['mp3', 'wav', 'm4a', 'flac', 'ogg'] as string[]).includes(ext);
    });
    if (valid.length === 0) {
      toast.error('Please select audio files (MP3, WAV, M4A, FLAC, OGG).');
      return;
    }
    const startIdx = files.length;
    setFiles((prev) => [...prev, ...valid]);
    setOrder((prev) => [...prev, ...valid.map((_, i) => startIdx + i)]);
    setOutputUrl(null);
  };

  const removeFile = (displayIdx: number) => {
    const fileIdx = order[displayIdx];
    setFiles((prev) => prev.filter((_, i) => i !== fileIdx));
    setOrder((prev) => {
      const remaining = prev.filter((_, i) => i !== displayIdx);
      return remaining.map((i) => (i > fileIdx! ? i - 1 : i));
    });
    setOutputUrl(null);
  };

  const moveUp = (displayIdx: number) => {
    if (displayIdx === 0) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[displayIdx - 1]!, next[displayIdx]!] = [next[displayIdx]!, next[displayIdx - 1]!];
      return next;
    });
    setOutputUrl(null);
  };

  const moveDown = (displayIdx: number) => {
    if (displayIdx >= order.length - 1) return;
    setOrder((prev) => {
      const next = [...prev];
      [next[displayIdx]!, next[displayIdx + 1]!] = [next[displayIdx + 1]!, next[displayIdx]!];
      return next;
    });
    setOutputUrl(null);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(e.target.files || []));
    if (e.target) e.target.value = '';
  };

  const mergeAudio = async () => {
    if (order.length < 2) {
      toast.error('Add at least 2 audio files to merge.');
      return;
    }
    const ff = await loadFFmpeg();
    if (!ff) {
      toast.error('FFmpeg is not ready yet.');
      return;
    }

    setIsProcessing(true);
    setOutputUrl(null);
    try {
      const outputName = `merged.${EXTENSIONS[outputFormat]}`;
      const inputFiles: { name: string; ext: string }[] = [];

      for (let i = 0; i < order.length; i++) {
        const file = files[order[i]!]!;
        const ext = file.name.split('.').pop() || 'mp3';
        const vfsName = `input${i}.${ext}`;
        await ff.writeFile(vfsName, await fetchFile(file));
        inputFiles.push({ name: vfsName, ext });
      }

      const inputArgs = inputFiles.flatMap((f) => ['-i', f.name]);

      const lastLabel = normalize ? 'norm' : 'out';

      let filterComplex = '';
      if (crossfade > 0) {
        const parts: string[] = [];
        for (let i = 0; i < order.length - 1; i++) {
          const prev = i === 0 ? `[0:a]` : `[af${i - 1}]`;
          const next = `[${i + 1}:a]`;
          const out = i === order.length - 2 ? `[${lastLabel}]` : `[af${i}]`;
          parts.push(`${prev}${next}acrossfade=d=${crossfade}${out}`);
        }
        filterComplex = parts.join(';');
      } else {
        const streams = order.map((_, i) => `[${i}:a]`).join('');
        filterComplex = `${streams}concat=n=${order.length}:v=0:a=1[${lastLabel}]`;
      }

      if (normalize) {
        filterComplex += `;[${lastLabel}]loudnorm=I=-16:LRA=11:TP=-1.5[out]`;
      }

      await ff.exec([
        ...inputArgs,
        '-filter_complex', filterComplex,
        '-map', '[out]',
        outputName,
      ]);

      const data = await ff.readFile(outputName);
      const blob = new Blob([data as BlobPart], { type: MIME_TYPES[outputFormat] });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);

      for (const f of inputFiles) {
        try { await ff.deleteFile(f.name); } catch { /* ignore */ }
      }
      try { await ff.deleteFile(outputName); } catch { /* ignore */ }

      toast.success(`Merged ${order.length} files → ${outputFormat.toUpperCase()}`);
    } catch (e) {
      console.error(e);
      toast.error('Merge failed. Check that all files are valid audio.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-4">
        <svg className="w-10 h-10 text-[var(--accent)] animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-[var(--text-secondary)] text-sm font-medium animate-pulse">
          {isLoading ? 'Loading audio engine...' : 'Initializing...'}
        </p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-xs">
          <strong>Merge Audio Tracks — 100% Offline:</strong> Combine MP3, WAV, M4A, FLAC, and OGG files into one seamless track. Add crossfade transitions and optional loudness normalization.
        </div>
        <FileUploader
          accept="audio/mp3,audio/wav,audio/mpeg,audio/ogg,audio/flac,audio/mp4,.mp3,.wav,.m4a,.flac,.ogg"
          onFileSelect={(file) => addFiles([file])}
          title="Select Audio Files"
          subtitle="Start with one track — add more after"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-6">
      <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-xs">
        <strong>Audio Merger:</strong> Drag to reorder or use the arrows. All processing is done locally — nothing is uploaded.
      </div>

      <div className="overflow-hidden space-y-5">
        {/* File list */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
              Tracks ({order.length})
            </h4>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[var(--text-muted)]">{formatTime(totalDuration)}</span>
              <button
                onClick={() => addMoreRef.current?.click()}
                className="text-[10px] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] px-3 py-1.5 rounded-lg text-[var(--text-secondary)] dark:text-[var(--text-muted)] transition-colors"
              >
                + Add More
              </button>
              <input
                ref={addMoreRef}
                aria-label="Add more audio files"
                type="file"
                multiple
                accept=".mp3,.wav,.m4a,.flac,.ogg"
                onChange={handleUpload}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
            {order.map((fileIdx, displayIdx) => {
              const file = files[fileIdx];
              return (
                <div
                  key={`${fileIdx}-${displayIdx}`}
                  className="flex items-center gap-2 p-2.5 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] group"
                >
                  <span className="text-[10px] text-[var(--text-muted)] w-5 text-right font-mono">{displayIdx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-[var(--text-primary)] truncate">{file!.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {(file!.size / 1024 / 1024).toFixed(1)} MB
                      {durations[fileIdx] ? ` · ${formatTime(durations[fileIdx])}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      aria-label={`Move ${file!.name} up`}
                      onClick={() => moveUp(displayIdx)}
                      disabled={displayIdx === 0}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-white disabled:opacity-20 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button
                      aria-label={`Move ${file!.name} down`}
                      onClick={() => moveDown(displayIdx)}
                      disabled={displayIdx === order.length - 1}
                      className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] dark:hover:text-white disabled:opacity-20 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    <button
                      aria-label={`Remove ${file!.name}`}
                      onClick={() => removeFile(displayIdx)}
                      className="p-1 text-red-700 dark:text-red-400 hover:text-red-600 transition-colors ml-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-[var(--border-subtle)] pt-5 space-y-5">
          {/* Format selector */}
          <div>
            <label className="text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 block uppercase tracking-wider">Output Format</label>
            <div className="flex flex-wrap gap-1.5">
              {FORMATS.map((f) => (
                <button
                  key={f}
                  onClick={() => setOutputFormat(f)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    outputFormat === f
                      ? 'bg-[var(--accent-ink)] text-white shadow-md'
                      : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                  }`}
                >
                  {FORMAT_LABELS[f]}
                </button>
              ))}
            </div>
          </div>

          {/* Crossfade */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Crossfade</label>
              <span className="text-xs font-bold text-[var(--accent)]">{crossfade}s</span>
            </div>
            <input aria-label="Crossfade"
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={crossfade}
              onChange={(e) => setCrossfade(Number(e.target.value))}
              disabled={isProcessing}
              className="w-full accent-blue-500"
            />
            <p className="text-[10px] text-[var(--text-muted)] mt-1">Smooth transition between tracks</p>
          </div>

          {/* Normalize */}
          <label className="flex items-center gap-3 cursor-pointer group">
            <button
              role="switch"
              aria-checked={normalize}
              aria-label="Normalize volume"
              onClick={() => setNormalize((n) => !n)}
              disabled={isProcessing}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                normalize ? 'bg-[var(--accent-ink)]' : 'bg-[var(--bg-overlay)]'
              } ${isProcessing ? 'opacity-50' : ''}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                  normalize ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <div>
              <span className="text-xs font-medium text-[var(--text-primary)]">Normalize Volume</span>
              <p className="text-[10px] text-[var(--text-muted)]">Equalize loudness across all tracks (-16 LUFS)</p>
            </div>
          </label>
        </div>

        {/* Action area */}
        {!outputUrl && !isProcessing && (
          <button
            onClick={mergeAudio}
            disabled={order.length < 2}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-ink)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-40"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Merge {order.length} Tracks → {outputFormat.toUpperCase()}
          </button>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-semibold text-[var(--accent)]">
              <span>Merging audio files...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-full h-2 overflow-hidden">
              <div className="bg-[var(--accent-ink)] h-full transition-all duration-300 rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {outputUrl && !isProcessing && (
          <div className="space-y-3 pt-2 border-t border-[var(--border-subtle)]">
            <audio controls className="w-full" src={outputUrl} />
            <button
              onClick={() => downloadOrShare(outputUrl, `merged_audio.${EXTENSIONS[outputFormat]}`)}
              className="w-full bg-[var(--accent-ink)] hover:opacity-90 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              Download {outputFormat.toUpperCase()} ({formatTime(totalDuration)})
            </button>
          </div>
        )}
      </div>

      <div className="bg-[var(--accent)]/10/20 border border-[var(--accent)]/20 rounded-xl p-3">
        <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]">
          <strong>Pro:</strong> Combine podcasts, merge audio chapters, create seamless DJ mixes — all in your browser. Crossfade durations up to 10s, loudness normalization, and batch mode available for power users.
        </p>
      </div>
    </div>
  );
}
