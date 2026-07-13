"use client";

import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2, Archive, RefreshCw } from 'lucide-react';
import heic2any from 'heic2any';
import JSZip from 'jszip';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

interface HeicFileItem {
  id: string;
  file: File;
  status: 'pending' | 'converting' | 'success' | 'failed';
  progress: number;
  outputUrl?: string;
  outputName?: string;
}

type HeicBatchConfig = {
  toType: 'image/jpeg' | 'image/png';
  outputExt: string;
  title: string;
  description: string;
  zipName: string;
  downloadLabel: string;
};

type HeicBatchProps = {
  config: HeicBatchConfig;
};

export default function HeicBatchConverter({ config }: HeicBatchProps) {
  const [queue, setQueue] = useState<HeicFileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newItems = files.map((file) => ({
      id: Math.random().toString(36).substring(7),
      file,
      status: 'pending' as const,
      progress: 0,
    }));

    setQueue((prev) => [...prev, ...newItems]);
    e.target.value = '';
    toast.success(`Added ${files.length} files to queue.`);
  };

  const convertSingle = async (item: HeicFileItem): Promise<HeicFileItem> => {
    setQueue((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, status: 'converting' } : i))
    );

    try {
      const blobResult = await heic2any({
        blob: item.file,
        toType: config.toType,
        quality: 0.85,
      });

      const finalBlob = Array.isArray(blobResult) ? blobResult[0] : blobResult;
      const url = URL.createObjectURL(finalBlob);
      const outputName = item.file.name.replace(/\.(heic|heif)$/i, config.outputExt);

      return { ...item, status: 'success', outputUrl: url, outputName };
    } catch (err) {
      console.error(err);
      return { ...item, status: 'failed' };
    }
  };

  const handleConvertAll = async () => {
    const pendingItems = queue.filter((i) => i.status === 'pending' || i.status === 'failed');
    if (pendingItems.length === 0) {
      toast.error('No pending files to convert');
      return;
    }

    setIsProcessing(true);
    try {
      let updatedQueue = [...queue];

      for (const item of pendingItems) {
        const result = await convertSingle(item);
        updatedQueue = updatedQueue.map((i) => (i.id === item.id ? result : i));
        setQueue(updatedQueue);
      }

      toast.success('Batch conversion complete!');
    } catch (err: any) {
      toast.error('Conversion failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadAll = async () => {
    const successItems = queue.filter((i) => i.status === 'success' && i.outputUrl);
    if (successItems.length === 0) return;

    if (successItems.length === 1) {
      const item = successItems[0];
      downloadOrShare(item.outputUrl!, item.outputName!);
      return;
    }

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      for (const item of successItems) {
        const response = await fetch(item.outputUrl!);
        const blob = await response.blob();
        zip.file(item.outputName!, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      downloadOrShare(zipUrl, config.zipName);
      toast.success('ZIP archive generated and downloaded!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create ZIP archive.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = (id: string) => {
    setQueue((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.outputUrl) URL.revokeObjectURL(item.outputUrl);
      return prev.filter((i) => i.id !== id);
    });
  };

  const handleClear = () => {
    queue.forEach((item) => {
      if (item.outputUrl) URL.revokeObjectURL(item.outputUrl);
    });
    setQueue([]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-6 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-500" />
          {config.title}
        </h2>
        <p className="text-sm text-[var(--text-secondary)] dark:text-zinc-400 mt-1">
          {config.description}
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-6">
        <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center bg-zinc-50 dark:bg-black/10 text-center relative hover:border-indigo-500/50 transition-colors">
          <Upload className="w-10 h-10 text-zinc-400 mb-2" />
          <span className="text-xs text-zinc-500 font-bold block mb-1">Upload HEIC / HEIF images</span>
          <span className="text-[10px] text-zinc-500 block">Drag-and-drop files or click to browse</span>
          <label className="bg-[var(--accent)] hover:bg-indigo-600 px-5 py-2.5 rounded-xl text-xs text-white font-bold cursor-pointer transition-colors shadow mt-4 block">
            Select HEIC Files
            <input type="file" multiple accept=".heic,.heif" className="hidden" onChange={handleFileChange} />
          </label>
        </div>

        {queue.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Files Queue ({queue.length})
              </span>
              <button onClick={handleClear} className="text-xs text-rose-400 hover:text-rose-300 font-bold cursor-pointer">
                Clear Queue
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {queue.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-white/5 text-xs text-zinc-800 dark:text-[var(--text-secondary)] gap-4">
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div className="overflow-hidden">
                      <span className="font-bold truncate block">{item.file.name}</span>
                      <span className="text-[10px] text-zinc-500 font-medium">
                        Original size: {(item.file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {item.status === 'pending' && <span className="text-zinc-500 font-bold uppercase text-[9px] tracking-wide">Pending</span>}
                    {item.status === 'converting' && <span className="text-indigo-400 font-bold uppercase text-[9px] tracking-wide flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Converting</span>}
                    {item.status === 'success' && <span className="text-emerald-400 font-bold uppercase text-[9px] tracking-wide flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 fill-emerald-500/10" /> Success</span>}
                    {item.status === 'failed' && <span className="text-rose-400 font-bold uppercase text-[9px] tracking-wide flex items-center gap-1"><XCircle className="w-3.5 h-3.5" /> Failed</span>}
                    <button onClick={() => handleRemove(item.id)} className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"><XCircle className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-4 print:hidden">
              <button onClick={handleConvertAll} disabled={isProcessing || queue.every((i) => i.status === 'success')}
                className="flex-1 bg-[var(--accent)] hover:bg-indigo-600 disabled:bg-[var(--accent)] text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow">
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                Convert Pending
              </button>
              {queue.some((i) => i.status === 'success') && (
                <button onClick={handleDownloadAll} disabled={isProcessing}
                  className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow">
                  <Archive className="w-4 h-4" />
                  {queue.filter((i) => i.status === 'success').length > 1 ? 'Download ZIP' : config.downloadLabel}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
