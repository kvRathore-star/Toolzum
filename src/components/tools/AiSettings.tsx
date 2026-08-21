"use client";

import Link from "next/link";

export default function AiSettings() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-[var(--radius-xl)] bg-blue-500/10 border border-blue-500/20 mb-6">
      <svg className="w-5 h-5 text-blue-700 dark:text-blue-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
      <div className="text-sm text-blue-600 dark:text-blue-400">
        <p className="font-medium mb-0.5">Powered by Google Gemini</p>
        <p className="text-blue-700 dark:text-blue-400/80 dark:text-blue-400/80 text-xs leading-relaxed">
          AI features are free and server-powered — no API key needed. Your data is sent to our server for processing with Gemini.
           {" "}<Link href="/privacy-policy" className="underline hover:no-underline">Privacy policy</Link>
        </p>
      </div>
    </div>
  );
}
