"use client";

import React, { useState } from 'react';
import { Activity, Download, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function SpeedTest() {
  const [isRunning, setIsRunning] = useState(false);
  const [speedMbps, setSpeedMbps] = useState<number | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [latencyEstimated, setLatencyEstimated] = useState(false);

  const startTest = async () => {
    setIsRunning(true);
    setSpeedMbps(null);
    setLatencyMs(null);
    setProgress(10);

    // Step 1: Simulate / Measure real connection latency (10s ceiling —
    // a stalled probe must fall back to estimated, not hang "Testing…").
    const startLatency = Date.now();
    try {
      await fetch('https://httpbin.org/delay/0', { mode: 'cors', signal: AbortSignal.timeout(10000) });
      setLatencyMs(Date.now() - startLatency);
      setLatencyEstimated(false);
    } catch (e) {
      setLatencyMs(45); setLatencyEstimated(true); // Estimated fallback when direct ping is blocked
    }
    setProgress(40);

    // Step 2: Download chunk speed test using 1MB image buffer
    const testUrl = 'https://picsum.photos/1000/1000'; // Random CDN image (approx. 1.2MB payload)
    const startTime = Date.now();
    
    try {
      // 30s overall: aborting cancels the reader stream too, so a stall
      // mid-download fails honestly instead of freezing at partial %.
      const response = await fetch(testUrl, { cache: 'no-store', mode: 'cors', signal: AbortSignal.timeout(30000) });
      const reader = response.body?.getReader();
      if (!reader) throw new Error();

      let receivedLength = 0;
      while(true) {
        const { done, value } = await reader.read();
        if (done) break;
        receivedLength += value.length;
        setProgress(Math.round(40 + (receivedLength / 1200000) * 50));
      }

      const endTime = Date.now();
      const durationSecs = (endTime - startTime) / 1000;
      const sizeBits = receivedLength * 8;
      const speed = (sizeBits / durationSecs) / (1024 * 1024); // Mbps
      
      setSpeedMbps(Math.min(950, parseFloat(speed.toFixed(1))));
      toast.success('Speed test completed!');
    } catch (err) {
      // CORS or network error: cannot measure speed from this environment
      setSpeedMbps(null);
      setLatencyMs(null);
      toast.error('Speed test failed — CORS or network error. Try again or use a different network.');
    } finally {
      setProgress(100);
      setIsRunning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-3">
        <Zap className="w-5 h-5 text-[var(--accent)]" />
        <h3 className="text-lg font-bold text-[var(--text-primary)]">Network Bandwidth Speed Test</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col justify-center items-center bg-[var(--bg-overlay)] rounded-2xl p-8 border border-[var(--border-subtle)] min-h-[220px]">
          {speedMbps !== null ? (
            <div className="text-center space-y-2 animate-in zoom-in-95">
              <span className="text-xs text-[var(--text-secondary)] font-bold uppercase block">Download Speed</span>
              <div className="text-6xl font-black text-[var(--accent)]">{speedMbps}</div>
              <span className="text-sm font-bold text-[var(--text-muted)]">Mbps</span>
            </div>
          ) : (
            <div className="text-center text-[var(--text-secondary)]">
              <Activity className={`w-12 h-12 mx-auto mb-3 opacity-30 ${isRunning ? 'animate-spin text-[var(--accent)] opacity-100' : ''}`} />
              <p className="text-xs font-bold">{isRunning ? `Testing Network (${progress}%)...` : 'Press Start to run speed check'}</p>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-xs text-[var(--text-muted)] font-bold uppercase block border-b border-[var(--border-subtle)] pb-2">Network Diagnostics</span>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[var(--bg-overlay)] p-3 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Latency (Ping)</span>
                <p className="text-lg font-mono font-bold text-[var(--text-secondary)] dark:text-[var(--text-primary)]">
                  {latencyMs !== null ? `${latencyMs} ms${latencyEstimated ? ' (est.)' : ''}` : '--'}
                </p>
              </div>
              <div className="bg-[var(--bg-overlay)] p-3 rounded-xl border border-[var(--border-subtle)]">
                <span className="text-[10px] text-[var(--text-secondary)] block uppercase">Server Node</span>
                <p className="text-xs font-bold text-[var(--text-secondary)] dark:text-[var(--text-primary)]">Fastest CDN (Auto)</p>
              </div>
            </div>
          </div>

          <button onClick={startTest} disabled={isRunning} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50">
            <RefreshCw className="w-4 h-4" /> Start Speed Diagnosis
          </button>
        </div>
      </div>
    </div>
  );
}