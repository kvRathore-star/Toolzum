import { useState, useRef, useEffect, useCallback } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';

// Global singleton instance so we don't re-download the 30MB wasm 
// every time the user switches between video tools.
let ffmpegGlobal: FFmpeg | null = null;
let hasLoadedOnce = false;

const LOAD_TIMEOUT_MS = 60_000;

const CDN_FALLBACKS: { baseURL: string; mt?: boolean }[] = [
  { baseURL: 'https://unpkg.com/@ffmpeg/core@0.12.9/dist/umd', mt: false },
  { baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/umd', mt: false },
  { baseURL: 'https://unpkg.com/@ffmpeg/core-mt@0.12.9/dist/umd', mt: true },
  { baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.9/dist/umd', mt: true },
];

export function useFFmpeg() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(false);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (ffmpegGlobal && ffmpegGlobal.loaded) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reflect already-loaded shared ffmpeg instance into local state
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

      const [coreURL, wasmURL] = await Promise.all([
        toBlobURL(`${entry.baseURL}/ffmpeg-core.js`, 'text/javascript'),
        toBlobURL(`${entry.baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      ]);

      // Do NOT pass classWorkerURL — a blob-URL module worker can't resolve
      // worker.js's relative imports, so load() never resolves. Let @ffmpeg/ffmpeg
      // use its bundled worker instead (same path as the known-good VocalRemover).
      await ffmpegGlobal.load({ coreURL, wasmURL });
      return true;
    } catch (err) {
      if (entry.mt && process.env.NODE_ENV !== 'production') console.warn('Multi-threaded fallback also failed:', err);
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const loadFFmpeg = async (): Promise<FFmpeg | null> => {
    if (ffmpegGlobal?.loaded) {
      setIsLoaded(true);
      setLoadError(null);
      return ffmpegGlobal;
    }

    if (isLoading) return null;
    if (!hasLoadedOnce) setIsFirstLoad(true);
    setIsLoading(true);
    setLoadError(null);
    setProgress(0);

    try {
      for (let i = 0; i < CDN_FALLBACKS.length; i++) {
        const loaded = await attemptLoad(CDN_FALLBACKS[i]);
        if (loaded) {
          setIsLoaded(true);
          hasLoadedOnce = true;
          setIsFirstLoad(false);
          return ffmpegGlobal;
        }
      }
      throw new Error('All FFmpeg CDN sources failed to load');
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to load FFmpeg WASM';
      console.error("FFmpeg load failed:", e);
      setLoadError(msg);
      return null;
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
    isFirstLoad,
    loadFFmpeg,
  };
}
