"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

type FormatDef = {
  key: string;
  label: string;
  ext: string;
  mime: string;
  accept: string;
  hasAlpha: boolean;
};

const FORMATS: Record<string, FormatDef> = {
  png: { key: 'png', label: 'PNG', ext: 'png', mime: 'image/png', accept: '.png', hasAlpha: true },
  jpg: { key: 'jpg', label: 'JPG', ext: 'jpg', mime: 'image/jpeg', accept: '.jpg,.jpeg', hasAlpha: false },
  webp: { key: 'webp', label: 'WebP', ext: 'webp', mime: 'image/webp', accept: '.webp', hasAlpha: true },
  heic: { key: 'heic', label: 'HEIC', ext: 'heic', mime: 'image/heic', accept: '.heic,.heif', hasAlpha: false },
  avif: { key: 'avif', label: 'AVIF', ext: 'avif', mime: 'image/avif', accept: '.avif', hasAlpha: true },
};

type FormatPair = {
  slug: string;
  input: string;
  output: string;
  label: string;
};

const FORMAT_PAIRS: FormatPair[] = [
  { slug: 'png-to-jpg', input: 'png', output: 'jpg', label: 'PNG \u2192 JPG' },
  { slug: 'jpg-to-png', input: 'jpg', output: 'png', label: 'JPG \u2192 PNG' },
  { slug: 'png-to-webp', input: 'png', output: 'webp', label: 'PNG \u2192 WebP' },
  { slug: 'jpg-to-webp', input: 'jpg', output: 'webp', label: 'JPG \u2192 WebP' },
  { slug: 'webp-to-png', input: 'webp', output: 'png', label: 'WebP \u2192 PNG' },
  { slug: 'heic-to-jpg', input: 'heic', output: 'jpg', label: 'HEIC \u2192 JPG' },
  { slug: 'heic-to-png', input: 'heic', output: 'png', label: 'HEIC \u2192 PNG' },
  { slug: 'png-to-avif', input: 'png', output: 'avif', label: 'PNG \u2192 AVIF' },
  { slug: 'jpg-to-avif', input: 'jpg', output: 'avif', label: 'JPG \u2192 AVIF' },
  { slug: 'webp-to-jpg', input: 'webp', output: 'jpg', label: 'WebP \u2192 JPG' },
];

const FORMAT_KEYS = Object.keys(FORMATS);

function resolveSlug(input: string, output: string): string {
  return `${input}-to-${output}`;
}

type ImageFormatConverterProps = {
  slug: string;
  description?: string;
};

export default function ImageFormatConverter({ slug, description }: ImageFormatConverterProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const initialPair = useMemo(() => FORMAT_PAIRS.find(p => p.slug === slug) || FORMAT_PAIRS[0], [slug]);

  const [inputKey, setInputKey] = useState<string>(initialPair.input);
  const [outputKey, setOutputKey] = useState<string>(initialPair.output);

  const inputFmt = FORMATS[inputKey];
  const outputFmt = FORMATS[outputKey];

  const handleFormatChange = (role: "input" | "output", value: string) => {
    if (role === "input") setInputKey(value);
    else setOutputKey(value);
    setFile(null);
    setPreview(null);
  };

  const swapFormats = () => {
    setInputKey(outputKey);
    setOutputKey(inputKey);
    setFile(null);
    setPreview(null);
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }, []);

  const convertCanvas = useCallback((img: HTMLImageElement): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;

      if (!outputFmt.hasAlpha) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(img, 0, 0);

      const quality = outputKey === 'jpg' ? 0.92 : outputKey === 'webp' ? 0.85 : 0.9;
      canvas.toBlob((blob) => resolve(blob), outputFmt.mime, quality);
    });
  }, [outputKey, outputFmt]);

  const convertImage = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      let blob: Blob | null = null;

      if (inputKey === 'heic') {
        const heic2any = (await import('heic2any')).default;
        const result = await heic2any({ blob: file, toType: outputFmt.mime, quality: 0.9 });
        blob = Array.isArray(result) ? result[0] : result;
      } else {
        const img = new Image();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = reject;
          img.src = dataUrl;
        });
        blob = await convertCanvas(img);
        URL.revokeObjectURL(dataUrl);
      }

      if (!blob) throw new Error('Conversion failed');
      const url = URL.createObjectURL(blob);
      downloadOrShare(url, `converted.${outputFmt.ext}`);
      setTimeout(() => URL.revokeObjectURL(url), 100);
      toast.success(`Converted to ${outputFmt.label} successfully!`);
    } catch (e: any) {
      toast.error(e.message || 'Conversion failed. Check your input.');
    } finally {
      setIsProcessing(false);
    }
  }, [file, inputKey, outputKey, outputFmt, convertCanvas]);

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-in fade-in duration-500">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <select value={inputKey} onChange={(e) => handleFormatChange("input", e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer">
          {FORMAT_KEYS.map(k => <option key={k} value={k}>{FORMATS[k].label} (.{FORMATS[k].ext})</option>)}
        </select>

        <button onClick={swapFormats}
          className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all active:scale-95"
          aria-label="Swap formats">
          <svg className="w-5 h-5 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
        </button>

        <select value={outputKey} onChange={(e) => handleFormatChange("output", e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none cursor-pointer">
          {FORMAT_KEYS.map(k => <option key={k} value={k}>{FORMATS[k].label} (.{FORMATS[k].ext})</option>)}
        </select>
      </div>

      {description && (
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-500 text-sm" dangerouslySetInnerHTML={{ __html: description }} />
      )}

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        {!file ? (
          <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
            <input type="file" accept={inputFmt.accept} onChange={handleFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
            <div className="text-zinc-500 flex flex-col items-center">
              <svg className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              <span className="text-sm">Upload {inputFmt.label} Image</span>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-black/30 rounded-xl border border-zinc-200 dark:border-zinc-800">
              <div>
                <div className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{file.name}</div>
                <div className="text-xs text-zinc-400">{(file.size / 1024).toFixed(1)} KB</div>
              </div>
              <button onClick={() => { setFile(null); setPreview(null); }} className="text-xs text-red-500 hover:underline">Remove</button>
            </div>

            {preview && (
              <div className="rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
                <img src={preview} alt="Preview" className="max-h-64 mx-auto object-contain" />
              </div>
            )}

            <button onClick={convertImage} disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all active:scale-[0.98] disabled:opacity-50">
              {isProcessing ? 'Converting...' : `Convert to ${outputFmt.label}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
