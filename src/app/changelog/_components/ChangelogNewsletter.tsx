"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ChangelogNewsletter() {
  return (
    <div className="mt-24 max-w-4xl mx-auto bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-8 sm:p-12 text-center relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent-ink)]/5 rounded-full blur-[80px]" />
      <h3 className="font-[family-name:var(--font-serif)] text-2xl sm:text-3xl font-semibold mb-3">Never miss a tool update</h3>
      <p className="text-[var(--text-secondary)] text-sm max-w-lg mx-auto mb-6">
        We ship new offline tools every week. Get release summaries straight to your inbox.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
        <input
          type="email"
          placeholder="name@email.com"
          className="flex-1 bg-[var(--bg-base)] text-sm border border-[var(--border-subtle)] rounded-[var(--radius-md)] px-4 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
        />
        <Button className="shrink-0 gap-2 bg-[var(--accent)] text-white hover:opacity-90 transition-opacity">Subscribe <ArrowRight className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
