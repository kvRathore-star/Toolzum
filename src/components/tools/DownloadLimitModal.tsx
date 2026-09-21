"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Crown, Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialogA11y } from "@/components/useDialogA11y";
import { proSlugs } from "@/registry/tools-constants";
import { getSignedInStatus } from "@/utils/freeUsageGuard";

const PRO_SLUG_SET = new Set(proSlugs);

function isCurrentToolPro(): boolean {
  if (typeof window === "undefined") return false;
  const parts = window.location.pathname.split("/").filter(Boolean);
  return parts.length >= 2 ? PRO_SLUG_SET.has(parts[1]!) : false;
}

type PlanLimitReason = "file_size" | "batch_size" | "pro_tool_anon";

interface PlanLimitDetail {
  reason: PlanLimitReason;
  limit: number;
  actual: number;
}

type BlockEvent =
  | { type: "quota"; detail?: undefined }
  | { type: "unavailable"; detail?: undefined }
  | { type: "plan"; detail: PlanLimitDetail };

const reasonCopy: Record<PlanLimitReason, { title: string; body: string }> = {
  file_size: {
    title: "File too large for your plan",
    body: "This file is over your plan's size limit. Upgrade to Pro for up to 2GB uploads.",
  },
  batch_size: {
    title: "Batch too large for your plan",
    body: "This batch is over your plan's file limit. Upgrade to Pro for bulk processing.",
  },
  pro_tool_anon: {
    title: "Sign in to use this Pro tool",
    body: "This is a premium Pro tool. Sign in free to get 2 downloads per day, or upgrade to Pro for unlimited access.",
  },
};

export function DownloadLimitModal() {
  const [event, setEvent] = useState<BlockEvent | null>(null);

  const close = useCallback(() => setEvent(null), []);
  const dialogRef = useDialogA11y<HTMLDivElement>(event !== null, close);

  useEffect(() => {
    const onQuota = () => setEvent({ type: "quota" });
    const onUnavailable = () => setEvent({ type: "unavailable" });
    const onPlan = (e: Event) => {
      const custom = e as CustomEvent<PlanLimitDetail>;
      const detail = custom.detail;
      if (!detail || !detail.reason) return;
      setEvent({ type: "plan", detail });
    };

    window.addEventListener("toolzum:download-blocked", onQuota);
    window.addEventListener("toolzum:download-unavailable", onUnavailable);
    window.addEventListener("toolzum:plan-limit", onPlan);
    return () => {
      window.removeEventListener("toolzum:download-blocked", onQuota);
      window.removeEventListener("toolzum:download-unavailable", onUnavailable);
      window.removeEventListener("toolzum:plan-limit", onPlan);
    };
  }, []);

  if (!event) return null;

  const isQuota = event.type === "quota";
  const isUnavailable = event.type === "unavailable";
  const isProTool = isCurrentToolPro();
  // Signed-in users never need a "sign in" CTA — show upgrade path only.
  const signedIn = getSignedInStatus();
  // Anon quota hit on a free tool is the prime signup moment — name the
  // concrete free-account upside (3→5 downloads, 10 AI credits, 10-file
  // batch, 150MB) instead of a generic "sign in for more".
  const isAnonQuota = isQuota && !isProTool && !signedIn;
  const isAnonPlanLimit = !isQuota && !isUnavailable && !signedIn && (event.type === "plan" && (event.detail.reason === "file_size" || event.detail.reason === "batch_size"));
  const copy = isUnavailable
    ? {
        title: "Downloads temporarily unavailable",
        body: "We couldn't reach the download service. Check your connection and try again — none of your quota was used.",
      }
    : isQuota
    ? isProTool
      ? {
          title: "Pro tool daily limit reached",
          body: "You've used your 2 free downloads on Pro tools today. Upgrade to Pro for unlimited downloads.",
        }
      : !signedIn
        ? {
            title: "You've used your 3 free downloads",
            body: "Sign in free to keep going today — 5 downloads/day, 10 AI credits/month, 10-file batches up to 150MB. No credit card.",
          }
        : {
            title: "Daily download limit reached",
            body: "You've used up your free downloads for today. Sign in for more, or go Pro for unlimited downloads.",
          }
    : !signedIn && event.type === "plan" && event.detail.reason === "file_size"
      ? {
          title: "File too large for guest use (30MB)",
          body: "Sign in free for files up to 150MB, or upgrade to Pro for up to 2GB uploads.",
        }
      : !signedIn && event.type === "plan" && event.detail.reason === "batch_size"
        ? {
            title: "Guests are limited to 1 file at a time",
            body: "Sign in free for batches up to 10 files, or upgrade to Pro for up to 500 files.",
          }
        : reasonCopy[(event as { detail: PlanLimitDetail }).detail.reason];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <button
        aria-label="Close dialog"
        onClick={close}
        tabIndex={-1}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-default"
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="download-limit-title"
        tabIndex={-1}
        className="relative bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 max-w-md w-full shadow-2xl"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Lock className="w-6 h-6 text-amber-500" />
          </div>
          <button onClick={close} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label="Close download limit dialog">
            <X className="w-5 h-5" />
          </button>
        </div>

        <h3 id="download-limit-title" className="text-lg font-bold text-[var(--text-primary)] mb-1">{copy.title}</h3>
        <p className="text-sm text-[var(--text-secondary)] mb-5">{copy.body}</p>

        {(isAnonQuota || isAnonPlanLimit) && (
          <ul className="mb-5 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 text-[13px] text-[var(--text-secondary)] space-y-1.5" aria-label="Free account benefits">
            <li>✓ 5 downloads/day <span className="text-[var(--text-muted)]">(vs 3 as guest)</span></li>
            <li>✓ 10 AI credits/month <span className="text-[var(--text-muted)]">(text 1/use, transcription 1/min)</span></li>
            <li>✓ 10-file batches up to 150MB <span className="text-[var(--text-muted)]">(vs 1 file / 30MB)</span></li>
            <li>✓ 2 Pro-tool downloads/day</li>
          </ul>
        )}

        <div className="space-y-2.5">
          {!isUnavailable && (
            <Link
              href="/pricing"
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-[var(--radius-lg)] transition-all text-sm"
            >
              <Crown className="w-4 h-4" /> Upgrade to Pro — Unlimited
            </Link>
          )}
          {!signedIn && !isUnavailable && (
            <Button
              variant="secondary"
              size="md"
              className="w-full text-sm"
              asChild
            >
              <Link href="/sign-in">{isAnonQuota || isAnonPlanLimit ? "Sign in free — unlock 5/day + 10 credits" : "Sign in free for more"}</Link>
            </Button>
          )}
          <button
            onClick={close}
            className="w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline transition-colors"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
