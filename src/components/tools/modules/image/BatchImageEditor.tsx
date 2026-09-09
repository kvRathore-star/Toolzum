"use client";
import React, { useState, useRef } from 'react';
import { toast } from "react-hot-toast";
import { Layers, Upload, Download, Settings2, Loader2, Crown } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { useUsageCounter } from '@/hooks/useUsageCounter';

const FREE_LIMIT = 3;

export default function BatchImageEditor() {
  const [files, setFiles] = useState<File[]>([]);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [watermark, setWatermark] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { usage, trackUsage } = useUsageCounter('batchEditorUsage');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fList = e.target.files;
    if (fList && fList.length > 0) {
      setFiles(Array.from(fList));
    }
  };

  const processBatch = async () => {
    if (files.length === 0 || !canvasRef.current) return;

    const remaining = FREE_LIMIT - usage;
    const toProcess = Math.min(files.length, remaining);
    if (toProcess === 0) {
      toast.error(`You've used all ${FREE_LIMIT} free images today. Upgrade to Pro for unlimited processing.`);
      return;
    }

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      for (let i = 0; i < toProcess; i++) {
        const file = files[i]!;
        const img = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = reject;
          image.src = URL.createObjectURL(file);
        });

        let targetWidth = img.width;
        let targetHeight = img.height;

        if (img.width > maxWidth) {
          const ratio = maxWidth / img.width;
          targetWidth = maxWidth;
          targetHeight = img.height * ratio;
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;
        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        if (watermark.trim() !== '') {
          ctx.font = `bold ${Math.max(20, targetWidth * 0.05)}px sans-serif`;
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 5;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.fillText(watermark, targetWidth - 20, targetHeight - 20);
        }

        const blob = await new Promise<Blob | null>(resolve => {
          canvas.toBlob(b => resolve(b), file.type || 'image/jpeg', 0.9);
        });
        if (blob) zip.file(`edited_${file.name}`, blob);
      }

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'batch_edited_images.zip');
      trackUsage(usage + toProcess);
      toast.success(`Processed ${toProcess} image(s)!`);
      if (remaining <= files.length) {
        toast(`Upgrade to Pro to process unlimited images.`, { icon: '👑' });
      }
    } catch (e) {
      console.error(e);
      toast.error("Failed to process images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const remaining = FREE_LIMIT - usage;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 rounded-2xl shadow-xl space-y-6">
         <div className="flex items-center justify-between gap-3">
           <div className="flex items-center gap-3">
             <Layers className="w-8 h-8 text-emerald-500" />
             <h2 className="text-2xl font-bold">Batch Image Editor</h2>
           </div>
           <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider"><Crown className="w-3.5 h-3.5" /> Pro</span>
         </div>

         <div className="flex items-center justify-between bg-[var(--bg-overlay)]/50 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
           <p className="text-xs text-[var(--text-secondary)]">Daily free limit:</p>
           <div className="flex items-center gap-2">
             <div className="flex gap-1">
               {Array.from({ length: FREE_LIMIT }, (_, i) => (
                 <div key={i} className={`w-3 h-3 rounded-full ${i < usage ? 'bg-zinc-300 dark:bg-zinc-600' : 'bg-emerald-700'}`} />
               ))}
             </div>
             <span className="text-[10px] font-bold text-[var(--text-secondary)]">{remaining} / {FREE_LIMIT} remaining</span>
           </div>
         </div>
         
         <canvas ref={canvasRef} style={{ display: 'none' }} />

         {files.length === 0 ? (
           <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-12 hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors cursor-pointer relative">
             <input type="file" multiple accept="image/*" onChange={handleUpload} className="absolute inset-0 opacity-0 cursor-pointer" aria-label="Select images" />
             <div className="text-[var(--text-secondary)] flex flex-col items-center">
                <Upload className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-2" />
                Select Multiple Images
             </div>
           </div>
         ) : (
           <div className="grid md:grid-cols-2 gap-8">
             <div className="space-y-4 bg-[var(--bg-overlay)]/50 p-6 rounded-xl border border-[var(--border-subtle)] h-fit">
               <h3 className="font-semibold text-lg border-b border-[var(--border-subtle)] pb-2">Queue Summary</h3>
               <div className="text-3xl font-bold text-emerald-500">{files.length}</div>
               <div className="text-[var(--text-secondary)] text-sm">Images ready</div>
               <div className="text-[10px] text-[var(--text-muted)]">Processed today: {usage} / {FREE_LIMIT}</div>
               <button onClick={() => setFiles([])} className="text-sm text-red-500 hover:underline mt-2 block">Clear Queue</button>
             </div>
             <div className="space-y-6 bg-[var(--bg-overlay)]/50 p-6 rounded-xl border border-[var(--border-subtle)]">
               <div className="flex items-center gap-2 font-semibold border-b border-[var(--border-subtle)] pb-3"><Settings2 className="w-5 h-5" />Batch Settings</div>
               <div className="space-y-3">
                 <label className="block text-sm font-semibold">Max Width (px)</label>
                 <p className="text-xs text-[var(--text-secondary)] mb-2">Images wider than this will be scaled down.</p>
                 <input aria-label="Max Width (px)" type="number" value={maxWidth} onChange={e => setMaxWidth(Number(e.target.value))} className="w-full p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
               </div>
               <div className="space-y-3">
                 <label className="block text-sm font-semibold">Watermark Text (Optional)</label>
                 <p className="text-xs text-[var(--text-secondary)] mb-2">Added to bottom right corner.</p>
                 <input aria-label="Watermark Text (Optional)" type="text" value={watermark} placeholder="e.g. © 2026 MyBrand" onChange={e => setWatermark(e.target.value)} className="w-full p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
               </div>
               <button onClick={processBatch} disabled={isProcessing || remaining === 0}
                 className="w-full mt-4 bg-emerald-700 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                 {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>) : remaining === 0 ? 'Limit reached — Upgrade to Pro' : (<><Download className="w-5 h-5" /> Process & Download ZIP</>)}
               </button>
             </div>
           </div>
         )}

         <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
           <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Pro:</strong> Unlimited daily processing, batch resize to multiple presets, custom output format per image, cloud storage integration. <span className="font-bold">This is the #1 reason users upgrade.</span></p>
         </div>
      </div>
    </div>
  );
}
