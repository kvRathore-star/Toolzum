import { proSlugs } from "@/registry/tools-constants";
import { getSignedInStatus } from "@/lib/session-state";

export { getSignedInStatus };

const PRO_SLUG_SET = new Set(proSlugs);

const STORAGE_KEYS = {
  count: "th_free_uses",
  fingerprint: "th_fp",
  signedInCount: "th_free_signed",
  resetDate: "th_reset",
};

const ANON_LIMIT = 3;
const SIGNED_IN_EXTRA = 2;
const TOTAL_FREE = ANON_LIMIT + SIGNED_IN_EXTRA;

export function getFingerprint(): string {
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
  categoryCaps?: Record<string, number>;
}

interface ServerCheckResponse {
  allowed: boolean;
  remaining: number;
  plan?: string | null;
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

async function callServerCheck(isProTool: boolean): Promise<ServerCheckResponse | null> {
  if (typeof window === "undefined") return null;
  try {
    const fp = getFingerprint();
    const url = isProTool ? "/api/downloads/check?isPro=1" : "/api/downloads/check";
    const res = await fetch(url, {
      headers: { "x-download-fingerprint": fp },
    });
    if (!res.ok) return null;
    return await res.json() as ServerCheckResponse;
  } catch (e) {
    console.error("[toolzum]", e);
    return null;
  }
}

function getCurrentToolContext(): { toolSlug: string | null; category: string | null } {
  if (typeof window === "undefined") return { toolSlug: null, category: null };
  const parts = window.location.pathname.split("/").filter(Boolean);
  // URL pattern: /{category}/{tool-slug}/ — if this doesn't match, analytics rows will have null toolSlug/category
  if (parts.length >= 2) {
    return { category: parts[0] ?? null, toolSlug: parts[1] ?? null };
  }
  console.warn('[download-analytics] URL does not match /{category}/{tool-slug}/ pattern:', window.location.pathname);
  return { toolSlug: null, category: null };
}

function isCurrentToolPro(): boolean {
  const { toolSlug } = getCurrentToolContext();
  return toolSlug ? PRO_SLUG_SET.has(toolSlug) : false;
}

async function callServerRecord(isProTool: boolean): Promise<boolean> {
  if (typeof window === "undefined") return false;
  try {
    const fp = getFingerprint();
    const { toolSlug, category } = getCurrentToolContext();
    const res = await fetch("/api/downloads/record", {
      method: "POST",
      headers: { "x-download-fingerprint": fp, "Content-Type": "application/json" },
      body: JSON.stringify({ toolSlug, category, isPro: isProTool }),
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

  const isProTool = isCurrentToolPro();

  // 0. Check plan limits from server (defensive: block if server unreachable)
  const plan = await callPlanCheck();
  if (!plan) {
    console.warn("[toolzum] Plan server unreachable — blocking download to stay safe");
    try { window.dispatchEvent(new CustomEvent("toolzum:download-unavailable")); } catch {}
    return false;
  }
  if (options?.fileSizeMB) {
    // Generous category ceilings (Oct 2026): the effective cap is per file
    // type, same for anon and signed-in. Pro keeps the plan ceiling (2GB).
    // Server ships the table; the local copy is fallback for stale responses.
    const { category } = getCurrentToolContext();
    const table = plan.categoryCaps;
    const catKey = (category || "").toLowerCase();
    const catCap = table && typeof table[catKey] === "number" ? table[catKey] as number : null;
    const cap = plan.plan === "pro" ? plan.maxFileSizeMB : catCap ?? plan.maxFileSizeMB;
    if (options.fileSizeMB > cap) {
      try { window.dispatchEvent(new CustomEvent("toolzum:plan-limit", { detail: { reason: "file_size", limit: cap, actual: options.fileSizeMB } })); } catch {}
      return false;
    }
  }
  if (options?.batchSize && options.batchSize > plan.maxBatchSize) {
    try { window.dispatchEvent(new CustomEvent("toolzum:plan-limit", { detail: { reason: "batch_size", limit: plan.maxBatchSize, actual: options.batchSize } })); } catch {}
    return false;
  }

  // 1. Server-side quota check. null = unreachable (not quota) — honest copy.
  const server = await callServerCheck(isProTool);
  if (!server) {
    try {
      window.dispatchEvent(new CustomEvent("toolzum:download-unavailable"));
    } catch (e) {
      console.error("[toolzum]", e);
    }
    return false;
  }
  if (!server.allowed) {
    // Pro tool + anonymous session: the server rejected the download. The
    // old client-side pre-gate (getSignedInStatus cookie sniffing) blocked
    // EVERYONE here — including signed-in Pro users. The server has the
    // httpOnly cookie, so its verdict is authoritative.
    if (isProTool && (server.plan === "anon" || server.plan === null || server.plan === undefined)) {
      try {
        window.dispatchEvent(new CustomEvent("toolzum:plan-limit", { detail: { reason: "pro_tool_anon", limit: 0, actual: 1 } }));
      } catch (e) {
        console.error("[toolzum]", e);
      }
      return false;
    }
    try {
      window.dispatchEvent(new CustomEvent("toolzum:download-blocked"));
    } catch (e) {
      console.error("[toolzum]", e);
    }
    return false;
  }

  // 2. Record on server (blocking — must succeed to authorise).
  // A failed record is a service problem, not quota exhaustion.
  const serverRecorded = await callServerRecord(isProTool);
  if (!serverRecorded) {
    console.warn("[toolzum] Server-side download record failed — rejecting to stay safe");
    try { window.dispatchEvent(new CustomEvent("toolzum:download-unavailable")); } catch {}
    return false;
  }

  // 3. Record locally (mirror)
  incrementDownloadCount();

  try {
    window.dispatchEvent(new CustomEvent("toolzum:download-completed"));
    localStorage.setItem("th_last_download", Date.now().toString());
  } catch (e) {
    console.error("[toolzum]", e);
  }
  return true;
}

/** Largest blob size in MB (per-file plan semantics — pass the biggest file, not the sum). */
export function maxBlobMB(blobs: { size: number }[]): number | undefined {
  if (blobs.length === 0) return undefined;
  return Math.max(...blobs.map((b) => b.size)) / (1024 * 1024);
}

/**
 * Per-batch quota gate (Option C): one batch download = one quota unit.
 * Call ONCE before generating any anchors/saving anything. Returns false
 * when blocked — the limit modal is shown automatically via the
 * `toolzum:plan-limit` / `toolzum:download-blocked` events, so callers
 * should simply abort (no extra toast needed).
 */
export async function gateBatchDownload(inputCount: number, maxFileMB?: number): Promise<boolean> {
  if (typeof window === "undefined") return true;
  return checkAndRecordDownload({ batchSize: inputCount, fileSizeMB: maxFileMB });
}
