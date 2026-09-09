"use client";

import React, { useState, useEffect } from 'react';
import { Shield, Copy, RefreshCw, Key, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import CryptoJS from 'crypto-js';
import { clipboardWrite } from "@/lib/clipboard";

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
            // eslint-disable-next-line react-hooks/set-state-in-effect -- decrypt + self-destruct a shared note from its URL param
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
      <div className="bg-[var(--bg-overlay)] p-5 border border-zinc-200 dark:border-[var(--border-subtle)] rounded-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] dark:text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--accent)]" />
          AES Self-Destructing Secure Note Sharer
        </h2>
        <p className="text-xs text-[var(--text-secondary)] mt-1">Encrypt notes with symmetric key locks client-side. The message decrypts and self-destructs upon loading.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Creation Box */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase border-b border-[var(--border-subtle)] pb-2">Create Secure Note</h3>
          
          <textarea aria-label="Create Secure Note"
            value={note}
            onChange={e => setNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && createSecureNote()}
            placeholder="Type your sensitive message here..."
            className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-[var(--text-primary)] h-32 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-xs resize-none"
          />

          <div className="space-y-1">
            <label className="text-xs text-[var(--text-muted)] font-bold">Custom Password (Optional)</label>
            <input aria-label="Custom Password (Optional)" 
              type="text" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Leave empty to auto-generate"
              className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
            />
          </div>

          <button onClick={createSecureNote} className="w-full bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer">
            <Key className="w-4 h-4" /> Generate Secret Link
          </button>

          {shareLink && (
            <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)] animate-in">
              <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">Shareable link</span>
              <div className="flex gap-2">
                <input aria-label="Shareable link" readOnly type="text" value={shareLink} className="flex-1 bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[10px] text-zinc-300 focus-visible:focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2" />
                <button onClick={() => { clipboardWrite(shareLink); toast.success('Link copied!'); }} className="bg-[var(--accent-ink)] px-3 py-2 rounded-xl text-xs text-white cursor-pointer" aria-label="Copy"><Copy className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>

        {/* Read / Decrypt Box */}
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6 rounded-2xl shadow-xl flex flex-col justify-center min-h-[300px]">
          {decryptedNote ? (
            <div className="space-y-4 animate-in zoom-in-95 flex-1 flex flex-col justify-between">
              <div>
                <span className="text-xs text-[var(--accent)] font-bold uppercase block flex items-center gap-1"><Trash2 className="w-4 h-4" /> Decrypted Note (Self-Destructed)</span>
                <p className="text-[10px] text-[var(--text-secondary)] mt-1">This note has been deleted from history. Copy it now if you need to retain the contents.</p>
              </div>
              <textarea aria-label="Decrypted note"
                value={decryptedNote}
                readOnly
                className="w-full bg-[var(--bg-overlay)] border border-emerald-500/30 rounded-xl px-4 py-3 text-emerald-700 dark:text-emerald-400 font-mono h-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 text-xs resize-none mt-2"
              />
            </div>
          ) : (
            <div className="text-center text-[var(--text-secondary)] m-auto space-y-2">
              <Shield className="w-12 h-12 mx-auto mb-2 text-zinc-700" />
              <p className="text-xs">No active secure note payload detected in page URL parameters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}