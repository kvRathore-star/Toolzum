"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Music, Upload, Download, Loader2 } from 'lucide-react';

export default function Mp3ToOgg() {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState('5');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setOutputUrl(null);
      if (!isLoaded) await loadFFmpeg();
    }
  };

  const processAudio = async () => {
    if (!file || !ffmpeg || !isLoaded) return;
    setIsProcessing(true);
    try {
      await ffmpeg.writeFile('input.mp3', await fetchFile(file));
      await ffmpeg.exec(['-i', 'input.mp3', '-aq', quality, 'output.ogg']);
      const data = await ffmpeg.readFile('output.ogg');
      const blob = new Blob([data as unknown as BlobPart], { type: 'audio/ogg' });
      setOutputUrl(URL.createObjectURL(blob));
      await ffmpeg.deleteFile('input.mp3');
      await ffmpeg.deleteFile('output.ogg');
      toast.success('Converted to OGG successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Conversion failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Music className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">MP3 to OGG Converter</h3>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Transcode MP3 to OGG Vorbis with adjustable quality. All processing is local.</p>

        {!file ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
            <input type="file" accept=".mp3" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-zinc-500 flex flex-col items-center">
              <Upload className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-2" />
              Select MP3 File
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</div>
                <div className="text-[10px] text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
              </div>
              <button onClick={() => { setFile(null); setOutputUrl(null); }} className="text-[10px] text-red-500 hover:underline">Remove</button>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-400 mb-1 block">Quality (-1 to 10)</label>
              <input type="range" min="-1" max="10" value={quality} onChange={e => setQuality(e.target.value)} className="w-full" />
              <div className="flex justify-between text-[10px] text-zinc-400 mt-1">
                <span>Low (45 kbps)</span>
                <span className="font-bold text-emerald-500">{quality === '-1' ? 'Lowest' : quality}</span>
                <span>High (500 kbps)</span>
              </div>
            </div>

            {(!isLoaded || isLoading) && (
              <div className="text-center text-zinc-500 py-4 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-500" />
                <span className="text-[10px]">Loading FFmpeg Engine...</span>
              </div>
            )}

            {isLoaded && !outputUrl && !isProcessing && (
              <button onClick={processAudio} className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-[0.98]">
                Convert to OGG
              </button>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-semibold text-emerald-600">
                  <span>Converting...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {outputUrl && (
              <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <audio controls className="w-full" src={outputUrl} />
                <a href={outputUrl} download="converted.ogg" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                  <Download className="w-4 h-4" /> Download OGG
                </a>
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Batch conversion, higher bitrates (320kbps), podcast presets, audio normalization, cover art preservation.</p>
        </div>
      </div>
    </div>
  );
}
