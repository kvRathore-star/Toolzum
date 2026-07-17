"use client";
import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Shield, Key, Hash, Unlock } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { clipboardWrite } from "@/lib/clipboard";

type Tab = 'hash' | 'hmac' | 'encrypt';

export default function CryptoKit() {
  const [tab, setTab] = useState<Tab>('hash');
  
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState<Record<string,string>>({});
  
  const [hmacInput, setHmacInput] = useState('');
  const [hmacKey, setHmacKey] = useState('');
  const [hmacAlgo, setHmacAlgo] = useState('SHA256');
  const [hmacResult, setHmacResult] = useState('');
  
  const [encryptInput, setEncryptInput] = useState('');
  const [encryptPass, setEncryptPass] = useState('');
  const [encryptResult, setEncryptResult] = useState('');
  const [decryptInput, setDecryptInput] = useState('');
  const [decryptPass, setDecryptPass] = useState('');
  const [decryptResult, setDecryptResult] = useState('');

  const computeHashes = (val: string) => {
    if (!val.trim()) { setHashes({}); return; }
    setHashes({
      sha1: CryptoJS.SHA1(val).toString(),
      sha224: CryptoJS.SHA224(val).toString(),
      sha256: CryptoJS.SHA256(val).toString(),
      sha384: CryptoJS.SHA384(val).toString(),
      sha512: CryptoJS.SHA512(val).toString(),
      sha3: CryptoJS.SHA3(val).toString(),
      ripemd160: CryptoJS.RIPEMD160(val).toString(),
    });
  };

  const computeHmac = () => {
    if (!hmacInput.trim() || !hmacKey.trim()) { toast.error('Enter both message and key'); return; }
    const algo = hmacAlgo as 'SHA1' | 'SHA224' | 'SHA256' | 'SHA384' | 'SHA512' | 'MD5';
    const fnMap: Record<string, (msg: string, key: string) => CryptoJS.lib.WordArray> = {
      SHA1: CryptoJS.HmacSHA1,
      SHA224: CryptoJS.HmacSHA224,
      SHA256: CryptoJS.HmacSHA256,
      SHA384: CryptoJS.HmacSHA384,
      SHA512: CryptoJS.HmacSHA512,
      MD5: CryptoJS.HmacMD5,
    };
    setHmacResult(fnMap[algo](hmacInput, hmacKey).toString());
  };

  const handleEncrypt = () => {
    if (!encryptInput.trim() || !encryptPass.trim()) { toast.error('Enter both text and passphrase'); return; }
    setEncryptResult(CryptoJS.AES.encrypt(encryptInput, encryptPass).toString());
  };

  const handleDecrypt = () => {
    if (!decryptInput.trim() || !decryptPass.trim()) { toast.error('Enter both ciphertext and passphrase'); return; }
    try {
      const bytes = CryptoJS.AES.decrypt(decryptInput, decryptPass);
      const dec = bytes.toString(CryptoJS.enc.Utf8);
      if (!dec) { toast.error('Decryption failed — wrong passphrase or invalid ciphertext'); return; }
      setDecryptResult(dec);
    } catch { toast.error('Decryption failed — invalid input'); }
  };

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  const TabButton = ({ v, label, icon: Icon }: { v: Tab; label: string; icon: React.ElementType }) => (
    <button onClick={() => setTab(v)} className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${tab === v ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
      <Icon className="w-3.5 h-3.5" /> {label}
    </button>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 w-fit">
        <TabButton v="hash" label="Hash" icon={Hash} />
        <TabButton v="hmac" label="HMAC" icon={Key} />
        <TabButton v="encrypt" label="Encrypt/Decrypt" icon={Shield} />
      </div>

      {tab === 'hash' && (
        <div className="grid grid-cols-1 gap-4">
          <textarea value={input} onChange={e => { setInput(e.target.value); computeHashes(e.target.value); }} placeholder="Enter text to hash..." className="w-full h-[120px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono focus:border-blue-500 transition-colors" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: 'sha1', label: 'SHA-1 (160-bit)' },
              { key: 'sha224', label: 'SHA-224 (224-bit)' },
              { key: 'sha256', label: 'SHA-256 (256-bit)' },
              { key: 'sha384', label: 'SHA-384 (384-bit)' },
              { key: 'sha512', label: 'SHA-512 (512-bit)' },
              { key: 'sha3', label: 'SHA-3 (256-bit)' },
              { key: 'ripemd160', label: 'RIPEMD-160 (160-bit)' },
            ].map(h => (
              <div key={h.key} className="space-y-1">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold">
                  <span>{h.label}</span>
                  {hashes[h.key] && <button onClick={() => copy(hashes[h.key], h.label)} className="text-indigo-400 hover:underline">Copy</button>}
                </div>
                <input type="text" readOnly value={hashes[h.key] || ''} placeholder="..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-emerald-400 font-mono text-[11px] outline-none" />
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'hmac' && (
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3">
            <select value={hmacAlgo} onChange={e => setHmacAlgo(e.target.value)} className="text-xs bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 outline-none text-zinc-900 dark:text-white">
              {['SHA1','SHA224','SHA256','SHA384','SHA512','MD5'].map(a => <option key={a} value={a}>{a.replace('SHA', 'SHA-')}</option>)}
            </select>
            <button onClick={computeHmac} className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer">Compute HMAC</button>
          </div>
          <input value={hmacKey} onChange={e => setHmacKey(e.target.value)} placeholder="Secret key..." className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl px-5 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none font-mono focus:border-blue-500 transition-colors" />
          <textarea value={hmacInput} onChange={e => setHmacInput(e.target.value)} placeholder="Message..." className="w-full h-[100px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono focus:border-blue-500 transition-colors" />
          <div className="relative">
            <textarea value={hmacResult} readOnly placeholder="HMAC result..." className="w-full h-[60px] bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 text-sm text-zinc-900 dark:text-emerald-400 placeholder:text-zinc-400 outline-none resize-none font-mono" />
            {hmacResult && <button onClick={() => copy(hmacResult, 'HMAC')} className="absolute top-2 right-2 text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 transition-colors">Copy</button>}
          </div>
        </div>
      )}

      {tab === 'encrypt' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-zinc-500 uppercase">Encrypt</h3>
            <input value={encryptPass} onChange={e => setEncryptPass(e.target.value)} type="password" placeholder="Passphrase..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
            <textarea value={encryptInput} onChange={e => setEncryptInput(e.target.value)} placeholder="Plain text..." className="w-full h-[100px] bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
            <button onClick={handleEncrypt} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"><Unlock className="w-3.5 h-3.5 inline mr-1" /> Encrypt</button>
            <div className="relative">
              <textarea value={encryptResult} readOnly placeholder="Ciphertext..." className="w-full h-[80px] bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-zinc-900 dark:text-emerald-400 placeholder:text-zinc-400 outline-none resize-none font-mono" />
              {encryptResult && <button onClick={() => copy(encryptResult, 'Ciphertext')} className="absolute top-2 right-2 text-[10px] text-zinc-400 hover:text-zinc-600 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 transition-colors">Copy</button>}
            </div>
          </div>
          <div className="space-y-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 rounded-2xl p-5">
            <h3 className="text-xs font-bold text-zinc-500 uppercase">Decrypt</h3>
            <input value={decryptPass} onChange={e => setDecryptPass(e.target.value)} type="password" placeholder="Passphrase..." className="w-full bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-zinc-900 dark:text-white outline-none font-mono" />
            <textarea value={decryptInput} onChange={e => setDecryptInput(e.target.value)} placeholder="Ciphertext..." className="w-full h-[100px] bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none resize-none font-mono" />
            <button onClick={handleDecrypt} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"><Unlock className="w-3.5 h-3.5 inline mr-1" /> Decrypt</button>
            <div className="relative">
              <textarea value={decryptResult} readOnly placeholder="Decrypted text..." className="w-full h-[80px] bg-zinc-50 dark:bg-black/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 text-sm text-zinc-900 dark:text-emerald-400 placeholder:text-zinc-400 outline-none resize-none font-mono" />
              {decryptResult && <button onClick={() => copy(decryptResult, 'Decrypted')} className="absolute top-2 right-2 text-[10px] text-zinc-400 hover:text-zinc-600 bg-white dark:bg-zinc-800 px-2 py-1 rounded border border-zinc-200 dark:border-zinc-700 transition-colors">Copy</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
