"use client";

import React, { useState } from 'react';

export default function BrowserExtension() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail('');
  };

  const features = [
    { icon: '⚡', title: 'Quick Access', desc: 'Right-click any text on any webpage to instantly process it with Toolzum tools.' },
    { icon: '🔒', title: 'Privacy First', desc: 'All processing happens locally in your browser. No data leaves your device.' },
    { icon: '🎨', title: 'Floating Panel', desc: 'Use tools in a side panel without leaving your current tab.' },
    { icon: '📋', title: 'Clipboard Integration', desc: 'One-click copy results back to your clipboard for seamless workflow.' },
    { icon: '🌙', title: 'Dark Mode', desc: 'Automatically matches your browser theme for a native feel.' },
    { icon: '⌨️', title: 'Keyboard Shortcuts', desc: 'Launch any tool with customizable keyboard shortcuts.' },
  ];

  const browsers = [
    { name: 'Chrome', status: 'Coming Soon', icon: '🟢' },
    { name: 'Firefox', status: 'Planned', icon: '🦊' },
    { name: 'Edge', status: 'Planned', icon: '🔵' },
    { name: 'Safari', status: 'Planned', icon: '🧭' },
  ];

  const useCases = [
    { title: 'Developers', desc: 'Quickly encode/decode Base64, generate UUIDs, test regex, or format JSON without switching tabs.' },
    { title: 'Writers', desc: 'Check word count, readability score, or convert markdown while writing in any editor.' },
    { title: 'Designers', desc: 'Convert colors between formats, generate CSS gradients, or check contrast ratios on the fly.' },
    { title: 'Data Analysts', desc: 'Transform CSV data, validate JSON, or convert data formats directly from spreadsheets.' },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-[var(--text-primary)]">Browser Extension</h2>
        <p className="text-[var(--text-secondary)] max-w-2xl mx-auto text-lg">
          Access 100+ developer tools directly from your browser. Right-click, process, done.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <div key={f.title} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-2">
            <div className="text-2xl">{f.icon}</div>
            <h3 className="font-bold text-[var(--text-primary)]">{f.title}</h3>
            <p className="text-sm text-[var(--text-secondary)]">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Use Cases */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-[var(--text-primary)] text-center">Built for Everyone</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {useCases.map((u) => (
            <div key={u.title} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4">
              <h4 className="font-bold text-[var(--text-primary)] mb-1">{u.title}</h4>
              <p className="text-sm text-[var(--text-secondary)]">{u.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Supported Browsers */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-[var(--text-primary)] text-center">Supported Browsers</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {browsers.map((b) => (
            <div key={b.name} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="font-medium text-[var(--text-primary)] text-sm">{b.name}</div>
              <div className="text-xs text-amber-600 dark:text-amber-400">{b.status}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Email Signup */}
      <div className="bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-200 dark:border-indigo-800/30 rounded-2xl p-6 text-center space-y-4">
        <h3 className="text-xl font-bold text-[var(--text-primary)]">Get Early Access</h3>
        <p className="text-sm text-[var(--text-secondary)]">Be the first to know when we launch. No spam, ever.</p>
        {submitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 max-w-sm mx-auto">
            <p className="text-emerald-700 dark:text-emerald-400 font-semibold">You're on the list!</p>
            <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80">We'll notify you when the extension launches.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="flex-1 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus:border-indigo-500"
            />
            <button type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20">
              Notify Me
            </button>
          </form>
        )}
      </div>

      {/* How it Works */}
      <div className="space-y-3">
        <h3 className="text-xl font-bold text-[var(--text-primary)] text-center">How It Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { step: '1', title: 'Install', desc: 'Add the extension from Chrome Web Store (coming soon).' },
            { step: '2', title: 'Select Text', desc: 'Highlight any text on any webpage.' },
            { step: '3', title: 'Right-Click', desc: 'Choose a Toolzum tool from the context menu.' },
          ].map((s) => (
            <div key={s.step} className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center mx-auto">{s.step}</div>
              <h4 className="font-bold text-[var(--text-primary)]">{s.title}</h4>
              <p className="text-sm text-[var(--text-secondary)]">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
