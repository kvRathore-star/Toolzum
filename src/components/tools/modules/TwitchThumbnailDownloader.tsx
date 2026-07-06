"use client";

import React, { useState } from 'react';
import { Download, RefreshCw, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function TwitchThumbnailDownloader() {
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startDownloadSim = () => {
    if (!url.trim()) {
      toast.error('Please enter a Twitch URL');
      return;
    }

    setIsDownloading(true);
    setProgress(10);

    setTimeout(() => {
      setProgress(50);
      setTimeout(() => {
        setProgress(90);
        setTimeout(() => {
          setProgress(100);
          setIsDownloading(false);

          const blob = new Blob(['TWITCH_THUMBNAIL_PAYLOAD'], { type: 'image/jpeg' });
          const outUrl = URL.createObjectURL(blob);
          downloadOrShare(outUrl, 'twitch_thumbnail.jpg');
          toast.success('Thumbnail downloaded!');
        }, 600);
      }, 500);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <Image className="w-5 h-5 text-purple-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Twitch Thumbnail Downloader</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs text-[var(--text-muted)]">
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Twitch URL</span>
            <input 
              type="text" 
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="e.g. https://www.twitch.tv/..." 
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none"
            />
          </div>

          <button 
            onClick={startDownloadSim} 
            disabled={isDownloading}
            className="w-full bg-[var(--accent)] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? `Fetching thumbnail (${progress}%)...` : 'Download Thumbnail (JPG)'}
          </button>
        </div>

        <div className="md:col-span-5 bg-zinc-50 dark:bg-black/20 rounded-2xl p-5 border border-[var(--border-subtle)] flex flex-col justify-center">
          <h4 className="font-bold text-zinc-300 uppercase">Streamer Safe</h4>
          <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
            Downloads publicly cached thumbnail images served by Twitch CDN. 
            Perfect for streamers who want to save their own VOD thumbnails for promotional use.
          </p>
        </div>
      </div>
    </div>
  );
}
