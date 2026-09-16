"use client";

import { useState } from "react";
import { CONSENT_KEY } from "@/lib/consent";

/**
 * Lets visitors revisit their banner choice after it was dismissed.
 * Clears the stored consent value and reloads so the banner shows again.
 */
export function CookieResetButton() {
  const [done, setDone] = useState(false);

  const reset = () => {
    try {
      window.localStorage.removeItem(CONSENT_KEY);
    } catch {
      /* noop */
    }
    setDone(true);
    window.setTimeout(() => window.location.reload(), 600);
  };

  return (
    <div className="pt-2">
      <button
        type="button"
        onClick={reset}
        className="px-4 py-2 text-xs font-medium text-[var(--text-primary)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] hover:bg-[var(--bg-overlay)] transition-all cursor-pointer"
      >
        {done ? "Preference cleared — reloading…" : "Reset cookie preference"}
      </button>
      <p className="text-xs text-[var(--text-muted)] mt-2">
        Clears your stored choice and shows the consent banner again on reload.
      </p>
    </div>
  );
}
