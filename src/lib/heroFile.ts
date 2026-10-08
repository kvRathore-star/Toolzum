import { useEffect, useRef } from 'react';

/**
 * heroFile.ts — carries the homepage drop into the destination tool.
 *
 * The hero box stashes the File in IndexedDB (same browser, never uploaded)
 * and navigates. The destination's FileUploader consumes it on mount and runs
 * it through its own accept/size guards. Single key + 5-minute TTL +
 * consume-once: a stale file can never surprise a later visit.
 * Every function is total — IDB missing or denied degrades to plain routing.
 */

const DB_NAME = 'toolzum-hero';
const STORE = 'files';
const KEY = 'current';
const TTL_MS = 5 * 60 * 1000;

interface HeroRecord {
  blob: Blob;
  name: string;
  type: string;
  at: number;
}

interface HeroPayload {
  items: HeroRecord[];
  at: number;
}

// Carry caps: IndexedDB handles blobs well on desktop, but Safari/iOS and
// private mode choke on hundreds of megabytes. Desktop Chrome/Firefox take
// far more — the cap protects the weakest path, not the strongest.
const MAX_CARRY_FILES = 100;
const MAX_CARRY_BYTES = 300 * 1024 * 1024;
const MAX_SINGLE_BYTES = 2 * 1024 * 1024 * 1024;

function openDb(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    try {
      if (typeof indexedDB === 'undefined') return resolve(null);
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function stashHeroFile(file: File): Promise<boolean> {
  return (await stashHeroFiles([file])) > 0;
}

export async function stashHeroFiles(files: File[]): Promise<number> {
  try {
    // First-N under a total budget: the rest travel light (bulk tools take
    // folders themselves). Order preserved so the lead files ride.
    const items: HeroRecord[] = [];
    let total = 0;
    for (const f of files) {
      if (items.length >= MAX_CARRY_FILES) break;
      if (f.size <= 0 || f.size > MAX_SINGLE_BYTES) continue;
      if (total + f.size > MAX_CARRY_BYTES) break;
      total += f.size;
      items.push({ blob: f, name: f.name, type: f.type, at: Date.now() });
    }
    if (items.length === 0) return 0;
    const db = await openDb();
    if (!db) return 0;
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE).put({ items, at: Date.now() } as HeroPayload, KEY);
    });
    db.close();
    return items.length;
  } catch {
    return 0;
  }
}

export async function consumeHeroFile(): Promise<File | null> {
  const files = await consumeHeroFiles();
  return files[0] ?? null;
}

export async function consumeHeroFiles(): Promise<File[]> {  try {
    const db = await openDb();
    if (!db) return [];
    const payload = await new Promise<HeroPayload | HeroRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const get = store.get(KEY);
      get.onsuccess = () => {
        const val = get.result as HeroPayload | HeroRecord | undefined;
        // Consume-once: delete on read regardless of freshness.
        store.delete(KEY);
        resolve(val);
      };
      get.onerror = () => reject(get.error);
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    if (!payload || Date.now() - payload.at > TTL_MS) return [];
    // Back-compat with the single-file shape written before arrays.
    const items = 'items' in payload && Array.isArray(payload.items)
      ? payload.items
      : 'blob' in payload && payload.blob
        ? [{ blob: payload.blob, name: payload.name, type: payload.type } as HeroRecord]
        : [];
    return items.map((r) => new File([r.blob], r.name, { type: r.type }));
  } catch {
    return [];
  }
}

/**
 * Active expiry sweep. TTL is otherwise checked lazily on consume — but an
 * abandoned carry (tab closed, user walked away) would sit in IndexedDB
 * until something reads the key. Call on page mount (the homepage box does)
 * so stale files — scans, IDs, contracts — can never linger.
 */
export async function sweepHeroFiles(): Promise<void> {
  try {
    const db = await openDb();
    if (!db) return;
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const get = store.get(KEY);
      get.onsuccess = () => {
        const val = get.result as HeroPayload | undefined;
        if (val && Date.now() - val.at > TTL_MS) store.delete(KEY);
        resolve();
      };
      get.onerror = () => resolve();
      tx.onerror = () => resolve();
    });
    db.close();
  } catch {
    // Sweep is hygiene, never load-bearing.
  }
}

/**
 * Shared one-shot pickup for destination uploaders. Replaces a dozen
 * hand-written consume effects with one shape: mount → consume → deliver
 * through the tool's own intake. Guards (accept/size) stay in the intake.
 */
export function useHeroFilePickup(onFiles: (files: File[]) => void): void {
  const claimed = useRef(false);
  const handlerRef = useRef(onFiles);
  handlerRef.current = onFiles;
  useEffect(() => {
    if (claimed.current) return;
    claimed.current = true;
    consumeHeroFiles().then((incoming) => {
      if (incoming.length > 0) handlerRef.current(incoming);
    }).catch(() => {});
  }, []);
}
