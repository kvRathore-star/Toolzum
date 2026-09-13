import { useState, useRef, useEffect, useCallback } from 'react';
import { isLowEndDevice } from '@/lib/device';

type FFmpegInstance = InstanceType<typeof import('@ffmpeg/ffmpeg').FFmpeg>;

// Global singleton instance so we don't re-download the 30MB wasm 
// every time the user switches between video tools.
let ffmpegGlobal: FFmpegInstance | null = null;
let ffmpegModulePromise: Promise<typeof import('@ffmpeg/ffmpeg')> | null = null;
let hasLoadedOnce = false;

async function getFFmpegModule() {
  if (!ffmpegModulePromise) {
    ffmpegModulePromise = import('@ffmpeg/ffmpeg');
  }
  return ffmpegModulePromise;
}

const LOAD_TIMEOUT_MS = 90_000;
const DB_NAME = 'ffmpeg-cache';
const DB_STORE = 'wasm';
const DB_KEY_JS = 'ffmpeg-core.js';
const DB_KEY_WASM = 'ffmpeg-core.wasm';

// Only try MT fallbacks if SharedArrayBuffer is available
// (requires COOP/COEP headers). Without it, MT cores silently fail.
const supportsMT = typeof globalThis.crossOriginIsolated !== 'undefined' && globalThis.crossOriginIsolated;

const CDN_FALLBACKS: { baseURL: string; mt?: boolean }[] = [
  { baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.9/dist/umd', mt: false },
  { baseURL: 'https://unpkg.com/@ffmpeg/core@0.12.9/dist/umd', mt: false },
  ...(supportsMT ? [
    { baseURL: 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.9/dist/umd', mt: true },
    { baseURL: 'https://unpkg.com/@ffmpeg/core-mt@0.12.9/dist/umd', mt: true },
  ] : []),
  { baseURL: 'https://cdnjs.cloudflare.com/ajax/libs/ffmpeg-core@0.12.9/dist/umd', mt: false },
];

/**
 * Adaptive strategy (B1.4): on low-end devices skip the multi-threaded core
 * entries — the extra ~30MB download plus thread overhead thrashes
 * ≤4-core/low-RAM devices. Single-threaded WASM still runs, just slower.
 * Never blocks: ST entries always remain.
 */
export function selectFfmpegFallbacks(lowEnd: boolean): { baseURL: string; mt?: boolean }[] {
  return lowEnd ? CDN_FALLBACKS.filter((e) => !e.mt) : CDN_FALLBACKS;
}

// --- IndexedDB helpers for caching wasm binaries ---
function openCacheDB(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => { req.result.createObjectStore(DB_STORE); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch { resolve(null); }
  });
}

async function getCached(key: string): Promise<string | null> {
  try {
    const db = await openCacheDB();
    if (!db) return null;
    return new Promise((resolve) => {
      const tx = db.transaction(DB_STORE, 'readonly');
      const req = tx.objectStore(DB_STORE).get(key);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

async function setCached(key: string, value: string): Promise<void> {
  try {
    const db = await openCacheDB();
    if (!db) return;
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(value, key);
  } catch { /* ignore */ }
}

async function fetchWithCache(url: string, type: 'text/javascript' | 'application/wasm', cacheKey: string): Promise<string> {
  // Try IndexedDB cache first
  const cached = await getCached(cacheKey);
  if (cached) return cached;

  // Fetch from CDN and cache
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Failed to fetch ${url}: ${resp.status}`);

  if (type === 'text/javascript') {
    const text = await resp.text();
    await setCached(cacheKey, text);
    return text;
  } else {
    // For wasm, convert to base64 for storage (IndexedDB can store ArrayBuffers directly but string is simpler)
    const buf = await resp.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]!);
    const b64 = btoa(binary);
    await setCached(cacheKey, b64);
    return b64;
  }
}

function b64ToBlobUrl(b64: string, mime: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: mime }));
}

export function useFFmpeg() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(false);
  const ffmpegRef = useRef<FFmpegInstance | null>(null);
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

  const setupListeners = useCallback((ffmpeg: FFmpegInstance) => {
    ffmpeg.off('progress', handleProgress);
    ffmpeg.off('log', handleLog);
    ffmpeg.on('progress', handleProgress);
    ffmpeg.on('log', handleLog);
  }, [handleProgress, handleLog]);

  const attemptLoad = async (entry: { baseURL: string; mt?: boolean }): Promise<boolean> => {
    abortRef.current = new AbortController();
    const timeoutId = setTimeout(() => abortRef.current?.abort(), LOAD_TIMEOUT_MS);

    try {
      const [{ FFmpeg }] = await Promise.all([
        getFFmpegModule(),
      ]);

      ffmpegGlobal = new FFmpeg();
      ffmpegRef.current = ffmpegGlobal;
      setupListeners(ffmpegGlobal);

      // Use IndexedDB cache to avoid re-downloading 30MB every page load
      const jsUrl = `${entry.baseURL}/ffmpeg-core.js`;
      const wasmUrl = `${entry.baseURL}/ffmpeg-core.wasm`;
      const cacheKeySuffix = entry.mt ? '-mt' : '';

      const [jsText, wasmB64] = await Promise.all([
        fetchWithCache(jsUrl, 'text/javascript', `${DB_KEY_JS}${cacheKeySuffix}`),
        fetchWithCache(wasmUrl, 'application/wasm', `${DB_KEY_WASM}${cacheKeySuffix}`),
      ]);

      // Convert cached data to blob URLs
      const coreURL = typeof jsText === 'string' && jsText.startsWith('data:')
        ? jsText
        : `data:text/javascript;base64,${btoa(jsText)}`;
      const wasmURL = b64ToBlobUrl(wasmB64, 'application/wasm');

      // Do NOT pass classWorkerURL — a blob-URL module worker can't resolve
      // worker.js's relative imports, so load() never resolves.
      await ffmpegGlobal.load({ coreURL, wasmURL });
      return true;
    } catch (err) {
      const errName = err instanceof Error ? err.name : '';
      const errMsg = err instanceof Error ? err.message : String(err);
      // Distinguish CSP blocks from network failures
      if (errName === 'TypeError' && errMsg.includes('Failed to fetch')) {
        console.warn(`CDN fetch failed (possible CSP block): ${entry.baseURL}`);
      } else if (entry.mt) {
        console.warn('Multi-threaded fallback failed (SharedArrayBuffer may not be available):', err);
      }
      return false;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const loadFFmpeg = async (): Promise<FFmpegInstance | null> => {
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
      // Adaptive: low-end devices try single-threaded cores only.
      const fallbacks = selectFfmpegFallbacks(isLowEndDevice());
      for (let i = 0; i < fallbacks.length; i++) {
        const loaded = await attemptLoad(fallbacks[i]!);
        if (loaded) {
          setIsLoaded(true);
          hasLoadedOnce = true;
          setIsFirstLoad(false);
          return ffmpegGlobal;
        }
      }
      const mtNote = supportsMT ? '' : ' Your browser does not support SharedArrayBuffer (required for multi-threaded mode).';
      throw new Error(`All CDN sources failed to load.${mtNote} This is usually caused by browser extensions (ad blockers, MetaMask, etc.) blocking the engine download. Try disabling extensions for this site, or open this page in an incognito/private window.`);
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
    // Lets tool UIs warn before the ~30MB first download on constrained
    // devices. Never gates loading — see isLowEndDevice docs.
    isLowEndDevice: isLowEndDevice(),
  };
}
