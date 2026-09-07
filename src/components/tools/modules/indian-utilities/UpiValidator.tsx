"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { Check, Copy, Download, History, User, Banknote, IndianRupee, CreditCard, XCircle, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { downloadOrShare } from '@/utils/nativeShare';

const KNOWN_HANDLES: Record<string, string> = {
  '@paytm': 'Paytm',
  '@okhdfcbank': 'HDFC Bank',
  '@okicici': 'ICICI Bank',
  '@oksbi': 'State Bank of India',
  '@ybl': 'Yes Bank',
  '@axl': 'Axis Bank',
  '@pnb': 'Punjab National Bank',
  '@yesbank': 'Yes Bank',
  '@unionbank': 'Union Bank of India',
  '@canarabank': 'Canara Bank',
  '@kotak': 'Kotak Mahindra Bank',
  '@idbi': 'IDBI Bank',
  '@indus': 'IndusInd Bank',
  '@federal': 'Federal Bank',
  '@dbs': 'DBS Bank',
  '@rbl': 'RBL Bank',
  '@bob': 'Bank of Baroda',
  '@citi': 'Citi Bank',
  '@hsbc': 'HSBC',
  '@ubi': 'Union Bank of India',
  '@sbi': 'State Bank of India',
  '@icici': 'ICICI Bank',
  '@hdfcbank': 'HDFC Bank',
};

const HISTORY_KEY = 'upiValidatorHistory';
const MAX_HISTORY = 10;

interface ValidationResult {
  valid: boolean;
  username?: string;
  handle?: string;
  bankName?: string;
  error?: string;
}

interface HistoryEntry {
  upiId: string;
  bankName: string;
  timestamp: number;
}

function validateUpiId(input: string): ValidationResult {
  const trimmed = input.trim();
  if (!trimmed) return { valid: false, error: 'Enter a UPI ID' };
  if (!trimmed.includes('@')) return { valid: false, error: 'UPI ID must contain @ (e.g. username@handle)' };
  const parts = trimmed.split('@');
  if (parts.length > 2) return { valid: false, error: 'UPI ID can only contain one @ symbol' };
  const [username, handle] = parts;
  if (!username) return { valid: false, error: 'Username is required before @' };
  if (!handle) return { valid: false, error: 'Handle is required after @' };
  if (username.length < 2) return { valid: false, error: 'Username must be at least 2 characters' };
  if (username.length > 40) return { valid: false, error: 'Username is too long (max 40 characters)' };
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) return { valid: false, error: 'Username can only contain letters, numbers, dots, hyphens, and underscores' };
  const formattedHandle = `@${handle.toLowerCase()}`;
  const bankName = KNOWN_HANDLES[formattedHandle];
  if (!bankName) return { valid: false, error: `"@${handle}" is not a recognized UPI handle` };
  return { valid: true, username, handle: formattedHandle, bankName };
}

function formatTimestamp(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return d.toLocaleDateString();
}

