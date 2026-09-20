"use client";
import React, { useState, useRef } from 'react';
import Image from "next/image";
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { Download, Upload, Crown, FileSpreadsheet, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';
import Link from 'next/link';
import { useUsageCounter } from '@/hooks/useUsageCounter';
import { useProStatus } from '@/hooks/useProStatus';

const DAILY_LIMIT = 5;
const PRO_MAX = 100;

export default function BulkQrCodeGenerator() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single');
  const [text, setText] = useState('https://example.com');
  const [csvData, setCsvData] = useState<{ label: string; value: string }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [singleQrUrl, setSingleQrUrl] = useState<string | null>(null);

  const { usage, trackUsage } = useUsageCounter('bulkQrUsage');
  const isProUser = useProStatus();

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split('\n').filter(l => l.trim());
      if (lines.length < 2) { toast.error('CSV must have a header row + at least 1 data row'); return; }
      const header = lines[0]!.split(',').map(h => h.trim().toLowerCase());
      const valueIdx = header.findIndex(h => h === 'value' || h === 'url' || h === 'link' || h === 'data');
      const labelIdx = header.findIndex(h => h === 'label' || h === 'name' || h === 'title');
      if (valueIdx === -1) { toast.error('CSV must have a "value" or "url" column'); return; }
      const data = lines.slice(1).map(line => {
        const cols = line.split(',').map(c => c.trim());
        return { label: labelIdx >= 0 ? cols[labelIdx] || `QR ${cols[valueIdx]!.substring(0, 20)}` : `QR ${cols[valueIdx]!.substring(0, 20)}`, value: cols[valueIdx]! };
      });
      if (!isProUser && data.length > PRO_MAX && usage >= DAILY_LIMIT) { toast.error(`Free tier limited to ${DAILY_LIMIT} QR. Upgrade to Pro for up to ${PRO_MAX}.`); return; }
      setCsvData(data);
      toast.success(`Loaded ${data.length} entries from CSV`);
    };
    reader.readAsText(file);
  };

  const generateSingle = async () => {
    if (!text.trim()) { toast.error('Enter text or URL'); return; }
    if (!isProUser && usage >= DAILY_LIMIT) { toast.error(`You've used your free QR today. Upgrade to Pro for unlimited.`); return; }
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
    // Free tier is 5 QR/day on every path — the old bulk check only gated
    // files over 100 rows, leaving bulk ≤100 effectively unlimited.
    if (!isProUser && usage >= DAILY_LIMIT) { toast.error(`You've used your free QR today. Upgrade to Pro for up to ${PRO_MAX}.`); return; }
    const rows = isProUser ? csvData.slice(0, PRO_MAX) : csvData.slice(0, DAILY_LIMIT);
    if (!isProUser && csvData.length > DAILY_LIMIT) toast.success(`Free tier: generating first ${DAILY_LIMIT} of ${csvData.length} rows — upgrade to Pro for up to ${PRO_MAX}.`);
    setIsProcessing(true);
    try {
      const zip = new JSZip();
      for (const item of rows) {
        const canvas = document.createElement('canvas');
        await QRCode.toCanvas(canvas, item.value, { width: 500, margin: 2, errorCorrectionLevel: 'M' });
        const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(b => resolve(b)));
        if (blob) zip.file(`${item.label.replace(/[^a-zA-Z0-9]/g, '_')}.png`, blob);
      }
      const content = await zip.generateAsync({ type: 'blob' });
      downloadOrShare(URL.createObjectURL(content), 'bulk_qr_codes.zip');
      trackUsage(usage + 1);
      toast.success(`Generated ${rows.length} QR codes!`);
    } catch { toast.error('Failed to generate bulk QR codes'); }
    finally { setIsProcessing(false); }
  };

  const remaining = DAILY_LIMIT - usage;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center">
              <Download className="w-5 h-5 text-[var(--accent)] dark:text-[var(--accent)]" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[var(--text-primary)]">Bulk QR Code Generator</h2>
              <p className="text-sm text-[var(--text-secondary)]">Generate one QR or batch 100 from CSV</p>
            </div>
          </div>
          <span className="flex items-center gap-1 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-[var(--accent)] text-[10px] font-bold rounded-full uppercase tracking-wider shrink-0"><Crown className="w-3.5 h-3.5" /> Pro</span>
        </div>

        <div className="flex items-center justify-between bg-[var(--bg-overlay)]/50 px-4 py-2.5 rounded-xl border border-[var(--border-subtle)]">
          <p className="text-xs text-[var(--text-secondary)]">Free tier: {DAILY_LIMIT} QR/day · Pro: up to {PRO_MAX} per batch</p>
          <span className="text-[10px] font-bold text-[var(--text-secondary)]">{remaining} / {DAILY_LIMIT} remaining</span>
        </div>

        <div className="flex gap-2 p-1 bg-[var(--bg-surface)] rounded-xl max-w-xs">
          <button onClick={() => setMode('single')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${mode === 'single' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Single QR</button>
          <button onClick={() => setMode('bulk')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer ${mode === 'bulk' ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>Bulk from CSV</button>
        </div>

        {mode === 'single' ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="lbl-bulkqrcodegenerator-text-or-url" className="text-sm font-bold text-[var(--text-primary)]">Text or URL</label>
              <input id="lbl-bulkqrcodegenerator-text-or-url" aria-label="Text or URL" type="text" value={text} onChange={e => setText(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--accent)]" />
            </div>
            <button onClick={generateSingle} disabled={isProcessing || remaining === 0}
              className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5">
              {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : remaining === 0 ? 'Daily limit reached — Upgrade to Pro' : 'Generate QR Code'}
            </button>
            {singleQrUrl && (
              <div className="flex flex-col items-center gap-3 pt-4 border-t border-[var(--border-subtle)]">
                <Image unoptimized={true} loading="lazy" src={singleQrUrl} alt="QR Code" className="w-48 h-48 border border-[var(--border-subtle)] rounded-xl" />
                <button onClick={() => downloadOrShare(singleQrUrl, 'qrcode.png')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[var(--accent-ink)] text-white font-semibold rounded-xl text-xs hover:opacity-90 transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download PNG
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-[var(--border-subtle)] rounded-xl p-8 hover:bg-[var(--bg-overlay)] dark:hover:bg-[var(--bg-elevated)] transition-colors cursor-pointer relative text-center">
              <input aria-label="Upload CSV file" type="file" accept=".csv" onChange={handleCsvUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
              <FileSpreadsheet className="w-10 h-10 text-zinc-300 dark:text-[var(--text-secondary)] mx-auto mb-2" />
              <p className="text-sm font-medium text-[var(--text-secondary)]">Upload CSV (columns: <strong>value</strong>, optional <strong>label</strong>)</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Pro: up to {PRO_MAX} QR codes per batch</p>
            </div>
            {csvData.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-bold text-[var(--text-primary)]">{csvData.length} entries loaded</p>
                <div className="max-h-40 overflow-y-auto bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] p-3">
                  {csvData.slice(0, 10).map((item, i) => (
                    <div key={i} className="text-xs text-[var(--text-secondary)] font-mono truncate py-0.5">{item.label}: {item.value}</div>
                  ))}
                  {csvData.length > 10 && <div className="text-xs text-[var(--text-muted)] pt-1">...and {csvData.length - 10} more</div>}
                </div>
                <button onClick={generateBulk} disabled={isProcessing}
                  className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5">
                  {isProcessing ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Download className="w-4 h-4" /> Generate & Download ZIP ({csvData.length} QRs)</>}
                </button>
                {csvData.length > DAILY_LIMIT && usage >= DAILY_LIMIT && (
                  <p className="text-xs text-amber-500 text-center">Free tier limited to {DAILY_LIMIT} QR. Upgrade to Pro for up to {PRO_MAX}.</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-[var(--accent)]/10/20 border border-[var(--accent)]/20 rounded-xl p-3 flex items-center justify-between">
          <p className="text-[10px] text-[var(--accent)] dark:text-[var(--accent)]"><strong>Pro:</strong> Generate up to {PRO_MAX} QR codes per batch, CSV templates included. Standard black-on-white PNG output.</p>
          <Link href="/pricing" className="text-[10px] font-bold text-[var(--accent)] dark:text-[var(--accent)] underline shrink-0 ml-4">Upgrade →</Link>
        </div>
      </div>
    </div>
  );
}
