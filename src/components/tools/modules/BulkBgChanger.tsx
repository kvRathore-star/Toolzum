"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, Download, ImagePlus, Layers, RefreshCw, Trash2, Palette, Check, Archive } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface ImageItem {
  id: string;
  name: string;
  originalUrl: string;
  processedUrl: string | null;
}

export default function BulkBgChanger() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [bgColor, setBgColor] = useState('#10b981');
  const [useTransparent, setUseTransparent] = useState(false);
  const [tolerance, setTolerance] = useState(30);
  const [sampleColor, setSampleColor] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const sampleCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const newImages: ImageItem[] = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      name: file.name,
      originalUrl: URL.createObjectURL(file),
      processedUrl: null,
    }));
    setImages(prev => [...prev, ...newImages]);
    if (!selectedImageId && newImages.length > 0) setSelectedImageId(newImages[0].id);
    toast.success(`Added ${files.length} image(s)`);
  };

  const pickColorFromImage = (imageId: string, canvas: HTMLCanvasElement, x: number, y: number) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const pixel = ctx.getImageData(x, y, 1, 1).data;
    const hex = '#' + [pixel[0], pixel[1], pixel[2]].map(v => v.toString(16).padStart(2, '0')).join('');
    setSampleColor(hex);
    toast.success(`Sampled color: ${hex}`);
  };

  const processImage = useCallback((item: ImageItem): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(item.originalUrl); return; }

        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        if (sampleColor) {
          const sr = parseInt(sampleColor.slice(1, 3), 16);
          const sg = parseInt(sampleColor.slice(3, 5), 16);
          const sb = parseInt(sampleColor.slice(5, 7), 16);

          for (let i = 0; i < data.length; i += 4) {
            const dr = Math.abs(data[i] - sr);
            const dg = Math.abs(data[i + 1] - sg);
            const db = Math.abs(data[i + 2] - sb);
            const dist = Math.sqrt(dr * dr + dg * dg + db * db);
            const threshold = tolerance * 2.55;

            if (dist < threshold) {
              if (useTransparent) {
                const alpha = Math.max(0, 1 - (threshold - dist) / threshold);
                data[i + 3] = Math.round((1 - alpha) * 255);
              } else {
                const blend = dist / threshold;
                const br = parseInt(bgColor.slice(1, 3), 16);
                const bg = parseInt(bgColor.slice(3, 5), 16);
                const bb = parseInt(bgColor.slice(5, 7), 16);
                data[i] = data[i] * blend + br * (1 - blend);
                data[i + 1] = data[i + 1] * blend + bg * (1 - blend);
                data[i + 2] = data[i + 2] * blend + bb * (1 - blend);
              }
            }
          }
        } else {
          // Auto-detect: remove white or near-white backgrounds
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            const threshold = 255 - tolerance * 1.5;
            if (avg > threshold) {
              if (useTransparent) {
                data[i + 3] = 0;
              } else {
                const br = parseInt(bgColor.slice(1, 3), 16);
                const bg = parseInt(bgColor.slice(3, 5), 16);
                const bb = parseInt(bgColor.slice(5, 7), 16);
                data[i] = br;
                data[i + 1] = bg;
                data[i + 2] = bb;
              }
            }
          }
        }

        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = item.originalUrl;
    });
  }, [sampleColor, tolerance, bgColor, useTransparent]);

  const processAll = async () => {
    if (images.length === 0) return toast.error('No images to process');
    if (!sampleColor) return toast.error('Click on the image to sample a background color first');
    setIsProcessing(true);
    let count = 0;
    for (const item of images) {
      const result = await processImage(item);
      setImages(prev => prev.map(p => p.id === item.id ? { ...p, processedUrl: result } : p));
      count++;
    }
    setIsProcessing(false);
    toast.success(`Processed ${count} images!`);
  };

  const downloadImage = (url: string, name: string) => {
    downloadOrShare(url, `bg_removed_${name}`);
  };

  const downloadAll = () => {
    images.filter(i => i.processedUrl).forEach(i => {
      if (i.processedUrl) downloadOrShare(i.processedUrl, `bg_removed_${i.name}`);
    });
    toast.success('Downloading all...');
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(i => i.id !== id));
    if (selectedImageId === id) setSelectedImageId(images.find(i => i.id !== id)?.id || null);
  };

  const selectedImage = images.find(i => i.id === selectedImageId);

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-500" />
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Bulk BG Changer</h3>
        </div>
        <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-full">{images.length} images</span>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 text-center hover:border-emerald-500/50 transition-colors cursor-pointer bg-zinc-50/50 dark:bg-black/20"
          onClick={() => fileInputRef.current?.click()}>
          <ImagePlus className="w-8 h-8 mx-auto mb-2 text-zinc-400" />
          <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">Upload product photos</p>
          <p className="text-[10px] text-zinc-500 mt-1">Select a color to remove, replace with your brand background</p>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="space-y-3 lg:col-span-1">
              <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <h5 className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5"><Palette className="w-3 h-3" /> Background Settings</h5>
                
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 flex justify-between"><span>New BG Color</span></label>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                    className="w-full h-10 rounded-xl border border-zinc-200 dark:border-zinc-800 cursor-pointer" />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-500 flex justify-between"><span>Color Tolerance</span><span className="font-mono">{tolerance}%</span></label>
                  <input type="range" min="1" max="100" value={tolerance} onChange={e => setTolerance(Number(e.target.value))}
                    className="w-full accent-emerald-500" />
                </div>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-[10px] text-zinc-500">Transparent BG (PNG)</span>
                  <input type="checkbox" checked={useTransparent} onChange={e => setUseTransparent(e.target.checked)}
                    className="rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500" />
                </label>

                {sampleColor && (
                  <div className="flex items-center gap-2 p-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <span className="w-5 h-5 rounded border border-zinc-300" style={{ backgroundColor: sampleColor }} />
                    <span className="text-[10px] text-zinc-500 font-mono">{sampleColor}</span>
                    <button onClick={() => setSampleColor(null)}
                      className="ml-auto text-[9px] text-zinc-500 hover:text-red-500">Reset</button>
                  </div>
                )}

                <button onClick={processAll} disabled={isProcessing}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
                  {isProcessing ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...</> : <><Layers className="w-3.5 h-3.5" /> Process All ({images.length})</>}
                </button>
              </div>

              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {images.map(item => (
                  <div key={item.id} onClick={() => setSelectedImageId(item.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                      selectedImageId === item.id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500'
                    }`}>
                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                      <img src={item.processedUrl || item.originalUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-zinc-700 dark:text-zinc-300 truncate">{item.name}</p>
                      <p className="text-[8px] text-zinc-500">{item.processedUrl ? 'Done' : 'Pending'}</p>
                    </div>
                    <div className="flex gap-1">
                      {item.processedUrl && (
                        <button onClick={e => { e.stopPropagation(); downloadImage(item.processedUrl!, item.name); }}
                          className="p-1 bg-zinc-200 dark:bg-zinc-700 rounded hover:bg-zinc-300 dark:hover:bg-zinc-600"><Download className="w-3 h-3 text-zinc-500" /></button>
                      )}
                      <button onClick={e => { e.stopPropagation(); removeImage(item.id); }}
                        className="p-1 bg-red-100 dark:bg-red-900/20 rounded hover:bg-red-200 dark:hover:bg-red-900/30"><Trash2 className="w-3 h-3 text-red-500" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {images.some(i => i.processedUrl) && (
                <button onClick={downloadAll}
                  className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download All
                </button>
              )}
            </div>

            <div className="lg:col-span-2">
              {selectedImage && (
                <div className="bg-zinc-50 dark:bg-black/30 rounded-xl p-2 border border-zinc-200 dark:border-zinc-800">
                  <div className="relative overflow-auto max-h-[500px] flex items-center justify-center">
                    <canvas ref={sampleCanvasRef}
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = (e.clientX - rect.left) * (e.currentTarget.width / rect.width);
                        const y = (e.clientY - rect.top) * (e.currentTarget.height / rect.height);
                        pickColorFromImage(selectedImage.id, e.currentTarget, Math.round(x), Math.round(y));
                      }}
                      className="max-w-full max-h-[500px] rounded-lg cursor-crosshair"
                      style={{ width: '100%', height: 'auto' }} />
                    <img src={selectedImage.processedUrl || selectedImage.originalUrl} alt=""
                      onLoad={(e) => {
                        const canvas = sampleCanvasRef.current;
                        if (!canvas) return;
                        const img = e.currentTarget;
                        canvas.width = img.naturalWidth;
                        canvas.height = img.naturalHeight;
                        const ctx = canvas.getContext('2d');
                        if (!ctx) return;
                        ctx.drawImage(img, 0, 0);
                      }}
                      className="hidden" />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[9px] px-2 py-1 rounded-full">
                      {selectedImage.processedUrl ? 'PROCESSED' : 'Click to sample color'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-xl p-3">
          <p className="text-[10px] text-amber-600 dark:text-amber-400">
            <strong>Tip:</strong> Works best with solid-color backgrounds (white/green/blue). Click on the background color to sample it, then adjust tolerance.
            <span className="block mt-1"><strong>Pro:</strong> AI-powered smart background removal (no color sampling needed), batch 100+ images, auto-crop to product, shadows, 4K export.</span>
          </p>
        </div>
      </div>
    </div>
  );
}
