"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AnimatePresence, MotionDiv } from "@/components/LazyMotion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSignedInStatus, AUTH_CHANGED_EVENT } from "@/lib/session-state";

export function PostDownloadBar() {
  const [show, setShow] = useState(false);
  // Signed-in visitors never need a "sign in" prompt (Sep 2026 bug: the bar
  // used to show "Sign In Free" to Pro admins because it had no session check).
  // Lazy init: mounted ssr:false, so this reads the resolved session state.
  const [signedIn, setSignedIn] = useState(() => getSignedInStatus());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handler = () => {
      setShow(true);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setShow(false), 8000);
    };
    const onAuth = () => setSignedIn(getSignedInStatus());

    window.addEventListener("toolzum:download-completed", handler);
    window.addEventListener(AUTH_CHANGED_EVENT, onAuth);
    return () => {
      window.removeEventListener("toolzum:download-completed", handler);
      window.removeEventListener(AUTH_CHANGED_EVENT, onAuth);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <AnimatePresence>
      {show && !signedIn && (
        <MotionDiv
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[90vw] max-w-lg"
        >
          <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-xl)] shadow-xl p-4 flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[var(--text-primary)] font-medium">
                Loved the tool?
              </p>
              <p className="text-xs text-[var(--text-secondary)]">
                Get <strong className="text-[var(--accent)]">3 more free downloads</strong> when you sign in.
              </p>
            </div>
            <Link href="/sign-in">
              <Button variant="primary" size="sm" className="whitespace-nowrap">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                Sign In Free
              </Button>
            </Link>
            <button
              onClick={() => setShow(false)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              aria-label="Dismiss sign-in prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </MotionDiv>
      )}
    </AnimatePresence>
  );
}
