"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

const MESSAGES: Record<string, { title: string; body: string }> = {
  state_mismatch: {
    title: "Login session expired",
    body: "Your sign-in attempt timed out or was interrupted (often from clicking the button twice or switching tabs mid-login). Please try again — one click, then complete the Google step.",
  },
  account_not_linked: {
    title: "Couldn't connect this login",
    body: "This email is already registered with a different sign-in method. Sign in with your original method first, then connect Google from your account page.",
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get("error") ?? "unknown";
  const known = MESSAGES[code] ?? {
    title: "Something went wrong",
    body: "The sign-in attempt didn't complete. Please try again.",
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)] flex items-center justify-center">
      <div className="relative z-10 w-full max-w-[420px] px-4">
        <div
          className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-8 sm:p-10 text-center"
          style={{ borderRadius: "var(--radius-xl)" }}
        >
          <div
            className="inline-flex items-center justify-center w-12 h-12 bg-[var(--warning)]/10 mb-5"
            style={{ borderRadius: "var(--radius-lg)" }}
          >
            <TriangleAlert className="w-5 h-5 text-[var(--warning)]" />
          </div>
          <h1 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl tracking-tight mb-2">
            {known.title}
          </h1>
          <p className="text-[var(--text-secondary)] text-sm mb-2">{known.body}</p>
          <p className="text-[var(--text-muted)] text-xs font-mono mb-8">CODE: {code}</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/login/"
              className="w-full flex items-center justify-center gap-2 h-11 text-sm font-medium text-white bg-[var(--accent-ink)] hover:bg-[var(--accent-hover)] transition-colors"
              style={{ borderRadius: "var(--radius-md)" }}
            >
              Try again
            </Link>
            <Link
              href="/"
              className="w-full flex items-center justify-center h-11 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="text-center text-sm text-[var(--text-muted)]">Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
