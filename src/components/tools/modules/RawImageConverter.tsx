"use client";

import React, { useState, useEffect, useRef } from 'react';
import { FileUploader } from '../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

const FORMATS = [
  { label: 'JPEG', value: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG', value: 'image/png', ext: 'png' },
  { label: 'WebP', value: 'image/webp', ext: 'webp' },
];

const EXTENSIONS = ['CR2', 'NEF', 'ARW', 'DNG', 'RAF', 'ORF', 'RW2', 'PEF', 'SRW'];

export default function RawImageConverter() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [supported, setSupported] = useState<boolean[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [format, setFormat] = useState<(typeof FORMATS)[number]>(FORMATS[0]);
  const [quality, setQuality] = useState(0.92);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const testSupport = (src: string): Promise<boolean> =>
    new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });

  const handleFileSelect = async (file: File, dataUrl: string) => {
    setOutputUrl(null);
    const idx = files.length;
    setFiles(prev => [...prev, file]);
    setPreviews(prev => [...prev, dataUrl]);
    setSelectedIndex(idx);
    const ok = await testSupport(dataUrl);
    setSupported(prev => [...prev, ok]);
    toast[ok ? 'success' : 'error'](`Loaded ${file.name}`);
  };

  const addMoreFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;
    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        if (ev.target?.result) handleFileSelect(file, ev.target.result as string);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const loadImage = (src: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });

  const canvasToBlob = (canvas: HTMLCanvasElement, type: string, q: number): Promise<Blob> =>
    new Promise((resolve, reject) => {
      canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))), type, q);
    });

  const convertFile = async (idx: number): Promise<string> => {
    const img = await loadImage(previews[idx]);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    const blob = await canvasToBlob(canvas, format.value, quality);
    const url = URL.createObjectURL(blob);
    const baseName = files[idx].name.replace(/\.[^.]+$/, '');
    const name = `${baseName}.${format.ext}`;
    return url;
  };

  const convertSelected = async () => {
    if (!files[selectedIndex] || !supported[selectedIndex]) {
      toast.error('This RAW file is not supported.');
      return;
    }
    setIsProcessing(true);
    try {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = await convertFile(selectedIndex);
      setOutputUrl(url);
      const baseName = files[selectedIndex].name.replace(/\.[^.]+$/, '');
      setOutputName(`${baseName}.${format.ext}`);
      toast.success(`Converted to ${format.label}!`);
    } catch (e) {
      console.error(e);
      toast.error('Conversion failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const convertAll = async () => {
    const indices = supported.map((ok, i) => (ok ? i : -1)).filter(i => i !== -1);
    if (indices.length === 0) { toast.error('No supported files.'); return; }
    setIsProcessing(true);
    let count = 0;
    try {
      for (const idx of indices) {
        const url = await convertFile(idx);
        const baseName = files[idx].name.replace(/\.[^.]+$/, '');
        downloadOrShare(url, `${baseName}.${format.ext}`);
        URL.revokeObjectURL(url);
        count++;
      }
      toast.success(`Converted ${count} file${count !== 1 ? 's' : ''}!`);
    } catch (e) {
      console.error(e);
      toast.error('Batch conversion failed.');
    } finally {
      setIsProcessing(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setPreviews([]);
    setSupported([]);
    setSelectedIndex(0);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    setOutputUrl(null);
  };

  if (files.length === 0) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-400 text-sm">
          <strong>RAW Converter:</strong> Convert RAW camera images ({EXTENSIONS.join(', ')}) to JPG, PNG, or WebP. All processing is done locally — nothing is uploaded.
        </div>
        <FileUploader
          accept="image/*"
          onFileSelect={handleFileSelect}
          title="Upload RAW Image"
          subtitle="Drag & drop your RAW file here"
        />
      </div>
    );
  }

  const currentFile = files[selectedIndex];
  const isSupported = supported[selectedIndex];
  const showQuality = format.value !== 'image/png';
  const convertableCount = supported.filter(Boolean).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/50 p-4 rounded-xl border border-zinc-200 dark:border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{files.length} file{files.length > 1 ? 's' : ''}</h3>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm">{convertableCount} supported</p>
          </div>
        </div>
        <button onClick={clearAll} className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:text-white px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-lg">Clear All</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-4 rounded-2xl shadow-xl space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-zinc-900 dark:text-white font-medium text-sm">Files</h4>
              <button onClick={() => fileInputRef.current?.click()} className="text-xs text-blue-500 hover:text-blue-400 font-medium">+ Add More</button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={addMoreFiles} />
            <div className="space-y-1 max-h-72 overflow-y-auto">
              {files.map((f, i) => (
                <div key={i} onClick={() => { setSelectedIndex(i); setOutputUrl(null); }}
                  className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer text-sm transition-all ${i === selectedIndex ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500/30' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}`}
                >
                  <span className="truncate flex-1 mr-2">{f.name}</span>
                  <span className={`flex-shrink-0 w-2 h-2 rounded-full ${supported[i] ? 'bg-green-500' : 'bg-red-400'}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
            <h4 className="text-zinc-900 dark:text-white font-medium text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2">Settings</h4>

            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-semibold">Output Format</p>
              <div className="grid grid-cols-3 gap-2">
                {FORMATS.map(f => (
                  <button key={f.value} onClick={() => setFormat(f)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${format.value === f.value ? 'bg-blue-600 border-blue-500 text-white shadow-md' : 'bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-300'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {showQuality && (
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 uppercase tracking-wider font-semibold">Quality: {Math.round(quality * 100)}%</p>
                <input type="range" min="0.1" max="1" step="0.01" value={quality} onChange={e => setQuality(parseFloat(e.target.value))} className="w-full accent-blue-600" />
              </div>
            )}

            <div className="space-y-2">
              <button onClick={convertSelected} disabled={isProcessing || !isSupported}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Converting...
                  </>
                ) : `Convert to ${format.label}`}
              </button>
              {convertableCount > 1 && (
                <button onClick={convertAll} disabled={isProcessing}
                  className="w-full bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium py-3 rounded-xl transition-all text-sm disabled:opacity-50"
                >
                  Convert All ({convertableCount} files)
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl">
            <h4 className="text-zinc-900 dark:text-white font-medium text-sm border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-4">Preview</h4>
            {isSupported ? (
              <div className="bg-zinc-100 dark:bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center min-h-[250px]">
                <img src={previews[selectedIndex]} alt={currentFile.name} className="max-w-full max-h-[400px] object-contain" />
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 p-5 rounded-xl text-amber-600 dark:text-amber-400 text-sm space-y-2">
                <p className="font-semibold">Browser cannot decode this RAW format.</p>
                <p>Your browser does not support decoding <strong>{currentFile.name}</strong>. This can happen with less common RAW formats or older browsers.</p>
                <p>Try opening the file in an external editor (e.g., Adobe Lightroom, RawTherapee, or your camera&apos;s software) and saving as TIFF or JPEG, then upload that file.</p>
              </div>
            )}
            <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400 truncate">{currentFile.name} &mdash; {(currentFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>

          {outputUrl && (
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
              <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 pb-4">
                <h4 className="font-bold text-emerald-500">Complete</h4>
              </div>
              <div className="bg-emerald-500/10 rounded-xl overflow-hidden border border-emerald-500/20 flex items-center justify-center p-4 min-h-[120px]">
                <img src={outputUrl} alt="Converted" className="max-w-full max-h-[250px] object-contain" />
              </div>
              <button onClick={() => downloadOrShare(outputUrl, outputName)}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-3.5 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {outputName}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
