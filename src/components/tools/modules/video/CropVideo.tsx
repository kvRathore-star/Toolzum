"use client";
import React, { useState } from 'react';
import { toast } from "react-hot-toast";
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Crop, Upload, Download, Loader2, Smartphone, Square, Monitor, Crown } from 'lucide-react';
import Link from 'next/link';
import { createDownloadBlob } from '@/utils/blob';
import { useUsageCounter } from '@/hooks/useUsageCounter';

const RATIOS = [
  { label: '9:16 Reel/Shorts', w: 1080, h: 1920, icon: Smartphone },
  { label: '1:1 Square', w: 1080, h: 1080, icon: Square },
  { label: '16:9 YouTube', w: 1920, h: 1080, icon: Monitor },
  { label: 'Custom', w: 0, h: 0, icon: Crop },
];

const DAILY_LIMIT = 3;

export default function ReelShortsMaker() {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [ratioIdx, setRatioIdx] = useState(0);
  const [customW, setCustomW] = useState('640');
  const [customH, setCustomH] = useState('480');
  const [xOffset, setXOffset] = useState('0');
  const [yOffset, setYOffset] = useState('0');

  const { usage, trackUsage } = useUsageCounter('reelShortsUsage');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setOutputUrl(null); if (!isLoaded) await loadFFmpeg(); }
  };

  const processVideo = async () => {
    if (!file || !ffmpeg || !isLoaded) return;
    if (usage >= DAILY_LIMIT) {
      toast.error(`You've used all ${DAILY_LIMIT} free crops today. Upgrade to Pro for unlimited processing.`);
      return;
    }
    setIsProcessing(true);
    try {
      const inputName = `input_${file.name.replace(/\s+/g, '_')}`;
      const outputName = 'cropped.mp4';
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      const r = RATIOS[ratioIdx];
      const cw = Math.floor((r.label === 'Custom' ? Number(customW) : r.w) / 2) * 2;
      const ch = Math.floor((r.label === 'Custom' ? Number(customH) : r.h) / 2) * 2;
      const ox = Number(xOffset) || 0;
      const oy = Number(yOffset) || 0;
      // Scale source to cover the target frame (works even when the source is
      // smaller), then crop to the requested aspect ratio + offsets. Output uses
      // libx264 + yuv420p + faststart so browsers can actually play it.
      const cropFilter = `scale=${cw}:${ch}:force_original_aspect_ratio=increase,crop=${cw}:${ch}:${ox}:${oy}`;

      await ffmpeg.exec(['-i', inputName, '-vf', cropFilter, '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-c:a', 'copy', outputName]);
      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(createDownloadBlob(data, 'video/mp4'));
      setOutputUrl(url);
      trackUsage(usage + 1);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      if (usage + 1 >= DAILY_LIMIT) {
        toast(`Upgrade to Pro for unlimited Reel & Shorts crops.`, { icon: '👑' });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to crop. Ensure crop dimensions fit within original video bounds.");
    } finally { setIsProcessing(false); }
  };

  const remaining = DAILY_LIMIT - usage;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-[var(--accent)]" />
          <h3 className="text-lg font-bold text-[var(--text-primary)]">Reel & Shorts Maker</h3>
        </div>
        <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider"><Crown className="w-3.5 h-3.5" /> Pro</span>
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-[var(--text-secondary)]">Crop any video to the perfect aspect ratio for Instagram Reels, YouTube Shorts, or TikTok.</p>

        <div className="flex items-center justify-between bg-[var(--bg-overlay)]/50 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-secondary)]">Daily free limit:</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: DAILY_LIMIT }, (_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < usage ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-indigo-500'}`} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-[var(--text-secondary)]">{remaining} / {DAILY_LIMIT} remaining</span>
          </div>
        </div>

        {!file ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
            <input type="file" accept="video/mp4,video/webm" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-[var(--text-secondary)] flex flex-col items-center"><Upload className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-2" />Select Video</div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
              <div><div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</div><div className="text-[10px] text-[var(--text-muted)]">{(file.size / 1024 / 1024).toFixed(2)} MB</div></div>
              <button onClick={() => { setFile(null); setOutputUrl(null); }} className="text-[10px] text-red-500 hover:underline">Remove</button>
            </div>

            <div><label className="text-[10px] font-bold text-[var(--text-muted)] uppercase mb-2 block">Aspect Ratio</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {RATIOS.map((r, i) => {
                  const Icon = r.icon;
                  return (
                    <button key={i} onClick={() => setRatioIdx(i)}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-[10px] font-bold border transition-all ${ratioIdx === i ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-[var(--bg-overlay)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)]'}`}>
                      <Icon className="w-4 h-4" />{r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {RATIOS[ratioIdx].label === 'Custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-semibold text-[var(--text-muted)]">Width</label><input type="number" value={customW} onChange={e => setCustomW(e.target.value)} className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-xs outline-none mt-1" /></div>
                <div><label className="text-[10px] font-semibold text-[var(--text-muted)]">Height</label><input type="number" value={customH} onChange={e => setCustomH(e.target.value)} className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-xs outline-none mt-1" /></div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] font-semibold text-[var(--text-muted)]">X Offset</label><input type="number" value={xOffset} onChange={e => setXOffset(e.target.value)} className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-xs outline-none mt-1" /></div>
              <div><label className="text-[10px] font-semibold text-[var(--text-muted)]">Y Offset</label><input type="number" value={yOffset} onChange={e => setYOffset(e.target.value)} className="w-full p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-xs outline-none mt-1" /></div>
            </div>

            {(!isLoaded || isLoading) && <div className="text-center text-[var(--text-secondary)] py-3 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-[var(--accent)]" /><span className="text-[10px]">Loading FFmpeg...</span></div>}
            {isLoaded && !outputUrl && !isProcessing && (
              <button onClick={processVideo} disabled={remaining === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-[0.98]">
                {remaining === 0 ? 'Limit reached — Upgrade to Pro' : 'Crop for Reels/Shorts'}
              </button>
            )}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-semibold text-[var(--accent)] dark:text-[var(--accent)]"><span>Processing...</span><span>{progress}%</span></div>
                <div className="w-full bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full h-2 overflow-hidden"><div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
              </div>
            )}
            {outputUrl && (
              <div className="space-y-3 pt-3 border-t border-[var(--border-subtle)]">
                <video controls className="w-full rounded-xl" src={outputUrl}></video>
                <a href={outputUrl} download={`${file.name.replace(/\.[^/.]+$/, "")}_cropped.mp4`} className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"><Download className="w-4 h-4" /> Download Cropped Video</a>
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3 flex items-center justify-between">
          <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Pro:</strong> Batch crop multiple videos, export to multiple ratios simultaneously, AI auto-center, background blur for portrait videos.</p>
          <Link href="/pricing" className="text-[10px] font-bold text-[var(--accent)] dark:text-[var(--accent)] underline shrink-0 ml-4">Upgrade →</Link>
        </div>
      </div>
    </div>
  );
}
