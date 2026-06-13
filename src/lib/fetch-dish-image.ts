import { dishKey, getCachedImage, setCachedImage } from "./image-cache";
import { streamDishImage } from "./stream-image";

/**
 * Returns a usable image src for a dish.
 *   1. IndexedDB cache (instant)
 *   2. Real photo via SerpAPI (/api/dish-photo)
 *   3. AI-generated fallback (streamed) via /api/dish-image
 */
export async function fetchDishImage(
  dish: string,
  cuisine: string | undefined,
  onFrame: (src: string, isFinal: boolean) => void,
  signal?: AbortSignal,
): Promise<void> {
  const key = dishKey(dish, cuisine);

  const cached = await getCachedImage(key);
  if (cached) {
    onFrame(cached, true);
    return;
  }
  if (signal?.aborted) return;

  try {
    const res = await fetch("/api/dish-photo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dish, cuisine }),
      signal,
    });
    if (res.ok) {
      const { url } = (await res.json()) as { url: string | null };
      if (url) {
        const ok = await preload(url, signal);
        if (ok) {
          onFrame(url, true);
          setCachedImage(key, url).catch(() => {});
          return;
        }
      }
    }
  } catch {
    // fall through to AI
  }
  if (signal?.aborted) return;

  await streamDishImage(
    { dish, cuisine },
    (dataUrl, isFinal) => {
      onFrame(dataUrl, isFinal);
      if (isFinal) setCachedImage(key, dataUrl).catch(() => {});
    },
    signal,
  );
}

function preload(url: string, signal?: AbortSignal): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    let settled = false;
    const done = (ok: boolean) => {
      if (settled) return;
      settled = true;
      resolve(ok);
    };
    img.onload = () => done(true);
    img.onerror = () => done(false);
    img.referrerPolicy = "no-referrer";
    img.src = url;
    signal?.addEventListener("abort", () => done(false), { once: true });
    setTimeout(() => done(false), 8000);
  });
}
