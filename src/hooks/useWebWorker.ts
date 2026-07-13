import { useEffect, useRef, useCallback } from 'react';

type WorkerMessage = { type: 'result'; data: unknown } | { type: 'error'; error: string } | { type: 'progress'; value: number };

export function useWebWorker<TInput = unknown, TOutput = unknown>() {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    return () => { workerRef.current?.terminate(); };
  }, []);

  const run = useCallback((fn: (input: TInput) => TOutput, input: TInput, signal?: AbortSignal): Promise<TOutput> => {
    return new Promise((resolve, reject) => {
      if (signal?.aborted) { reject(new Error('Aborted')); return; }
      workerRef.current?.terminate();
      try {
        const blob = new Blob([`self.onmessage = async function(e) { try { const fn = ${fn.toString()}; const result = await fn(e.data); self.postMessage({ type: 'result', data: result }); } catch(err) { self.postMessage({ type: 'error', error: err.message }); } };`], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        const worker = new Worker(url);
        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
          URL.revokeObjectURL(url);
          if (e.data.type === 'result') { worker.terminate(); resolve(e.data.data as TOutput); }
          else if (e.data.type === 'error') { worker.terminate(); reject(new Error(e.data.error)); }
        };
        worker.onerror = () => { URL.revokeObjectURL(url); worker.terminate(); reject(new Error('Worker error')); };

        if (signal) {
          signal.addEventListener('abort', () => { URL.revokeObjectURL(url); worker.terminate(); reject(new Error('Aborted')); });
        }

        queueMicrotask(() => worker.postMessage(input));
      } catch (err) {
        reject(err instanceof Error ? err : new Error('Worker setup failed'));
      }
    });
  }, []);

  return { run };
}
