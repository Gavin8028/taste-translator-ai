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

/**
 * Returns a usable image src for a dish.
 *   1. IndexedDB cache (instant)
 *   2. Real photo via SerpAPI (/api/dish-photo)
 *   3. AI-generated fallback (streamed) — ONLY when allowAi is true
 *   4. Static placeholder when AI isn't allowed
 */
export async function fetchDishImage(
  dish: string,
  cuisine: string | undefined,
  onFrame: (src: string, isFinal: boolean) => void,
  signal?: AbortSignal,
  allowAi: boolean = false,
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
    // fall through
  }
  if (signal?.aborted) return;

  if (!allowAi) {
    onFrame(DISH_PLACEHOLDER, true);
    return;
  }

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
