"use client";

export default function BrowserExtension() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Browser Extension</h2>
      <p className="text-zinc-400 max-w-md mb-8">
        The ToolHub browser extension is currently in development. It will bring our tools directly into your browser for quick access on any webpage.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        In Development
      </div>
    </div>
  );
}
