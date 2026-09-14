"use client";

import React, { useState } from 'react';
import { Download, RefreshCw, Music } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface PreviewTrack {
  trackId: number;
  trackName: string;
  artistName: string;
  artworkUrl: string;
  previewUrl: string;
}

export default function AppleMusicPreviewExtractor() {
  const [url, setUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tracks, setTracks] = useState<PreviewTrack[]>([]);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  // Real implementation: Apple's public iTunes Search API (no key, CORS-open).
  // Song links carry the track id as ?i=<id>; anything else is treated as a
  // search query and resolved to matching tracks with 30s preview streams.
  const findPreviews = async () => {
    const input = url.trim();
    if (!input) {
      toast.error('Please enter an Apple Music link or song name');
      return;
    }
    setIsDownloading(true);
    setProgress(10);
    setTracks([]);
    try {
      const idMatch = input.match(/[?&]i=(\d+)/) ?? input.match(/^\d+$/);
      const apiUrl = idMatch
        ? `https://itunes.apple.com/lookup?id=${idMatch[1]}&entity=song`
        : `https://itunes.apple.com/search?term=${encodeURIComponent(input)}&media=music&entity=song&limit=5`;
      setProgress(50);
      const res = await fetch(apiUrl);
      if (!res.ok) throw new Error('Apple lookup failed');
      const data = await res.json();
      const results: PreviewTrack[] = (data.results || [])
        .filter((t: { previewUrl?: string; trackId?: number }) => t.previewUrl && t.trackId)
        .map((t: { trackId: number; trackName: string; artistName: string; artworkUrl100?: string; previewUrl: string }) => ({
          trackId: t.trackId,
          trackName: t.trackName,
          artistName: t.artistName,
          artworkUrl: (t.artworkUrl100 || '').replace('100x100', '300x300'),
          previewUrl: t.previewUrl,
        }));
      setProgress(100);
      if (results.length === 0) {
        toast.error(idMatch ? 'No track found for that link. Try a song link (with ?i=) or a song name.' : 'No matches. Try a different song or artist name.');
      } else {
        setTracks(results);
        toast.success(`Found ${results.length} preview${results.length > 1 ? 's' : ''} — tap Download on any track.`);
      }
    } catch {
      toast.error('Could not reach Apple Music. Check your connection and try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadTrack = async (track: PreviewTrack) => {
    setDownloadingId(track.trackId);
    try {
      const res = await fetch(track.previewUrl);
      if (!res.ok) throw new Error('fetch failed');
      const blob = await res.blob();
      const outUrl = URL.createObjectURL(blob);
      const safeName = `${track.artistName} - ${track.trackName}`.replace(/[^\w\s-]/g, '').slice(0, 80);
      downloadOrShare(outUrl, `${safeName || 'apple_music_preview'}.m4a`);
      toast.success('Preview downloaded!');
    } catch {
      // Fallback: open the stream URL directly (browser handles the download).
      window.open(track.previewUrl, '_blank', 'noopener');
      toast.success('Preview opened in a new tab.');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <Music className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Apple Music Preview Extractor</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 text-xs text-[var(--text-muted)]">
        <div className="md:col-span-7 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">Apple Music Link</span>
            <input aria-label="Apple Music Link"
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="e.g. https://music.apple.com/in/album/...?i=123456789 or a song name"
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            />
          </div>

          <button
            onClick={findPreviews}
            disabled={isDownloading}
            className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {isDownloading ? `Searching Apple Music (${progress}%)...` : 'Find Previews'}
          </button>

          {tracks.length > 0 && (
            <div className="space-y-2" role="status" aria-label="Found previews">
              {tracks.map(track => (
                <div key={track.trackId} className="flex items-center gap-3 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-3">
                  {track.artworkUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={track.artworkUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <Music className="w-12 h-12 p-3 text-[var(--text-muted)]" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[var(--text-primary)] truncate">{track.trackName}</p>
                    <p className="text-[10px] text-[var(--text-secondary)] truncate">{track.artistName} · 30s preview</p>
                  </div>
                  <button
                    onClick={() => downloadTrack(track)}
                    disabled={downloadingId === track.trackId}
                    aria-label={`Download preview of ${track.trackName} by ${track.artistName}`}
                    className="px-3 py-2 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold rounded-lg text-[10px] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3 h-3" />
                    {downloadingId === track.trackId ? 'Saving…' : 'Download'}
                  </button>
                </div>
              ))}
            </div>
          )}
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
