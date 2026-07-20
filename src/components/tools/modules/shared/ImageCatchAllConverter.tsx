"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import DOMPurify from 'dompurify';

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
  svg: { key: 'svg', label: 'SVG', ext: 'svg', mime: 'image/svg+xml', accept: '.svg', hasAlpha: true },
  bmp: { key: 'bmp', label: 'BMP', ext: 'bmp', mime: 'image/bmp', accept: '.bmp', hasAlpha: false },
  tiff: { key: 'tiff', label: 'TIFF', ext: 'tiff', mime: 'image/tiff', accept: '.tiff,.tif', hasAlpha: false },
  gif: { key: 'gif', label: 'GIF', ext: 'gif', mime: 'image/gif', accept: '.gif', hasAlpha: true },
  ico: { key: 'ico', label: 'ICO', ext: 'ico', mime: 'image/x-icon', accept: '.ico', hasAlpha: true },
  jxl: { key: 'jxl', label: 'JXL', ext: 'jxl', mime: 'image/jxl', accept: '.jxl', hasAlpha: true },
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
  { slug: 'png-to-gif', input: 'png', output: 'gif', label: 'PNG \u2192 GIF' },
  { slug: 'jpg-to-gif', input: 'jpg', output: 'gif', label: 'JPG \u2192 GIF' },
  { slug: 'webp-to-gif', input: 'webp', output: 'gif', label: 'WebP \u2192 GIF' },
  { slug: 'svg-to-png', input: 'svg', output: 'png', label: 'SVG \u2192 PNG' },
  { slug: 'svg-to-jpg', input: 'svg', output: 'jpg', label: 'SVG \u2192 JPG' },
  { slug: 'bmp-to-jpg', input: 'bmp', output: 'jpg', label: 'BMP \u2192 JPG' },
  { slug: 'bmp-to-png', input: 'bmp', output: 'png', label: 'BMP \u2192 PNG' },
  { slug: 'tiff-to-jpg', input: 'tiff', output: 'jpg', label: 'TIFF \u2192 JPG' },
  { slug: 'tiff-to-png', input: 'tiff', output: 'png', label: 'TIFF \u2192 PNG' },
  { slug: 'gif-to-jpg', input: 'gif', output: 'jpg', label: 'GIF \u2192 JPG' },
  { slug: 'gif-to-png', input: 'gif', output: 'png', label: 'GIF \u2192 PNG' },
  { slug: 'ico-to-png', input: 'ico', output: 'png', label: 'ICO \u2192 PNG' },
  { slug: 'jxl-to-png', input: 'jxl', output: 'png', label: 'JXL \u2192 PNG' },
  { slug: 'jxl-to-jpg', input: 'jxl', output: 'jpg', label: 'JXL \u2192 JPG' },
  { slug: 'avif-to-png', input: 'avif', output: 'png', label: 'AVIF \u2192 PNG' },
  { slug: 'avif-to-jpg', input: 'avif', output: 'jpg', label: 'AVIF \u2192 JPG' },
  { slug: 'bmp-to-webp', input: 'bmp', output: 'webp', label: 'BMP \u2192 WebP' },
  { slug: 'bmp-to-gif', input: 'bmp', output: 'gif', label: 'BMP \u2192 GIF' },
  { slug: 'bmp-to-avif', input: 'bmp', output: 'avif', label: 'BMP \u2192 AVIF' },
  { slug: 'gif-to-webp', input: 'gif', output: 'webp', label: 'GIF \u2192 WebP' },
  { slug: 'gif-to-avif', input: 'gif', output: 'avif', label: 'GIF \u2192 AVIF' },
  { slug: 'heic-to-webp', input: 'heic', output: 'webp', label: 'HEIC \u2192 WebP' },
  { slug: 'heic-to-avif', input: 'heic', output: 'avif', label: 'HEIC \u2192 AVIF' },
  { slug: 'heic-to-gif', input: 'heic', output: 'gif', label: 'HEIC \u2192 GIF' },
  { slug: 'ico-to-jpg', input: 'ico', output: 'jpg', label: 'ICO \u2192 JPG' },
  { slug: 'ico-to-webp', input: 'ico', output: 'webp', label: 'ICO \u2192 WebP' },
  { slug: 'jxl-to-webp', input: 'jxl', output: 'webp', label: 'JXL \u2192 WebP' },
  { slug: 'jxl-to-gif', input: 'jxl', output: 'gif', label: 'JXL \u2192 GIF' },
  { slug: 'png-to-jxl', input: 'png', output: 'jxl', label: 'PNG \u2192 JXL' },
  { slug: 'jpg-to-jxl', input: 'jpg', output: 'jxl', label: 'JPG \u2192 JXL' },
  { slug: 'svg-to-webp', input: 'svg', output: 'webp', label: 'SVG \u2192 WebP' },
  { slug: 'svg-to-avif', input: 'svg', output: 'avif', label: 'SVG \u2192 AVIF' },
  { slug: 'svg-to-gif', input: 'svg', output: 'gif', label: 'SVG \u2192 GIF' },
  { slug: 'tiff-to-webp', input: 'tiff', output: 'webp', label: 'TIFF \u2192 WebP' },
  { slug: 'tiff-to-gif', input: 'tiff', output: 'gif', label: 'TIFF \u2192 GIF' },
  { slug: 'tiff-to-avif', input: 'tiff', output: 'avif', label: 'TIFF \u2192 AVIF' },
  { slug: 'webp-to-avif', input: 'webp', output: 'avif', label: 'WebP \u2192 AVIF' },
  { slug: 'webp-to-bmp', input: 'webp', output: 'bmp', label: 'WebP \u2192 BMP' },
  { slug: 'webp-to-heic', input: 'webp', output: 'heic', label: 'WebP \u2192 HEIC' },
  { slug: 'webp-to-ico', input: 'webp', output: 'ico', label: 'WebP \u2192 ICO' },
  { slug: 'webp-to-jxl', input: 'webp', output: 'jxl', label: 'WebP \u2192 JXL' },
  { slug: 'webp-to-svg', input: 'webp', output: 'svg', label: 'WebP \u2192 SVG' },
  { slug: 'webp-to-tiff', input: 'webp', output: 'tiff', label: 'WebP \u2192 TIFF' },
  { slug: 'png-to-bmp', input: 'png', output: 'bmp', label: 'PNG \u2192 BMP' },
  { slug: 'png-to-heic', input: 'png', output: 'heic', label: 'PNG \u2192 HEIC' },
  { slug: 'png-to-ico', input: 'png', output: 'ico', label: 'PNG \u2192 ICO' },
  { slug: 'png-to-svg', input: 'png', output: 'svg', label: 'PNG \u2192 SVG' },
  { slug: 'png-to-tiff', input: 'png', output: 'tiff', label: 'PNG \u2192 TIFF' },
  { slug: 'jpg-to-bmp', input: 'jpg', output: 'bmp', label: 'JPG \u2192 BMP' },
  { slug: 'jpg-to-heic', input: 'jpg', output: 'heic', label: 'JPG \u2192 HEIC' },
  { slug: 'jpg-to-ico', input: 'jpg', output: 'ico', label: 'JPG \u2192 ICO' },
  { slug: 'jpg-to-svg', input: 'jpg', output: 'svg', label: 'JPG \u2192 SVG' },
  { slug: 'jpg-to-tiff', input: 'jpg', output: 'tiff', label: 'JPG \u2192 TIFF' },
  { slug: 'gif-to-bmp', input: 'gif', output: 'bmp', label: 'GIF \u2192 BMP' },
  { slug: 'gif-to-heic', input: 'gif', output: 'heic', label: 'GIF \u2192 HEIC' },
  { slug: 'gif-to-ico', input: 'gif', output: 'ico', label: 'GIF \u2192 ICO' },
  { slug: 'gif-to-jxl', input: 'gif', output: 'jxl', label: 'GIF \u2192 JXL' },
  { slug: 'gif-to-svg', input: 'gif', output: 'svg', label: 'GIF \u2192 SVG' },
  { slug: 'gif-to-tiff', input: 'gif', output: 'tiff', label: 'GIF \u2192 TIFF' },
  { slug: 'ico-to-avif', input: 'ico', output: 'avif', label: 'ICO \u2192 AVIF' },
  { slug: 'ico-to-bmp', input: 'ico', output: 'bmp', label: 'ICO \u2192 BMP' },
  { slug: 'ico-to-gif', input: 'ico', output: 'gif', label: 'ICO \u2192 GIF' },
  { slug: 'ico-to-heic', input: 'ico', output: 'heic', label: 'ICO \u2192 HEIC' },
  { slug: 'ico-to-jxl', input: 'ico', output: 'jxl', label: 'ICO \u2192 JXL' },
  { slug: 'ico-to-svg', input: 'ico', output: 'svg', label: 'ICO \u2192 SVG' },
  { slug: 'ico-to-tiff', input: 'ico', output: 'tiff', label: 'ICO \u2192 TIFF' },
  { slug: 'jxl-to-avif', input: 'jxl', output: 'avif', label: 'JXL \u2192 AVIF' },
  { slug: 'jxl-to-bmp', input: 'jxl', output: 'bmp', label: 'JXL \u2192 BMP' },
  { slug: 'jxl-to-heic', input: 'jxl', output: 'heic', label: 'JXL \u2192 HEIC' },
  { slug: 'jxl-to-ico', input: 'jxl', output: 'ico', label: 'JXL \u2192 ICO' },
  { slug: 'jxl-to-svg', input: 'jxl', output: 'svg', label: 'JXL \u2192 SVG' },
  { slug: 'jxl-to-tiff', input: 'jxl', output: 'tiff', label: 'JXL \u2192 TIFF' },
  { slug: 'bmp-to-heic', input: 'bmp', output: 'heic', label: 'BMP \u2192 HEIC' },
  { slug: 'bmp-to-ico', input: 'bmp', output: 'ico', label: 'BMP \u2192 ICO' },
  { slug: 'bmp-to-jxl', input: 'bmp', output: 'jxl', label: 'BMP \u2192 JXL' },
  { slug: 'bmp-to-svg', input: 'bmp', output: 'svg', label: 'BMP \u2192 SVG' },
  { slug: 'bmp-to-tiff', input: 'bmp', output: 'tiff', label: 'BMP \u2192 TIFF' },
  { slug: 'avif-to-bmp', input: 'avif', output: 'bmp', label: 'AVIF \u2192 BMP' },
  { slug: 'avif-to-gif', input: 'avif', output: 'gif', label: 'AVIF \u2192 GIF' },
  { slug: 'avif-to-heic', input: 'avif', output: 'heic', label: 'AVIF \u2192 HEIC' },
  { slug: 'avif-to-ico', input: 'avif', output: 'ico', label: 'AVIF \u2192 ICO' },
  { slug: 'avif-to-jxl', input: 'avif', output: 'jxl', label: 'AVIF \u2192 JXL' },
  { slug: 'avif-to-svg', input: 'avif', output: 'svg', label: 'AVIF \u2192 SVG' },
  { slug: 'avif-to-tiff', input: 'avif', output: 'tiff', label: 'AVIF \u2192 TIFF' },
  { slug: 'avif-to-webp', input: 'avif', output: 'webp', label: 'AVIF \u2192 WebP' },
  { slug: 'svg-to-bmp', input: 'svg', output: 'bmp', label: 'SVG \u2192 BMP' },
  { slug: 'svg-to-heic', input: 'svg', output: 'heic', label: 'SVG \u2192 HEIC' },
  { slug: 'svg-to-ico', input: 'svg', output: 'ico', label: 'SVG \u2192 ICO' },
  { slug: 'svg-to-jxl', input: 'svg', output: 'jxl', label: 'SVG \u2192 JXL' },
  { slug: 'svg-to-tiff', input: 'svg', output: 'tiff', label: 'SVG \u2192 TIFF' },
  { slug: 'tiff-to-bmp', input: 'tiff', output: 'bmp', label: 'TIFF \u2192 BMP' },
  { slug: 'tiff-to-heic', input: 'tiff', output: 'heic', label: 'TIFF \u2192 HEIC' },
  { slug: 'tiff-to-ico', input: 'tiff', output: 'ico', label: 'TIFF \u2192 ICO' },
  { slug: 'tiff-to-jxl', input: 'tiff', output: 'jxl', label: 'TIFF \u2192 JXL' },
  { slug: 'tiff-to-svg', input: 'tiff', output: 'svg', label: 'TIFF \u2192 SVG' },
  { slug: 'heic-to-bmp', input: 'heic', output: 'bmp', label: 'HEIC \u2192 BMP' },
  { slug: 'heic-to-ico', input: 'heic', output: 'ico', label: 'HEIC \u2192 ICO' },
  { slug: 'heic-to-jxl', input: 'heic', output: 'jxl', label: 'HEIC \u2192 JXL' },
  { slug: 'heic-to-svg', input: 'heic', output: 'svg', label: 'HEIC \u2192 SVG' },
  { slug: 'heic-to-tiff', input: 'heic', output: 'tiff', label: 'HEIC \u2192 TIFF' },
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
        if (inputKey === 'svg') {
          img.width = img.naturalWidth;
          img.height = img.naturalHeight;
        }
        if (inputKey === 'tiff' || inputKey === 'jxl') {
          try {
            blob = await convertCanvas(img);
          } catch (e) {
            console.error(e);
            throw new Error('Your browser does not support decoding this format. Try using Chrome or Edge.');
          }
        } else {
          blob = await convertCanvas(img);
        }
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
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-500 text-sm" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }} />
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
