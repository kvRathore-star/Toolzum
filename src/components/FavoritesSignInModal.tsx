"use client";

import React from "react";
import Link from "next/link";
import { Star, X } from "lucide-react";

export function FavoritesSignInModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[var(--bg-overlay)] border border-[var(--border-subtle)] rounded-[var(--radius-2xl)] p-6 sm:p-8 max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-end">
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
            <Star className="w-6 h-6 text-amber-500" />
          </div>

          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Save your favorite tools
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6 max-w-xs">
            Sign in to save tools you use often and access them instantly from your homepage.
          </p>

          <Link
            href="/login"
            className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold rounded-[var(--radius-lg)] transition-all text-sm"
          >
            Sign in to save favorites
          </Link>

          <button
            onClick={onClose}
            className="w-full text-center text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] underline mt-4"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
