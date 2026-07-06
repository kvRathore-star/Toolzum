"use client";

import React, { useState } from 'react';
import { Music, Download, Copy, Check, ExternalLink, AlertTriangle, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function YouTubeDownloader() {
  const [url, setUrl] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{ title: string; channel: string; isCC: boolean; duration: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const checkAndExtract = async () => {
    if (!url.trim()) return toast.error('Enter a YouTube URL');
    setIsChecking(true);
    setVideoInfo(null);

    try {
      const cleanUrl = url.trim();
      const videoId = cleanUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
      if (!videoId) throw new Error('Invalid YouTube URL');

      // Fetch video page to check metadata
      const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(cleanUrl)}&format=json`);
      if (!response.ok) throw new Error('Could not fetch video information');

      const data: any = await response.json();

      setVideoInfo({
        title: data.title || 'Unknown',
        channel: data.author_name || 'Unknown',
        isCC: false, // We display a prominent notice about CC verification
        duration: data.type || 'N/A',
      });

      toast.success('Video found! Please verify CC license status.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to fetch video info');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Music className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">YouTube Audio Extractor (CC Only)</h3>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
          <div className="text-[10px] text-amber-600 dark:text-amber-400 leading-relaxed">
            <strong className="text-amber-700 dark:text-amber-300">For Creative Commons-licensed content only.</strong>
            <span className="block mt-1">This tool is designed exclusively for extracting audio from YouTube videos that have a Creative Commons (CC-BY) license. You must independently verify the license status before extracting. Download only for personal, non-commercial use.</span>
            <span className="block mt-1">How to check: Open the video on YouTube → Click &ldquo;Show More&rdquo; below the video → Look for &ldquo;License: Creative Commons&rdquo; in the description.</span>
          </div>
        </div>

        <div className="flex gap-2">
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30"
            onKeyDown={e => e.key === 'Enter' && checkAndExtract()} />
          <button onClick={checkAndExtract} disabled={isChecking}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap">
            {isChecking ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round" /></svg> Checking...</> : <>Check Video</>}
          </button>
        </div>

        {videoInfo && (
          <div className="space-y-3">
            <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
              <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1">Video Info</p>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{videoInfo.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{videoInfo.channel}</p>
              <a href={url} target="_blank" rel="noopener noreferrer"
                className="text-[10px] text-emerald-500 hover:underline mt-2 inline-flex items-center gap-1">
                View on YouTube <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <div className="text-[10px] text-red-600 dark:text-red-400">
                  <strong>License verification required:</strong>
                  <span className="block mt-1">We cannot automatically verify the CC license status. Before proceeding:</span>
                  <ol className="list-decimal ml-4 mt-1 space-y-0.5">
                    <li>Open the video on YouTube</li>
                    <li>Click &ldquo;Show More&rdquo; in the description</li>
                    <li>Confirm &ldquo;License: Creative Commons Attribution&rdquo; is displayed</li>
                    <li>Only then proceed with audio extraction</li>
                  </ol>
                  <span className="block mt-2 font-bold">By using this tool, you confirm the video has a CC-BY license and you will use the audio for personal, non-commercial purposes only.</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
            <strong>Pro:</strong> Verified CC license auto-detection via YouTube Data API, batch extraction from CC playlists, higher bitrate MP3 exports, podcast-ready audio normalization.
          </p>
        </div>
      </div>
    </div>
  );
}
