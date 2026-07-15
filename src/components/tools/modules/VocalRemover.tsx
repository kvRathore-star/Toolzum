"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '@/components/tools/FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

type Mode = 'instrumental' | 'acapella' | 'both';
type OutFormat = 'mp3' | 'wav' | 'm4a' | 'flac' | 'ogg';

const FORMATS: OutFormat[] = ['mp3', 'wav', 'm4a', 'flac', 'ogg'];

const FORMAT_LABELS: Record<OutFormat, string> = {
  mp3: 'MP3',
  wav: 'WAV',
  m4a: 'M4A (AAC)',
  flac: 'FLAC',
  ogg: 'OGG Vorbis',
};

const MODE_LABELS: Record<Mode, string> = {
  instrumental: 'Instrumental (Karaoke)',
  acapella: 'Acapella (Vocals Only)',
  both: 'Both Tracks',
};

const FORMAT_EXT: Record<OutFormat, string> = {
  mp3: 'mp3', wav: 'wav', m4a: 'm4a', flac: 'flac', ogg: 'ogg',
};

const FORMAT_MIME: Record<OutFormat, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  m4a: 'audio/mp4',
  flac: 'audio/flac',
  ogg: 'audio/ogg',
};

const CDN_SOURCES = [
  { baseURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd' },
  { baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd' },
];

let ffmpegSingleton: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<void> | null = null;

async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegSingleton?.loaded) return ffmpegSingleton;
  if (ffmpegLoadPromise) {
    await ffmpegLoadPromise;
    if (ffmpegSingleton?.loaded) return ffmpegSingleton;
  }
  ffmpegLoadPromise = (async () => {
    for (const src of CDN_SOURCES) {
      try {
        const ff = new FFmpeg();
        const [coreURL, wasmURL] = await Promise.all([
          toBlobURL(`${src.baseURL}/ffmpeg-core.js`, 'text/javascript'),
          toBlobURL(`${src.baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        ]);
        await ff.load({ coreURL, wasmURL });
        ffmpegSingleton = ff;
        return;
      } catch {
        // try next CDN fallback
      }
    }
    throw new Error('All FFmpeg CDN sources failed to load.');
  })();
  await ffmpegLoadPromise;
  if (!ffmpegSingleton?.loaded) throw new Error('FFmpeg failed to load.');
  return ffmpegSingleton;
}

export default function VocalRemover() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>('instrumental');
  const [outputFormat, setOutputFormat] = useState<OutFormat>('mp3');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputUrl2, setOutputUrl2] = useState<string | null>(null);
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const ffRef = useRef<FFmpeg | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    getFFmpeg()
      .then((ff) => {
        if (!mounted.current) return;
        ffRef.current = ff;
        ff.on('progress', ({ progress: p }) => {
          if (mounted.current) setProgress(Math.round(p * 100));
        });
        setFfmpegLoaded(true);
      })
      .catch(() => {
        if (mounted.current) toast.error('Failed to load audio engine. Please refresh.');
      });
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (outputUrl2) URL.revokeObjectURL(outputUrl2);
    };
  }, [outputUrl, outputUrl2]);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setOutputUrl(null);
    setOutputUrl2(null);
    setProgress(0);
  };

  const handleRemove = () => {
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    if (outputUrl2) URL.revokeObjectURL(outputUrl2);
    setFile(null);
    setOutputUrl(null);
    setOutputUrl2(null);
    setProgress(0);
  };

  const ext = FORMAT_EXT[outputFormat];
  const baseName = file ? file.name.replace(/\.[^/.]+$/, '') : '';

  const processAudio = async () => {
    if (!file || !ffRef.current) return;
    setIsProcessing(true);
    setProgress(0);
    const ff = ffRef.current;
    const inputName = `in_${Date.now()}.${file.name.split('.').pop() || 'mp3'}`;
    try {
      await ff.writeFile(inputName, await fetchFile(file));

      if (mode === 'both') {
        const out1 = `out_inst.${ext}`;
        const out2 = `out_voc.${ext}`;
        await ff.exec([
          '-i', inputName,
          '-af', 'pan=stereo|c0=c0-c1|c1=c1-c0,lowpass=f=18000,highpass=f=20',
          out1,
        ]);
        const d1 = await ff.readFile(out1);
        setOutputUrl(URL.createObjectURL(new Blob([d1 as BlobPart], { type: FORMAT_MIME[outputFormat] })));
        await ff.deleteFile(out1);

        await ff.exec([
          '-i', inputName,
          '-af', 'pan=stereo|c0=.5*c0+.5*c1|c1=.5*c0+.5*c1,lowpass=f=18000,highpass=f=20',
          out2,
        ]);
        const d2 = await ff.readFile(out2);
        setOutputUrl2(URL.createObjectURL(new Blob([d2 as BlobPart], { type: FORMAT_MIME[outputFormat] })));
        await ff.deleteFile(out2);
      } else {
        const isInst = mode === 'instrumental';
        const filter = isInst
          ? 'pan=stereo|c0=c0-c1|c1=c1-c0,lowpass=f=18000,highpass=f=20'
          : 'pan=stereo|c0=.5*c0+.5*c1|c1=.5*c0+.5*c1,lowpass=f=18000,highpass=f=20';
        const outName = `out.${ext}`;
        await ff.exec(['-i', inputName, '-af', filter, outName]);
        const data = await ff.readFile(outName);
        setOutputUrl(URL.createObjectURL(new Blob([data as BlobPart], { type: FORMAT_MIME[outputFormat] })));
        await ff.deleteFile(outName);
      }

      await ff.deleteFile(inputName);
      toast.success(
        mode === 'both'
          ? 'Both tracks created!'
          : `${mode === 'instrumental' ? 'Instrumental' : 'Vocal'} track created!`,
      );
    } catch (e) {
      console.error(e);
      toast.error('Failed to process audio. Try a different file or format.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  if (!ffmpegLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading audio processing engine...</p>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
        <FileUploader
          accept="audio/*"
          onFileSelect={handleFileSelect}
          title="Upload Your Audio File"
          subtitle="MP3, WAV, M4A, FLAC, OGG — all processed locally"
        />
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-4">
          <p className="text-xs text-indigo-700 dark:text-indigo-300">
            <strong>How it works:</strong> This tool uses center channel removal — it subtracts the left and right channels to remove audio panned to the center (typically vocals). Works best on stereo recordings where vocals are mixed in the center. Mono recordings or songs with heavily panned vocals may produce artifacts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl p-5 space-y-5">
        <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</div>
            <div className="text-[10px] text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
          </div>
          <button onClick={handleRemove} disabled={isProcessing} className="text-[10px] text-red-500 hover:underline disabled:opacity-50">Remove</button>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-zinc-400 mb-1.5 block">Output Mode</label>
          <div className="grid grid-cols-3 gap-2">
            {(Object.entries(MODE_LABELS) as [Mode, string][]).map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setMode(key); setOutputUrl(null); setOutputUrl2(null); }}
                className={`py-2.5 px-2 rounded-xl text-[10px] font-bold transition-all ${
                  mode === key
                    ? 'bg-violet-500 text-white shadow-lg'
                    : 'bg-zinc-50 dark:bg-black/50 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-zinc-400 mb-1 block">Output Format</label>
          <select
            value={outputFormat}
            onChange={e => setOutputFormat(e.target.value as OutFormat)}
            className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none"
          >
            {FORMATS.map(f => <option key={f} value={f}>{FORMAT_LABELS[f]}</option>)}
          </select>
        </div>

        {!isProcessing && !outputUrl && !outputUrl2 && (
          <button onClick={processAudio}
            className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
            Process Audio
          </button>
        )}

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-semibold text-violet-600 dark:text-violet-400">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
              <div className="bg-violet-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {(outputUrl || outputUrl2) && !isProcessing && (
          <div className="space-y-4 pt-3 border-t border-zinc-200 dark:border-zinc-800">
            {outputUrl && mode !== 'acapella' && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-zinc-500">Instrumental (Karaoke)</p>
                <audio controls className="w-full" src={outputUrl} />
                <button onClick={() => downloadOrShare(outputUrl, `${baseName}_instrumental.${ext}`)}
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                  Download Instrumental
                </button>
              </div>
            )}
            {mode === 'acapella' && outputUrl && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-zinc-500">Acapella (Vocals Only)</p>
                <audio controls className="w-full" src={outputUrl} />
                <button onClick={() => downloadOrShare(outputUrl, `${baseName}_vocals.${ext}`)}
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                  Download Vocals
                </button>
              </div>
            )}
            {mode === 'both' && outputUrl2 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold text-zinc-500">Acapella (Vocals Only)</p>
                <audio controls className="w-full" src={outputUrl2} />
                <button onClick={() => downloadOrShare(outputUrl2, `${baseName}_vocals.${ext}`)}
                  className="w-full bg-violet-500 hover:bg-violet-600 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                  Download Vocals
                </button>
              </div>
            )}
            {mode === 'both' && (
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 text-center">Both tracks ready</p>
            )}
          </div>
        )}
      </div>

      <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
        <p className="text-[10px] text-indigo-600 dark:text-indigo-400">
          <strong>How it works:</strong> This tool uses center channel removal — it subtracts the left and right channels to remove audio panned to the center (typically vocals). Works best on stereo recordings where vocals are mixed in the center. Mono recordings or songs with heavily panned vocals may produce artifacts. For best results, use studio recordings with clean vocal centering.
        </p>
      </div>
    </div>
  );
}
