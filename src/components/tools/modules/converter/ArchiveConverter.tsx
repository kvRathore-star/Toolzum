"use client";

import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import JSZip from 'jszip';
import { gateBatchDownload, maxBlobMB } from '@/utils/freeUsageGuard';
import { FileArchive, Download, Upload, Trash2, File } from 'lucide-react';

interface ZipFile {
  file: File;
  id: string;
}

export default function ArchiveConverter() {
  const [files, setFiles] = useState<ZipFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | File[]) => {
    const toAdd: ZipFile[] = Array.from(newFiles).map(f => ({
      file: f,
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    }));
    setFiles(prev => [...prev, ...toAdd]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const createZip = async () => {
    if (files.length === 0) return toast.error('Add at least one file');
    // Per-batch quota: one gate call (1 unit) before generating anything.
    // Abort silently on block — the limit modal explains.
    if (!(await gateBatchDownload(files.length, maxBlobMB(files.map((f) => f.file))))) return;
    setIsProcessing(true);
    toast.loading('Creating ZIP archive...', { id: 'zip' });

    try {
      const zip = new JSZip();
      const usedNames = new Set<string>();

      for (const { file } of files) {
        let name = file.name;
        if (usedNames.has(name)) {
          const dot = name.lastIndexOf('.');
          const base = dot >= 0 ? name.slice(0, dot) : name;
          const ext = dot >= 0 ? name.slice(dot) : '';
          let i = 1;
          while (usedNames.has(`${base} (${i})${ext}`)) i++;
          name = `${base} (${i})${ext}`;
        }
        usedNames.add(name);
        zip.file(name, file);
      }

      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 },
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `archive.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('ZIP created and downloaded!', { id: 'zip' });
    } catch (err) {
      console.error(err);
      toast.error('Failed to create ZIP', { id: 'zip' });
    } finally {
      setIsProcessing(false);
    }
  };

  const totalSize = files.reduce((acc, f) => acc + f.file.size, 0);

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-500 space-y-5">
      <div className="flex items-center gap-2">
        <FileArchive className="w-5 h-5 text-emerald-500" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">ZIP File Creator</h3>
      </div>
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl shadow-xl overflow-hidden p-5 space-y-5">
        <p className="text-xs text-[var(--text-secondary)]">Drag & drop files or select them to create a ZIP archive. All processing is done locally in your browser.</p>

        <div onDrop={handleDrop} onDragOver={handleDragOver} role="button" tabIndex={0} aria-label="Upload files to archive" onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click(); } }}
          className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-10 hover:bg-[var(--bg-overlay)] dark:hover:bg-zinc-800 transition-colors cursor-pointer text-center"
        >
          <input ref={inputRef} type="file" multiple onChange={e => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }} className="hidden" />
          <Upload className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
          <p className="text-xs text-[var(--text-secondary)]">Drop files here or click to browse</p>
        </div>

        {files.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{files.length} file{files.length !== 1 ? 's' : ''} ({(totalSize / 1024 / 1024).toFixed(2)} MB)</p>
              <button onClick={() => setFiles([])} className="text-[10px] text-red-500 hover:underline">Clear all</button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {files.map(({ id, file }) => (
                <div key={id} className="flex items-center justify-between p-2.5 bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] group">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <File className="w-4 h-4 text-[var(--text-muted)] shrink-0" />
                    <span className="text-xs text-[var(--text-primary)] truncate">{file.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)] shrink-0">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button onClick={() => removeFile(id)} className="text-[var(--text-muted)] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button onClick={createZip} disabled={isProcessing}
              className="w-full bg-emerald-700 hover:bg-emerald-700 disabled:bg-zinc-300 dark:disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]">
              <Download className="w-4 h-4" />
              {isProcessing ? 'Creating ZIP...' : `Create & Download ZIP (${files.length} files)`}
            </button>
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3">
          <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Pro:</strong> Password-protected ZIPs, split large archives into multi-volume ZIPs, cloud storage integration (Google Drive / Dropbox), batch folder creation.</p>
        </div>
      </div>
    </div>
  );
}
