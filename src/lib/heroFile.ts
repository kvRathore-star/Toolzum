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
  try {
    const db = await openDb();
    if (!db) return false;
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.objectStore(STORE).put(
        { blob: file, name: file.name, type: file.type, at: Date.now() } as HeroRecord,
        KEY,
      );
    });
    db.close();
    return true;
  } catch {
    return false;
  }
}

export async function consumeHeroFile(): Promise<File | null> {
  try {
    const db = await openDb();
    if (!db) return null;
    const rec = await new Promise<HeroRecord | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const get = store.get(KEY);
      get.onsuccess = () => {
        const val = get.result as HeroRecord | undefined;
        // Consume-once: delete on read regardless of freshness.
        store.delete(KEY);
        resolve(val);
      };
      get.onerror = () => reject(get.error);
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    if (!rec || Date.now() - rec.at > TTL_MS) return null;
    return new File([rec.blob], rec.name, { type: rec.type });
  } catch {
    return null;
  }
}
