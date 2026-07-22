"use client";

export default function TemporaryEmailGenerator() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Temporary Email</h2>
      <p className="text-[var(--text-muted)] max-w-md mb-8">
        This feature requires a server-side email relay service and is not yet available in the current offline-first deployment. It will be available in a future update.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-[var(--text-muted)] text-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        Coming Soon
      </div>
    </div>
  );
}