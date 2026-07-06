"use client";

import React, { useState } from 'react';
import { Download, ImageIcon, RefreshCw, AlertCircle, Camera, ExternalLink } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

function extractShortcode(url: string): string | null {
  const patterns = [
    /instagram\.com\/(?:p|reel|tv|stories)\/([a-zA-Z0-9_-]+)/,
    /instagram\.com\/[^\/]+\/([a-zA-Z0-9_-]+)/,
    /^([a-zA-Z0-9_-]{11,})$/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

export default function InstagramStoryDownloader() {
  const [url, setUrl] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);

  const handleFetch = async () => {
    setError('');
    setMediaUrl(null);
    setMediaType(null);

    const shortcode = extractShortcode(url.trim());
    if (!shortcode) {
      setError('Invalid Instagram URL. Paste a link to a post, reel, or story.');
      return;
    }

    setIsLoading(true);

    try {
      const oembedUrl = `https://api.instagram.com/oembed?url=https://www.instagram.com/p/${shortcode}/`;
      const resp = await fetch(oembedUrl);
      if (!resp.ok) throw new Error('oEmbed fetch failed');
      const data: { thumbnail_url?: string } = await resp.json();

      if (data.thumbnail_url) {
        const img = new Image();
        img.onload = () => {
          const width = img.naturalWidth;
          const height = img.naturalHeight;
          setMediaUrl(data.thumbnail_url ?? null);
          setMediaType('image' as const);
          setIsLoading(false);
        };
        img.onerror = () => {
          setMediaUrl(data.thumbnail_url ?? null);
          setMediaType('image' as const);
          setIsLoading(false);
        };
        img.src = data.thumbnail_url;
      } else {
        setError('Could not extract media from this URL. Instagram may have restricted access.');
        setIsLoading(false);
      }
    } catch {
      try {
        const fallbackUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
        const img = new Image();
        img.onload = () => {
          setMediaUrl(fallbackUrl);
          setMediaType('image' as const);
          setIsLoading(false);
        };
        img.onerror = () => {
          setError('Could not fetch media. Instagram API may have rate-limited this request. Try again shortly.');
          setIsLoading(false);
        };
        img.src = fallbackUrl;
      } catch {
        setError('Failed to fetch media. Instagram may be blocking the request.');
        setIsLoading(false);
      }
    }
  };

  const handleDownload = () => {
    if (!mediaUrl) return;
    if (mediaType === 'video') {
      window.open(mediaUrl, '_blank');
    } else {
      const a = document.createElement('a');
      a.href = mediaUrl;
      a.download = `instagram_${Date.now()}.jpg`;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
    toast.success('Opening media in new tab — right-click to save');
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <Camera className="w-5 h-5 text-pink-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Instagram Story / Post Downloader</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5 space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-400 font-bold uppercase">Instagram Post / Reel / Story URL</label>
            <input
              type="text"
              value={url}
              onChange={e => { setUrl(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && handleFetch()}
              placeholder="https://www.instagram.com/p/..."
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-pink-500/30"
            />
          </div>

          <button
            onClick={handleFetch}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 transition-all shadow-md"
          >
            {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isLoading ? 'Fetching from Instagram...' : 'Get Media'}
          </button>

          {error && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold mb-0.5">{error}</p>
                <p className="text-[11px] text-amber-500">Instagram restricts direct downloads. For reliable downloading, try our <a href="/downloader/facebook-video-downloader" className="underline">Facebook Downloader</a> instead, or save from the preview below.</p>
              </div>
            </div>
          )}

          <div className="bg-zinc-50 dark:bg-black/20 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800">
            <h4 className="text-xs font-bold text-zinc-500 uppercase mb-2">How it works</h4>
            <ol className="space-y-1.5 text-[11px] text-zinc-500 leading-relaxed">
              <li>1. Paste any Instagram post, reel, or public story URL</li>
              <li>2. We fetch the media via Instagram&apos;s public oEmbed API</li>
              <li>3. Preview and download the image/video</li>
            </ol>
            <p className="text-[10px] text-zinc-400 mt-2 border-t border-zinc-200 dark:border-zinc-700 pt-2">
              Only works for public content. Private stories require authentication.
            </p>
          </div>
        </div>

        <div className="md:col-span-7 flex flex-col items-center justify-center bg-zinc-50 dark:bg-black/30 rounded-2xl p-4 border border-zinc-200 dark:border-zinc-800 min-h-[300px]">
          {mediaUrl ? (
            <div className="w-full space-y-3">
              {mediaType === 'video' ? (
                <video src={mediaUrl} controls className="w-full rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 max-h-[400px] object-contain bg-black" />
              ) : (
                <img loading="lazy" src={mediaUrl} alt="Instagram media" className="w-full rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-700 max-h-[400px] object-contain bg-black" crossOrigin="anonymous" />
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <span>Media loaded</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl text-xs hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                  <a
                    href={mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-zinc-400">
              <Camera className="w-12 h-12 mb-3 text-zinc-300 dark:text-zinc-700" />
              <p className="text-sm font-medium">Paste an Instagram URL to fetch media</p>
              <p className="text-xs text-zinc-500 mt-1">Supports posts, reels, and public stories</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
