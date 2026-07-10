"use client";

export default function PromptLibraryGenerator() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-indigo-500/10 flex items-center justify-center mb-6">
        <svg className="w-10 h-10 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Prompt Library</h2>
      <p className="text-zinc-400 max-w-md mb-8">
        A curated library of engineering-grade prompts requires server-side hosting for prompt templates and is not available in the current offline-first deployment.
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-400 text-sm">
        <span className="w-2 h-2 rounded-full bg-amber-400" />
        Coming Soon
      </div>
    </div>
  );
}
