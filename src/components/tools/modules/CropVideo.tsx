"use client";
import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Crop, Upload, Download, Loader2, Smartphone, Square, Monitor, Crown } from 'lucide-react';
import Link from 'next/link';

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
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('reelShortsUsage');
    if (stored) {
      try {
        const { date, count } = JSON.parse(stored);
        setUsage(date === today ? count : 0);
      } catch { setUsage(0); }
    }
  }, []);

  const trackUsage = (count: number) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('reelShortsUsage', JSON.stringify({ date: today, count }));
    setUsage(count);
  };

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
      const cw = r.label === 'Custom' ? customW : String(r.w);
      const ch = r.label === 'Custom' ? customH : String(r.h);
      const cropFilter = `crop=${cw}:${ch}:${xOffset}:${yOffset}`;

      await ffmpeg.exec(['-i', inputName, '-vf', cropFilter, '-c:a', 'copy', outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as unknown as BlobPart], { type: 'video/mp4' });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      trackUsage(usage + 1);
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      if (usage + 1 >= DAILY_LIMIT) {
        toast(`Upgrade to Pro for unlimited Reel & Shorts crops.`, { icon: '👑' });
      }
    } catch {
      toast.error("Failed to crop. Ensure crop dimensions fit within original video bounds.");
    } finally { setIsProcessing(false); }
  };

  const remaining = DAILY_LIMIT - usage;

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-indigo-500" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Reel & Shorts Maker</h3>
        </div>
        <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider"><Crown className="w-3.5 h-3.5" /> Pro</span>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Crop any video to the perfect aspect ratio for Instagram Reels, YouTube Shorts, or TikTok.</p>

        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <p className="text-xs text-zinc-500">Daily free limit:</p>
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              {Array.from({ length: DAILY_LIMIT }, (_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < usage ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-indigo-500'}`} />
              ))}
            </div>
            <span className="text-[10px] font-bold text-zinc-500">{remaining} / {DAILY_LIMIT} remaining</span>
          </div>
        </div>

        {!file ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
            <input type="file" accept="video/mp4,video/webm" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-zinc-500 flex flex-col items-center"><Upload className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-2" />Select Video</div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div><div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</div><div className="text-[10px] text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div></div>
              <button onClick={() => { setFile(null); setOutputUrl(null); }} className="text-[10px] text-red-500 hover:underline">Remove</button>
            </div>

            <div><label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Aspect Ratio</label>
              <div className="grid grid-cols-4 gap-2">
                {RATIOS.map((r, i) => {
                  const Icon = r.icon;
                  return (
                    <button key={i} onClick={() => setRatioIdx(i)}
                      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-[10px] font-bold border transition-all ${ratioIdx === i ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'}`}>
                      <Icon className="w-4 h-4" />{r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {RATIOS[ratioIdx].label === 'Custom' && (
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-[10px] font-semibold text-zinc-400">Width</label><input type="number" value={customW} onChange={e => setCustomW(e.target.value)} className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 text-xs outline-none mt-1" /></div>
                <div><label className="text-[10px] font-semibold text-zinc-400">Height</label><input type="number" value={customH} onChange={e => setCustomH(e.target.value)} className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 text-xs outline-none mt-1" /></div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] font-semibold text-zinc-400">X Offset</label><input type="number" value={xOffset} onChange={e => setXOffset(e.target.value)} className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 text-xs outline-none mt-1" /></div>
              <div><label className="text-[10px] font-semibold text-zinc-400">Y Offset</label><input type="number" value={yOffset} onChange={e => setYOffset(e.target.value)} className="w-full p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/50 text-xs outline-none mt-1" /></div>
            </div>

            {(!isLoaded || isLoading) && <div className="text-center text-zinc-500 py-3 flex items-center justify-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-indigo-500" /><span className="text-[10px]">Loading FFmpeg...</span></div>}
            {isLoaded && !outputUrl && !isProcessing && (
              <button onClick={processVideo} disabled={remaining === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-[0.98]">
                {remaining === 0 ? 'Limit reached — Upgrade to Pro' : 'Crop for Reels/Shorts'}
              </button>
            )}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-semibold text-indigo-600 dark:text-indigo-400"><span>Processing...</span><span>{progress}%</span></div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden"><div className="bg-indigo-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div></div>
              </div>
            )}
            {outputUrl && (
              <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <video controls className="w-full rounded-xl" src={outputUrl}></video>
                <a href={outputUrl} download={`${file.name.replace(/\.[^/.]+$/, "")}_cropped.mp4`} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"><Download className="w-4 h-4" /> Download Cropped Video</a>
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3 flex items-center justify-between">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Batch crop multiple videos, export to multiple ratios simultaneously, AI auto-center, background blur for portrait videos.</p>
          <Link href="/pricing" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 underline shrink-0 ml-4">Upgrade →</Link>
        </div>
      </div>
    </div>
  );
}
