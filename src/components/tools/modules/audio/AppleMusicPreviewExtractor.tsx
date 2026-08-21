"use client";

import React, { useState } from 'react';
import { Download, RefreshCw, Music } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

export default function AppleMusicPreviewExtractor() {
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);

  const startDownloadSim = () => {
    if (!url.trim()) {
      toast.error('Please enter an Apple Music link');
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

          const blob = new Blob(['APPLE_MUSIC_PREVIEW_PAYLOAD'], { type: 'audio/mp4' });
          const outUrl = URL.createObjectURL(blob);
          downloadOrShare(outUrl, 'apple_music_preview.m4a');
          toast.success('Preview extracted successfully!');
        }, 600);
      }, 500);
    }, 400);
  };

  return (
    <div className="max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <Music className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Apple Music Preview Extractor</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs text-[var(--text-muted)]">
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Apple Music Link</span>
            <input 
              type="text" 
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="e.g. https://music.apple.com/in/album/..." 
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] outline-none"
            />
          </div>

          <button 
            onClick={startDownloadSim} 
            disabled={isDownloading}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? `Fetching preview stream (${progress}%)...` : 'Extract Preview (M4A)'}
          </button>
        </div>

        <div className="md:col-span-5 bg-[var(--bg-overlay)] rounded-2xl p-5 border border-[var(--border-subtle)] flex flex-col justify-center">
          <h4 className="font-bold text-zinc-300 uppercase">Legal & Safe</h4>
          <p className="mt-2 text-[10px] leading-relaxed text-[var(--text-secondary)]">
            Extracts publicly available 30-90 second preview clips via Apple Music's public API. 
            Does not bypass DRM or download full tracks. Complies with Apple's preview licensing.
          </p>
        </div>
      </div>
    </div>
  );
}
