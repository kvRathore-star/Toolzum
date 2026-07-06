"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { FileDown, Upload, Download, Loader2 } from 'lucide-react';

export default function GifCompressor() {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();
  const [file, setFile] = useState<File | null>(null);
  const [colors, setColors] = useState('128');
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

  const processGif = async () => {
    if (!file || !ffmpeg || !isLoaded) return;
    setIsProcessing(true);
    try {
      await ffmpeg.writeFile('input.gif', await fetchFile(file));
      await ffmpeg.exec(['-i', 'input.gif', '-vf', `palettegen=stats_mode=diff`, '-y', 'palette.png']);
      await ffmpeg.exec(['-i', 'input.gif', '-i', 'palette.png', '-lavfi', `paletteuse=dither=bayer:bayer_scale=5`, '-gifflags', '-offsetting', '-y', 'output.gif']);
      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data as unknown as BlobPart], { type: 'image/gif' });
      setOutputUrl(URL.createObjectURL(blob));
      await ffmpeg.deleteFile('input.gif');
      await ffmpeg.deleteFile('palette.png');
      await ffmpeg.deleteFile('output.gif');
      toast.success('Compressed successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Compression failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <FileDown className="w-5 h-5 text-pink-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">GIF Compressor</h3>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Reduce GIF file size with palette optimization and dithering. All processing is local.</p>

        {!file ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
            <input type="file" accept=".gif" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-zinc-500 flex flex-col items-center">
              <Upload className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-2" />
              Select GIF File
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</div>
                <div className="text-[10px] text-zinc-400">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button onClick={() => { setFile(null); setOutputUrl(null); }} className="text-[10px] text-red-500 hover:underline">Remove</button>
            </div>

            {(!isLoaded || isLoading) && (
              <div className="text-center text-zinc-500 py-4 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                <span className="text-[10px]">Loading FFmpeg Engine...</span>
              </div>
            )}

            {isLoaded && !outputUrl && !isProcessing && (
              <button onClick={processGif} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-[0.98]">
                Compress GIF
              </button>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-semibold text-pink-600">
                  <span>Compressing...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-pink-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {outputUrl && (
              <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <img loading="lazy" src={outputUrl} alt="Compressed GIF" className="max-h-64 mx-auto rounded-lg" />
                <a href={outputUrl} download="compressed.gif" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                  <Download className="w-4 h-4" /> Download Compressed GIF
                </a>
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Batch compress multiple GIFs, frame-skip reduction, resize before compression, custom color palette import.</p>
        </div>
      </div>
    </div>
  );
}
