"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { createDownloadBlob } from '@/utils/blob';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { useEnterToSubmit } from '@/lib/keyboard';
import { EmptyState } from '@/components/EmptyState';

export default function VideoTrimmer() {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const { ffmpeg, isLoaded, progress, loadFFmpeg } = useFFmpeg();
  
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(10);
  const [videoDuration, setVideoDuration] = useState(0);
  
  useEffect(() => {
    loadFFmpeg();
  }, []);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setOutputUrl(null);
    // Read the video's real duration so sliders clamp to it.
    const objectUrl = URL.createObjectURL(f);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const dur = video.duration;
      setVideoDuration(dur);
      setStartTime(0);
      setEndTime(Math.min(10, dur));
      URL.revokeObjectURL(objectUrl);
    };
    video.src = objectUrl;
  };

  const fmtTime = (s: number) => {
    const secs = Math.max(0, Math.floor(s));
    const h = String(Math.floor(secs / 3600)).padStart(2, '0');
    const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const sec = String(secs % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const processVideo = async () => {
    if (!file) return;
    if (!ffmpeg?.loaded) await loadFFmpeg();
    if (!ffmpeg) return;
    if (startTime >= endTime) {
      toast.error("Start time must be before end time.");
      return;
    }
    setIsProcessing(true);

    try {
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));
      
      toast("Trimming video...");
      await ffmpeg.exec([
        '-ss', fmtTime(startTime),
        '-i', 'input.mp4',
        '-t', (endTime - startTime).toFixed(3),
        '-c:v', 'copy', '-c:a', 'copy',
        '-avoid_negative_ts', 'make_zero',
        '-movflags', '+faststart',
        'output.mp4'
      ]);
      
      const data = await ffmpeg.readFile('output.mp4');
      const url = URL.createObjectURL(createDownloadBlob(data, 'video/mp4'));
      setOutputUrl(url);
      
      toast.success("Trimming complete!");
    } catch (e) {
      console.error(e);
      toast.error("Trimming failed. Try a start time aligned to a keyframe.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleKeyDown = useEnterToSubmit(processVideo);

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>Lossless Trimming:</strong> Cut video clips natively in your browser using WASM. No video data is uploaded.
        </div>
        <FileUploader 
          accept="video/mp4,video/quicktime,video/webm,video/x-matroska"
          onFileSelect={(f) => handleFileSelect(f)} 
          title="Upload Video"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button 
          onClick={() => { setFile(null); setOutputUrl(null); }}
          className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-black border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px]">
          <video src={URL.createObjectURL(file)} controls className="w-full max-h-[350px] rounded-lg" />
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
            <h4 className="text-[var(--text-primary)] font-medium">Trim Settings</h4>

            <div className="flex justify-between text-sm">
              <span className="text-[var(--text-muted)] dark:text-[var(--text-muted)]">Video duration: <span className="font-mono text-[var(--text-primary)]">{fmtTime(videoDuration)}</span></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Clip length: <span className="font-mono">{fmtTime(endTime - startTime)}</span></span>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">Start Time</label>
                  <span className="font-mono text-sm text-[var(--accent)]">{fmtTime(startTime)}</span>
                </div>
                <input aria-label="Start Time" 
                  type="range" 
                  min={0}
                  max={videoDuration || 1}
                  step={0.1}
                  value={startTime}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setStartTime(v);
                    if (v >= endTime) setEndTime(Math.min(videoDuration, v + 1));
                  }}
                  className="w-full accent-blue-500"
                />
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <label className="block text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)]">End Time</label>
                  <span className="font-mono text-sm text-[var(--accent)]">{fmtTime(endTime)}</span>
                </div>
                <input aria-label="End Time" 
                  type="range" 
                  min={0}
                  max={videoDuration || 1}
                  step={0.1}
                  value={endTime}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setEndTime(v);
                    if (v <= startTime) setStartTime(Math.max(0, v - 1));
                  }}
                  className="w-full accent-blue-500"
                />
              </div>

              {progress === 0 && isProcessing && (
                <p className="text-xs text-[var(--text-muted)] dark:text-[var(--text-muted)]">
                  Seeking to keyframe... this can take a moment on large files.
                </p>
              )}
            </div>

            <button 
              onClick={processVideo}
              onKeyDown={handleKeyDown}
              disabled={isProcessing || !isLoaded}
              className="w-full bg-gradient-to-r from-[var(--accent-ink)] to-[var(--accent-ink)] hover:from-[var(--accent-ink)] hover:to-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label={isProcessing ? `Trimming video ${Math.round(progress)}%` : 'Trim video'}
            >
              {isProcessing && (
                <div 
                  className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="relative z-10">
                {isProcessing ? `Trimming ${Math.round(progress)}%` : "Trim Video"}
              </span>
            </button>
          </div>

          {outputUrl ? (
            <div className="p-6 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-[var(--accent)] mb-4">Video Trimmed!</h4>
              <video src={outputUrl} controls autoPlay className="w-full max-h-[200px] rounded-lg mb-6" />
              <button 
                onClick={() => downloadOrShare(outputUrl, `trimmed_${file.name}`)}
                className="w-full bg-white text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] font-bold px-4 py-3 rounded-xl transition-colors shadow-lg focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Download trimmed video"
              >
                Download Video
              </button>
            </div>
          ) : (
            <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
              <EmptyState
                title="Trimmed video will appear here"
                message="Upload a video above to trim."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
