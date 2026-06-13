import { dishKey, getCachedImage, setCachedImage } from "./image-cache";
import { streamDishImage } from "./stream-image";

// Inline SVG placeholder — a simple utensils glyph on a warm muted background.
// Used when no real photo is found and AI generation isn't allowed.
const PLACEHOLDER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#f4ede3"/>
  <g fill="none" stroke="#c9b89a" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" transform="translate(155 95)">
    <path d="M10 0v50a10 10 0 0 0 10 10h0a10 10 0 0 0 10-10V0"/>
    <path d="M20 60v50"/>
    <path d="M55 0c-8 0-15 14-15 30s7 25 15 25v55"/>
    <path d="M75 0v40a10 10 0 0 1-10 10h0"/>
  </g>
</svg>`;
export const DISH_PLACEHOLDER = `data:image/svg+xml;utf8,${encodeURIComponent(PLACEHOLDER_SVG)}`;

export const MAX_DISH_IMAGES = 5;

/**
 * Returns a usable image src for a dish (single image — kept for back-compat).
 */
export async function fetchDishImage(
  dish: string,
  cuisine: string | undefined,
  onFrame: (src: string, isFinal: boolean) => void,
  signal?: AbortSignal,
  allowAi: boolean = false,
): Promise<void> {
  await fetchDishImages(
    dish,
    cuisine,
    (urls, isFinal) => {
      if (urls.length > 0) onFrame(urls[0], isFinal);
      else if (isFinal) onFrame(DISH_PLACEHOLDER, true);
    },
    signal,
    allowAi,
  );
}

/**
 * Returns up to MAX_DISH_IMAGES image srcs for a dish.
 *   1. IndexedDB cache (instant)
 *   2. Real photos via SerpAPI (/api/dish-photo)
 *   3. AI-generated fallback (streamed, single image) — ONLY when allowAi
 *   4. Static placeholder when AI isn't allowed
 */
export async function fetchDishImages(
  dish: string,
  cuisine: string | undefined,
  onFrame: (urls: string[], isFinal: boolean) => void,
  signal?: AbortSignal,
  allowAi: boolean = false,
): Promise<void> {
  const key = dishKey(dish, cuisine);
  const multiKey = key + "||multi";

  const cachedMulti = await getCachedImage(multiKey);
  if (cachedMulti) {
    try {
      const arr = JSON.parse(cachedMulti) as string[];
      if (Array.isArray(arr) && arr.length > 0) {
        onFrame(arr.slice(0, MAX_DISH_IMAGES), true);
        return;
      }
    } catch {
      // ignore
    }
  }
  // legacy single-image cache fallback
  const cachedSingle = await getCachedImage(key);
  if (cachedSingle) {
    onFrame([cachedSingle], true);
    // continue and try to upgrade to multi in background? skip to keep simple
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
      const { urls } = (await res.json()) as { urls?: string[]; url?: string | null };
      const list = (urls ?? []).slice(0, MAX_DISH_IMAGES);
      if (list.length > 0) {
        // Preload in parallel; keep the ones that load successfully.
        const results = await Promise.all(list.map((u) => preload(u, signal)));
        const good = list.filter((_, i) => results[i]);
        if (good.length > 0) {
          onFrame(good, true);
          setCachedImage(multiKey, JSON.stringify(good)).catch(() => {});
          return;
        }
      }
    }
  } catch {
    // fall through
  }
  if (signal?.aborted) return;

  if (!allowAi) {
    onFrame([DISH_PLACEHOLDER], true);
    return;
  }

  await streamDishImage(
    { dish, cuisine },
    (dataUrl, isFinal) => {
      onFrame([dataUrl], isFinal);
      if (isFinal) {
        setCachedImage(key, dataUrl).catch(() => {});
        setCachedImage(multiKey, JSON.stringify([dataUrl])).catch(() => {});
      }
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
