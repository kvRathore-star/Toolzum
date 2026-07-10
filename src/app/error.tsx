"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV === "development") console.error("[page-error]", error.message || error.digest || "Unknown error");
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <span className="text-red-500 text-3xl font-bold">!</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
          Page error
        </h1>
        <p className="text-[var(--text-secondary)] mb-2 text-sm leading-relaxed">
          Something went wrong loading this page.
        </p>
        <p className="text-[var(--text-muted)] mb-8 text-xs font-mono break-words bg-[var(--bg-overlay)] p-3 rounded-xl">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl font-medium transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
