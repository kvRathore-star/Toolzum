"use client";
import Link from "next/link";
import {
  Shield, Unlock, Lock, Hash, Key, Fingerprint
} from "lucide-react";

const sectionBtn = "inline-flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-default";

interface HubCard {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
}

function ToolCard({ name, slug, desc, icon: Icon }: HubCard) {
  return (
    <Link
      href={`/developer/${slug}`}
      className="group flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all hover:shadow-md"
    >
      <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/30 transition-colors">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{name}</div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </Link>
  );
}

export default function CryptoKit() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Crypto & Hash Toolkit</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          A collection of cryptographic and hashing tools — encrypt and decrypt text with AES,
          generate secure password hashes using PBKDF2-SHA256, compute message digests
          with MD5/SHA-1/SHA-256/SHA-512, and produce HMAC signatures. Everything runs locally
          in your browser with nothing uploaded to any server.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Unlock className="w-3.5 h-3.5" /> Encryption Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="AES Encrypt" slug="aes-encrypt" desc="Encrypt text with AES symmetric encryption using a passphrase. Generates portable ciphertext." icon={Lock} />
          <ToolCard name="AES Decrypt" slug="aes-decrypt" desc="Decrypt AES-encrypted ciphertext back to plain text using the original passphrase." icon={Unlock} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Hash className="w-3.5 h-3.5" /> Hash Generators</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="MD5 & SHA Hash Generator" slug="md5-hash-generator" desc="Compute MD5, SHA-1, SHA-256, and SHA-512 hashes from text or file input." icon={Fingerprint} />
          <ToolCard name="Hash Password Generator" slug="hash-password-generator" desc="Generate password hashes using PBKDF2-SHA256 with 600,000 iterations." icon={Key} />
          <ToolCard name="HMAC Generator" slug="hmac-generator" desc="Generate HMAC signatures with configurable hash algorithm and secret key." icon={Shield} />
        </div>
      </div>
    </div>
  );
}


