import { trackError } from "./telemetry";

const CACHE_PREFIX = "th_cache_";
const MAX_CACHE_ITEMS = 20;

function getCacheKey(input: string, toolSlug: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const chr = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return `${CACHE_PREFIX}${toolSlug}_${hash.toString(36)}`;
}

export function getCachedOutput(input: string, toolSlug: string): string | null {
  try {
    const key = getCacheKey(input, toolSlug);
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const { data, expiry } = JSON.parse(stored);
    if (expiry && Date.now() > expiry) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch (e) {
    console.error("[toolhub]", e);
    trackError(e instanceof Error ? e : new Error(String(e)), "toolcache_get");
    return null;
  }
}

export function setCachedOutput(input: string, toolSlug: string, data: string, ttlMinutes = 60) {
  try {
    const key = getCacheKey(input, toolSlug);
    const payload = JSON.stringify({
      data,
      expiry: Date.now() + ttlMinutes * 60 * 1000,
    });
    localStorage.setItem(key, payload);

    // Evict old entries if over limit
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(CACHE_PREFIX)) keys.push(k);
    }
    if (keys.length > MAX_CACHE_ITEMS) {
      const toRemove = keys.slice(0, keys.length - MAX_CACHE_ITEMS);
      toRemove.forEach(k => localStorage.removeItem(k));
    }
  } catch (e) {
    console.error("[toolhub]", e);
    trackError(e instanceof Error ? e : new Error(String(e)), "toolcache_set");
  }
}
