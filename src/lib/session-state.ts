// Single client-side source of truth for "is the user signed in?".
//
// better-auth's session cookie is httpOnly, so it is invisible to
// document.cookie and to localStorage — sniffing either always answers
// "signed out" (the Sep 2026 pro-badge bug). SessionSync (mounted in
// ClientProviders) reads useSession() and publishes the resolved value
// here; every consumer reads getSignedInStatus() / listens for the event.

export const AUTH_CHANGED_EVENT = "toolzum:auth-changed";

let signedIn = false;

export function setSignedIn(value: boolean): void {
  if (signedIn === value) return;
  signedIn = value;
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new CustomEvent(AUTH_CHANGED_EVENT));
    } catch (e) {
      console.error("[toolzum]", e);
    }
  }
}

/** Signed-in until SessionSync proves otherwise — SSR-safe (always false). */
export function getSignedInStatus(): boolean {
  return typeof window === "undefined" ? false : signedIn;
}
