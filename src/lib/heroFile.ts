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

// Carry caps: IDB handles blobs well, but a 500-file Pro batch must never
// ride the homepage — the bulk tools take folders themselves.
const MAX_CARRY_FILES = 25;
const MAX_CARRY_BYTES = 2 * 1024 * 1024 * 1024;

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
  return stashHeroFiles([file]);
}

export async function stashHeroFiles(files: File[]): Promise<boolean> {
  try {
    const items: HeroRecord[] = files
      .filter((f) => f.size > 0 && f.size <= MAX_CARRY_BYTES)
      .slice(0, MAX_CARRY_FILES)
      .map((f) => ({ blob: f, name: f.name, type: f.type, at: Date.now() }));
    if (items.length === 0) return false;
    const db = await openDb();
    if (!db) return false;
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE).put({ items, at: Date.now() } as HeroPayload, KEY);
    });
    db.close();
    return true;
  } catch {
    return false;
  }
}

export async function consumeHeroFile(): Promise<File | null> {
  const files = await consumeHeroFiles();
  return files[0] ?? null;
}

export async function consumeHeroFiles(): Promise<File[]> {
  try {
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
