"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { createDownloadBlob } from '@/utils/blob';

type Mode = 'mute' | 'replace' | 'volume';

export default function MuteVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>('mute');
  const [volume, setVolume] = useState(100);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [syncMode, setSyncMode] = useState<'shortest' | 'first'>('shortest');

  const ffmpegRef = useRef(new FFmpeg());
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';

  const loadFFmpeg = async () => {
    const ffmpeg = ffmpegRef.current;
    if (ffmpeg.loaded) {
      setFfmpegLoaded(true);
      return;
    }
    ffmpeg.on('progress', ({ progress: p }) => {
      setProgress(Math.round(p * 100));
    });
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    setFfmpegLoaded(true);
  };

  useEffect(() => {
    if (file && !ffmpegLoaded) {
      loadFFmpeg();
    }
  }, [file]);

  const reset = () => {
    setFile(null);
    setAudioFile(null);
    setOutputUrl(null);
    setProgress(0);
  };

  const processVideo = async () => {
    if (!file) return;
    if (mode === 'replace' && !audioFile) {
      toast.error('Please upload an audio file to replace with.');
      return;
    }
    setIsProcessing(true);
    setProgress(0);

    try {
      const ffmpeg = ffmpegRef.current;
      if (!ffmpeg.loaded) await loadFFmpeg();

      await ffmpeg.writeFile('input.mp4', await fetchFile(file));

      if (mode === 'mute') {
        toast('Removing audio track...');
        await ffmpeg.exec(['-i', 'input.mp4', '-c:v', 'copy', '-an', 'output.mp4']);
      } else if (mode === 'replace') {
        toast('Replacing audio track...');
        await ffmpeg.writeFile('audio_replace', await fetchFile(audioFile!));
        const args = [
          '-i', 'input.mp4',
          '-i', 'audio_replace',
          '-c:v', 'copy',
          '-c:a', 'aac',
          '-map', '0:v:0',
          '-map', '1:a:0',
          '-shortest',
          'output.mp4',
        ];
        if (syncMode === 'first') args.splice(args.indexOf('-shortest'), 1);
        await ffmpeg.exec(args);
      } else if (mode === 'volume') {
        const volFactor = (volume / 100).toFixed(2);
        toast(`Adjusting volume to ${volume}%...`);
        await ffmpeg.exec([
          '-i', 'input.mp4',
          '-c:v', 'copy',
          '-af', `volume=${volFactor}`,
          'output.mp4',
        ]);
      }

      const data = await ffmpeg.readFile('output.mp4');
      const url = URL.createObjectURL(createDownloadBlob(data, 'video/mp4'));
      setOutputUrl(url);

      await ffmpeg.deleteFile('input.mp4');
      await ffmpeg.deleteFile('output.mp4');
      if (mode === 'replace') await ffmpeg.deleteFile('audio_replace');

      const label = mode === 'mute' ? 'Audio removed' : mode === 'replace' ? 'Audio replaced' : 'Volume adjusted';
      toast.success(`${label} successfully!`);
    } catch (e) {
      console.error(e);
      toast.error('Processing failed. Try a different file or mode.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-amber-400 text-sm">
          <strong>Mute / Replace Audio:</strong> Strip, replace, or adjust the volume of your video&apos;s audio track. Everything runs in your browser — no uploads.
        </div>
        <FileUploader
          accept="video/*"
          onFileSelect={(f) => setFile(f)}
          title="Upload Video"
        />
      </div>
    );
  }

  const getButtonLabel = () => {
    if (isProcessing) return `Processing ${progress}%`;
    switch (mode) {
      case 'mute': return 'Mute Video';
      case 'replace': return 'Replace Audio';
      case 'volume': return `Apply Volume (${volume}%)`;
    }
  };

  const getOutputFileName = () => {
    const base = file.name.replace(/\.[^/.]+$/, '');
    switch (mode) {
      case 'mute': return `${base}_muted.mp4`;
      case 'replace': return `${base}_reaudio.mp4`;
      case 'volume': return `${base}_vol${volume}.mp4`;
    }
  };

  const getModeDescription = () => {
    switch (mode) {
      case 'mute': return 'Completely removes the audio track from your video. The resulting file will have no audio stream.';
      case 'replace': return 'Replace the original audio with a new audio file. Supports MP3, WAV, M4A, and AAC formats.';
      case 'volume': return `Adjust the audio volume from 0% (silent) to 200% (double volume). Normal level is 100%.`;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          onClick={reset}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
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
            <h4 className="text-[var(--text-primary)] font-medium">Audio Settings</h4>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setMode('mute')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'mute' ? 'bg-amber-500 text-white shadow-md' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
              >
                Mute
              </button>
              <button
                onClick={() => setMode('replace')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'replace' ? 'bg-amber-500 text-white shadow-md' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
              >
                Replace
              </button>
              <button
                onClick={() => setMode('volume')}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === 'volume' ? 'bg-amber-500 text-white shadow-md' : 'bg-[var(--bg-surface)] text-zinc-600 dark:text-[var(--text-muted)] hover:bg-[var(--bg-surface)]'}`}
              >
                Volume
              </button>
            </div>

            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{getModeDescription()}</p>

            {!ffmpegLoaded && (
              <div className="flex items-center gap-3 p-3 bg-[var(--bg-overlay)] rounded-xl">
                <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Loading FFmpeg engine...</span>
              </div>
            )}

            {mode === 'replace' && (
              <div className="space-y-3">
                <label className="block text-sm text-zinc-600 dark:text-[var(--text-muted)]">Replacement Audio</label>
                {!audioFile ? (
                  <FileUploader
                    accept="audio/mp3,audio/wav,audio/m4a,audio/aac,.mp3,.wav,.m4a,.aac"
                    onFileSelect={(f) => setAudioFile(f)}
                    title="Upload Audio (MP3, WAV, M4A, AAC)"
                  />
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)]">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">{audioFile.name}</p>
                        <p className="text-xs text-[var(--text-secondary)]">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <button
                        onClick={() => setAudioFile(null)}
                        className="text-xs text-red-500 hover:underline shrink-0 ml-3"
                      >
                        Remove
                      </button>
                    </div>
                    <audio ref={audioRef} src={URL.createObjectURL(audioFile)} controls className="w-full h-10" />
                    <div className="flex items-center justify-between p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800/30">
                      <span className="text-xs text-amber-700 dark:text-amber-400">Sync Mode</span>
                      <select
                        value={syncMode}
                        onChange={(e) => setSyncMode(e.target.value as 'shortest' | 'first')}
                        className="text-xs bg-white dark:bg-black border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-[var(--text-primary)] outline-none"
                      >
                        <option value="shortest">Trim to shortest duration</option>
                        <option value="first">Use original video duration</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {mode === 'volume' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-zinc-600 dark:text-[var(--text-muted)]">Volume Level</label>
                  <span className="text-lg font-bold text-amber-500">{volume}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-xs text-[var(--text-muted)]">
                  <span>0% (Silent)</span>
                  <span>100% (Normal)</span>
                  <span>200% (Double)</span>
                </div>
              </div>
            )}

            <button
              onClick={processVideo}
              disabled={isProcessing || !ffmpegLoaded || (mode === 'replace' && !audioFile)}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
            >
              {isProcessing && (
                <div
                  className="absolute inset-y-0 left-0 bg-white/20 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              )}
              <span className="relative z-10">{getButtonLabel()}</span>
            </button>
          </div>

          {outputUrl && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-400 mb-2">Processing Complete!</h4>
              <p className="text-sm text-emerald-600 dark:text-emerald-300 mb-4">
                {mode === 'mute' && 'Audio track has been removed.'}
                {mode === 'replace' && 'Audio track has been replaced.'}
                {mode === 'volume' && `Volume adjusted to ${volume}%.`}
              </p>
              <video src={outputUrl} controls autoPlay className="w-full max-h-[200px] rounded-lg mb-6" />
              <button
                onClick={() => downloadOrShare(outputUrl, getOutputFileName())}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download Video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
