"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useFFmpeg } from '@/hooks/useFFmpeg';
import { fetchFile } from '@ffmpeg/util';
import { Music, Upload, Download, Loader2 } from 'lucide-react';

const BIT_DEPTHS = [16, 8] as const;
const SAMPLE_RATES = [44100, 22050, 11025] as const;

export default function WavCompressor() {
  const { ffmpeg, isLoaded, isLoading, progress, loadFFmpeg } = useFFmpeg();
  const [file, setFile] = useState<File | null>(null);
  const [bitDepth, setBitDepth] = useState<number>(16);
  const [sampleRate, setSampleRate] = useState<number>(44100);
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
      await ffmpeg.writeFile('input.wav', await fetchFile(file));
      await ffmpeg.exec(['-i', 'input.wav', '-sample_fmt', bitDepth === 16 ? 's16' : 'u8', '-ar', sampleRate.toString(), 'output.wav']);
      const data = await ffmpeg.readFile('output.wav');
      const blob = new Blob([data as unknown as BlobPart], { type: 'audio/wav' });
      setOutputUrl(URL.createObjectURL(blob));
      await ffmpeg.deleteFile('input.wav');
      await ffmpeg.deleteFile('output.wav');
      toast.success('Compressed successfully!');
    } catch (e) {
      console.error(e);
      toast.error('Compression failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const estimatedRatio = file ? ((bitDepth / 16) * (sampleRate / 44100)).toFixed(1) : '1.0';

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <Music className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">WAV Compressor</h3>
      </div>
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">Reduce WAV file size by lowering bit depth and sample rate. All processing is local.</p>

        {!file ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
            <input type="file" accept=".wav" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-zinc-500 flex flex-col items-center">
              <Upload className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-2" />
              Select WAV File
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</div>
                <div className="text-[10px] text-zinc-400">{(file.size / 1024 / 1024).toFixed(2)} MB · Est. ratio: {estimatedRatio}x</div>
              </div>
              <button onClick={() => { setFile(null); setOutputUrl(null); }} className="text-[10px] text-red-500 hover:underline">Remove</button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1 block">Bit Depth</label>
                <select value={bitDepth} onChange={e => setBitDepth(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none">
                  {BIT_DEPTHS.map(b => <option key={b} value={b}>{b}-bit {b === 16 ? '(CD quality)' : '(telephone)'}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-400 mb-1 block">Sample Rate</label>
                <select value={sampleRate} onChange={e => setSampleRate(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-900 dark:text-white outline-none">
                  {SAMPLE_RATES.map(s => <option key={s} value={s}>{s} Hz {s === 44100 ? '(CD)' : s === 22050 ? '(radio)' : '(speech)'}</option>)}
                </select>
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
                Compress WAV
              </button>
            )}

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-semibold text-emerald-600">
                  <span>Compressing...</span>
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
                <a href={outputUrl} download="compressed.wav" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
                  <Download className="w-4 h-4" /> Download Compressed WAV
                </a>
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Batch compression, frequency spectrum comparison preview, adjustable quality presets for podcasts vs music.</p>
        </div>
      </div>
    </div>
  );
}
