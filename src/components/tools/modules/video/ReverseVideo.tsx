"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { fetchFile } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { useEnterToSubmit } from '@/lib/keyboard';
import { EmptyState } from '@/components/EmptyState';

export default function ReverseVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'video' | 'audio' | 'both'>('both');
  const [preservePitch, setPreservePitch] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const { isLoaded, loadFFmpeg, progress } = useFFmpeg();
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const processVideo = async () => {
    if (!file) return;
    setIsProcessing(true);
    setOutputUrl(null);

    const toastId = toast.loading('Loading FFmpeg...');

    try {
      const ffmpeg = await loadFFmpeg();
      if (!ffmpeg) {
        toast.error('Failed to load FFmpeg engine.', { id: toastId });
        return;
      }

      setLoadingMessage('Writing input file...');
      toast.loading('Writing input file...', { id: toastId });
      await ffmpeg.writeFile('input.mp4', await fetchFile(file));

      const args = ['-i', 'input.mp4'];

      if (mode === 'video' || mode === 'both') {
        args.push('-vf', 'reverse');
      }

      if (mode === 'audio' || mode === 'both') {
        args.push('-af', preservePitch ? 'areverse,asetrate=44100,aresample=44100' : 'areverse');
      }

      if (mode === 'video') args.push('-c:a', 'copy');
      if (mode === 'audio') args.push('-c:v', 'copy');

      args.push('output.mp4');

      const msg = mode === 'video' ? 'Reversing video...' : mode === 'audio' ? 'Reversing audio...' : 'Reversing video & audio...';
      setLoadingMessage(msg);
      toast.loading(msg, { id: toastId });

      await ffmpeg.exec(args);

      setLoadingMessage('Reading output...');
      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data as BlobPart], { type: 'video/mp4' });
      setOutputUrl(URL.createObjectURL(blob));

      toast.success('Reverse complete!', { id: toastId });
    } catch (e) {
      console.error(e);
      toast.error('Reverse processing failed.', { id: toastId });
    } finally {
      setIsProcessing(false);
      setLoadingMessage('');
    }
  };

  const handleKeyDown = useEnterToSubmit(processVideo);

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>Reverse Video:</strong> Play video, audio, or both in reverse. All processing happens locally in your browser — nothing is uploaded.
        </div>
        <FileUploader
          accept="video/*"
          onFileSelect={(f) => setFile(f)}
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
          <p className="text-[var(--text-secondary)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          onClick={() => { setFile(null); setOutputUrl(null); }}
          className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
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
            <h4 className="text-[var(--text-primary)] font-medium">Reverse Settings</h4>

            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-3">Reverse</label>
              <div className="grid grid-cols-3 gap-2">
                {(['video', 'audio', 'both'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      mode === m
                        ? 'bg-[var(--accent-ink)] text-white shadow'
                        : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)]'
                    }`}
                    aria-label={`Reverse ${m === 'both' ? 'video and audio' : m}`}
                    aria-pressed={mode === m}
                  >
                    {m === 'video' ? 'Video' : m === 'audio' ? 'Audio' : 'Both'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--text-secondary)]">Preserve Audio Pitch</span>
              <button
                type="button"
                role="switch"
                aria-checked={preservePitch}
                aria-label="Preserve Audio Pitch"
                onClick={() => setPreservePitch(!preservePitch)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  preservePitch ? 'bg-[var(--accent-ink)]' : 'bg-[var(--bg-overlay)]'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    preservePitch ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <button
              onClick={processVideo}
              onKeyDown={handleKeyDown}
              disabled={isProcessing || !isLoaded}
              className="w-full bg-gradient-to-r from-[var(--accent-ink)] to-[var(--accent-ink)] hover:from-[var(--accent-ink)] hover:to-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
              aria-label={isProcessing ? `Reversing video: ${loadingMessage || 'Processing...'}` : 'Reverse video'}
            >
              {isProcessing && (
                <div
                  className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="relative z-10">
                {isProcessing ? (loadingMessage || 'Processing...') : 'Reverse Video'}
              </span>
            </button>
          </div>

          {outputUrl ? (
            <div className="p-6 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-[var(--accent)] mb-4">Reversed!</h4>
              <video src={outputUrl} controls autoPlay className="w-full max-h-[200px] rounded-lg mb-6" />
              <button
                onClick={() => downloadOrShare(outputUrl, `reversed_${file.name}`)}
                className="w-full bg-white text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] font-bold px-4 py-3 rounded-xl transition-colors shadow-lg focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-offset-2"
                aria-label="Download reversed video"
              >
                Download Reversed Video
              </button>
            </div>
          ) : (
            <div className="border border-dashed border-[var(--border-subtle)] rounded-2xl">
              <EmptyState
                title="Reversed video will appear here"
                message="Upload a video above to reverse."
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
