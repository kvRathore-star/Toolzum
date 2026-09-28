"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Pause, Play, Download, RotateCcw, Edit3, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import { getErrorMessage } from '@/utils/error';

export default function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordingName, setRecordingName] = useState('Recording');
  const [outputFormat, setOutputFormat] = useState<'webm' | 'wav'>('webm');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isRenaming, setIsRenaming] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const fmt = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setHasPermission(true);
      return stream;
    } catch (err: unknown) {
      setHasPermission(false);
      if (err instanceof Error && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        toast.error('Microphone access denied. Allow permissions in browser settings and reload.');
      } else if (err instanceof Error && err.name === 'NotFoundError') {
        toast.error('No microphone found. Connect a microphone and try again.');
      } else {
        toast.error('Microphone error: ' + getErrorMessage(err, 'Unknown error'));
      }
      return null;
    }
  };

  const startWaveform = (stream: MediaStream) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = 120 * window.devicePixelRatio;
    }
    canvas.style.width = '100%';
    canvas.style.height = '120px';

    const audioCtx = new AudioContext();
    audioContextRef.current = audioCtx;
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const ctx = canvas.getContext('2d')!;
    const dpr = window.devicePixelRatio;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i]! / 255) * canvas.height;
        const grad = ctx.createLinearGradient(0, canvas.height, 0, 0);
        grad.addColorStop(0, '#a855f7');
        grad.addColorStop(1, '#ec4899');
        ctx.fillStyle = grad;
        ctx.fillRect(x, canvas.height - barHeight, barWidth * dpr, barHeight);
        x += barWidth + 1 * dpr;
      }
    };
    draw();
  };

  const stopWaveform = () => {
    cancelAnimationFrame(animationRef.current);
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const getMimeType = () => {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return 'audio/webm';
  };

  const startRecording = async () => {
    let stream = streamRef.current;
    if (!stream) {
      stream = await requestMic();
      if (!stream) return;
    }
    chunksRef.current = [];
    const mimeType = getMimeType();
    try {
      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stopWaveform();
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
      };
      recorder.onerror = () => { toast.error('Recording error. Try again.'); stopRecording(); };
      recorder.start(100);
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      startWaveform(stream);
      timerRef.current = setInterval(() => setDuration(prev => prev + 1), 1000);
    } catch {
      toast.error('Failed to start recording. Try a different browser.');
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current?.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerRef.current = setInterval(() => setDuration(prev => prev + 1), 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
  };

  const blobToWav = async (blob: Blob): Promise<Blob> => {
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    await audioCtx.close();
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const bitsPerSample = 16;
    const bytesPerSample = bitsPerSample / 8;
    const dataLength = audioBuffer.length * numChannels * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);
    const w = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
    w(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    w(8, 'WAVE');
    w(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
    view.setUint16(32, numChannels * bytesPerSample, true);
    view.setUint16(34, bitsPerSample, true);
    w(36, 'data');
    view.setUint32(40, dataLength, true);
    const channels: Float32Array[] = [];
    for (let ch = 0; ch < numChannels; ch++) channels.push(audioBuffer.getChannelData(ch));
    let offset = 44;
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const s = Math.max(-1, Math.min(1, channels[ch]![i]!));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        offset += 2;
      }
    }
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const handleDownload = async () => {
    if (!audioBlob) return;
    setIsProcessing(true);
    try {
      let finalBlob = audioBlob;
      if (outputFormat === 'wav') finalBlob = await blobToWav(audioBlob);
      const url = URL.createObjectURL(finalBlob);
      await downloadOrShare(url, `${recordingName}.${outputFormat}`);
      URL.revokeObjectURL(url);
      toast.success('Recording saved!');
    } catch {
      toast.error('Failed to save recording. Try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecordAgain = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setRecordingName('Recording');
    setOutputFormat('webm');
  };

  const startRename = () => {
    setIsRenaming(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const confirmRename = () => {
    const trimmed = inputRef.current?.value?.trim();
    if (trimmed) setRecordingName(trimmed);
    setIsRenaming(false);
  };

  const isSupported = typeof window !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-6">
        <div className="flex items-center justify-center gap-3 mb-2">
          <Mic className="w-8 h-8 text-fuchsia-500" />
          <h2 className="text-2xl font-bold">Voice Recorder</h2>
        </div>

        <div className="bg-[var(--accent)]/10/20 border border-[var(--accent)]/20 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[var(--accent)] shrink-0 mt-0.5" />
          <p className="text-xs text-[var(--accent)] dark:text-[var(--accent)]">
            Your recording stays in your browser — nothing is uploaded. Supports WebM (native) or WAV (converted browser-side).
          </p>
        </div>

        {!isSupported && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Browser not supported</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Your browser does not support the MediaRecorder API. Try Chrome, Firefox, or Edge.</p>
            </div>
          </div>
        )}

        {hasPermission === false && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700 dark:text-red-400">Microphone access denied</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">Allow microphone access in your browser settings, then reload.</p>
            </div>
          </div>
        )}

        {!audioUrl ? (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-6xl font-mono font-bold tracking-wider tabular-nums text-[var(--text-primary)] dark:text-[var(--text-primary)]">{fmt(duration)}</div>
            </div>
            <canvas ref={canvasRef} className="w-full rounded-xl bg-[var(--bg-surface)]" style={{ height: '120px' }} />
            <div className="flex items-center justify-center gap-6">
              {!isRecording ? (
                <button onClick={startRecording} disabled={!isSupported}
                  className="relative w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-xl transition-all active:scale-95"
                  aria-label="Start recording">
                  <Mic className="w-9 h-9" />
                </button>
              ) : (
                <>
                  <button aria-label={isPaused ? "Resume recording" : "Pause recording"} onClick={isPaused ? resumeRecording : pauseRecording}
                    className="w-16 h-16 rounded-full bg-[var(--accent-ink)] hover:opacity-90 text-white flex items-center justify-center shadow-lg transition-all active:scale-95">
                    {isPaused ? <Play className="w-7 h-7" /> : <Pause className="w-7 h-7" />}
                  </button>
                  <button onClick={stopRecording}
                    className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-lg transition-all active:scale-95"
                    aria-label="Stop recording">
                    <Square className="w-7 h-7" />
                  </button>
                </>
              )}
            </div>
            {isRecording && (
              <div className="flex items-center justify-center gap-2.5 text-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                </span>
                <span className="text-red-500 font-semibold">{isPaused ? 'Paused' : 'Recording...'}</span>
              </div>
            )}
            {!isRecording && isSupported && hasPermission !== false && (
              <p className="text-center text-xs text-[var(--text-muted)]">Click the record button to start. Your browser will ask for microphone access.</p>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <audio ref={audioRef} controls className="w-full" src={audioUrl || undefined} />
            <div className="flex items-center justify-between p-4 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
              {isRenaming ? (
                <input ref={inputRef} defaultValue={recordingName} aria-label="Recording name"
                  onKeyDown={e => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setIsRenaming(false); }}
                  onBlur={confirmRename}
                  className="flex-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] dark:border-[var(--border-subtle)] rounded-lg px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:ring-2 focus:ring-fuchsia-500" />
              ) : (
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-sm font-medium text-[var(--text-primary)] truncate max-w-[180px]">{recordingName}.{outputFormat}</span>
                  <button aria-label="Rename recording" onClick={startRename} className="text-[var(--text-muted)] hover:text-fuchsia-500 transition-colors shrink-0"><Edit3 className="w-4 h-4" /></button>
                </div>
              )}
              <div className="text-sm text-[var(--text-secondary)] shrink-0 ml-3">{audioBlob && `${(audioBlob.size / 1024).toFixed(1)} KB`}</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-secondary)] font-medium">Format:</span>
              {(['webm', 'wav'] as const).map(f => (
                <button key={f} onClick={() => setOutputFormat(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${outputFormat === f ? 'bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-700 dark:text-fuchsia-300 border border-fuchsia-300 dark:border-fuchsia-700' : 'bg-[var(--bg-surface)] text-[var(--text-secondary)] dark:text-[var(--text-muted)] border border-[var(--border-subtle)] hover:bg-[var(--bg-surface)]'}`}>
                  .{f.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={handleDownload} disabled={isProcessing}
              className="w-full bg-fuchsia-600 hover:bg-fuchsia-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              {isProcessing ? <><Loader2 className="w-5 h-5 animate-spin" /> Converting...</> : <><Download className="w-5 h-5" /> Download {recordingName}.{outputFormat}</>}
            </button>
            <button onClick={handleRecordAgain}
              className="w-full bg-[var(--bg-surface)] hover:bg-[var(--bg-surface)] text-[var(--text-primary)] font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" /> Record Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
