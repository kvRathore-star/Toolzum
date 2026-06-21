const STORAGE_KEYS = {
  count: "th_free_uses",
  fingerprint: "th_fp",
  signedInCount: "th_free_signed",
  resetDate: "th_reset",
};

const ANON_LIMIT = 2;
const SIGNED_IN_EXTRA = 3;
const TOTAL_FREE = ANON_LIMIT + SIGNED_IN_EXTRA;

function getFingerprint(): string {
  if (typeof window === "undefined") return "ssr";
  const raw = [
    navigator.userAgent,
    screen.width,
    screen.height,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    const chr = raw.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(36);
}

function getResetMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}`;
}

function isNewMonth(stored: string | null): boolean {
  return stored !== getResetMonth();
}

function readCount(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const v = localStorage.getItem(key);
    return v ? parseInt(v, 10) || 0 : 0;
  } catch (e) {
    console.error("[toolhub]", e);
    return 0;
  }
}

function writeCount(key: string, value: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    console.error("[toolhub]", e);
  }
}

function getSignedInStatus(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const cookies = document.cookie.split("; ");
    for (const c of cookies) {
      if (c.startsWith("better-auth_session_token=") || c.startsWith("next-auth.session-token=")) return true;
    }
    return !!localStorage.getItem("better-auth.session");
  } catch (e) {
    console.error("[toolhub]", e);
    return false;
  }
}

export function getRemainingDownloads(): number {
  if (typeof window === "undefined") return TOTAL_FREE;
  try {
    if (detectTampering()) resetCounts();
    if (isNewMonth(localStorage.getItem(STORAGE_KEYS.resetDate))) resetCounts();

    const isSignedIn = getSignedInStatus();
    const anonUsed = readCount(STORAGE_KEYS.count);
    const signedUsed = readCount(STORAGE_KEYS.signedInCount);
    const totalUsed = isSignedIn ? anonUsed + signedUsed : anonUsed;
    return Math.max(0, TOTAL_FREE - totalUsed);
  } catch (e) {
    console.error("[toolhub]", e);
    return 0;
  }
}

function detectTampering(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const fp = localStorage.getItem(STORAGE_KEYS.fingerprint);
    return fp !== null && fp !== getFingerprint();
  } catch (e) {
    console.error("[toolhub]", e);
    return false;
  }
}

function resetCounts() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.resetDate, getResetMonth());
    writeCount(STORAGE_KEYS.count, 0);
    writeCount(STORAGE_KEYS.signedInCount, 0);
    localStorage.setItem(STORAGE_KEYS.fingerprint, getFingerprint());
  } catch (e) {
    console.error("[toolhub]", e);
  }
}

export function incrementDownloadCount(): void {
  if (typeof window === "undefined") return;
  try {
    if (isNewMonth(localStorage.getItem(STORAGE_KEYS.resetDate))) resetCounts();
    if (detectTampering()) resetCounts();

    const isSignedIn = getSignedInStatus();
    const anonUsed = readCount(STORAGE_KEYS.count);
    if (anonUsed < ANON_LIMIT) {
      writeCount(STORAGE_KEYS.count, anonUsed + 1);
    } else if (isSignedIn) {
      const signedUsed = readCount(STORAGE_KEYS.signedInCount);
      if (signedUsed < SIGNED_IN_EXTRA) {
        writeCount(STORAGE_KEYS.signedInCount, signedUsed + 1);
      }
    }

    localStorage.setItem(STORAGE_KEYS.fingerprint, getFingerprint());
  } catch (e) {
    console.error("[toolhub]", e);
  }
}

interface ServerCheckResponse {
  allowed: boolean;
  remaining: number;
}

interface ServerRecordResponse {
  allowed: boolean;
}

async function callServerCheck(): Promise<ServerCheckResponse | null> {
  if (typeof window === "undefined") return null;
  try {
    const fp = getFingerprint();
    const res = await fetch("/api/downloads/check", {
      headers: { "x-download-fingerprint": fp },
    });
    if (!res.ok) return null;
    return await res.json() as ServerCheckResponse;
  } catch (e) {
    console.error("[toolhub]", e);
    return null;
  }
}

async function callServerRecord(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const fp = getFingerprint();
    const res = await fetch("/api/downloads/record", {
      method: "POST",
      headers: { "x-download-fingerprint": fp },
    });
    if (!res.ok) return false;
    const data = await res.json() as ServerRecordResponse;
    return data.allowed === true;
  } catch (e) {
    console.error("[toolhub]", e);
    return false;
  }
}

export async function checkAndRecordDownload(): Promise<boolean> {
  if (typeof window === "undefined") return true;
  // 1. Fast path: client-side check
  const remaining = getRemainingDownloads();
  if (remaining <= 0) {
    try {
      window.dispatchEvent(new CustomEvent("toolhub:download-blocked"));
    } catch (e) {
      console.error("[toolhub]", e);
    }
    return false;
  }

  // 2. Server-side authoritative check (optional — non-blocking)
  const server = await callServerCheck();
  if (server !== null && !server.allowed) {
    try {
      window.dispatchEvent(new CustomEvent("toolhub:download-blocked"));
    } catch (e) {
      console.error("[toolhub]", e);
    }
    return false;
  }

  // 3. Record locally
  incrementDownloadCount();

  // 4. Record on server (fire-and-forget — server rejection after download won't block)
  callServerRecord();

  try {
    window.dispatchEvent(new CustomEvent("toolhub:download-completed"));
    localStorage.setItem("th_last_download", Date.now().toString());
  } catch (e) {
    console.error("[toolhub]", e);
  }
  return true;
}
