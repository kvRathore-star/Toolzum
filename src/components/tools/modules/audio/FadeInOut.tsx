"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileUploader } from '@/components/tools/FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { fetchFile } from '@ffmpeg/util';
import { Music, Loader2, Download, Volume2, Play, Square, Trash2 } from 'lucide-react';
import { useFFmpeg } from '@/hooks/useFFmpeg';

type FadeCurve = 'linear' | 'logarithmic' | 'exponential' | 's-curve';
type OutputFormat = 'mp3' | 'wav' | 'm4a' | 'flac' | 'ogg';

const CURVES: { v: FadeCurve; l: string }[] = [
  { v: 'linear', l: 'Linear' },
  { v: 'logarithmic', l: 'Logarithmic' },
  { v: 'exponential', l: 'Exponential' },
  { v: 's-curve', l: 'S-curve' },
];

const FORMATS: OutputFormat[] = ['mp3', 'wav', 'm4a', 'flac', 'ogg'];
const FORMAT_LABELS: Record<OutputFormat, string> = { mp3: 'MP3', wav: 'WAV', m4a: 'M4A', flac: 'FLAC', ogg: 'OGG' };
const FFMPEG_CURVE: Record<FadeCurve, string> = { linear: 'tri', logarithmic: 'qsin', exponential: 'esin', 's-curve': 'sinc' };
const MIME: Record<OutputFormat, string> = { mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', flac: 'audio/flac', ogg: 'audio/ogg' };

function cv(t: number, c: FadeCurve): number {
  switch (c) {
    case 'linear': return t;
    case 'logarithmic': return Math.sin(t * Math.PI / 2);
    case 'exponential': return t * t;
    case 's-curve': return 0.5 - 0.5 * Math.cos(t * Math.PI);
  }
}

function fmt(s: number) {
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function FadePanel({ side, enabled, onToggle, duration, onDuration, percent, onPercent, curve, onCurve, color }: {
  side: 'in' | 'out'; enabled: boolean; onToggle: (v: boolean) => void;
  duration: number; onDuration: (v: number) => void;
  percent: boolean; onPercent: (v: boolean) => void;
  curve: FadeCurve; onCurve: (v: FadeCurve) => void; color: 'emerald' | 'red';
}) {
  const max = percent ? 100 : 30;
  const label = percent ? '%' : 's';
  const labelColor = color === 'emerald' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  const accent = color === 'emerald' ? 'accent-emerald-500' : 'accent-red-500';
  const toggleColor = color === 'emerald' ? 'text-emerald-500' : 'text-red-500';
  return (
    <div className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-semibold text-[var(--text-primary)]">
          <input type="checkbox" checked={enabled} onChange={e => onToggle(e.target.checked)}
            className={`rounded border-zinc-400 dark:border-zinc-600 text-${color}-500 focus:ring-${color}-500`} />
          {side === 'in' ? 'Fade In' : 'Fade Out'}
        </label>
        <span className={`text-[10px] font-mono ${labelColor}`}>
          {side === 'in' ? '+' : '-'}{duration.toFixed(1)}{label}
        </span>
      </div>
      {enabled && (
        <>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-[var(--text-muted)]">Duration</span>
              <button onClick={() => onPercent(!percent)}
                className={`text-[9px] ${toggleColor} hover:opacity-80 font-semibold uppercase tracking-wider`}>
                {percent ? 'Switch to sec' : 'Switch to %'}
              </button>
            </div>
            <input type="range" min={0.5} max={max} step={0.5} value={duration}
              onChange={e => onDuration(parseFloat(e.target.value))}
              className={`w-full ${accent}`} />
            <div className="text-center text-[10px] text-[var(--text-secondary)] font-mono">{duration.toFixed(1)}{label}</div>
          </div>
          <div>
            <span className="text-[10px] text-[var(--text-muted)] block mb-1">Curve</span>
            <select aria-label="Curve" value={curve} onChange={e => onCurve(e.target.value as FadeCurve)}
              className="w-full bg-white dark:bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-lg px-2 py-1.5 text-xs text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2">
              {CURVES.map(c => <option key={c.v} value={c.v}>{c.l}</option>)}
            </select>
          </div>
        </>
      )}
    </div>
  );
}

export default function FadeInOut() {
  const [file, setFile] = useState<File | null>(null);
  const [fadeIn, setFadeIn] = useState(true);
  const [fadeInDur, setFadeInDur] = useState(2);
  const [fadeInPct, setFadeInPct] = useState(false);
  const [fadeInCurve, setFadeInCurve] = useState<FadeCurve>('linear');
  const [fadeOut, setFadeOut] = useState(true);
  const [fadeOutDur, setFadeOutDur] = useState(3);
  const [fadeOutPct, setFadeOutPct] = useState(false);
  const [fadeOutCurve, setFadeOutCurve] = useState<FadeCurve>('linear');
  const [outputFmt, setOutputFmt] = useState<OutputFormat>('mp3');
  const [processing, setProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  const { ffmpeg, isLoaded, loadFFmpeg } = useFFmpeg();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const origUrl = useRef<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!file) { // eslint-disable-next-line react-hooks/set-state-in-effect -- reset duration when no file selected
      setDuration(0); return; }
    const url = URL.createObjectURL(file);
    const el = new Audio(url);
    let r = false;
    const onMeta = () => { setDuration(el.duration); if (!r) URL.revokeObjectURL(url); };
    el.addEventListener('loadedmetadata', onMeta);
    return () => { r = true; URL.revokeObjectURL(url); };
  }, [file]);

  const fadeInSec = useCallback(() => {
    if (duration <= 0) return fadeInDur;
    return fadeInPct ? (fadeInDur / 100) * duration : fadeInDur;
  }, [duration, fadeInDur, fadeInPct]);

  const fadeOutSec = useCallback(() => {
    if (duration <= 0) return fadeOutDur;
    return fadeOutPct ? (fadeOutDur / 100) * duration : fadeOutDur;
  }, [duration, fadeOutDur, fadeOutPct]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || duration <= 0) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    const W = rect.width, H = rect.height;
    const pt = 8, pb = 22, pl = 32, pr = 10;
    const pw = W - pl - pr, ph = H - pt - pb;
    ctx.clearRect(0, 0, W, H);

    const dark = document.documentElement.classList.contains('dark');
    const gc = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const tc = dark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    const fc = dark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)';
    const lc = dark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)';

    ctx.strokeStyle = gc; ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pt + (i / 4) * ph; ctx.beginPath(); ctx.moveTo(pl, y); ctx.lineTo(W - pr, y); ctx.stroke();
    }
    ctx.fillStyle = tc; ctx.font = '9px ui-monospace, monospace'; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let i = 0; i <= 4; i++) ctx.fillText((1 - i / 4).toFixed(1), pl - 4, pt + (i / 4) * ph);

    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    const st = Math.min(8, Math.max(2, Math.round(duration / 5)));
    for (let i = 0; i <= st; i++) ctx.fillText(`${((i / st) * duration).toFixed(1)}s`, pl + (i / st) * pw, H - pb + 3);

    const pts = 400;
    const fi = fadeInSec(), fo = fadeOutSec();

    ctx.beginPath(); ctx.moveTo(pl, pt + ph);
    for (let i = 0; i <= pts; i++) {
      const t = (i / pts) * duration;
      let v = 1;
      if (fadeIn && fi > 0 && t <= fi) v = cv(t / fi, fadeInCurve);
      if (fadeOut && fo > 0 && t >= duration - fo) v = Math.min(v, 1 - cv((t - (duration - fo)) / fo, fadeOutCurve));
      const x = pl + (t / duration) * pw, y = pt + ph - v * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.lineTo(pl + pw, pt + ph); ctx.closePath(); ctx.fillStyle = fc; ctx.fill();

    ctx.beginPath();
    for (let i = 0; i <= pts; i++) {
      const t = (i / pts) * duration;
      let v = 1;
      if (fadeIn && fi > 0 && t <= fi) v = cv(t / fi, fadeInCurve);
      if (fadeOut && fo > 0 && t >= duration - fo) v = Math.min(v, 1 - cv((t - (duration - fo)) / fo, fadeOutCurve));
      const x = pl + (t / duration) * pw, y = pt + ph - v * ph;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = lc; ctx.lineWidth = 1.5; ctx.stroke();

    if (fadeIn && fi > 0) {
      const fx = pl + (Math.min(fi, duration) / duration) * pw;
      ctx.fillStyle = 'rgba(34,197,94,0.1)'; ctx.fillRect(pl, pt, fx - pl, ph);
      ctx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const t = (i / pts) * Math.min(fi, duration);
        const v = cv(t / fi, fadeInCurve);
        const x = pl + (t / duration) * pw, y = pt + ph - v * ph;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#22c55e'; ctx.lineWidth = 2.5; ctx.stroke();
    }

    if (fadeOut && fo > 0 && fo < duration) {
      const start = duration - fo, fx = pl + (start / duration) * pw;
      ctx.fillStyle = 'rgba(239,68,68,0.1)'; ctx.fillRect(fx, pt, pl + pw - fx, ph);
      ctx.beginPath();
      for (let i = 0; i <= pts; i++) {
        const t = start + (i / pts) * fo;
        if (t > duration) break;
        const v = 1 - cv((t - start) / fo, fadeOutCurve);
        const x = pl + (t / duration) * pw, y = pt + ph - v * ph;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = '#ef4444'; ctx.lineWidth = 2.5; ctx.stroke();
    }
  }, [duration, fadeIn, fadeInDur, fadeInPct, fadeInCurve, fadeOut, fadeOutDur, fadeOutPct, fadeOutCurve, fadeInSec, fadeOutSec]);

  useEffect(() => () => { if (outputUrl) URL.revokeObjectURL(outputUrl); if (origUrl.current) URL.revokeObjectURL(origUrl.current); }, [outputUrl]);

  const handleFile = useCallback(async (f: File) => {
    setFile(f); setOutputUrl(null);
    if (origUrl.current) { URL.revokeObjectURL(origUrl.current); origUrl.current = null; }
    origUrl.current = URL.createObjectURL(f);
    if (!isLoaded) try { await loadFFmpeg(); } catch { toast.error('Failed to load FFmpeg engine'); }
  }, [isLoaded]);

  const process = async () => {
    if (!file || !ffmpeg?.loaded) return;
    const fi = fadeInSec(), fo = fadeOutSec();
    if (!fadeIn && !fadeOut) { toast.error('Enable at least one fade effect'); return; }
    setProcessing(true);
    try {
      const ff = ffmpeg;
      const inName = file.name.replace(/\s+/g, '_'), outName = `output.${outputFmt}`;
      await ff.writeFile(inName, await fetchFile(file));
      const filters: string[] = [];
      if (fadeIn) filters.push(`afade=t=in:st=0:d=${fi}:curve=${FFMPEG_CURVE[fadeInCurve]}`);
      if (fadeOut) filters.push(`afade=t=out:st=${Math.max(0, duration - fo)}:d=${fo}:curve=${FFMPEG_CURVE[fadeOutCurve]}`);
      await ff.exec(['-i', inName, '-af', filters.join(','), outName]);
      const data = await ff.readFile(outName);
      const blob = new Blob([data as BlobPart], { type: MIME[outputFmt] });
      const url = URL.createObjectURL(blob);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(url);
      await ff.deleteFile(inName); await ff.deleteFile(outName);
      toast.success('Fade effect applied successfully!');
    } catch (e) { console.error(e); toast.error('Failed to apply fade effect.'); }
    finally { setProcessing(false); }
  };

  const remove = () => {
    setFile(null); setOutputUrl(null); setPlaying(false);
    if (origUrl.current) { URL.revokeObjectURL(origUrl.current); origUrl.current = null; }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Volume2 className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Audio Fade In/Out</h3>
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-[var(--text-secondary)]">
          Apply smooth volume fade in and/or fade out effects to your audio. All processing happens locally.
        </p>

        {!file ? (
          <FileUploader accept="audio/*" onFileSelect={handleFile}
            title="Upload Audio File"
            subtitle="MP3, WAV, M4A, FLAC, OGG supported" />
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
              <div className="flex items-center gap-3 min-w-0">
                <Music className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">{file.name}</div>
                  <div className="text-[10px] text-[var(--text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB{duration > 0 && <span> &middot; {fmt(duration)}</span>}</div>
                </div>
              </div>
              <button onClick={remove} className="text-[10px] text-red-500 hover:underline shrink-0 flex items-center gap-1">
                <Trash2 /> Remove
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FadePanel side="in" enabled={fadeIn} onToggle={setFadeIn}
                duration={fadeInDur} onDuration={setFadeInDur}
                percent={fadeInPct} onPercent={setFadeInPct}
                curve={fadeInCurve} onCurve={setFadeInCurve} color="emerald" />
              <FadePanel side="out" enabled={fadeOut} onToggle={setFadeOut}
                duration={fadeOutDur} onDuration={setFadeOutDur}
                percent={fadeOutPct} onPercent={setFadeOutPct}
                curve={fadeOutCurve} onCurve={setFadeOutCurve} color="red" />
            </div>

            <div>
              <canvas ref={canvasRef} className="w-full h-28 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl" />
              <div className="flex justify-between text-[9px] text-[var(--text-muted)] mt-0.5 px-1">
                <span>0s</span>
                <span className="text-green-500">Fade In</span>
                <span className="text-red-500">Fade Out</span>
                <span>{duration > 0 ? fmt(duration) : '--:--'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-[var(--text-secondary)] shrink-0">Output:</label>
              <div className="flex gap-1.5 flex-wrap">
                {FORMATS.map(f => (
                  <button key={f} onClick={() => setOutputFmt(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      outputFmt === f
                        ? 'bg-emerald-700 text-white border-emerald-500'
                        : 'bg-[var(--bg-overlay)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-emerald-300 dark:hover:border-emerald-700'
                    }`}>
                    {FORMAT_LABELS[f]}
                  </button>
                ))}
              </div>
            </div>

            {!outputUrl && !processing && (
              <button onClick={process}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                <Play className="w-4 h-4" /> Apply Fade Effects
              </button>
            )}

            {processing && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span>Processing...</span>
                </div>
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                </div>
              </div>
            )}

            {!isLoaded && !processing && (
              <button onClick={loadFFmpeg}
                className="w-full bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] font-bold py-3 rounded-xl text-xs transition-all">
                Load FFmpeg Engine
              </button>
            )}

            {outputUrl && (
              <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-1">
                  <Volume2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-xs font-semibold text-zinc-600 dark:text-[var(--text-muted)]">Preview</span>
                  <div className="flex gap-2 ml-auto">
                    <audio ref={audioRef} src={outputUrl} onPlay={() => setPlaying(true)} onEnded={() => setPlaying(false)} onPause={() => setPlaying(false)} className="hidden" />
                    <button onClick={() => audioRef.current?.paused ? audioRef.current.play() : audioRef.current?.pause()}
                      className="text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1">
                      {playing ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}{playing ? 'Stop' : 'Play'}
                    </button>
                  </div>
                </div>
                <audio controls className="w-full" src={outputUrl} />
                <button onClick={() => downloadOrShare(outputUrl, `faded_audio.${outputFmt}`)}
                  className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                  <Download className="w-4 h-4" /> Download {FORMAT_LABELS[outputFmt]}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]">
            <strong>Pro:</strong> Curve types — Linear (constant rate), Logarithmic (gradual start), Exponential (rapid start), S-curve (smooth midpoint). Use percentage mode for duration-independent fades.
          </p>
        </div>
      </div>
    </div>
  );
}
