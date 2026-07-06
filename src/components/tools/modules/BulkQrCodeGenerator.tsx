"use client";
import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { Download, Upload, Crown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import Link from 'next/link';

const DAILY_LIMIT = 1;
const PRO_MAX = 100;

export default function BulkQrCodeGenerator() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [text, setText] = useState('https://example.com');
  const [csvData, setCsvData] = useState<{ label: string; value: string }[]>([]);
  const [usage, setUsage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [singleQrUrl, setSingleQrUrl] = useState<string | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('bulkQrUsage');
    if (stored) {
      try { const { date, count } = JSON.parse(stored); setUsage(date === today ? count : 0); }
      catch { setUsage(0); }
    }
  }, []);

  const trackUsage = (count: number) => {
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem('bulkQrUsage', JSON.stringify({ date: today, count }));
    setUsage(count);
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { toast.error('CSV must have a header row + at least 1 data row'); return; }
      const header = lines[0].split(',').map(h => h.trim().toLowerCase());
      const valueIdx = header.findIndex(h => h === 'value' || h === 'url' || h === 'link' || h === 'data');
      const labelIdx = header.findIndex(h => h === 'label' || h === 'name' || h === 'title');
      if (valueIdx === -1) { toast.error('CSV must have a "value" or "url" column'); return; }
      const data = lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.trim());
        return { label: labelIdx >= 0 ? cols[labelIdx] || `QR ${cols[valueIdx].substring(0, 20)}` : `QR ${cols[valueIdx].substring(0, 20)}`, value: cols[valueIdx] };
      });
      if (data.length > PRO_MAX && usage >= DAILY_LIMIT) { toast.error(`Free tier limited to ${DAILY_LIMIT} QR. Upgrade to Pro for up to ${PRO_MAX}.`); return; }
      setCsvData(data);
      toast.success(`Loaded ${data.length} entries from CSV`);
    };
    reader.readAsText(file);
  };

  const generateSingle = async () => {
    if (!text.trim()) { toast.error('Enter text or URL'); return; }
    if (usage >= DAILY_LIMIT) { toast.error(`You've used your free QR today. Upgrade to Pro for unlimited.`); return; }
    setIsProcessing(true);
    try {
      const canvas = document.createElement('canvas');
      await QRCode.toCanvas(canvas, text, { width: 500, margin: 2, errorCorrectionLevel: 'M' });
      const url = canvas.toDataURL('image/png');
      setSingleQrUrl(url);
      trackUsage(usage + 1);
      toast.success('QR generated!');
    } catch { toast.error('Failed to generate QR'); }
    finally { setIsProcessing(false); }
  };

  const generateBulk = async () => {
    if (csvData.length === 0) { toast.error('Upload a CSV first'); return; }
    if (csvData.length > PRO_MAX && usage >= DAILY_LIMIT) { toast.error(`Free tier limited to ${DAILY_LIMIT} QR. Upgrade to Pro for up to ${PRO_MAX}.`); return; }
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      for (const item of csvData) {
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, item.value, { width: 500, margin: 2, errorCorrectionLevel: 'M' });
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b)));
        if (blob) zip.file(`${item.label.replace(/[^a-zA-Z0-9]/g, '_')}.png`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      downloadOrShare(URL.createObjectURL(content), 'bulk_qr_codes.zip');
      toast.success(`Generated ${csvData.length} QR codes!`);
    } catch { toast.error('Failed to generate bulk QR codes'); }
    finally { setIsProcessing(false); }
  };

  const remaining = DAILY_LIMIT - usage;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Bulk QR Code Generator</h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Generate one QR or batch 100 from CSV</p>
            </div>
          </div>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0"><Crown className="w-3.5 h-3.5" /> Pro</span>
        </div>

        <div className="flex items-center justify-between bg-zinc-50 dark:bg-zinc-800/50 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <p className="text-xs text-zinc-500">Free tier: {DAILY_LIMIT} QR/day · Pro: up to {PRO_MAX} per batch</p>
          <span className="text-[10px] font-bold text-zinc-500">{remaining} / {DAILY_LIMIT} remaining</span>
        </div>

        <div className="flex gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl max-w-xs">
          <button onClick={() => setMode('single')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${mode === 'single' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>Single QR</button>
          <button onClick={() => setMode('bulk')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${mode === 'bulk' ? 'bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'}`}>Bulk from CSV</button>
        </div>

        {mode === 'single' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Text or URL</label>
              <input type="text" value={text} onChange={e => setText(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-zinc-50 dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white outline-none focus:border-indigo-500" />
            </div>
            <button onClick={generateSingle} disabled={isProcessing || remaining === 0}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5">
              {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : remaining === 0 ? 'Daily limit reached — Upgrade to Pro' : 'Generate QR Code'}
            </button>
            {singleQrUrl && (
              <div className="flex flex-col items-center gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <img src={singleQrUrl} alt="QR Code" className="w-48 h-48 border border-zinc-200 dark:border-zinc-700 rounded-xl" />
                <button onClick={() => downloadOrShare(singleQrUrl, 'qrcode.png')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl text-xs hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download PNG
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl p-8 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer relative text-center">
              <input type="file" accept=".csv" onChange={handleCsvUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              <FileSpreadsheet className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-zinc-500">Upload CSV (columns: <strong>value</strong>, optional <strong>label</strong>)</p>
              <p className="text-xs text-zinc-400 mt-1">Pro: up to {PRO_MAX} QR codes per batch</p>
            </div>
            {csvData.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{csvData.length} entries loaded</p>
                <div className="max-h-40 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-zinc-200 dark:border-zinc-800 p-3">
                  {csvData.slice(0, 10).map((item, i) => (
                    <div key={i} className="text-xs text-zinc-500 font-mono truncate py-0.5">{item.label}: {item.value}</div>
                  ))}
                  {csvData.length > 10 && <div className="text-xs text-zinc-400 pt-1">...and {csvData.length - 10} more</div>}
                </div>
                <button onClick={generateBulk} disabled={isProcessing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5">
                  {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Download className="w-4 h-4" /> Generate & Download ZIP ({csvData.length} QRs)</>}
                </button>
                {csvData.length > DAILY_LIMIT && usage >= DAILY_LIMIT && (
                  <p className="text-xs text-amber-500 text-center">Free tier limited to {DAILY_LIMIT} QR. Upgrade to Pro for up to {PRO_MAX}.</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800/30 rounded-xl p-3 flex items-center justify-between">
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400"><strong>Pro:</strong> Generate up to {PRO_MAX} QR codes per batch, custom colors per QR, logo overlay on all QRs, high-resolution output (2000×2000), CSV templates included.</p>
          <Link href="/pricing" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 underline shrink-0 ml-4">Upgrade →</Link>
        </div>
      </div>
    </div>
  );
}
