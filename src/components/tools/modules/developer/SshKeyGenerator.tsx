"use client";
import React, { useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Key, Copy, Loader2 } from 'lucide-react';
import { clipboardWrite } from "@/lib/clipboard";

/* ---- Ed25519 pure-JS implementation (no Web Crypto support) ---- */
const P_P = (BigInt(1) << BigInt(255)) - BigInt(19);

function mod(a: bigint, p: bigint): bigint {
  const r = a % p;
  return r < BigInt(0) ? r + p : r;
}
function modinv(x: bigint, p: bigint): bigint {
  return modPow(x, p - BigInt(2), p);
}
function modPow(base: bigint, exp: bigint, m: bigint): bigint {
  let result = BigInt(1);
  let b = mod(base, m);
  let e = exp;
  while (e > BigInt(0)) {
    if (e & BigInt(1)) result = mod(result * b, m);
    b = mod(b * b, m);
    e >>= BigInt(1);
  }
  return result;
}

const SQRT_MINUS_1 = modPow(BigInt(2), (P_P - BigInt(1)) / BigInt(4), P_P);
const D_ED = mod(BigInt(-121665) * modinv(BigInt(121666), P_P), P_P);
const BASE_Y = BigInt(4) * modinv(BigInt(5), P_P);
const BASE = (() => {
  function recoverX(y: bigint): bigint {
    const y2 = mod(y * y, P_P);
    const u = mod(y2 - BigInt(1), P_P);
    const v = mod(D_ED * y2 + BigInt(1), P_P);
    const uv = mod(u * modinv(v, P_P), P_P);
    let x = modPow(uv, (P_P + BigInt(3)) / BigInt(8), P_P);
    if (mod(x * x - uv, P_P) !== BigInt(0)) {
      x = mod(x * SQRT_MINUS_1, P_P);
    }
    if (mod(x, BigInt(2)) !== BigInt(0)) x = mod(-x, P_P);
    return x;
  }
  return { x: recoverX(BASE_Y), y: BASE_Y };
})();

function pointAdd(a: { x: bigint; y: bigint }, b: { x: bigint; y: bigint }) {
  const d = D_ED;
  const x1y2 = mod(a.x * b.y, P_P);
  const y1x2 = mod(a.y * b.x, P_P);
  const x1x2 = mod(a.x * b.x, P_P);
  const y1y2 = mod(a.y * b.y, P_P);
  const term = mod(d * mod(x1x2 * y1y2, P_P), P_P);
  const denom = mod(BigInt(1) + term, P_P);
  const denom2 = mod(BigInt(1) - term, P_P);
  return {
    x: mod(mod(x1y2 + y1x2, P_P) * modinv(denom, P_P), P_P),
    y: mod(mod(y1y2 + x1x2, P_P) * modinv(denom2, P_P), P_P),
  };
}

function pointMul(s: bigint, p: { x: bigint; y: bigint }) {
  let result = { x: BigInt(0), y: BigInt(1) };
  let addend = { x: p.x, y: p.y };
  let scalar = s;
  while (scalar > BigInt(0)) {
    if (scalar & BigInt(1)) result = pointAdd(result, addend);
    addend = pointAdd(addend, addend);
    scalar >>= BigInt(1);
  }
  return result;
}

function encodePoint(p: { x: bigint; y: bigint }): Uint8Array {
  const yBytes = leBuf(p.y, 32);
  const xParity = Number(p.x & BigInt(1));
  yBytes[31] |= (xParity << 7);
  return yBytes;
}

function leBuf(n: bigint, len: number): Uint8Array {
  const buf = new Uint8Array(len);
  let v = n;
  for (let i = 0; i < len; i++) {
    buf[i] = Number(v & BigInt(0xff));
    v >>= BigInt(8);
  }
  return buf;
}

function bufToBigInt(buf: Uint8Array): bigint {
  let v = BigInt(0);
  for (let i = buf.length - 1; i >= 0; i--) v = (v << BigInt(8)) | BigInt(buf[i]);
  return v;
}

function clampScalar(hash: ArrayBuffer): bigint {
  const bytes = new Uint8Array(hash.slice(0, 32));
  bytes[0] &= 0xf8;
  bytes[31] &= 0x7f;
  bytes[31] |= 0x40;
  return bufToBigInt(bytes);
}

