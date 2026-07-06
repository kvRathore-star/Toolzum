"use client";

import React, { useState, useEffect } from 'react';
import { Download, ImageIcon, RefreshCw, AlertCircle, Check, Crown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import Link from 'next/link';

function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/,
  ];
  for (const p of patterns) { const m = url.match(p); if (m) return m[1]; }
  return null;
}

const QUALITIES = [
  { label: 'Max Resolution', key: 'maxresdefault', note: '1920×1080 (if available)' },
  { label: 'High Quality', key: 'hqdefault', note: '480×360' },
  { label: 'Medium Quality', key: 'mqdefault', note: '320×180' },
  { label: 'Standard', key: 'sddefault', note: '640×480' },
  { label: 'Default', key: 'default', note: '120×90' },
];

const DAILY_LIMIT = 5;

export default function YoutubeThumbnailDownloader() {
  const [url, setUrl] = useState('');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(null);
  const [selectedQuality, setSelectedQuality] = useState('maxresdefault');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('ytThumbnailUsage');
    if (stored) {
      try { const { date, count } = JSON.parse(stored); setUsage(date === today ? count : 0); }
      catch { setUsage(0); }
    }
  }, []);

  const trackUsage = (count: number) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('ytThumbnailUsage', JSON.stringify({ date: today, count }));
    setUsage(count);
  };

  const handleFetch = () => {
    setError('');
    setThumbUrl(null);
    if (usage >= DAILY_LIMIT) { toast.error(`You've used all ${DAILY_LIMIT} free downloads today. Upgrade to Pro for unlimited thumbnail downloads.`); return; }
    const id = extractVideoId(url.trim());
    if (!id) { setError('Invalid YouTube URL. Paste a youtube.com or youtu.be link.'); return; }
    setVideoId(id);
    setIsLoading(true);
    const testUrl = `https://img.youtube.com/vi/${id}/${selectedQuality}.jpg`;
    const img = new Image();
    img.onload = () => { setThumbUrl(testUrl); setIsLoading(false); };
    img.onerror = () => {
      if (selectedQuality !== 'maxresdefault') { toast.error('Failed to load this quality. Try a different one.'); }
      else { setThumbUrl(`https://img.youtube.com/vi/${id}/hqdefault.jpg`); toast('Max resolution not available — fell back to HQ.', { icon: 'ℹ️' }); }
      setIsLoading(false);
    };
    img.src = testUrl;
  };

  const handleDownload = async () => {
    if (!thumbUrl) return;
    try {
      const resp = await fetch(thumbUrl);
      const blob = await resp.blob();
      const objUrl = URL.createObjectURL(blob);
      downloadOrShare(objUrl, `youtube_thumbnail_${videoId}.jpg`);
      trackUsage(usage + 1);
      toast.success('Thumbnail downloaded!');
      if (usage + 1 >= DAILY_LIMIT) toast(`Upgrade to Pro for unlimited thumbnail downloads.`, { icon: '👑' });
    } catch { toast.error('Download failed. Try right-clicking the image instead.'); }
  };

  const remaining = DAILY_LIMIT - usage;

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-red-500" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">YouTube Thumbnail Downloader</h3>
        </div>
        <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0"><Crown className="w-3.5 h-3.5" /> Pro</span>
      </div>

      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-xl px-5 py-2.5 shadow-sm">
        <p className="text-xs text-zinc-500">Daily free downloads:</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {Array.from({ length: DAILY_LIMIT }, (_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < usage ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-red-500'}`} />
            ))}
          </div>
          <span className="text-[10px] font-bold text-zinc-500">{remaining} / {DAILY_LIMIT} remaining</span>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 font-bold uppercase">YouTube Video URL</label>
              <input type="text" value={url} onChange={e => { setUrl(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleFetch()} placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500/30" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] text-zinc-400 font-bold uppercase">Thumbnail Quality</label>
              <select value={selectedQuality} onChange={e => setSelectedQuality(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none">
                {QUALITIES.map(q => <option key={q.key} value={q.key}>{q.label} — {q.note}</option>)}
              </select>
            </div>
            <button onClick={handleFetch} disabled={isLoading || remaining === 0}
              className="w-full bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
              {remaining === 0 ? 'Limit reached — Upgrade to Pro' : isLoading ? 'Fetching...' : 'Get Thumbnail'}
            </button>
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><span>{error}</span>
              </div>
            )}
          </div>
          <div className="md:col-span-7 flex flex-col items-center justify-center bg-zinc-50 dark:bg-black/30 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 min-h-[280px]">
            {thumbUrl ? (
              <div className="w-full space-y-3">
                <img loading="lazy" src={thumbUrl} alt="YouTube Thumbnail" className="w-full rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700" crossOrigin="anonymous" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                    <Check className="w-3.5 h-3.5" /><span>Loaded — {videoId}</span>
                  </div>
                  <button onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl text-xs hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center text-zinc-400">
                <ImageIcon className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-700" />
                <p className="text-sm font-medium">Enter a YouTube URL to fetch the thumbnail</p>
                <p className="text-xs text-zinc-500 mt-1">Supports all quality levels up to 1080p</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3 flex items-center justify-between">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Bulk thumbnail download from multiple URLs at once, batch quality selection, CSV export of video metadata. For creators and marketers.</p>
          <Link href="/pricing" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 underline shrink-0 ml-4">Upgrade →</Link>
        </div>
      </div>
    </div>
  );
}
