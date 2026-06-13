
## Goal

Replace the current AI-only dish image flow with real photos pulled from Google Images via SerpAPI. If SerpAPI returns no usable result (or fails), fall back to the existing AI image generator so every dish still gets an image.

## What changes

### 1. SerpAPI key
Add `SERPAPI_API_KEY` as a project secret (I'll request it from you when we start building). SerpAPI gives 100 free searches/month; beyond that it's paid. We cache aggressively so the same dish is never re-searched.

### 2. New server endpoint: `/api/dish-photo`
- Input: `{ dish, cuisine }`
- Calls SerpAPI `engine=google_images` with a query like `"<dish> <cuisine> food"`, safe search on.
- Picks the first result whose image URL looks usable (https, reasonable dimensions, not a known blocked host).
- Returns `{ url, source }` on success, or `{ url: null }` if nothing usable was found.
- Server-side: no SerpAPI key ever reaches the browser.

### 3. New client helper: `fetchDishImage(dish, cuisine)`
Replaces the streaming AI call as the primary path:

```
1. Check IndexedDB cache (existing image-cache.ts) — return instantly if hit.
2. Call /api/dish-photo. If it returns a URL:
     - preload the image (new Image()) to verify it actually loads
     - on success: cache the URL string and display it
3. If step 2 fails or returns null:
     - fall back to streamDishImage (existing AI generator)
     - cache the resulting data URL as today
```

The cache key stays `dish|cuisine`, so existing cached AI images continue to work — only new lookups go through SerpAPI first.

### 4. Component updates
- `src/components/dish-card.tsx` — swap the `streamDishImage` call inside the IntersectionObserver for the new `fetchDishImage` helper. Keep the blur-up animation only for the AI fallback path (real photos load atomically, no progressive frames).
- `src/components/dish-detail-sheet.tsx` — same swap for the larger preview.

### 5. Keep the AI route
`/api/dish-image` and `streamDishImage` stay exactly as they are — used only as the fallback now.

## Technical details

- Cache hits remain instant from IndexedDB (no network).
- For real photos we store the remote URL string in IndexedDB; for AI fallbacks we keep storing the data URL (unchanged).
- We rate-limit ourselves implicitly via the cache: each unique dish is fetched at most once per browser.
- Network failures, 429s, and empty SerpAPI results all transparently fall back to AI.
- No DB schema changes. No UI redesign — only the image source changes.

## Files touched

- new: `src/routes/api/dish-photo.ts`
- new: `src/lib/fetch-dish-image.ts` (the orchestrator: cache → SerpAPI → AI)
- edit: `src/components/dish-card.tsx`
- edit: `src/components/dish-detail-sheet.tsx`
- secret: add `SERPAPI_API_KEY`

## Out of scope

- Bulk pre-fetching at menu-analysis time (we'd hit SerpAPI quota fast). Images still load lazily as cards scroll into view.
- Letting users manually pick/replace an image — can be added later.