async function ed25519KeyGen(): Promise<{ pub: Uint8Array; priv: Uint8Array }> {
  const seed = crypto.getRandomValues(new Uint8Array(32));
  const hash = await crypto.subtle.digest('SHA-512', seed);
  const scalar = clampScalar(hash);
  const pubPoint = pointMul(scalar, BASE);
  const pubKey = encodePoint(pubPoint);
  return { pub: pubKey, priv: seed };
}

/* ---- SSH wire format helpers ---- */
function sshString(s: Uint8Array): Uint8Array {
  const len = new Uint8Array(4);
  new DataView(len.buffer).setUint32(0, s.length, false);
  return concat(len, s);
}
function sshMpint(n: bigint): Uint8Array {
  let bytes: Uint8Array;
  if (n === BigInt(0)) {
    bytes = new Uint8Array([0]);
  } else {
    const hex = n.toString(16);
    bytes = new Uint8Array(Math.ceil(hex.length / 2));
    for (let i = 0; i < bytes.length; i++) bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  if (bytes[0]! & 0x80) bytes = concat(new Uint8Array([0]), bytes);
  return sshString(bytes);
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((a, b) => a + b.length, 0);
  const r = new Uint8Array(total);
  let o = 0;
  for (const a of arrays) { r.set(a, o); o += a.length; }
  return r;
}

function arrToStr(a: Uint8Array): string {
  let s = '';
  for (let i = 0; i < a.length; i++) s += String.fromCharCode(a[i]);
  return s;
}

function toBase64(a: Uint8Array): string {
  return btoa(arrToStr(a));
}

function pemWrap(label: string, data: Uint8Array): string {
  const b64 = toBase64(data).match(/.{1,64}/g)?.join('\n') || '';
  return `-----BEGIN ${label}-----\n${b64}\n-----END ${label}-----`;
}

/* ---- SSH public key wire format ---- */
function rsaPublicKeyWire(e: bigint, n: bigint): Uint8Array {
  const algo = new TextEncoder().encode('ssh-rsa');
  return concat(sshString(algo), sshMpint(e), sshMpint(n));
}

function ecdsaPublicKeyWire(curve: string, q: Uint8Array): Uint8Array {
  const algo = new TextEncoder().encode(`ecdsa-sha2-${curve}`);
  const cname = new TextEncoder().encode(curve);
  return concat(sshString(algo), sshString(cname), sshString(q));
}

function ed25519PublicKeyWire(pub: Uint8Array): Uint8Array {
  const algo = new TextEncoder().encode('ssh-ed25519');
  return concat(sshString(algo), sshString(pub));
}

function sshPublicKeyLine(wire: Uint8Array, algo: string, comment: string): string {
  return `${algo} ${toBase64(wire)} ${comment}`;
}

/* ---- OpenSSH format private key wire (for Ed25519) ---- */
function opensshPrivateKeyWire(pub: Uint8Array, priv: Uint8Array): string {
  const AUTH_MAGIC = new TextEncoder().encode('openssh-key-v1\0');
  const algo = new TextEncoder().encode('ssh-ed25519');
  const pubWire = ed25519PublicKeyWire(pub);
  const check = crypto.getRandomValues(new Uint8Array(4));
  const checkPair = concat(check, check);
  const comment = new TextEncoder().encode('');
  const keyData = concat(checkPair, sshString(algo), sshString(pub), sshString(priv), sshString(comment));
  const padLen = 8 - (keyData.length % 8);
  const padded = new Uint8Array(keyData.length + padLen);
  padded.set(keyData);
  for (let i = keyData.length; i < padded.length; i++) padded[i] = i - keyData.length + 1;
  const cipher = new TextEncoder().encode('none');
  const kdf = new TextEncoder().encode('none');
  const kdfOpts = new Uint8Array(4);
  const numKeys = new Uint8Array(4);
  new DataView(numKeys.buffer).setUint32(0, 1, false);
  return pemWrap('OPENSSH PRIVATE KEY',
    concat(AUTH_MAGIC, sshString(cipher), sshString(kdf), sshString(kdfOpts), numKeys, pubWire, sshString(padded))
  );
}

/* ---- PKCS8 PEM from Web Crypto (RSA/ECDSA) ---- */
async function exportPem(key: CryptoKey, type: 'public' | 'private'): Promise<string> {
  const format = type === 'public' ? 'spki' : 'pkcs8';
  const label = type === 'public' ? 'PUBLIC KEY' : 'PRIVATE KEY';
  const exported = await crypto.subtle.exportKey(format, key);
  return pemWrap(label, new Uint8Array(exported));
}

function parseDer(d: Uint8Array, offset: number): { tag: number; value: Uint8Array; end: number } {
  const tag = d[offset]!;
  let len = d[offset + 1]!;
  let o = offset + 2;
  if (len & 0x80) {
    const nBytes = len & 0x7f;
    len = 0;
    for (let i = 0; i < nBytes; i++) len = (len << 8) | d[o + i]!;
    o += nBytes;
  }
  return { tag, value: d.slice(o, o + len), end: o + len };
}

function derInt(d: Uint8Array): bigint {
  let v = BigInt(0);
  for (let i = 0; i < d.length; i++) v = (v << BigInt(8)) | BigInt(d[i]!);
  return v;
}

function spkiToRsa(spkiDer: ArrayBuffer): { e: bigint; n: bigint } | null {
  try {
    const d = new Uint8Array(spkiDer);
    const outer = parseDer(d, 0);
    const inner = parseDer(outer.value, 0);
    const bitStr = parseDer(outer.value, inner.end);
    const pkSeq = parseDer(bitStr.value.slice(1), 0);
    const pkInner1 = parseDer(pkSeq.value, 0);
    const n = derInt(pkInner1.value);
    const pkInner2 = parseDer(pkSeq.value, pkInner1.end);
    const e = derInt(pkInner2.value);
    return { e, n };
  } catch { return null; }
}

/* ---- React component ---- */
type KeyAlgo = 'rsa' | 'ecdsa-p256' | 'ecdsa-p384' | 'ed25519';

const ALGO_LABELS: Record<KeyAlgo, { label: string; bits: string }> = {
  'rsa': { label: 'RSA 2048', bits: '2048-bit' },
  'ecdsa-p256': { label: 'ECDSA P-256', bits: '256-bit' },
  'ecdsa-p384': { label: 'ECDSA P-384', bits: '384-bit' },
  'ed25519': { label: 'Ed25519', bits: '256-bit' },
};

export default function SshKeyGenerator() {
  const [algo, setAlgo] = useState<KeyAlgo>('ed25519');
  const [loading, setLoading] = useState(false);
  const [pubKeyStr, setPubKeyStr] = useState('');
  const [privKeyStr, setPrivKeyStr] = useState('');
  const [keyDetails, setKeyDetails] = useState<{ algo: string; bits: string; format: string } | null>(null);

  const generate = useCallback(async () => {
    setLoading(true);
    setPubKeyStr('');
    setPrivKeyStr('');
    setKeyDetails(null);
    try {
      if (algo === 'rsa') {
        const keyPair = await crypto.subtle.generateKey(
          { name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
          true, ['sign', 'verify']
        );
        const [pubPem, privPem] = await Promise.all([exportPem(keyPair.publicKey, 'public'), exportPem(keyPair.privateKey, 'private')]);
        const spki = await crypto.subtle.exportKey('spki', keyPair.publicKey);
        const rsaData = spkiToRsa(spki);
        if (rsaData) {
          const pubWire = rsaPublicKeyWire(rsaData.e, rsaData.n);
          setPubKeyStr(sshPublicKeyLine(pubWire, 'ssh-rsa', 'generated@toolzum'));
        }
        setPrivKeyStr(privPem);
        setKeyDetails({ algo: 'RSA', bits: '2048-bit', format: 'SPKI/PKCS8 + SSH' });
      } else if (algo.startsWith('ecdsa-')) {
        const curve = algo === 'ecdsa-p256' ? 'P-256' : 'P-384';
        const keyPair = await crypto.subtle.generateKey(
          { name: 'ECDSA', namedCurve: curve },
          true, ['sign', 'verify']
        );
        const [pubPem, privPem, pubRaw] = await Promise.all([
          exportPem(keyPair.publicKey, 'public'),
          exportPem(keyPair.privateKey, 'private'),
          crypto.subtle.exportKey('raw', keyPair.publicKey),
        ]);
        const ecCurve = curve === 'P-256' ? 'nistp256' : 'nistp384';
        const qPoint = new Uint8Array([0x04, ...new Uint8Array(pubRaw)]);
        const pubWire = ecdsaPublicKeyWire(ecCurve, qPoint);
        setPubKeyStr(sshPublicKeyLine(pubWire, `ecdsa-sha2-${ecCurve}`, 'generated@toolzum'));
        setPrivKeyStr(privPem);
        setKeyDetails({ algo: `ECDSA ${curve}`, bits: curve === 'P-256' ? '256-bit' : '384-bit', format: 'SPKI/PKCS8 + SSH' });
      } else if (algo === 'ed25519') {
        const { pub, priv } = await ed25519KeyGen();
        const pubWire = ed25519PublicKeyWire(pub);
        setPubKeyStr(sshPublicKeyLine(pubWire, 'ssh-ed25519', 'generated@toolzum'));
        setPrivKeyStr(opensshPrivateKeyWire(pub, priv));
        setKeyDetails({ algo: 'Ed25519', bits: '256-bit', format: 'OpenSSH' });
      }
      toast.success('Key pair generated!');
    } catch (e) {
      toast.error('Key generation failed');
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [algo]);

  const copy = (txt: string, label: string) => { clipboardWrite(txt); toast.success(`${label} copied!`); };

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex bg-[var(--bg-surface)] rounded-xl p-1 flex-wrap">
            {(Object.entries(ALGO_LABELS) as [KeyAlgo, typeof ALGO_LABELS[KeyAlgo]][]).map(([k, v]) => (
              <button key={k} onClick={() => setAlgo(k)} disabled={loading} className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${algo === k ? 'bg-[var(--bg-elevated)] text-blue-600 dark:text-blue-400 shadow-sm' : 'text-[var(--text-secondary)]'}`}>
                {v.label}
              </button>
            ))}
          </div>
          <button onClick={generate} disabled={loading} className={`bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors cursor-pointer flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}>
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Key className="w-4 h-4" /> Generate SSH Key Pair</>}
          </button>
        </div>
        {keyDetails && (
          <div className="bg-[var(--bg-overlay)]/50 rounded-2xl p-4">
            <div className="grid grid-cols-2 gap-3 text-[11px]">
              <div><span className="text-[var(--text-secondary)]">Algorithm</span><p className="font-mono text-[var(--text-primary)]">{keyDetails.algo}</p></div>
              <div><span className="text-[var(--text-secondary)]">Strength</span><p className="font-mono text-[var(--text-primary)]">{keyDetails.bits}</p></div>
              <div className="col-span-2"><span className="text-[var(--text-secondary)]">Output Format</span><p className="font-mono text-[var(--text-primary)]">{keyDetails.format}</p></div>
            </div>
          </div>
        )}
        <p className="text-[10px] text-[var(--text-muted)] mt-2">
          Ed25519 keys use a pure-JS implementation (Web Crypto does not expose Ed25519).
          RSA and ECDSA use native Web Crypto (RSASSA-PKCS1-v1_5 / ECDSA).
          Public keys are in OpenSSH wire format — paste into <code className="text-zinc-600 dark:text-zinc-300">~/.ssh/authorized_keys</code>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <KeySection title="Public Key" pem={pubKeyStr} onCopy={() => copy(pubKeyStr, 'Public key')} />
        <KeySection title="Private Key" pem={privKeyStr} onCopy={() => copy(privKeyStr, 'Private key')} />
      </div>

      {pubKeyStr && (
        <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-2">
          <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">Verify with</h3>
          <pre className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-[11px] text-zinc-900 dark:text-emerald-400 font-mono overflow-x-auto">
{`# Save private key and verify:
echo '${privKeyStr.slice(0, 40)}...' > ~/.ssh/id_test
chmod 600 ~/.ssh/id_test
ssh-keygen -y -f ~/.ssh/id_test
# Also: paste public key into a file and run:
ssh-keygen -l -f ~/.ssh/id_test.pub`}
          </pre>
        </div>
      )}
    </div>
  );
}

function KeySection({ title, pem, onCopy }: { title: string; pem: string; onCopy: () => void }) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-2xl p-5 space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-[11px] font-bold text-[var(--text-secondary)] uppercase">{title}</h3>
        {pem && <button onClick={onCopy} className="text-[10px] text-[var(--accent)] hover:underline flex items-center gap-1"><Copy className="w-3 h-3" /> Copy</button>}
      </div>
      <textarea value={pem} readOnly placeholder={`Click "Generate" to create a ${title.toLowerCase()}...`} rows={8} className="w-full bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-xl p-4 text-[11px] text-zinc-900 dark:text-emerald-400 placeholder:text-[var(--text-muted)] outline-none resize-none font-mono" />
      {pem && (
        <div className="text-[10px] text-[var(--text-muted)]">
          {pem.split('\n').filter(l => !l.startsWith('---')).join('').length} characters
        </div>
      )}
    </div>
  );
}
