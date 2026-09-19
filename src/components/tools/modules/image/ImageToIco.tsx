"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';

const ICON_SIZES = [16, 32, 48, 64, 128, 256];
const DEFAULT_SIZE = 32;

export default function ImageToIco() {
  const [file, setFile] = useState<File | null>(null);
  const [iconSize, setIconSize] = useState(DEFAULT_SIZE);
  const [multiSize, setMultiSize] = useState(true);
  const [squareCrop, setSquareCrop] = useState(true);
  const [bgColor, setBgColor] = useState('#ffffff00');
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [outputUrl, preview]);

  const sizesToGenerate = multiSize ? ICON_SIZES : [iconSize];

  const createBmpData = (imageData: ImageData): ArrayBuffer => {
    const { width, height, data } = imageData;
    const rowSize = width * 4;
    const paddedRowSize = Math.ceil(rowSize / 4) * 4;
    const xorSize = paddedRowSize * height;
    const andRowSize = Math.ceil(width / 8);
    const andSize = andRowSize * height;

    const buf = new ArrayBuffer(40 + xorSize + andSize);
    const view = new DataView(buf);

    let offset = 0;
    view.setUint32(offset, 40, true); offset += 4;
    view.setInt32(offset, width, true); offset += 4;
    view.setInt32(offset, height * 2, true); offset += 4;
    view.setUint16(offset, 1, true); offset += 2;
    view.setUint16(offset, 32, true); offset += 2;
    view.setUint32(offset, 0, true); offset += 4;
    view.setUint32(offset, 0, true); offset += 4;
    view.setInt32(offset, 0, true); offset += 4;
    view.setInt32(offset, 0, true); offset += 4;
    view.setUint32(offset, 0, true); offset += 4;
    view.setUint32(offset, 0, true); offset += 4;

    for (let y = height - 1; y >= 0; y--) {
      const rowStart = y * width * 4;
      let o = 40 + (height - 1 - y) * paddedRowSize;
      for (let x = 0; x < width; x++) {
        const i = rowStart + x * 4;
        view.setUint8(o++, data[i + 2] ?? 0);
        view.setUint8(o++, data[i + 1] ?? 0);
        view.setUint8(o++, data[i] ?? 0);
        view.setUint8(o++, data[i + 3] ?? 0);
      }
    }

    const andOffset = 40 + xorSize;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        if ((data[i + 3] ?? 0) < 128) {
          const byteIdx = andOffset + y * andRowSize + Math.floor(x / 8);
          const bitIdx = 7 - (x % 8);
          view.setUint8(byteIdx, view.getUint8(byteIdx) | (1 << bitIdx));
        }
      }
    }

    return buf;
  };

  const createIco = async () => {
    if (!file) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = URL.createObjectURL(file);
      });

      const iconDir: ArrayBuffer[] = [];
      let totalIcoSize = 6 + sizesToGenerate.length * 16;

      for (const size of sizesToGenerate) {
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Failed to get canvas context');

        if (squareCrop) {
          const srcAspect = img.width / img.height;
          let sx: number, sy: number, sw: number, sh: number;
          if (srcAspect > 1) {
            sh = img.height;
            sw = img.height;
            sx = (img.width - sw) / 2;
            sy = 0;
          } else {
            sw = img.width;
            sh = img.width;
            sx = 0;
            sy = (img.height - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, size, size);
        } else {
          if (bgColor === '#ffffff00') {
            ctx.clearRect(0, 0, size, size);
          } else {
            ctx.fillStyle = bgColor;
            ctx.fillRect(0, 0, size, size);
          }
          const scale = Math.min(size / img.width, size / img.height);
          const dx = (size - img.width * scale) / 2;
          const dy = (size - img.height * scale) / 2;
          ctx.drawImage(img, dx, dy, img.width * scale, img.height * scale);
        }

        const imageData = ctx.getImageData(0, 0, size, size);
        const bmpData = createBmpData(imageData);
        iconDir.push(bmpData);
        totalIcoSize += bmpData.byteLength;
      }

      const icoBuf = new ArrayBuffer(totalIcoSize);
      const icoView = new DataView(icoBuf);
      let offset = 0;

      icoView.setUint16(offset, 0, true); offset += 2;
      icoView.setUint16(offset, 1, true); offset += 2;
      icoView.setUint16(offset, sizesToGenerate.length, true); offset += 2;

      let imgDataOffset = 6 + sizesToGenerate.length * 16;
      for (let i = 0; i < sizesToGenerate.length; i++) {
        const size = sizesToGenerate[i]!;
        const w = size >= 256 ? 0 : size;
        const h = size >= 256 ? 0 : size;
        icoView.setUint8(offset++, w);
        icoView.setUint8(offset++, h);
        icoView.setUint8(offset++, 0);
        icoView.setUint8(offset++, 0);
        icoView.setUint16(offset, 1, true); offset += 2;
        icoView.setUint16(offset, 32, true); offset += 2;
        icoView.setUint32(offset, iconDir[i]!.byteLength, true); offset += 4;
        icoView.setUint32(offset, imgDataOffset, true); offset += 4;
        imgDataOffset += iconDir[i]!.byteLength;
      }

      for (const bmp of iconDir) {
        new Uint8Array(icoBuf).set(new Uint8Array(bmp), offset);
        offset += bmp.byteLength;
      }

      const blob = new Blob([icoBuf], { type: 'image/x-icon' });
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);

      const previewCanvas = document.createElement('canvas');
      const pSize = Math.min(iconSize, 128);
      previewCanvas.width = pSize;
      previewCanvas.height = pSize;
      const pCtx = previewCanvas.getContext('2d');
      if (pCtx) {
        const img2 = new Image();
        img2.src = URL.createObjectURL(file);
        await new Promise(r => { img2.onload = r; });
        pCtx.drawImage(img2, 0, 0, pSize, pSize);
        if (preview) URL.revokeObjectURL(preview);
        previewCanvas.toBlob(b => {
          if (b) setPreview(URL.createObjectURL(b));
        }, 'image/png');
      }

      toast.success(`ICO generated with ${sizesToGenerate.length} size${sizesToGenerate.length > 1 ? 's' : ''}!`);
    } catch (e) {
      console.error(e);
      toast.error("Failed to generate ICO.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl text-[var(--accent)] text-sm">
          <strong>Image to ICO:</strong> Convert images to Windows ICO format for favicons and app icons.
        </div>
        <FileUploader
          accept="image/png,image/jpeg,image/webp,image/gif"
          onFileSelect={(f) => { setFile(f); setOutputUrl(null); setPreview(null); }}
          title="Upload Image"
          subtitle="PNG, JPG, WebP, or GIF"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-[var(--border-subtle)] dark:border-[var(--border-subtle)]">
        <div>
          <h3 className="font-bold text-[var(--text-primary)]">{file.name}</h3>
          <p className="text-[var(--text-secondary)] dark:text-[var(--text-muted)] text-sm">{(file.size / 1024).toFixed(2)} KB</p>
        </div>
        <button
          onClick={() => { setFile(null); setOutputUrl(null); setPreview(null); }}
          className="text-sm text-[var(--text-secondary)] dark:text-[var(--text-muted)] hover:text-[var(--text-primary)] px-3 py-1.5 bg-[var(--bg-surface)] rounded-lg"
        >
          Change Image
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6">
          <div>
            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Icon Size</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
              {ICON_SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => { setIconSize(s); setOutputUrl(null); }}
                  disabled={multiSize}
                  className={`py-2 text-[10px] font-bold border rounded-lg transition-all ${
                    iconSize === s && !multiSize
                      ? 'bg-[var(--accent-ink)] text-white border-[var(--accent-ink)] shadow-md'
                      : multiSize
                        ? 'bg-[var(--bg-surface)] text-[var(--text-muted)] border-[var(--border-subtle)] cursor-not-allowed'
                        : 'bg-[var(--bg-overlay)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:border-[var(--accent)]'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={multiSize}
              onChange={() => setMultiSize(!multiSize)}
              className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--accent)]"
            />
            <span className="text-sm font-bold text-[var(--text-primary)]">Generate multiple sizes (16x16 – 256x256)</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={squareCrop}
              onChange={() => setSquareCrop(!squareCrop)}
              className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--accent)]"
            />
            <span className="text-sm font-bold text-[var(--text-primary)]">Square crop (center)</span>
          </label>

          {!squareCrop && (
            <div>
              <label htmlFor="lbl-imagetoico-background-color" className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2 block">Background Color</label>
              <input id="lbl-imagetoico-background-color" aria-label="Background Color"
                type="color"
                value={bgColor === '#ffffff00' ? '#ffffff' : bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 rounded-lg border border-[var(--border-subtle)] cursor-pointer"
              />
              <div className="flex items-center gap-2 mt-2">
                <input aria-label="Transparent background"
                  type="checkbox"
                  id="transparentBg"
                  checked={bgColor === '#ffffff00'}
                  onChange={(e) => setBgColor(e.target.checked ? '#ffffff00' : '#ffffff')}
                  className="w-3.5 h-3.5 rounded border-[var(--border-subtle)] text-[var(--accent)]"
                />
                <label htmlFor="transparentBg" className="text-xs text-[var(--text-secondary)]">Transparent background</label>
              </div>
            </div>
          )}

          <button
            onClick={createIco}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-[var(--accent-ink)] to-[var(--accent-ink)] hover:from-[var(--accent-ink)] hover:to-[var(--accent-ink)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isProcessing ? "Generating ICO..." : "Generate ICO"}
          </button>
        </div>

        <div className="space-y-6">
          {outputUrl ? (
            <div className="p-6 bg-emerald-700/10 border border-emerald-500/20 rounded-2xl animate-in slide-in-from-bottom-4 text-center shadow-xl">
              <h4 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-4">ICO Ready!</h4>
              <div className="bg-[var(--bg-overlay)] dark:bg-black rounded-xl p-6 mb-6 flex items-center justify-center min-h-[120px] chess-bg">
                <style>{`
                  .chess-bg {
                    background-image: linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee),
                      linear-gradient(45deg, #eee 25%, transparent 25%, transparent 75%, #eee 75%, #eee);
                    background-size: 20px 20px;
                    background-position: 0 0, 10px 10px;
                  }
                  @media (prefers-color-scheme: dark) {
                    .chess-bg {
                      background-image: linear-gradient(45deg, #222 25%, transparent 25%, transparent 75%, #222 75%, #222),
                        linear-gradient(45deg, #222 25%, transparent 25%, transparent 75%, #222 75%, #222);
                    }
                  }
                `}</style>
                {preview && (
                  <img  loading="lazy" src={preview} alt="Preview" width={iconSize} height={iconSize} className="drop-shadow-md rounded" />
                )}
              </div>
              <div className="text-xs text-[var(--text-secondary)] mb-4">
                {sizesToGenerate.length} size{sizesToGenerate.length > 1 ? 's' : ''}: {sizesToGenerate.join('x, ')}x
              </div>
              <button
                onClick={() => downloadOrShare(outputUrl, `${file.name.split('.')[0]}.ico`)}
                className="w-full bg-white text-[var(--text-primary)] hover:bg-[var(--bg-overlay)] font-bold px-4 py-3 rounded-xl transition-colors shadow-lg"
              >
                Download ICO
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex items-center justify-center min-h-[300px]">
              <img
                
                loading="lazy"
                src={URL.createObjectURL(file)}
                alt="Original"
                className="max-h-[300px] object-contain rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
