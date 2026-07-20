'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="flex items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950">
        <div className="text-center px-6">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-4">Something went wrong</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
            An unexpected error occurred. Please try again.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
