/**
 * Degraded-network UX (#45). Network failures surface as bare TypeErrors
 * ("Failed to fetch", "Load failed", "NetworkError") that read as app
 * bugs. When the browser reports offline, say so explicitly and offer
 * the retry path — never auto-retry credit-spending calls.
 */

export function isOffline(): boolean {
  if (typeof navigator === "undefined") return false;
  try {
    return navigator.onLine === false;
  } catch {
    return false;
  }
}

const NETWORK_SIGNATURES = [
  "failed to fetch",
  "load failed",
  "networkerror",
  "network error",
  "network request failed",
  "offline",
];

function extractMessage(e: unknown): string | null {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  if (
    e &&
    typeof e === "object" &&
    "message" in e &&
    typeof (e as Record<string, unknown>).message === "string"
  ) {
    return (e as Record<string, string>).message!;
  }
  return null;
}

/**
 * User-facing message for a failed request. Offline + network-shaped
 * error => explicit offline copy; everything else passes through
 * untouched (server 4xx/5xx copy must stay verbatim).
 */
export function toUserError(e: unknown, fallback = "An error occurred"): string {
  if (e === null || e === undefined) return fallback;
  const message = extractMessage(e);
  if (message) {
    const lowered = message.toLowerCase();
    if (isOffline() && NETWORK_SIGNATURES.some((s) => lowered.includes(s))) {
      return "You're offline. Reconnect and try again.";
    }
    return message;
  }
  try {
    const json = JSON.stringify(e);
    return typeof json === "string" ? json : fallback;
  } catch {
    return fallback;
  }
}
