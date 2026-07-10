import { useState, useRef, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

// Global singleton instance so we don't re-download the 30MB wasm 
// every time the user switches between video tools.
let ffmpegGlobal: FFmpeg | null = null;

const LOAD_TIMEOUT_MS = 60_000;

const CDN_FALLBACKS: { baseURL: string; mt?: boolean }[] = [
  { baseURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd', mt: false },
  { baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd', mt: false },
  { baseURL: 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd', mt: true },
  { baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.6/dist/umd', mt: true },
];

export function useFFmpeg() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (ffmpegGlobal && ffmpegGlobal.loaded) {
      setIsLoaded(true);
      setLoadError(null);
      ffmpegRef.current = ffmpegGlobal;
      setupListeners(ffmpegGlobal);
    }
    
    return () => {
      if (ffmpegRef.current) {
        ffmpegRef.current.off('progress', handleProgress);
        ffmpegRef.current.off('log', handleLog);
      }
    };
  }, []);

  const handleProgress = useCallback((p: { progress: number; time: number }) => {
    setProgress(Math.round(p.progress * 100));
  }, []);

  const handleLog = useCallback(({ message }: { message: string }) => {
    setLogs(prev => [...prev.slice(-10), message]);
  }, []);

  const setupListeners = useCallback((ffmpeg: FFmpeg) => {
    ffmpeg.off('progress', handleProgress);
    ffmpeg.off('log', handleLog);
    ffmpeg.on('progress', handleProgress);
    ffmpeg.on('log', handleLog);
  }, [handleProgress, handleLog]);

  const attemptLoad = async (entry: { baseURL: string; mt?: boolean }): Promise<boolean> => {
    abortRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortRef.current?.abort(), LOAD_TIMEOUT_MS);

    try {
      ffmpegGlobal = new FFmpeg();
      ffmpegRef.current = ffmpegGlobal;
      setupListeners(ffmpegGlobal);

      const [coreURL, wasmURL, classWorkerURL] = await Promise.all([
        toBlobURL(`${entry.baseURL}/ffmpeg-core.js`, 'text/javascript'),
        toBlobURL(`${entry.baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        toBlobURL('https://unpkg.com/@ffmpeg/ffmpeg@0.12.10/dist/umd/814.ffmpeg.js', 'text/javascript'),
      ]);

      await ffmpegGlobal.load({ coreURL, wasmURL, classWorkerURL });
      return true;
    } catch (err) {
      if (entry.mt) console.warn('Multi-threaded fallback also failed:', err);
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const loadFFmpeg = async () => {
    if (ffmpegGlobal?.loaded) {
      setIsLoaded(true);
      setLoadError(null);
      return;
    }

    if (isLoading) return;
    setIsLoading(true);
    setLoadError(null);
    setProgress(0);

    try {
      for (let i = 0; i < CDN_FALLBACKS.length; i++) {
        const loaded = await attemptLoad(CDN_FALLBACKS[i]);
        if (loaded) {
          setIsLoaded(true);
          return;
        }
      }
      throw new Error('All FFmpeg CDN sources failed to load');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load FFmpeg WASM';
      console.error("FFmpeg load failed:", e);
      setLoadError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    ffmpeg: ffmpegRef.current,
    isLoaded,
    isLoading,
    loadError,
    progress,
    logs,
    loadFFmpeg,
  };
}
