"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Key, Copy, Loader2 } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

async function exportPem(key: CryptoKey, type: 'public' | 'private'): Promise<string> {
  const format = type === 'public' ? 'spki' : 'pkcs8';
  const label = type === 'public' ? 'PUBLIC KEY' : 'PRIVATE KEY';
  const exported = await crypto.subtle.exportKey(format, key);
  const bytes = new Uint8Array(exported);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  const base64 = btoa(binary);
  const lines = base64.match(/.{1,64}/g) || [];
  return `-----BEGIN ${label}-----\n${lines.join('\n')}\n-----END ${label}-----`;
}

export default function RsaKeyGenerator() {
  const [keySize, setKeySize] = useState(2048);
  const [loading, setLoading] = useState(false);
  const [publicKey, setPublicKey] = useState('');
  const [privateKey, setPrivateKey] = useState('');
  const [keyDetails, setKeyDetails] = useState<{ algo: string; length: number; usages: string[] } | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setPublicKey('');
    setPrivateKey('');
    setKeyDetails(null);
    try {
      const { publicKey: pub, privateKey: priv } = await crypto.subtle.generateKey(
        { name: 'RSA-OAEP', modulusLength: keySize, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
        true,
        ['encrypt', 'decrypt']
      );
      const [pubPem, privPem] = await Promise.all([exportPem(pub, 'public'), exportPem(priv, 'private')]);
      setPublicKey(pubPem);
      setPrivateKey(privPem);
      setKeyDetails({ algo: 'RSA-OAEP / SHA-256', length: keySize, usages: ['encrypt', 'decrypt'] });
      toast.success('Key pair generated!');
    } catch (e) {
      toast.error('Key generation failed');
    } finally {
      setLoading(false);
    }
  }, [keySize]);

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  const KeySection = ({ title, pem, label }: { title: string; pem: string; label: string }) => (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">{title}</h3>
        {pem && <button onClick={() => copy(pem, title)} className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>}
      </div>
      <textarea aria-label={title + " output"} value={pem} readOnly placeholder={`Click "Generate" to create a ${title.toLowerCase()}...`} rows={8} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-[11px] text-zinc-900 dark:text-emerald-400 placeholder:text-[var(--text-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 resize-none font-mono" />
      {pem && (
        <div className="text-[10px] text-[var(--text-muted)]">
          {pem.split('\n').filter(l => !l.startsWith('---')).join('').length} characters
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex bg-[var(--bg-surface)] rounded-xl p-1">
            {[2048, 4096].map(n => (
              <button key={n} onClick={() => setKeySize(n)} disabled={loading} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${keySize === n ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>
                {n}-bit
              </button>
            ))}
          </div>
          <button onClick={generate} disabled={loading} className={`bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Key className="w-4 h-4" /> Generate Key Pair</>}
          </button>
        </div>
        {keyDetails && (
          <div className="bg-[var(--bg-overlay)]/50 rounded-2xl p-4">
            <div className="space-y-0">
              <InfoRow label="Algorithm" val={keyDetails.algo} />
              <InfoRow label="Key Size" val={`${keyDetails.length} bits`} />
              <InfoRow label="Key Usages" val={keyDetails.usages.join(', ')} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KeySection title="Public Key" pem={publicKey} label="public" />
        <KeySection title="Private Key" pem={privateKey} label="private" />
      </div>
    </div>
  );
}

function InfoRow({ label, val }: { label: string; val: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-[var(--border-subtle)] last:border-0">
      <span className="text-[11px] font-medium text-[var(--text-secondary)]">{label}</span>
      <span className="text-[11px] font-mono text-[var(--text-primary)] text-right">{val}</span>
    </div>
  );
}
