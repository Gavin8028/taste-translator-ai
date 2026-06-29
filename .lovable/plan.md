# Next: Launch-Blocker Polish

You're 95% there. Before doing trust/onboarding nice-to-haves, close the last gaps that hurt a real first-time visitor.

## 1. Friendly empty states

- **`/history`** (signed-in, zero scans) — replace the bare list with a centered card: icon, "No scans yet", and a primary "Scan your first menu" button linking to `/scan`.
- **`/restaurants/mine`** (signed-in, zero menus) — same treatment: "You haven't published a menu yet" with a "Create your first menu" button to `/restaurants/new`.
- **`/scan`** offline — small inline banner ("You're offline — connect to analyze a menu") and disable the Analyze button while `navigator.onLine === false`.

## 2. Deleted / missing menu 404

- **`/m/$slug`** when the menu doesn't exist or was unpublished — render a real 404 component (headline, short message, link back to `/` and `/demo`) instead of a blank screen. Wire it through the route's `notFoundComponent`.

## 3. Pre-publish verification pass

- Run a fresh **security scan**; fix or justify any new criticals.
- Run a fresh **SEO scan**; fix anything new it flags.
- Confirm Paddle test checkout still shows "MenuVision AI" as seller and that a $39 menu actually flips to paid after the webhook fires.
- Walk scan → results → share on a real phone (portrait).

## Out of scope for this pass

Homepage trust strip, onboarding toasts, performance lazy-loading, `/changelog` — all worth doing but post-launch.

## Technical notes

- `/history` and `/restaurants/mine` already detect the empty case; just swap the rendered block.
- `/m/$slug` likely throws `notFound()` from its loader (or should) — set `notFoundComponent` on `createFileRoute("/m/$slug")` so the 404 stays within the site shell.
- Use existing `SiteHeader` / `SiteFooter` so empty/404 states match the rest of the site.
- For the scan-offline banner, listen to `online` / `offline` events in a small hook in `src/routes/scan.tsx`; no new dependency.

Approve and I'll ship #1 and #2, then kick off the security + SEO scans for #3.