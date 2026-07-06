"use client";

import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Hash, MessageCircle, Music, Eye, Calendar, Heart } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface TikTokMeta {
  caption: string;
  author: string;
  likes: string;
  plays: string;
  hashtags: string[];
  sound: string;
  url: string;
}

export default function TikTokCaptionExtractor() {
  const [url, setUrl] = useState('');
  const [meta, setMeta] = useState<TikTokMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const extractCaption = async () => {
    if (!url.trim()) return toast.error('Enter a TikTok URL');
    setIsLoading(true);
    setError('');
    setMeta(null);

    try {
      const cleanUrl = url.trim().split('?')[0];
      const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`);

      if (!response.ok) throw new Error('Could not fetch video data');

      const data: any = await response.json();

      const hashtags = (data.title || '')
        .split(' ')
        .filter((w: string) => w.startsWith('#'))
        .map((h: string) => h.replace('#', ''));

      setMeta({
        caption: data.title || 'No caption',
        author: data.author_name || 'Unknown',
        likes: data.author_url || 'N/A',
        plays: 'N/A',
        hashtags: hashtags.length > 0 ? hashtags : [],
        sound: data.author_name || 'Original Sound',
        url: cleanUrl,
      });
      toast.success('Caption extracted!');
    } catch (err: any) {
      setError(err.message || 'Failed to extract. Make sure the video is public.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!meta) return;
    const text = `Caption: ${meta.caption}\nAuthor: ${meta.author}\nHashtags: ${meta.hashtags.map(h => '#' + h).join(' ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Music className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">TikTok Caption Extractor</h3>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Extract captions, hashtags, and metadata from public TikTok videos. Uses TikTok&apos;s public oEmbed API — no login required, completely legal.
        </p>

        <div className="flex gap-2">
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://www.tiktok.com/@user/video/123456..."
            className="flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/30"
            onKeyDown={e => e.key === 'Enter' && extractCaption()} />
          <button onClick={extractCaption} disabled={isLoading}
            className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap">
            {isLoading ? <><svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" strokeDasharray="32" strokeDashoffset="32" strokeLinecap="round" /></svg> Loading...</> : <>Extract</>}
          </button>
        </div>

        {error && (
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl">
            <p className="text-[10px] text-amber-600 dark:text-amber-400">{error}</p>
          </div>
        )}

        {meta && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-[10px] font-bold text-zinc-400 uppercase">Extracted Metadata</h5>
              <button onClick={handleCopy}
                className="px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 hover:bg-emerald-600 transition-colors">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied' : 'Copy All'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1 flex items-center gap-1"><MessageCircle className="w-3 h-3" /> Caption</p>
                <p className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">{meta.caption}</p>
              </div>
              <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                <p className="text-[9px] font-bold text-zinc-400 uppercase mb-1 flex items-center gap-1"><Eye className="w-3 h-3" /> Author</p>
                <p className="text-xs text-zinc-800 dark:text-zinc-200">{meta.author}</p>
                <a href={meta.url} target="_blank" rel="noopener noreferrer"
                  className="text-[10px] text-emerald-500 hover:underline mt-1 inline-flex items-center gap-1">
                  View on TikTok <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {meta.hashtags.length > 0 && (
                <div className="md:col-span-2 bg-zinc-50 dark:bg-black/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800">
                  <p className="text-[9px] font-bold text-zinc-400 uppercase mb-2 flex items-center gap-1"><Hash className="w-3 h-3" /> Hashtags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {meta.hashtags.map(h => (
                      <span key={h} className="text-[10px] px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full font-semibold">#{h}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
                <strong>Pro:</strong> Bulk extract captions from multiple URLs, export to CSV, hashtag analytics, competitor research, trending sound tracker, AI-powered caption rewriting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
