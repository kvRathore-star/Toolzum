"use client";

import React from 'react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { ErrorMessage } from '@/components/ErrorMessage';
import { classifyError } from '@/lib/errorMessages';

function FallbackComponent({ error, resetErrorBoundary }: FallbackProps) {
  const friendly = classifyError(error);
  const errorName = error instanceof Error ? error.name : "UnknownError";

  return (
    <ErrorMessage
      title={friendly.title}
      message={friendly.message}
      detail={errorName}
      onRetry={resetErrorBoundary}
      retryLabel="Reset Tool & Try Again"
      copyText={`[${errorName}] ${friendly.message}`}
      debugText={error instanceof Error ? `${error.name}: ${error.message}\n\n${error.stack || ""}` : String(error)}
      hint="Try refreshing the page or clearing your browser cache. If the issue persists, contact support."
    />
  );
}

export function GlobalErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary FallbackComponent={FallbackComponent}>
      {children}
    </ErrorBoundary>
  );
}
