"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import { readPsd, Psd, Layer } from 'ag-psd';

type Format = 'image/jpeg' | 'image/png' | 'image/webp';

const COLOR_MODE_NAMES: Record<number, string> = {
  0: 'Bitmap',
  1: 'Grayscale',
  2: 'Indexed',
  3: 'RGB',
  4: 'CMYK',
  7: 'Multichannel',
  8: 'Duotone',
  9: 'Lab',
};

const FORMATS: { label: string; mime: Format; ext: string }[] = [
  { label: 'JPG', mime: 'image/jpeg', ext: 'jpg' },
  { label: 'PNG', mime: 'image/png', ext: 'png' },
  { label: 'WebP', mime: 'image/webp', ext: 'webp' },
];

function countLayers(children: Layer[] | undefined): number {
  if (!children) return 0;
  let count = 0;
  for (const child of children) {
    count += 1;
    if (child.children) count += countLayers(child.children);
  }
  return count;
}

export default function PsdToJpgPng() {
  const [file, setFile] = useState<File | null>(null);
  const [psdData, setPsdData] = useState<Psd | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [format, setFormat] = useState<Format>('image/png');
  const [quality, setQuality] = useState(90);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [layerCount, setLayerCount] = useState(0);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      if (outputUrl) URL.revokeObjectURL(outputUrl);
    };
  }, [previewUrl, outputUrl]);

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const psd = readPsd(arrayBuffer, { skipLayerImageData: true });
      setLayerCount(countLayers(psd.children));

      if (psd.canvas) {
        const canvas = document.createElement('canvas');
        canvas.width = psd.width;
        canvas.height = psd.height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(psd.canvas, 0, 0);
        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
        if (blob) {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setPreviewUrl(URL.createObjectURL(blob));
        }
      }

      setPsdData(psd);
      setFile(selectedFile);
      setOutputUrl(null);
    } catch (e) {
      toast.error('Failed to read PSD file. The file may be corrupted or in an unsupported format.');
    }
  };

  const clearAll = () => {
    setFile(null);
    setPsdData(null);
    setPreviewUrl(null);
    setOutputUrl(null);
    setLayerCount(0);
  };

  const convertToFormat = async () => {
    if (!psdData) return;

    setIsProcessing(true);
    try {
      let sourceCanvas: HTMLCanvasElement | null = null;

      if (psdData.canvas) {
        sourceCanvas = psdData.canvas;
      } else {
        const firstVisible = psdData.children?.find((c) => !c.hidden && c.canvas);
        if (firstVisible?.canvas) {
          sourceCanvas = firstVisible.canvas;
        }
      }

      if (!sourceCanvas) {
        toast.error('No image data found in this PSD file.');
        return;
      }

      const canvas = document.createElement('canvas');
      canvas.width = sourceCanvas.width;
      canvas.height = sourceCanvas.height;
      const ctx = canvas.getContext('2d')!;

      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      ctx.drawImage(sourceCanvas, 0, 0);

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, format, quality / 100)
      );

      if (!blob) {
        toast.error('Failed to generate output image.');
        return;
      }

      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      toast.success('Conversion complete!');
    } catch (e) {
      toast.error('An error occurred during conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getExt = () => FORMATS.find((f) => f.mime === format)?.ext ?? 'png';

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm">
          <strong>PSD to JPG/PNG/WebP:</strong> Extract flattened image layers from Adobe Photoshop files directly in your browser. No upload needed — everything stays local.
        </div>
        <FileUploader
          accept=".psd,image/vnd.adobe.photoshop"
          onFileSelect={handleFileSelect}
          title="Upload PSD File"
          subtitle="Drag & drop your Photoshop file here"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100">{file.name}</h3>
          <p className="text-zinc-600 dark:text-[var(--text-muted)] text-sm">
            {(file.size / 1024 / 1024).toFixed(2)} MB
            {psdData && (
              <>
                {' '}• {psdData.width}×{psdData.height}px
                {' '}• {COLOR_MODE_NAMES[psdData.colorMode ?? 3] ?? 'Unknown'}
                {' '}• {layerCount} Layer{layerCount !== 1 ? 's' : ''}
              </>
            )}
          </p>
        </div>
        <button
          onClick={clearAll}
          className="text-sm text-zinc-600 dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change File
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 h-fit">
          <h4 className="text-[var(--text-primary)] font-medium border-b border-[var(--border-subtle)] pb-2">
            Export Settings
          </h4>

          <div>
            <label className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.mime}
                  onClick={() => setFormat(f.mime)}
                  className={`py-2.5 px-2 rounded-xl text-xs font-bold transition-all border ${
                    format === f.mime
                      ? 'bg-blue-600 border-blue-500 text-white shadow-md'
                      : 'bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-zinc-600 dark:text-[var(--text-muted)] hover:border-blue-300'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {format === 'image/jpeg' || format === 'image/webp' ? (
            <div>
              <label htmlFor="lbl-psdtojpgpng-quality-quality" className="text-xs text-[var(--text-secondary)] font-medium mb-2 block">
                Quality: {quality}%
              </label>
              <input id="lbl-psdtojpgpng-quality-quality"
                type="range"
                min={10}
                max={100}
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-[var(--text-muted)] mt-1">
                <span>Smaller</span>
                <span>Larger</span>
              </div>
            </div>
          ) : null}

          {format === 'image/png' ? (
            <p className="text-xs text-[var(--text-secondary)]">
              PNG output preserves transparency from the PSD composite image.
            </p>
          ) : null}

          <button
            onClick={convertToFormat}
            disabled={isProcessing}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 flex justify-center items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            {isProcessing ? 'Processing...' : `Convert to ${FORMATS.find((f) => f.mime === format)?.label ?? 'PNG'}`}
          </button>
        </div>

        <div className="space-y-6">
          {previewUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-4 rounded-2xl shadow-xl">
              <div className="overflow-hidden rounded-xl max-h-[350px] flex items-center justify-center chess-bg">
                <style>{`
                    .chess-bg {
                      background-image:
                        linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb),
                        linear-gradient(45deg, #e5e7eb 25%, transparent 25%, transparent 75%, #e5e7eb 75%, #e5e7eb);
                      background-size: 20px 20px;
                      background-position: 0 0, 10px 10px;
                    }
                    .dark .chess-bg {
                      background-image:
                        linear-gradient(45deg, #374151 25%, transparent 25%, transparent 75%, #374151 75%, #374151),
                        linear-gradient(45deg, #374151 25%, transparent 25%, transparent 75%, #374151 75%, #374151);
                    }
                  `}</style>
                <img
                  src={previewUrl}
                  alt="PSD Preview"
                  className="max-h-[340px] w-full object-contain"
                />
              </div>
              <div className="flex justify-between text-xs text-[var(--text-secondary)] mt-3 px-1">
                <span>{psdData?.width}px × {psdData?.height}px</span>
                <span>{COLOR_MODE_NAMES[psdData?.colorMode ?? 3]}</span>
                <span>{layerCount} Layer{layerCount !== 1 ? 's' : ''}</span>
              </div>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] p-6 rounded-2xl flex flex-col items-center justify-center min-h-[300px] text-[var(--text-muted)]">
              <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p>Preview will appear here</p>
            </div>
          )}

          {outputUrl ? (
            <div className="p-6 bg-emerald-700/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-4">Ready!</h4>
              <button
                onClick={() => downloadOrShare(outputUrl, `${file.name.replace(/\.psd$/i, '')}.${getExt()}`)}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download {FORMATS.find((f) => f.mime === format)?.label ?? 'PNG'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
