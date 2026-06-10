
# MenuVision AI — v1 Plan

Scoped down per your request: no accounts, no history, no favorites, no allergens, no recommendations, no restaurant mode, no analytics, no QR. Pure "snap a menu → see every dish" flow.

## What gets built

1. **Landing page** (`/`) — Apple-style minimal hero, one-line value prop, big "Scan a menu" CTA, 3-step how-it-works, pricing teaser, footer. Light + dark mode, mobile-first.
2. **Scan page** (`/scan`) — drag-drop + camera/file upload (JPG/PNG/WEBP/HEIC). Target language picker (auto-detect source). Client-side image compression before upload.
3. **Loading screen** — animated progress: "Reading menu…" → "Translating…" → "Describing dishes…" → "Generating dish images…". No ads.
4. **Results page** (`/scan/:id`) — grid of dish cards. Each card: dish name (original + translated), AI description, ingredients, cuisine tag, spice level, dietary tags (veg/vegan/gluten-free if detectable), and a generated dish image. Search bar + filter chips (cuisine, spice, dietary). Tap a card → detail sheet with larger image.
5. **Pricing page** (`/pricing`) — Free vs Premium ($4.79/mo) comparison. Display only — no Stripe yet.
6. **About / Privacy** — short static routes for SEO and footer links.

## How it works (technical)

- **Stack**: existing TanStack Start + Tailwind. No Lovable Cloud needed for v1 (no persistence).
- **OCR + dish extraction** (one call): `createServerFn` → Lovable AI Gateway → `google/gemini-3-flash-preview` with vision. Send the menu image + a prompt asking for structured JSON: `{ sourceLanguage, dishes: [{ nameOriginal, nameTranslated, description, ingredients[], cuisine, spiceLevel(0-3), dietary[] }] }`. Uses AI SDK `Output.object` with a Zod schema so output is reliable.
- **Dish images**: parallel calls to Gateway `/v1/images/generations` with `openai/gpt-image-2`, `quality: "low"`, streamed back as SSE. One image per dish, generated concurrently (capped at ~4 in flight). Prompt = `"Appetizing overhead food photo of {dish}, {cuisine}, natural light, shallow depth of field"`.
- **Result transport**: scan results held in-memory + URL state (no DB). Refreshing the results page re-runs from a cached blob in `sessionStorage`. Acceptable for v1 since there's no history feature.
- **HEIC**: convert client-side with `heic2any` before upload.
- **Compression**: `browser-image-compression` to keep uploads under ~1.5 MB.

## Design

Apple-style: generous whitespace, SF-style system font stack, soft neutral surfaces, single accent color, subtle motion on card entry and image reveal. Dark mode via Tailwind `dark:` classes and a system-preference toggle. Tokens in `src/styles.css` — no hardcoded colors in components.

## File layout

```text
src/routes/
  index.tsx                  landing
  scan.tsx                   upload + camera
  scan.$id.tsx               results
  pricing.tsx
  about.tsx
  privacy.tsx
src/lib/
  menu.functions.ts          analyzeMenu server fn (vision + structured output)
  dish-image.functions.ts    generateDishImage server fn (streaming)
  scan-store.ts              sessionStorage cache + in-memory store
src/components/
  upload-dropzone.tsx
  loading-stages.tsx
  dish-card.tsx
  dish-detail-sheet.tsx
  filter-bar.tsx
  theme-toggle.tsx
```

## Out of scope (v1, by your call)

Auth, saved history, favorites, allergens, smart recommendations, restaurant mode, analytics, QR menus, ads, payments. The pricing page is visual only.

## What I'll defer-decide

- Dish images use AI generation (no external search API needed — works out of the box).
- Apple-style minimal design, no 3-direction prototyping round.

If either of those is wrong, tell me before approving and I'll adjust.
