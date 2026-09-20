"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useSession } from '@/lib/auth-client';

export interface ProcessFile<T = unknown> {
  file: File;
  index: number;
  result?: T;
  error?: string;
  status: 'pending' | 'processing' | 'done' | 'error';
  progress: number;
}

export interface ParallelProcessorOptions<T> {
  files: File[];
  processFn: (file: File, index: number, signal: AbortSignal) => Promise<T>;
  onProgress?: (done: number, total: number) => void;
}

export function useParallelProcessor() {
  const { data: session } = useSession();
  // Server is the source of truth for Pro (Pass holders, admin grants, etc.
  // don't appear in the raw session plan). Resolve via /api/check-plan and
  // fall back to the session value until it answers. Return shape unchanged.
  const [serverPro, setServerPro] = useState<boolean | null>(null);
  useEffect(() => {
    let live = true;
    fetch('/api/check-plan')
      .then(r => (r.ok ? r.json() : null))
      .then((d: unknown) => {
        if (!live || !d || typeof d !== 'object') return;
        setServerPro((d as { plan?: string }).plan === 'pro');
      })
      .catch(() => {});
    return () => { live = false; };
  }, []);
  const sessionPro = (session?.user as Record<string, unknown>)?.plan === 'pro';
  const isPro = serverPro ?? sessionPro;
  const abortRef = useRef<AbortController | null>(null);
  const processingRef = useRef(false);

  const getMaxConcurrency = useCallback(() => {
    return isPro ? 6 : 1;
  }, [isPro]);

  const process = useCallback(async <T>({
    files,
    processFn,
    onProgress,
  }: ParallelProcessorOptions<T>): Promise<(T | undefined)[]> => {
    if (processingRef.current) return [];
    processingRef.current = true;
    abortRef.current = new AbortController();
    const signal = abortRef.current.signal;
    const concurrency = getMaxConcurrency();
    const results: (T | undefined)[] = new Array(files.length);

    if (concurrency === 1) {
      for (let i = 0; i < files.length; i++) {
        if (signal.aborted) break;
        try {
          results[i] = await processFn(files[i]!, i, signal);
        } catch (e) {
          results[i] = undefined;
        }
        onProgress?.(i + 1, files.length);
      }
    } else {
      const chunks: number[][] = [];
      for (let i = 0; i < files.length; i += concurrency) {
        chunks.push(Array.from({ length: Math.min(concurrency, files.length - i) }, (_, j) => i + j));
      }
      let done = 0;
      for (const chunk of chunks) {
        if (signal.aborted) break;
        const chunkResults = await Promise.allSettled(
          chunk.map(i => processFn(files[i]!, i, signal))
        );
        chunkResults.forEach((r, j) => {
          const idx = chunk[j]!;
          results[idx] = r.status === 'fulfilled' ? r.value : undefined;
          done++;
        });
        onProgress?.(done, files.length);
      }
    }

    processingRef.current = false;
    return results;
  }, [getMaxConcurrency]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  return { process, abort, maxConcurrency: getMaxConcurrency(), isPro };
}
