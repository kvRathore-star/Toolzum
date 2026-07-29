"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ComingSoonTool({ toolName }: { toolName: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setSubmitted(true);
    setEmail('');
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="mb-6 relative">
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
        <div className="relative w-24 h-24 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-3xl flex items-center justify-center shadow-2xl">
          <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
      
      <h2 className="text-3xl sm:text-4xl font-bold text-[var(--text-primary)] mb-4 tracking-tight">
        In Development
      </h2>
      
      <p className="text-zinc-600 dark:text-[var(--text-muted)] max-w-md mx-auto mb-10 text-lg leading-relaxed">
        We are currently building the <span className="text-zinc-800 dark:text-zinc-200 font-semibold">{toolName}</span> module. It will be powered entirely by your browser for maximum privacy.
      </p>

      {submitted ? (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 max-w-sm w-full mx-auto backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-center mb-3">
            <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h3 className="text-emerald-400 font-semibold mb-1">You're on the list!</h3>
          <p className="text-emerald-500/80 text-sm">We'll notify you the moment this tool goes live.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md mx-auto">
          <Input 
            type="email" 
            placeholder="Enter your email to get early access"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-[var(--bg-overlay)] border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-zinc-600 flex-1 h-12 rounded-xl focus-visible:ring-blue-500"
          />
          <Button type="submit" className="h-12 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all">
            Notify Me
          </Button>
        </form>
      )}

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-3xl mx-auto w-full border-t border-zinc-200 dark:border-[var(--border-subtle)] pt-12">
        <div>
          <h4 className="text-[var(--text-primary)] font-medium mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span> 100% Client-Side
          </h4>
          <p className="text-sm text-[var(--text-secondary)]">Your files will never leave your device. All processing happens in your browser.</p>
        </div>
        <div>
          <h4 className="text-[var(--text-primary)] font-medium mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Zero Data Retention
          </h4>
          <p className="text-sm text-[var(--text-secondary)]">We don't store your files, logs, or processing history on our servers.</p>
        </div>
        <div>
          <h4 className="text-[var(--text-primary)] font-medium mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span> Lightning Fast
          </h4>
          <p className="text-sm text-[var(--text-secondary)]">Powered by WebAssembly for near-native performance directly on your machine.</p>
        </div>
      </div>
    </div>
  );
}
