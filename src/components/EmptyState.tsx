"use client";

import React from "react";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}

/**
 * Generic empty state: icon + title + optional message + optional CTA.
 * Themed via CSS vars; keeps empty/zero-data UI consistent across tools
 * instead of each tool inventing its own layout.
 */
export function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12 px-6">
      {icon && <div className="mb-4 text-[var(--text-muted)]">{icon}</div>}
      <p className="text-sm font-semibold text-[var(--text-primary)]">{title}</p>
      {message && (
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-[var(--text-secondary)]">{message}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
