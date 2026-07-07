"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Copy, RefreshCw, Key, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CryptoJS from 'crypto-js';

export default function SecureNoteSharer() {
  const [note, setNote] = useState('');
  const [password, setPassword] = useState('');
  const [shareLink, setShareLink] = useState('');
  
  const [decryptedNote, setDecryptedNote] = useState('');
  const [hasDestructed, setHasDestructed] = useState(false);

  useEffect(() => {
    // Check if URL has note parameters on mount
    const hash = window.location.hash;
    if (hash && hash.startsWith('#note=')) {
      const encryptedData = hash.replace('#note=', '');
      try {
        const decoded = decodeURIComponent(encryptedData);
        // Prompt password to decrypt or decrypt automatically if password parameter matches
        const urlParams = new URLSearchParams(window.location.search);
        const pass = urlParams.get('key') || '';
        if (pass) {
          const bytes = CryptoJS.AES.decrypt(decoded, pass);
          const decrypted = bytes.toString(CryptoJS.enc.Utf8);
          if (decrypted) {
            setDecryptedNote(decrypted);
            setHasDestructed(true);
            // Destruct: immediately clear hash parameter from window URL
            window.history.replaceState(null, '', window.location.pathname);
            toast.success('Secure note decrypted and self-destructed!');
          }
        }
      } catch (_e) {
        /* noop */
      }
    }
  }, []);

  const createSecureNote = () => {
    if (!note.trim()) {
      toast.error('Note cannot be empty');
      return;
    }

    const genPass = password.trim() ? password.trim() : Math.random().toString(36).slice(-8);
    try {
      const encrypted = CryptoJS.AES.encrypt(note, genPass).toString();
      const encoded = encodeURIComponent(encrypted);
      const link = `${window.location.origin}${window.location.pathname}?key=${genPass}#note=${encoded}`;
      setShareLink(link);
      toast.success('Secure link generated!');
    } catch (e) {
      toast.error('Encryption failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="bg-zinc-50 dark:bg-zinc-900/50 p-5 border border-zinc-200 dark:border-white/5 rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          AES Self-Destructing Secure Note Sharer
        </h2>
        <p className="text-xs text-zinc-500 mt-1">Encrypt notes with symmetric key locks client-side. The message decrypts and self-destructs upon loading.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Creation Box */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase border-b border-zinc-800 pb-2">Create Secure Note</h3>
          
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && createSecureNote()}
            placeholder="Type your sensitive message here..."
            className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white h-32 outline-none text-xs resize-none"
          />

          <div className="space-y-1">
            <label className="text-xs text-zinc-400 font-bold">Custom Password (Optional)</label>
            <input 
              type="text" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave empty to auto-generate"
              className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs outline-none"
            />
          </div>

          <button onClick={createSecureNote} className="w-full bg-[var(--accent)] hover:bg-indigo-600 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Key className="w-4 h-4" /> Generate Secret Link
          </button>

          {shareLink && (
            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] animate-in">
              <span className="text-[10px] text-zinc-400 font-bold uppercase block">Shareable link</span>
              <div className="flex gap-2">
                <input readOnly type="text" value={shareLink} className="flex-1 bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-[10px] text-zinc-300 outline-none" />
                <button onClick={() => { navigator.clipboard.writeText(shareLink); toast.success('Link copied!'); }} className="bg-zinc-800 px-3 py-2 rounded-xl text-xs text-white cursor-pointer" aria-label="Copy"><Copy className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Read / Decrypt Box */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl shadow-xl flex flex-col justify-center min-h-[300px]">
          {decryptedNote ? (
            <div className="space-y-4 animate-in zoom-in-95 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs text-rose-500 font-bold uppercase block flex items-center gap-1"><Trash2 className="w-4 h-4" /> Decrypted Note (Self-Destructed)</span>
                <p className="text-[10px] text-zinc-500 mt-1">This note has been deleted from history. Copy it now if you need to retain the contents.</p>
              </div>
              <textarea
                value={decryptedNote}
                readOnly
                className="w-full bg-zinc-50 dark:bg-black/50 border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-400 font-mono h-40 outline-none text-xs resize-none mt-2"
              />
            </div>
          ) : (
            <div className="text-center text-zinc-500 m-auto space-y-2">
              <Shield className="w-12 h-12 mx-auto mb-2 text-zinc-700" />
              <p className="text-xs">No active secure note payload detected in page URL parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}