## 1. Premium-only menu history

Today, **Recent scans** appear on `/scan` for everyone and are limited to the last 8 (in `src/lib/scan-store.ts`, `MAX_RECENT = 8`). I'll turn this into a Premium feature with a dedicated history page.

- **New route `src/routes/history.tsx`** — full-page list of all saved scans on this device. For Premium users it shows every scan (newest first) with restaurant name, dish count, language, and time. Each row links to `/scan/$id` and has a delete button. Empty state links back to `/scan`.
- **Non-Premium users** visiting `/history` see an upgrade prompt explaining that history is a Premium feature, with a "Go Premium" CTA to `/pricing` and a "Scan a menu" button. They keep the small recent-scans list on `/scan` as today (still useful for the last few).
- **Premium users**: bump the per-device cap from 8 → 50 scans in `scan-store.ts` so history is meaningful. The on-`/scan` "Recent scans" section gets a "View all" link to `/history` when Premium.
- **Header nav**: add a "History" link in `SiteHeader` that's only rendered when `useDinerPremium()` is true.

No backend changes — scans are already stored in `localStorage` (`menuvision:scan:*` + index). The Premium flag is per-device too, so this matches the existing model.

## 2. "MenuVision AI" on the Paddle checkout

The name shown on the Paddle checkout overlay (and statement descriptor) comes from the seller's Paddle account settings, not from our code. I'll update it via the Paddle API in **both sandbox and live**:

- `PATCH /settings/statement-descriptor` → `{ "name": "MenuVision AI" }` so card statements read "MenuVision AI".
- Confirm the seller / business name shown on checkout. If the Paddle account's seller display name still shows your personal name, it can only be changed in the Paddle dashboard (account verification setting) — I'll flag that as a manual step if the API change alone doesn't update the checkout header.

No code changes for this — it's a settings update on the Paddle side that takes effect immediately for new checkouts.

## 3. Home page "See pricing" → real button

In `src/routes/index.tsx`, the current `See pricing` link under the big Scan button is a tiny muted text link. It already routes to `/pricing`, but it doesn't look clickable. I'll replace it with a proper `<Button variant="outline" asChild>` styled as a pill, sitting just below the Scan circle, so it visually reads as the secondary CTA.

## Files

- `src/routes/history.tsx` (new) — Premium history page + non-Premium upsell.
- `src/lib/scan-store.ts` — raise cap (50 for Premium, 8 for free), export both, and update `saveScan` to use the Premium cap when active.
- `src/routes/scan.tsx` — add "View all" link to `/history` when Premium.
- `src/components/site-header.tsx` — conditional "History" nav link for Premium.
- `src/routes/index.tsx` — turn "See pricing" into a styled outline Button.
- Paddle settings (sandbox + live) — `PATCH /settings/statement-descriptor` to "MenuVision AI".
