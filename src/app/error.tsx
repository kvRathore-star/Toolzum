"use client";

import { ErrorMessage } from "@/components/ErrorMessage";
import { classifyError } from "@/lib/errorMessages";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  if (process.env.NODE_ENV === "development") console.error("[page-error]", error.message || error.digest || "Unknown error");
  const friendly = classifyError(error.message || error.digest);
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <ErrorMessage
          title={friendly.title}
          message={friendly.message}
          detail={error.digest ? `digest: ${error.digest}` : undefined}
          onRetry={reset}
          retryLabel="Try again"
        />
      </div>
    </div>
  );
}