export default function UpiValidator() {
  const [upiId, setUpiId] = useState('');
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [amount, setAmount] = useState('');
  const [payeeName, setPayeeName] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- hydrate validation history from localStorage on mount
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const handleInputChange = (value: string) => {
    setUpiId(value);
    setQrDataUrl(null);
    if (value.includes('@')) {
      const v = validateUpiId(value);
      setResult(v);
      setShowResult(true);
    } else {
      setShowResult(false);
      setResult(null);
    }
  };

  const generateQR = useCallback(async () => {
    if (!result?.valid) {
      toast.error('Please enter a valid UPI ID first');
      return;
    }
    const pa = `${result.username}${result.handle}`;
    let uri = `upi://pay?pa=${pa}&cu=INR`;
    if (payeeName.trim()) uri += `&pn=${encodeURIComponent(payeeName.trim())}`;
    if (amount.trim() && !isNaN(Number(amount)) && Number(amount) > 0) uri += `&am=${Number(amount).toFixed(2)}`;
    try {
      const url = await QRCode.toDataURL(uri, { width: 400, margin: 2, color: { dark: '#000000', light: '#ffffff' }, errorCorrectionLevel: 'H' });
      setQrDataUrl(url);
      toast.success('UPI QR code generated!');

      const entry: HistoryEntry = { upiId: `${result.username}${result.handle}`, bankName: result.bankName || 'Unknown', timestamp: Date.now() };
      const updated = [entry, ...history.filter(h => h.upiId !== entry.upiId)].slice(0, MAX_HISTORY);
      setHistory(updated);
      try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
    } catch {
      toast.error('Failed to generate QR code');
    }
  }, [result, payeeName, amount, history]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('UPI ID copied to clipboard');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) { toast.error('Generate a QR code first'); return; }
    downloadOrShare(qrDataUrl, 'upi-qr.png');
    toast.success('QR code downloaded!');
  };

  const clearHistory = () => {
    setHistory([]);
    try { localStorage.removeItem(HISTORY_KEY); } catch {}
    toast.success('History cleared');
  };

  const inpCls = "w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3.5 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[#0d9488] text-[var(--text-primary)]";

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-overlay)] p-6 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-2xl font-bold text-[var(--text-primary)] flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-[#0d9488]" />
          UPI Validator & QR Generator
        </h2>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Validate UPI IDs, identify the bank handle, and generate UPI payment QR codes for instant payments.
        </p>
      </div>

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-xl space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-[#0d9488]" />
            UPI ID (VPA)
          </label>
          <div className="flex">
            <span className="inline-flex items-center px-4 bg-[#0d9488] text-white font-bold text-lg rounded-l-xl border-2 border-r-0 border-[#0d9488]">
              @
            </span>
            <input aria-label="UPI ID (VPA)"
              ref={inputRef}
              type="text"
              value={upiId}
              onChange={e => handleInputChange(e.target.value)}
              placeholder="username@okhdfcbank"
              className="flex-1 bg-[var(--bg-overlay)] border-2 border-l-0 border-[var(--border-subtle)] focus:border-[#0d9488] rounded-r-xl px-4 py-3.5 text-lg font-mono text-[var(--text-primary)] focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            />
          </div>
          <div className="flex flex-wrap gap-1.5 text-[10px] text-[var(--text-muted)]">
            <span className="font-medium text-[#0d9488]">Format:</span>
            <span>username@handle</span>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <span>e.g.</span>
            <button type="button" onClick={() => handleInputChange('john.doe@okhdfcbank')} className="text-[#0d9488] hover:underline cursor-pointer font-medium">john.doe@okhdfcbank</button>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <button type="button" onClick={() => handleInputChange('user@paytm')} className="text-[#0d9488] hover:underline cursor-pointer font-medium">user@paytm</button>
          </div>
        </div>

        {showResult && result && (
          <div className={`p-5 rounded-xl border-2 animate-in fade-in slide-in-from-top-2 duration-300 ${result.valid ? 'bg-emerald-700/5 border-emerald-500/30' : 'bg-rose-500/5 border-rose-500/30'}`}>
            <div className="flex items-start gap-4">
              <div className={`shrink-0 p-2 rounded-full ${result.valid ? 'bg-emerald-700/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                {result.valid ? <CheckCircle className="w-7 h-7 animate-in zoom-in-95 duration-300" /> : <XCircle className="w-7 h-7 animate-in zoom-in-95 duration-300" />}
              </div>
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-lg font-bold ${result.valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {result.valid ? 'Valid UPI ID' : 'Invalid UPI ID'}
                  </span>
                  {result.valid && result.bankName && (
                    <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#0d9488]/10 text-[#0d9488] border border-[#0d9488]/20 rounded-full">
                      {result.bankName}
                    </span>
                  )}
                </div>
                {result.valid ? (
                  <div className="space-y-1.5 text-sm">
                    <p className="text-[var(--text-primary)]">
                      <span className="text-[var(--text-secondary)]">Username:</span>{' '}
                      <span className="font-mono font-bold text-[#0d9488]">{result.username}</span>
                    </p>
                    <p className="text-[var(--text-primary)]">
                      <span className="text-[var(--text-secondary)]">Handle:</span>{' '}
                      <span className="font-mono font-bold text-[#0d9488]">{result.handle?.toLowerCase()}</span>
                    </p>
                    {result.bankName && (
                      <p className="text-[var(--text-primary)]">
                        <span className="text-[var(--text-secondary)]">Bank / Provider:</span>{' '}
                        <span className="font-bold">{result.bankName}</span>
                      </p>
                    )}
                    <p className="text-[var(--text-primary)] break-all">
                      <span className="text-[var(--text-secondary)]">Full VPA:</span>{' '}
                      <span className="font-mono">{result.username}{result.handle?.toLowerCase()}</span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-rose-600 dark:text-rose-400">{result.error}</p>
                )}
              </div>
              {result.valid && (
                <button
                  onClick={() => copyToClipboard(`${result.username}${result.handle}`)}
                  className="shrink-0 bg-gradient-to-r from-[#0d9488] to-teal-500 hover:from-teal-600 hover:to-teal-600 text-white font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 flex items-center gap-1.5 text-xs cursor-pointer shadow-md"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copy
                </button>
              )}
            </div>
          </div>
        )}

        {result?.valid && (
          <div className="border-t border-[var(--border-subtle)] pt-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <Banknote className="w-3.5 h-3.5 text-[#0d9488]" />
              Payment QR Details
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Payee Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input aria-label="Payee Name" type="text" value={payeeName} onChange={e => setPayeeName(e.target.value)} placeholder="John Doe" className={`${inpCls} pl-9`} />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <input aria-label="Amount (₹)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" min="0" step="0.01" className={`${inpCls} pl-9`} />
                </div>
              </div>
            </div>

            <button
              onClick={generateQR}
              className="w-full bg-gradient-to-r from-[#0d9488] to-teal-500 hover:from-teal-600 hover:to-teal-600 text-white font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-lg text-sm"
            >
              <CreditCard className="w-4 h-4" />
              {qrDataUrl ? 'Regenerate QR Code' : 'Generate QR Code'}
            </button>
          </div>
        )}

        {qrDataUrl && (
          <div className="border-t border-[var(--border-subtle)] pt-5 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="bg-white border border-zinc-200 dark:border-zinc-700 rounded-2xl p-6 flex justify-center items-center shadow-inner">
              <img src={qrDataUrl} alt="UPI QR Code" className="max-w-full h-auto max-h-72 object-contain" />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                className="flex-1 bg-[#0d9488] hover:bg-teal-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
              >
                <Download className="w-4 h-4" />
                Download PNG
              </button>
              <button
                onClick={() => copyToClipboard(`upi://pay?pa=${result?.username}${result?.handle?.toLowerCase()}${payeeName ? `&pn=${encodeURIComponent(payeeName)}` : ''}${amount ? `&am=${amount}` : ''}&cu=INR`)}
                className="flex-1 bg-gradient-to-r from-[#0d9488] to-teal-500 hover:from-teal-600 hover:to-teal-600 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
              >
                <Copy className="w-4 h-4" />
                Copy UPI Link
              </button>
            </div>
          </div>
        )}
      </div>

      {history.length > 0 && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 shadow-xl space-y-3 animate-in fade-in duration-500">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-[#0d9488]" />
              Recent Validations
            </h4>
            <button onClick={clearHistory} className="text-[10px] font-bold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 cursor-pointer">Clear All</button>
          </div>
          <div className="space-y-1.5">
            {history.map((entry, i) => (
              <div
                key={`${entry.upiId}-${entry.timestamp}`}
                className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-overlay)] border border-[var(--border-subtle)] hover:border-[#0d9488]/30 transition-colors group cursor-pointer"
                role="button" tabIndex={0} onClick={() => {
                  setUpiId(entry.upiId);
                  setQrDataUrl(null);
                  const v = validateUpiId(entry.upiId);
                  setResult(v);
                  setShowResult(true);
                  inputRef.current?.focus();
                }}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setUpiId(entry.upiId); setQrDataUrl(null); const v = validateUpiId(entry.upiId); setResult(v); setShowResult(true); inputRef.current?.focus(); } }}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-1.5 rounded-lg bg-[#0d9488]/10 text-[#0d9488]">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-mono font-bold text-[var(--text-primary)] truncate">{entry.upiId}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{entry.bankName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(entry.timestamp)}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
