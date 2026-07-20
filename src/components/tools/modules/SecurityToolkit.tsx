"use client";
import React from 'react';
import { Shield, Key, Lock, Scan } from 'lucide-react';

const sectionBtn = "inline-flex items-center gap-2 px-3 py-2 text-[11px] font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 cursor-default";

interface HubCard {
  name: string;
  slug: string;
  desc: string;
  icon: React.ElementType;
  path?: string;
}

function ToolCard({ name, slug, desc, icon: Icon, path }: HubCard) {
  const href = path || `/developer/${slug}/`;
  return (
    <a href={href}
      className="group flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md">
      <span className="shrink-0 w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{name}</div>
        <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{desc}</div>
      </div>
    </a>
  );
}

export default function SecurityToolkit() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Security Tools</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-3xl">
          JWT, OAuth, crypto, and SSL tools — all running locally in your browser.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Shield className="w-3.5 h-3.5" /> JWT Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="JWT Debugger" slug="jwt-debugger" desc="Decode, inspect, and debug JWT tokens." icon={Shield} />
          <ToolCard name="JWT Inspector" slug="jwt-inspector" desc="Advanced JWT analysis with claim validation." icon={Shield} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Key className="w-3.5 h-3.5" /> OAuth Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="OAuth PKCE Generator" slug="oauth-pkce-generator" desc="Generate PKCE code_verifier and code_challenge pairs." icon={Key} />
          <ToolCard name="OAuth Client Setup" slug="oauth-client-setup" desc="Generate authorization URLs for major providers." icon={Key} />
          <ToolCard name="PKCE Verifier" slug="pkce-verifier" desc="Verify PKCE verifier/challenge pairs." icon={Key} />
          <ToolCard name="OAuth Scope Builder" slug="oauth-scope-builder" desc="Build and preview OAuth scope strings." icon={Key} />
          <ToolCard name="OAuth State Validator" slug="oauth-state-validator" desc="Validate state parameters for format and age." icon={Key} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Lock className="w-3.5 h-3.5" /> Crypto Tools</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="PBKDF2 Hash Generator" slug="pbkdf2-hash-generator" desc="Generate PBKDF2 hashes with SHA-256." icon={Lock} />
          <ToolCard name="AES Encrypt / Decrypt" slug="aes-encrypt" desc="Encrypt and decrypt data with AES-256-GCM." icon={Lock} />
          <ToolCard name="Content Security Policy Generator" slug="content-security-policy-generator" desc="Build CSP headers with nonce generation." icon={Lock} />
          <ToolCard name="Cookie Parser & Analyzer" slug="cookie-parser" desc="Parse Set-Cookie headers and check security flags." icon={Lock} />
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className={sectionBtn}><Scan className="w-3.5 h-3.5" /> SSL &amp; SAML</span>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <ToolCard name="SSL/TLS Checker" slug="ssl-tls-checker" desc="Inspect SSL certificate chains and protocol support." icon={Scan} />
          <ToolCard name="SAML Decoder" slug="saml-decoder" desc="Decode SAML assertions and extract attributes." icon={Scan} />
        </div>
      </div>
    </div>
  );
}
