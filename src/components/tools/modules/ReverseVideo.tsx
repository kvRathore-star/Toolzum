"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../FileUploader';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

export default function ReverseVideo() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'video' | 'audio' | 'both'>('both');
  const [preservePitch, setPreservePitch] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);

  const ffmpegRef = useRef(new FFmpeg());
  const [progress, setProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [outputUrl]);

  const processVideo = async () => {
    if (!file) return;
    setIsProcessing(true);
    setProgress(0);
    setOutputUrl(null);

    const toastId = toast.loading('Loading FFmpeg...');

    try {
      const ffmpeg = ffmpegRef.current;

      if (!ffmpeg.loaded) {
        setLoadingMessage('Loading FFmpeg...');
        ffmpeg.on('progress', ({ progress }) => {
          setProgress(progress * 100);
        });
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        setFfmpegLoaded(true);
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

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
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
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
        </div>
        <button
          onClick={() => { setFile(null); setOutputUrl(null); }}
          className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg"
        >
          Change Video
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-black border border-zinc-200 dark:border-white/10 p-4 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px]">
          <video src={URL.createObjectURL(file)} controls className="w-full max-h-[350px] rounded-lg" />
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
            <h4 className="text-zinc-900 dark:text-white font-medium">Reverse Settings</h4>

            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400 mb-3">Reverse</label>
              <div className="grid grid-cols-3 gap-2">
                {(['video', 'audio', 'both'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      mode === m
                        ? 'bg-blue-600 text-white shadow'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {m === 'video' ? 'Video' : m === 'audio' ? 'Audio' : 'Both'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Preserve Audio Pitch</span>
              <button
                type="button"
                role="switch"
                aria-checked={preservePitch}
                onClick={() => setPreservePitch(!preservePitch)}
                className={`relative w-11 h-6 rounded-full transition-colors ${
                  preservePitch ? 'bg-blue-600' : 'bg-zinc-300 dark:bg-zinc-700'
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
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 relative overflow-hidden"
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

          {outputUrl && (
            <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-400 mb-4">Reversed!</h4>
              <video src={outputUrl} controls autoPlay className="w-full max-h-[200px] rounded-lg mb-6" />
              <button
                onClick={() => downloadOrShare(outputUrl, `reversed_${file.name}`)}
                className="w-full bg-white text-zinc-900 hover:bg-zinc-200 font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download Reversed Video
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
