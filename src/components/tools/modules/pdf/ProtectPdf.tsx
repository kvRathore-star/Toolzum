"use client";

import React, { useState, useEffect } from 'react';
import { FileUploader } from '../../FileUploader';
import { downloadOrShare } from '@/utils/nativeShare';
import { toast } from 'react-hot-toast';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { ShieldAlert, Lock, Unlock, Download, FileText, RefreshCw } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

type Mode = 'protect' | 'unlock';

export function PdfSecurityTool({ defaultMode = 'protect' }: { defaultMode?: Mode }) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [file, setFile] = useState<File | null>(null);
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  useEffect(() => {
    return () => { if (outputUrl) URL.revokeObjectURL(outputUrl); };
  }, [outputUrl]);

  const isProtect = mode === 'protect';

  const handleFileSelect = async (selectedFile: File) => {
    try {
      const buf = await selectedFile.arrayBuffer();
      setFileBuffer(buf);
      setFile(selectedFile);
      setOutputUrl(null);
      setPassword('');
      setConfirmPassword('');
      setProgress(0);

      if (!isProtect) {
        try { await pdfjsLib.getDocument({ data: buf }).promise; toast.success('PDF is not password protected.'); }
        catch (e: unknown) { if (e instanceof Error && e.name === 'PasswordException') toast.success('Password-protected PDF detected.'); }
      }
    } catch { toast.error('Failed to load PDF.'); }
  };

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !fileBuffer) return;

    if (isProtect) {
      if (!password) return toast.error('Enter a password.');
      if (password !== confirmPassword) return toast.error('Passwords do not match.');
    }

    setIsProcessing(true);
    setProgress(0);
    setStatusText('Initializing...');

    try {
      const pdf = isProtect
        ? await pdfjsLib.getDocument(fileBuffer).promise
        : await pdfjsLib.getDocument({ data: fileBuffer, password: password || undefined }).promise;

      const totalPages = pdf.numPages;
      const doc = isProtect
        ? new jsPDF({ encryption: { userPassword: password, ownerPassword: password, userPermissions: ['print', 'copy'] } })
        : new jsPDF();

      for (let i = 1; i <= totalPages; i++) {
        setStatusText(`${isProtect ? 'Securing' : 'Decrypting'} page ${i} of ${totalPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        if (!context) continue;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport }).promise;
        const imgData = canvas.toDataURL('image/jpeg', 0.85);
        const w = viewport.width * 0.264583;
        const h = viewport.height * 0.264583;
        if (i > 1) { doc.addPage([w, h]); } else { doc.deletePage(1); doc.addPage([w, h]); }
        doc.addImage(imgData, 'JPEG', 0, 0, w, h);
        setProgress(Math.round((i / totalPages) * 100));
      }

      setStatusText('Saving...');
      const blob = doc.output('blob');
      if (outputUrl) URL.revokeObjectURL(outputUrl);
      setOutputUrl(URL.createObjectURL(blob));
      toast.success(isProtect ? 'PDF protected!' : 'PDF unlocked!');
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'PasswordException') toast.error('Incorrect password.');
      else toast.error(isProtect ? 'Failed to protect PDF.' : 'Failed to unlock PDF.');
    } finally {
      setIsProcessing(false);
      setProgress(100);
    }
  };

  const clearAll = () => {
    setFile(null); setFileBuffer(null); setOutputUrl(null);
    setPassword(''); setConfirmPassword(''); setProgress(0);
  };

  if (!file) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto animate-in fade-in duration-500">
        <div className="flex bg-white dark:bg-black p-1 rounded-xl border border-[var(--border-subtle)] w-fit">
          <button
            onClick={() => { setMode('protect'); setFile(null); setFileBuffer(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'protect'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Protect PDF
          </button>
          <button
            onClick={() => { setMode('unlock'); setFile(null); setFileBuffer(null); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              mode === 'unlock'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Unlock PDF
          </button>
        </div>
        <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl text-blue-700 dark:text-blue-400 text-sm flex items-center gap-2">
          {isProtect ? <ShieldAlert className="w-5 h-5 flex-shrink-0" /> : <Unlock className="w-5 h-5 flex-shrink-0" />}
          <span>
            {isProtect
              ? <><strong>Secure Client-Side Encryption:</strong> Your files never leave your computer.</>
              : <><strong>100% Client-Side Decryption:</strong> All decryption happens in your browser.</>}
          </span>
        </div>
        <FileUploader
          accept="application/pdf"
          onFileSelect={handleFileSelect}
          title={isProtect ? 'Upload PDF to Protect' : 'Upload Password Protected PDF'}
          subtitle={isProtect ? 'Add password encryption to your PDF' : 'Select file to decrypt'}
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[var(--bg-overlay)] p-4 rounded-xl border border-zinc-200 dark:border-[var(--border-subtle)]">
        <div className="flex items-center gap-3">
          <FileText className="w-8 h-8 text-[var(--accent)]" />
          <div>
            <h3 className="font-bold text-zinc-900 dark:text-[var(--text-primary)]">{file.name}</h3>
            <p className="text-[var(--text-secondary)] text-xs">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        </div>
        <button onClick={clearAll} disabled={isProcessing}
          className="text-xs text-[var(--text-secondary)] dark:text-zinc-300 px-3 py-2 bg-[var(--bg-overlay)] dark:bg-[var(--bg-surface)] rounded-lg hover:bg-[var(--bg-surface)] transition-colors disabled:opacity-50">
          Change File
        </button>
      </div>

      <div className="flex bg-white dark:bg-black p-1 rounded-xl border border-[var(--border-subtle)] w-fit">
        <button
          onClick={() => { setMode('protect'); setFile(null); setFileBuffer(null); setOutputUrl(null); setPassword(''); setConfirmPassword(''); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'protect'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          Protect PDF
        </button>
        <button
          onClick={() => { setMode('unlock'); setFile(null); setFileBuffer(null); setOutputUrl(null); setPassword(''); setConfirmPassword(''); }}
          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            mode === 'unlock'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-[var(--text-secondary)] hover:text-zinc-900 dark:hover:text-white'
          }`}
        >
          Unlock PDF
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleAction} className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-[var(--text-primary)] font-bold text-base flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
              {isProtect ? <Lock className="w-4 h-4 text-[var(--accent)]" /> : <Lock className="w-4 h-4 text-[var(--accent)]" />}
              {isProtect ? 'Set Encryption Password' : 'Enter PDF Password'}
            </h4>
            <div className="space-y-1">
              <label htmlFor="lbl-protectpdf-password" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Password</label>
              <input id="lbl-protectpdf-password" aria-label="Password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder={isProtect ? 'Enter password (minimum 4 characters)...' : 'Enter password (leave empty if none)...'}
                minLength={isProtect ? 4 : undefined}
                className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-zinc-800 rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--border-subtle)]"
                required={isProtect} />
            </div>
            {isProtect && (
              <div className="space-y-1">
                <label htmlFor="lbl-protectpdf-confirm-password" className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider">Confirm Password</label>
                <input id="lbl-protectpdf-confirm-password" aria-label="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password..." minLength={4} required
                  className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] dark:border-zinc-800 rounded-xl px-4 py-3 text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-[var(--border-subtle)]" />
              </div>
            )}
          </div>
          <button type="submit" disabled={isProcessing}
            className="w-full mt-6 bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2">
            {isProcessing ? (
              <><RefreshCw className="w-5 h-5 animate-spin" /><span>{statusText} ({progress}%)</span></>
            ) : (
              <>{isProtect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                <span>{isProtect ? 'Encrypt & Protect PDF' : 'Unlock & Remove Password'}</span></>
            )}
          </button>
        </form>

        <div className="flex flex-col justify-center">
          {outputUrl ? (
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-6 animate-in zoom-in-95 duration-300 h-full flex flex-col justify-center">
              <div className={`rounded-xl overflow-hidden border flex flex-col items-center justify-center p-8 ${isProtect ? 'bg-indigo-500/10 border-indigo-500/20 text-[var(--accent)]' : 'bg-emerald-700/10 border-emerald-500/20 text-emerald-500'}`}>
                {isProtect ? <Lock className="w-16 h-16 mb-4" /> : <Unlock className="w-16 h-16 mb-4" />}
                <p className="font-bold text-center">{isProtect ? `protected_${file!.name}` : `unlocked_${file!.name}`}</p>
                <p className="text-xs mt-1 opacity-80">{isProtect ? 'Ready with password protection.' : 'Ready without encryption.'}</p>
              </div>
              <button onClick={() => downloadOrShare(outputUrl, `${isProtect ? 'protected' : 'unlocked'}_${file!.name}`)}
                className="w-full bg-emerald-700 hover:bg-emerald-700 text-white font-bold px-4 py-4 rounded-xl transition-colors shadow-lg flex justify-center items-center gap-2 cursor-pointer">
                <Download className="w-5 h-5" /> Download {isProtect ? 'Protected' : 'Unlocked'} PDF
              </button>
            </div>
          ) : (
            <div className="bg-[var(--bg-overlay)] border border-dashed border-[var(--border-subtle)] dark:border-zinc-800 p-6 rounded-2xl flex flex-col items-center justify-center h-full min-h-[250px] text-[var(--text-muted)] text-center">
              {isProtect ? <Lock className="w-12 h-12 mb-4 opacity-30" /> : <Unlock className="w-12 h-12 mb-4 opacity-30" />}
              <p className="text-sm font-medium">{isProtect ? 'Protected' : 'Unlocked'} PDF will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProtectPdf() { return <PdfSecurityTool key="protect" defaultMode="protect" />; }
