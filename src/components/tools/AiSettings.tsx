"use client";

import Link from "next/link";
import { useFlag } from "@/hooks/useFlag";

export default function AiSettings() {
  // #49: server 503s when killed — reflect it so users don't burn attempts.
  const aiEnabled = useFlag("ai_generation");
  if (!aiEnabled) {
    return (
      <div className="flex items-start gap-3 p-4 rounded-[var(--radius-xl)] bg-amber-500/10 border border-amber-500/20 mb-6">
        <svg className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z" />
        </svg>
        <div className="text-sm text-amber-600 dark:text-amber-400">
          <p className="font-medium mb-0.5">AI features temporarily disabled</p>
          <p className="text-amber-700 dark:text-amber-400/80 text-xs leading-relaxed">
            Our AI provider is paused for maintenance. Local tools are unaffected.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 p-4 rounded-[var(--radius-xl)] bg-blue-500/10 border border-blue-500/20 mb-6">
      <svg className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <div className="text-sm text-blue-600 dark:text-blue-400">
        <p className="font-medium mb-0.5">AI-Powered</p>
        <p className="text-blue-700 dark:text-blue-400/80 dark:text-blue-400/80 text-xs leading-relaxed">
          AI features are server-powered — no API key needed. Your data is processed securely.
           {" "}<Link href="/privacy-policy" className="underline hover:no-underline">Privacy policy</Link>
        </p>
      </div>
    </div>
  );
}
