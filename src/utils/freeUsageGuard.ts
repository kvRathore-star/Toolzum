const STORAGE_KEYS = {
  count: "th_free_uses",
  fingerprint: "th_fp",
  signedInCount: "th_free_signed",
  resetDate: "th_reset",
};

const ANON_LIMIT = 3;
const SIGNED_IN_EXTRA = 7;
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

function getResetDay(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

function isNewDay(stored: string | null): boolean {
  return stored !== getResetDay();
}

function readCount(key: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const v = localStorage.getItem(key);
    return v ? parseInt(v, 10) || 0 : 0;
  } catch (e) {
    console.error("[toolzum]", e);
    return 0;
  }
}

function writeCount(key: string, value: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, String(value));
  } catch (e) {
    console.error("[toolzum]", e);
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
    console.error("[toolzum]", e);
    return false;
  }
}

export function getRemainingDownloads(): number {
  if (typeof window === "undefined") return TOTAL_FREE;
  try {
    if (detectTampering()) resetCounts();
    if (isNewDay(localStorage.getItem(STORAGE_KEYS.resetDate))) resetCounts();

    const isSignedIn = getSignedInStatus();
    const anonUsed = readCount(STORAGE_KEYS.count);
    const signedUsed = readCount(STORAGE_KEYS.signedInCount);
    const totalUsed = isSignedIn ? anonUsed + signedUsed : anonUsed;
    return Math.max(0, TOTAL_FREE - totalUsed);
  } catch (e) {
    console.error("[toolzum]", e);
    return 0;
  }
}

function detectTampering(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const fp = localStorage.getItem(STORAGE_KEYS.fingerprint);
    return fp !== null && fp !== getFingerprint();
  } catch (e) {
    console.error("[toolzum]", e);
    return false;
  }
}

function resetCounts() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEYS.resetDate, getResetDay());
    writeCount(STORAGE_KEYS.count, 0);
    writeCount(STORAGE_KEYS.signedInCount, 0);
    localStorage.setItem(STORAGE_KEYS.fingerprint, getFingerprint());
  } catch (e) {
    console.error("[toolzum]", e);
  }
}

export function incrementDownloadCount(): void {
  if (typeof window === "undefined") return;
  try {
    if (isNewDay(localStorage.getItem(STORAGE_KEYS.resetDate))) resetCounts();
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
    console.error("[toolzum]", e);
  }
}

interface PlanLimits {
  plan: string;
  maxFileSizeMB: number;
  maxBatchSize: number;
  threads: number;
}

interface ServerCheckResponse {
  allowed: boolean;
  remaining: number;
}

interface ServerRecordResponse {
  allowed: boolean;
}

async function callPlanCheck(): Promise<PlanLimits | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/api/check-plan");
    if (!res.ok) return null;
    return await res.json() as PlanLimits;
  } catch {
    return null;
  }
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
    console.error("[toolzum]", e);
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
    console.error("[toolzum]", e);
    return false;
  }
}

export async function checkAndRecordDownload(options?: { fileSizeMB?: number; batchSize?: number }): Promise<boolean> {
  if (typeof window === "undefined") return true;

  // 0. Check plan limits from server
  const plan = await callPlanCheck();
  if (plan) {
    if (options?.fileSizeMB && options.fileSizeMB > plan.maxFileSizeMB) {
      try { window.dispatchEvent(new CustomEvent("toolzum:plan-limit", { detail: { reason: "file_size", limit: plan.maxFileSizeMB, actual: options.fileSizeMB } })); } catch {}
      return false;
    }
    if (options?.batchSize && options.batchSize > plan.maxBatchSize) {
      try { window.dispatchEvent(new CustomEvent("toolzum:plan-limit", { detail: { reason: "batch_size", limit: plan.maxBatchSize, actual: options.batchSize } })); } catch {}
      return false;
    }
  }

  // 1. Server-side authoritative check (blocking — must pass)
  const server = await callServerCheck();
  if (server !== null && !server.allowed) {
    try {
      window.dispatchEvent(new CustomEvent("toolzum:download-blocked"));
    } catch (e) {
      console.error("[toolzum]", e);
    }
    return false;
  }

  // 2. Client-side check (soft guard in case server is unreachable)
  const remaining = getRemainingDownloads();
  if (remaining <= 0) {
    try {
      window.dispatchEvent(new CustomEvent("toolzum:download-blocked"));
    } catch (e) {
      console.error("[toolzum]", e);
    }
    return false;
  }

  // 3. Record on server first (blocking — must succeed to authorise)
  const serverRecorded = await callServerRecord();
  if (!serverRecorded) {
    console.warn("[toolzum] Server-side download record failed — rejecting to stay safe");
    return false;
  }

  // 4. Record locally (mirror)
  incrementDownloadCount();

  try {
    window.dispatchEvent(new CustomEvent("toolzum:download-completed"));
    localStorage.setItem("th_last_download", Date.now().toString());
  } catch (e) {
    console.error("[toolzum]", e);
  }
  return true;
}
