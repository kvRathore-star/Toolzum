"use client";

import { useState, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';

export type FileStatus = 'queued' | 'processing' | 'done' | 'error';

export interface BatchFile {
  file: File;
  id: string;
  status: FileStatus;
  progress: number;
  error?: string;
  result?: Blob;
}

export function useBatchProgress() {
  const [files, setFiles] = useState<BatchFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const abortedRef = useRef(false);

  const addFiles = useCallback((newFiles: File[]) => {
    setFiles(prev => [
      ...prev,
      ...newFiles.map(f => ({
        file: f,
        id: `${f.name}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        status: 'queued' as FileStatus,
        progress: 0,
      })),
    ]);
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  }, []);

  const clearFiles = useCallback(() => setFiles([]), []);

  const updateFile = useCallback((id: string, upd: Partial<BatchFile>) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, ...upd } : f));
  }, []);

  const processBatch = useCallback(async (
    processor: (file: File, onProgress: (pct: number) => void) => Promise<Blob | null>,
    options?: { onComplete?: () => void }
  ) => {
    abortedRef.current = false;
    setIsProcessing(true);

    for (const bf of files) {
      if (abortedRef.current) break;
      if (bf.status === 'done') continue;

      updateFile(bf.id, { status: 'processing', progress: 0 });

      try {
        const result = await processor(bf.file, (pct) => {
          updateFile(bf.id, { progress: pct });
        });
        if (result) {
          updateFile(bf.id, { status: 'done', progress: 100, result });
        }
      } catch (err) {
        updateFile(bf.id, {
          status: 'error',
          error: err instanceof Error ? err.message : 'Processing failed',
        });
        toast.error(`Failed: ${bf.file.name}`);
      }
    }

    setIsProcessing(false);
    options?.onComplete?.();
  }, [files, updateFile]);

  const abort = useCallback(() => {
    abortedRef.current = true;
    setIsProcessing(false);
  }, []);

  const progress = {
    total: files.length,
    completed: files.filter(f => f.status === 'done').length,
    failed: files.filter(f => f.status === 'error').length,
    processing: files.filter(f => f.status === 'processing').length,
    percent: files.length > 0
      ? Math.round((files.filter(f => f.status === 'done' || f.status === 'error').length / files.length) * 100)
      : 0,
  };

  return { files, addFiles, removeFile, clearFiles, updateFile, processBatch, abort, isProcessing, progress };
}
