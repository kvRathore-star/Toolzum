/**
 * Single source of truth for the GDPR consent choice.
 *
 * The banner in GdprConsentBanner writes the choice; telemetry senders
 * (PostHogProvider, AnalyticsProvider, CommandMenu miss-log) read it.
 * "declined" must actually disable non-essential collection — see #26.
 */

export const CONSENT_KEY = "th_gdpr_consent";

export type ConsentChoice = "accepted" | "declined";

/** Stored choice, or null when the visitor hasn't chosen yet. */
export function getConsent(): ConsentChoice | null {
  try {
    const stored = window.localStorage.getItem(CONSENT_KEY);
    return stored === "accepted" || stored === "declined" ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Whether non-essential telemetry (PostHog, first-party /api/analytics)
 * may be collected. Everything except an explicit "declined" collects —
 * this preserves current behavior for visitors who never saw the banner
 * (e.g. set before this gate existed) while making Decline real.
 */
export function mayCollectTelemetry(): boolean {
  return getConsent() !== "declined";
}

/** Clears the stored choice so the banner shows again. */
export function resetConsent(): void {
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* noop */
  }
}

const CHANGE_EVENT = "toolzum:consent";

/**
 * Stores a choice and notifies live telemetry senders in the same tab
 * (same-tab setItem fires no storage event, and providers mount before
 * the visitor chooses — without this, Decline would only take effect
 * after a reload or navigation).
 */
export function setConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* noop */
  }
  window.dispatchEvent(new CustomEvent<ConsentChoice>(CHANGE_EVENT, { detail: choice }));
}

/** Subscribe to choice changes; returns an unsubscribe function. */
export function onConsentChange(fn: (choice: ConsentChoice | null) => void): () => void {
  const handler = () => fn(getConsent());
  window.addEventListener(CHANGE_EVENT, handler);
  return () => window.removeEventListener(CHANGE_EVENT, handler);
}
