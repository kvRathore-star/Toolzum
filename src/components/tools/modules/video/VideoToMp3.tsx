"use client";
import React, { useState } from 'react';
import { toast } from "react-hot-toast";
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Music, Upload, Download, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { createDownloadBlob } from '@/utils/blob';
import { useUsageCounter } from '@/hooks/useUsageCounter';
import { useProStatus } from '@/hooks/useProStatus';
import { useSession } from '@/lib/auth-client';
import { smartMax } from '@/utils/fileSizeLimits';
import { EmptyState } from '@/components/EmptyState';

const DAILY_LIMIT = 3;

export default function VideoToMp3() {
  const { ffmpeg, isLoaded, isLoading, loadError, progress, loadFFmpeg } = useFFmpeg();
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [bitrate, setBitrate] = useState('192k');
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const { data: session } = useSession();
  const isSignedIn = !!session?.user;

  const { usage, trackUsage } = useUsageCounter('videoToMp3Usage');
  const isProUser = useProStatus();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      const limits = smartMax('video/*');
      const effectiveLimit = isSignedIn ? limits.signed : limits.free;
      if (f.size > effectiveLimit * 1024 * 1024) {
        toast.error(
          isSignedIn
            ? `File exceeds ${effectiveLimit}MB limit`
            : `Free users limited to ${effectiveLimit}MB. Sign in for up to ${limits.signed}MB.`,
        );
        e.target.value = '';
        return;
      }
      setFile(f);
      setOutputUrl(null);
      if (!isLoaded) await loadFFmpeg();
    }
  };

  const processVideo = async () => {
    if (!file || !ffmpeg || !isLoaded) return;
    if (!isProUser && usage >= DAILY_LIMIT) {
      toast.error(`You've used all ${DAILY_LIMIT} free extracts today. Upgrade to Pro for unlimited audio extraction.`);
      return;
    }

    setIsProcessing(true);
    try {
      const inputName = `input_${file.name.replace(/\s+/g, '_')}`;
      const outputName = 'output.mp3';

      await ffmpeg.writeFile(inputName, await fetchFile(file));
      const args = ['-i', inputName, '-b:a', bitrate, '-map', 'a'];
      if (title.trim()) args.push('-metadata', `title=${title.trim()}`);
      if (artist.trim()) args.push('-metadata', `artist=${artist.trim()}`);
      args.push(outputName);
      await ffmpeg.exec(args);

      const data = await ffmpeg.readFile(outputName);
      const url = URL.createObjectURL(createDownloadBlob(data, 'audio/mp3'));
      setOutputUrl(url);

      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);
      trackUsage(usage + 1);
      if (!isProUser && usage + 1 >= DAILY_LIMIT) {
        toast(`Upgrade to Pro for unlimited audio extraction.`, { icon: '👑' });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to process video. Make sure the file contains an audio track.");
    } finally {
      setIsProcessing(false);
    }
  };

  const remaining = DAILY_LIMIT - usage;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6 text-center">
         <div className="flex items-center justify-center gap-3 mb-2">
           <Music className="w-8 h-8 text-fuchsia-500" />
           <h2 className="text-2xl font-bold">Audio Extractor</h2>
         </div>
         <div className="flex items-center justify-center gap-2">
           <span className="text-[var(--text-secondary)] text-xs">Extract high-quality audio from video files</span>
            <span className="flex items-center gap-1 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-[var(--accent)] text-[10px] font-bold rounded-full uppercase tracking-wider">{isProUser ? 'Pro unlimited' : '3/day free'}</span>
         </div>

          {!isProUser && (
          <div className="flex items-center justify-between bg-[var(--bg-overlay)]/50 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] max-w-md mx-auto">
            <p className="text-xs text-[var(--text-secondary)]">Daily free extractions:</p>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {Array.from({ length: DAILY_LIMIT }, (_, i) => (
                  <div key={i} className={`w-3 h-3 rounded-full ${i < usage ? 'bg-[var(--bg-overlay)] dark:bg-[var(--bg-elevated)]' : 'bg-fuchsia-500'}`} />
                ))}
              </div>
              <span className="text-[10px] font-bold text-[var(--text-secondary)]">{remaining} / {DAILY_LIMIT} remaining</span>
            </div>
          </div>
          )}

         {!file ? (
           <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-12 hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer relative mt-8">
             <input type="file" accept="video/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
             <div className="text-[var(--text-secondary)] flex flex-col items-center">
                <Upload className="w-12 h-12 text-[var(--text-muted)] mb-2" />
                Select Video File (MP4, WEBM, MOV)
             </div>
           </div>
         ) : (
           <div className="mt-8 space-y-6 text-left">
             <div className="flex items-center justify-between p-4 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
               <div>
                 <div className="font-semibold">{file.name}</div>
                 <div className="text-sm text-[var(--text-secondary)]">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
               </div>
               <button onClick={() => { setFile(null); setOutputUrl(null); }} className="text-sm text-red-500 hover:underline">Remove</button>
             </div>

              {(!isLoaded || isLoading) && !loadError && (
                <div className="text-center text-[var(--text-secondary)] py-4 flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-fuchsia-500" />
                  Loading FFmpeg Engine... (This may take a moment)
                </div>
              )}

              {loadError && (
                <div className="text-center py-4 flex flex-col items-center gap-3">
                  <p className="text-sm text-red-500">{loadError}</p>
                  <button onClick={() => loadFFmpeg()} className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Retry
                  </button>
                </div>
              )}

              {isLoaded && !outputUrl && !isProcessing && (
                <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="text-left"><label htmlFor="lbl-videotomp3-bitrate" className="text-xs font-semibold text-[var(--text-secondary)]">Bitrate</label><select id="lbl-videotomp3-bitrate" aria-label="Bitrate" value={bitrate} onChange={e => setBitrate(e.target.value)} className="w-full mt-1 p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-xs text-[var(--text-primary)]"><option value="128k">128 kbps</option><option value="192k">192 kbps</option><option value="320k">320 kbps</option></select></div>
                  <div className="text-left"><label htmlFor="lbl-videotomp3-title" className="text-xs font-semibold text-[var(--text-secondary)]">Title tag</label><input id="lbl-videotomp3-title" aria-label="Title tag" type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Track title" className="w-full mt-1 p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-xs text-[var(--text-primary)]" /></div>
                  <div className="text-left"><label htmlFor="lbl-videotomp3-artist" className="text-xs font-semibold text-[var(--text-secondary)]">Artist tag</label><input id="lbl-videotomp3-artist" aria-label="Artist tag" type="text" value={artist} onChange={e => setArtist(e.target.value)} placeholder="Artist" className="w-full mt-1 p-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-overlay)] text-xs text-[var(--text-primary)]" /></div>
                </div>
                <button onClick={processVideo} disabled={!isProUser && remaining === 0}
                 className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95">
                  {!isProUser && remaining === 0 ? 'Limit reached — Upgrade to Pro' : 'Extract MP3'}
                </button>
                </>
              )}

             {isProcessing && (
               <div className="space-y-2">
                 <div className="flex justify-between text-sm font-semibold text-fuchsia-600 dark:text-fuchsia-400">
                   <span>Processing...</span>
                   <span>{progress}%</span>
                 </div>
                 <div className="w-full bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-full h-3 overflow-hidden">
                   <div className="bg-fuchsia-500 h-full transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
                 </div>
               </div>
             )}

             {outputUrl ? (
               <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                 <audio controls className="w-full" src={outputUrl}></audio>
                 <a href={outputUrl} download={`${file.name.replace(/\.[^/.]+$/, "")}.mp3`}
                   className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                   <Download className="w-5 h-5" />
                   Download MP3
                 </a>
               </div>
             ) : (
               <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
                 <EmptyState
                   title="Converted audio will appear here"
                   message="Upload a video above to extract audio."
                 />
               </div>
             )}
           </div>
         )}

         <div className="bg-[var(--accent)]/10/20 border border-[var(--accent)]/20 rounded-xl p-3 flex items-center justify-between">
           <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Pro:</strong> Unlimited extractions, batch process multiple files, select specific audio track, export as MP3/FLAC/WAV/AAC.</p>
           <Link href="/pricing" className="text-[10px] font-bold text-[var(--accent)] dark:text-[var(--accent)] underline shrink-0 ml-4">Upgrade →</Link>
         </div>

         <div className="pt-4 border-t border-[var(--border-subtle)]">
           <p className="text-sm text-[var(--text-secondary)] mb-3 font-medium">Also popular:</p>
           <div className="flex flex-wrap gap-2 justify-center">
             {[
               { slug: 'mp4-to-mp3', label: 'MP4 → MP3' },
               { slug: 'mov-to-mp3', label: 'MOV → MP3' },
               { slug: 'webm-to-mp3', label: 'WebM → MP3' },
             ].map(p => (
               <Link
                 key={p.slug}
                 href={`/video/${p.slug}`}
                 className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-[var(--bg-surface)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-all"
               >
                 {p.label}
               </Link>
             ))}
           </div>
         </div>
      </div>
    </div>
  );
}
