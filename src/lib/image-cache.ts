// IndexedDB-backed cache for generated dish images.
// Key = normalized "dish|cuisine". Value = data URL string.

const DB_NAME = "menuvision";
const STORE = "dish-images";
const VERSION = 1;

function openDb(): Promise<IDBDatabase | null> {
  if (typeof indexedDB === "undefined") return Promise.resolve(null);
  return new Promise((resolve) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
}

export function dishKey(dish: string, cuisine?: string): string {
  return `${dish.trim().toLowerCase()}|${(cuisine ?? "").trim().toLowerCase()}`;
}

export async function getCachedImage(key: string): Promise<string | null> {
  const db = await openDb();
  if (!db) return null;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as string | undefined) ?? null);
    req.onerror = () => resolve(null);
  });
}

export async function setCachedImage(key: string, dataUrl: string): Promise<void> {
  const db = await openDb();
  if (!db) return;
  return new Promise((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(dataUrl, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}
