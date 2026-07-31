"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export interface ToolLayoutProps {
  title: string;
  description: string;
  icon: string;
  category: string;
  children: ReactNode;
  /** Ad slot for future monetization (never tracking-based) */
  adSlot?: ReactNode;
}

export function ToolLayout({
  title,
  description,
  icon,
  category,
  children,
  adSlot,
}: ToolLayoutProps) {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb + Category */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Toolzum
        </Link>
        <span>/</span>
        <span className="capitalize">{category}</span>
        <span>/</span>
        <span className="text-zinc-900 dark:text-zinc-100">{title}</span>
      </nav>

      {/* Tool Header */}
      <div className="mb-8 flex items-start gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-100 text-2xl dark:bg-zinc-800">
          {icon}
        </span>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          <p className="mt-1 text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>

      {/* Main Tool Area */}
      <Card className="mb-8">
        <CardContent className="p-6">{children}</CardContent>
      </Card>

      {/* Privacy Notice */}
      <div className="mb-8 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-900 dark:bg-green-950">
        <p className="text-sm text-green-800 dark:text-green-200">
          <strong>Privacy Guarantee:</strong> All processing happens entirely in
          your browser. Your files are never uploaded to any server.
        </p>
      </div>

      {/* Ad Slot (contextual, non-tracking) */}
      {adSlot && (
        <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-400 dark:border-zinc-700">
          {adSlot}
        </div>
      )}
    </div>
  );
}