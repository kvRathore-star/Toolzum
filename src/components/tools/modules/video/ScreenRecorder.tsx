"use client";
import React, { useState, useEffect, useRef } from 'react';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';

type Quality = '720p' | '1080p' | '1440p';

const qualityPresets: Record<Quality, { width: number; height: number; label: string }> = {
  '720p': { width: 1280, height: 720, label: 'HD (720p)' },
  '1080p': { width: 1920, height: 1080, label: 'Full HD (1080p)' },
  '1440p': { width: 2560, height: 1440, label: '2K (1440p)' },
};

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
};

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [includeAudio, setIncludeAudio] = useState(false);
  const [quality, setQuality] = useState<Quality>('1080p');
  const [isProcessing, setIsProcessing] = useState(false);
  const [ffmpegProgress, setFfmpegProgress] = useState(0);
  const { ffmpeg, isLoaded, loadFFmpeg } = useFFmpeg();

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const displayStreamRef = useRef<MediaStream | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    };
  }, [recordedUrl]);

  const stopAllTracks = () => {
    [displayStreamRef, audioStreamRef].forEach(ref => {
      if (ref.current) {
        ref.current.getTracks().forEach(t => t.stop());
        ref.current = null;
      }
    });
  };

  const clearTimer = () => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const getMimeType = () => {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=h264,opus',
      'video/webm',
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return '';
  };

  const startRecording = async () => {
    try {
      if (typeof MediaRecorder === 'undefined') {
        toast.error('MediaRecorder is not supported in this browser.');
        return;
      }

      const preset = qualityPresets[quality];
      let displayStream: MediaStream;

      try {
        displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: { width: preset.width, height: preset.height },
        });
      } catch (e) {
        if ((e as DOMException).name === 'NotAllowedError') {
          toast.error('Screen sharing was cancelled or denied.');
        } else {
          toast.error('Failed to access screen.');
        }
        return;
      }

      const tracks: MediaStreamTrack[] = [...displayStream.getVideoTracks()];

      let audioStream: MediaStream | null = null;
      if (includeAudio) {
        try {
          audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          tracks.push(...audioStream.getAudioTracks());
        } catch (e) {
          console.error(e);
          toast.error('Microphone access was denied. Recording without audio.');
        }
      }

      const combinedStream = new MediaStream(tracks);
      displayStreamRef.current = displayStream;
      audioStreamRef.current = audioStream;

      const mimeType = getMimeType();
      const recorder = new MediaRecorder(combinedStream, mimeType ? { mimeType } : {});

      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        clearTimer();
        if (chunksRef.current.length === 0) {
          toast.error('No data was recorded. Please try again.');
          stopAllTracks();
          return;
        }
        const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        setIsRecording(false);
        setIsPaused(false);
        stopAllTracks();
      };

      displayStream.getVideoTracks()[0]!.onended = () => {
        if (recorder.state === 'recording' || recorder.state === 'paused') {
          recorder.stop();
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start(1000);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);

      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (e) {
      console.error(e);
      toast.error('Failed to start recording.');
      stopAllTracks();
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      clearTimer();
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (mediaRecorderRef.current.state === 'recording' || mediaRecorderRef.current.state === 'paused')) {
      mediaRecorderRef.current.stop();
    }
  };

  const resetAll = () => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setDuration(0);
    setIsRecording(false);
    setIsPaused(false);
    stopAllTracks();
    clearTimer();
  };

  const convertToMp4 = async () => {
    if (!recordedBlob) return;
    setIsProcessing(true);
    setFfmpegProgress(0);

    const { fetchFile } = await import('@ffmpeg/util');
    const ffmpeg = await loadFFmpeg();
    if (!ffmpeg) {
      setIsProcessing(false);
      toast.error('Failed to load FFmpeg engine.');
      return;
    }
    try {
      ffmpeg.on('progress', ({ progress }) => {
        setFfmpegProgress(Math.round(progress * 100));
      });

      const inputName = 'input.webm';
      const outputName = 'output.mp4';

      await ffmpeg.writeFile(inputName, await fetchFile(new File([recordedBlob], inputName, { type: recordedBlob.type })));
      await ffmpeg.exec(['-i', inputName, '-c:v', 'libx264', '-preset', 'fast', '-c:a', 'aac', '-movflags', '+faststart', outputName]);

      const data = await ffmpeg.readFile(outputName);
      const mp4Blob = new Blob([data as BlobPart], { type: 'video/mp4' });
      const mp4Url = URL.createObjectURL(mp4Blob);

      await downloadOrShare(mp4Url, `screen_recording_${Date.now()}.mp4`);

      URL.revokeObjectURL(mp4Url);
      toast.success('MP4 ready for download.');
    } catch (e) {
      console.error(e);
      toast.error('MP4 conversion failed. Try downloading WebM instead.');
    } finally {
      setIsProcessing(false);
      setFfmpegProgress(0);
    }
  };

  const isIdle = !isRecording && !recordedUrl;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
        <strong>Browser-Based Recording:</strong> Your screen is never uploaded. Everything stays on your device. Share your entire screen, a specific application window, or a browser tab.
      </div>

      {isIdle && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-8">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold">Screen Recorder</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">Record your screen, tab, or application window</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Video Quality</label>
            <div className="flex gap-2">
              {(Object.keys(qualityPresets) as Quality[]).map(q => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 px-4 py-3 text-sm font-medium rounded-xl border transition-all ${quality === q ? 'bg-red-500 text-white border-red-500 shadow-lg' : 'bg-[var(--bg-overlay)] text-zinc-600 dark:text-[var(--text-muted)] border-[var(--border-subtle)] hover:border-red-300 dark:hover:border-red-700'}`}
                >
                  {qualityPresets[q].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-[var(--bg-overlay)]/50 rounded-xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-sm font-medium">Include microphone audio</span>
            </div>
            <button
              role="switch"
              aria-checked={includeAudio}
              aria-label="Include microphone audio"
              onClick={() => setIncludeAudio(!includeAudio)}
              className={`relative w-11 h-6 rounded-full transition-colors ${includeAudio ? 'bg-red-500' : 'bg-zinc-300 dark:bg-zinc-600'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${includeAudio ? 'translate-x-5' : ''}`} />
            </button>
          </div>

          <button
            onClick={startRecording}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3 text-lg"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="6" />
            </svg>
            Start Recording
          </button>
        </div>
      )}

      {isRecording && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-8 text-center">
          <div className="flex items-center justify-center gap-3">
            {!isPaused && <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />}
            {isPaused && (
              <svg className="w-5 h-5 text-amber-700 dark:text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
            )}
            <span className={`text-3xl font-mono font-bold tabular-nums ${isPaused ? 'text-amber-700 dark:text-amber-400' : 'text-red-500'}`}>
              {isPaused ? 'Paused' : 'REC'} {formatTime(duration)}
            </span>
          </div>

          <div className="flex justify-center gap-4">
            {isPaused ? (
              <button onClick={resumeRecording} className="px-8 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><polygon points="5,3 19,12 5,21" /></svg>
                Resume
              </button>
            ) : (
              <button onClick={pauseRecording} className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></svg>
                Pause
              </button>
            )}
            <button onClick={stopRecording} className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
              Stop
            </button>
          </div>
        </div>
      )}

      {recordedUrl && !isRecording && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-emerald-500">Recording Complete</h3>
            <span className="text-sm text-[var(--text-muted)] font-mono">{formatTime(duration)}</span>
          </div>

          <div className="bg-black rounded-xl overflow-hidden shadow-inner">
            <video src={recordedUrl} controls className="w-full max-h-[400px]" />
          </div>

          {isProcessing ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-semibold text-blue-700 dark:text-blue-400">
                <span>Converting to MP4...</span>
                <span>{ffmpegProgress}%</span>
              </div>
              <div className="w-full bg-zinc-200 dark:bg-[var(--bg-surface)] rounded-full h-3 overflow-hidden">
                <div className="bg-blue-500 h-full transition-all duration-300 ease-out" style={{ width: `${ffmpegProgress}%` }} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { if (recordedUrl) downloadOrShare(recordedUrl, `screen_recording_${Date.now()}.webm`); }}
                className="px-4 py-4 bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-zinc-800 dark:text-zinc-200 font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 border border-[var(--border-subtle)]"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download WebM
              </button>
              <button
                onClick={convertToMp4}
                disabled={isProcessing || !isLoaded}
                className="px-4 py-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                Download MP4
              </button>
            </div>
          )}

          <button
            onClick={resetAll}
            disabled={isProcessing}
            className="w-full px-4 py-3 bg-[var(--bg-overlay)] hover:bg-zinc-100 dark:hover:bg-[var(--bg-elevated)] text-zinc-600 dark:text-[var(--text-muted)] font-medium rounded-xl transition-all active:scale-95 border border-[var(--border-subtle)] disabled:opacity-50"
          >
            Record Again
          </button>
        </div>
      )}
    </div>
  );
}
