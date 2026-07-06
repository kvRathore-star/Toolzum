"use client";
import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Film, Upload, Download, Loader2, Plus, X, GripVertical } from 'lucide-react';

export default function ImageToGif() {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();
  const [images, setImages] = useState<{ file: File; url: string }[]>([]);
  const [frameDelay, setFrameDelay] = useState('100');
  const [loopCount, setLoopCount] = useState('0');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = await Promise.all(files.map(async (file) => ({
      file,
      url: URL.createObjectURL(file),
    })));
    setImages(prev => [...prev, ...newImages]);
    setOutputUrl(null);
    if (!isLoaded) await loadFFmpeg();
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].url);
      return prev.filter((_, i) => i !== index);
    });
    setOutputUrl(null);
  };

  const moveImage = (from: number, to: number) => {
    setImages(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setOutputUrl(null);
  };

  const processGif = async () => {
    if (images.length < 2 || !ffmpeg || !isLoaded) return;
    setIsProcessing(true);
    try {
      for (let i = 0; i < images.length; i++) {
        await ffmpeg.writeFile(`img${i}.png`, await fetchFile(images[i].file));
      }

      const inputs = images.map((_, i) => `-i img${i}.png`).join(' ');
      const filter = `[0:v]${images.slice(1).map((_, i) => `[${i + 1}:v]`).join('')}concat=n=${images.length}:v=1:a=0,setpts=${parseInt(frameDelay) / 1000}*PTS[v]`;

      await ffmpeg.exec([
        ...images.flatMap((_, i) => ['-i', `img${i}.png`]),
        '-filter_complex', filter,
        '-map', '[v]',
        '-loop', loopCount,
        '-y', 'output.gif',
      ]);

      const data = await ffmpeg.readFile('output.gif');
      const blob = new Blob([data as unknown as BlobPart], { type: 'image/gif' });
      setOutputUrl(URL.createObjectURL(blob));

      for (let i = 0; i < images.length; i++) {
        await ffmpeg.deleteFile(`img${i}.png`);
      }
      await ffmpeg.deleteFile('output.gif');
      toast.success('GIF created successfully!');
    } catch (e) {
      console.error(e);
      toast.error('GIF creation failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Film className="w-5 h-5 text-pink-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Image to GIF Maker</h3>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Stitch images into an animated GIF. Drag to reorder frames, adjust delay and loop count.</p>

        {images.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={addImages} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-zinc-500 flex flex-col items-center">
              <Upload className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-2" />
              <span>Upload 2+ Images</span>
              <span className="text-[10px] text-zinc-400 mt-1">PNG, JPG, or WebP</span>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="text-xs bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Images
              </button>
              <span className="text-[10px] text-zinc-400">{images.length} frame{images.length !== 1 ? 's' : ''}</span>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={addImages} className="hidden" />

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
              {images.map((img, i) => (
                <div key={i} className="relative group bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                  <img loading="lazy" src={img.url} alt={`Frame ${i + 1}`} className="w-full aspect-square object-cover" />
                  <div className="absolute top-1 left-1 bg-black/60 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">{i + 1}</div>
                  <button onClick={() => removeImage(i)} className="absolute top-1 right-1 bg-black/60 text-white p-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                  <div className="absolute bottom-0 inset-x-0 flex">
                    {i > 0 && <button onClick={() => moveImage(i, i - 1)} className="flex-1 bg-black/40 text-white text-[9px] py-1 hover:bg-black/60 transition-colors">◀</button>}
                    {i < images.length - 1 && <button onClick={() => moveImage(i, i + 1)} className="flex-1 bg-black/40 text-white text-[9px] py-1 hover:bg-black/60 transition-colors">▶</button>}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1 block">Frame Delay (ms)</label>
                <input type="number" value={frameDelay} onChange={e => setFrameDelay(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none" />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1 block">Loop Count (0 = ∞)</label>
                <input type="number" value={loopCount} onChange={e => setLoopCount(e.target.value)} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none" />
              </div>
            </div>

            {(!isLoaded || isLoading) && (
              <div className="text-center text-zinc-500 py-4 flex flex-col items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                <span className="text-[10px]">Loading FFmpeg Engine...</span>
              </div>
            )}

            {isLoaded && !outputUrl && !isProcessing && (
              <button onClick={processGif} disabled={images.length < 2} className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-xl text-xs transition-all active:scale-[0.98] disabled:opacity-50">
                Create GIF
              </button>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-semibold text-pink-600">
                  <span>Creating GIF...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-pink-500 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {outputUrl && (
              <div className="space-y-3 pt-3 border-t border-zinc-200 dark:border-zinc-800">
                <img loading="lazy" src={outputUrl} alt="Created GIF" className="max-h-64 mx-auto rounded-lg" />
                <a href={outputUrl} download="animation.gif" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                  <Download className="w-4 h-4" /> Download GIF
                </a>
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Video frames extraction, custom canvas dimensions, crossfade transitions between frames, output size presets.</p>
        </div>
      </div>
    </div>
  );
}
