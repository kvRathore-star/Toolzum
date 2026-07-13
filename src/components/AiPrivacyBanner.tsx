"use client";

export function AiPrivacyBanner() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-[var(--radius-xl)] bg-amber-500/10 border border-amber-500/20 mb-6">
      <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <div className="text-sm text-amber-600 dark:text-amber-400">
        <p className="font-medium mb-0.5">Data leaves your browser</p>
        <p className="text-amber-500/80 dark:text-amber-400/80 text-xs leading-relaxed">
          This tool sends your content to our server for processing with Google Gemini.{" "}
          <a href="/privacy" className="underline hover:no-underline">Privacy policy</a>
        </p>
      </div>
    </div>
  );
}
