## Finalize MenuVision AI — Launch Checklist

A focused pass to make the site launch-ready. No new features — just verify, polish, and harden what's already built.

### 1. Pricing consistency sweep
- Verify every surface says "1 free scan on signup" (home, pricing, scan paywall, FAQ, marketing copy).
- Verify the three plans are consistent everywhere: Free, Diner Premium ($4.79/mo), Restaurants ($39 one-time), plus Scan Packs (10/$2.99, 50/$9.99, 200/$29.99).
- Confirm dietary info + filters are Premium-only across dish card, detail sheet, and scan result.

### 2. Auth & paid-flow guards
- Confirm `/scan`, `/history`, `/restaurants/new`, `/restaurants/mine` require sign-in and redirect cleanly.
- Confirm Paddle checkout always passes `customData: { userId }` and `successUrl`.
- Confirm webhook correctly grants Premium, scan packs, and restaurant publish.

### 3. Owner / admin sanity
- Confirm `mckinneygavin74@gmail.com` is in `admin_emails` and bypasses all credit checks.
- Confirm admin analytics at `/admin/analytics` is gated to admins only.

### 4. Error / empty / offline states
- Friendly empty states on `/history`, `/restaurants/mine`.
- Real 404 for missing `/m/$slug`.
- Offline banner on `/scan`.
- Friendly error mapping on scan failures.

### 5. SEO & metadata final pass
- Every route has unique `title`, `description`, `og:title`, `og:description`, `og:type`, `twitter:card`.
- `sitemap.xml` and `robots.txt` reachable and current.
- JSON-LD present on home, FAQ, demo, public menus.
- Canonical tags on all public routes.

### 6. Legal & Paddle readiness
- `/privacy`, `/terms`, `/refunds` linked from footer and reference Paddle as Merchant of Record.
- Refund window 14–90 days, no "all sales final" language.
- Support email `support@menuvisionai.live` present on legal pages + footer.
- Run `get_go_live_status` and surface any remaining Paddle verification steps to you.

### 7. Security pass
- Run `security--run_security_scan`; fix any critical findings (RLS, exposed keys, missing grants).
- Confirm `restaurant_menus` / `menu_dishes` reads go through server functions with `supabaseAdmin`, not public SELECT.
- Confirm `/api/dish-photo` and other public APIs enforce same-origin guard + input caps.

### 8. Performance & polish
- Verify image carousel caps at 5 photos per dish everywhere.
- Verify IndexedDB cache + localStorage scan history still work.
- Quick visual sweep on mobile viewport (Shazam-style centered Scan button, See Pricing below it).

### 9. Publish
- Once 1–8 are green, run `preview_ui--publish` so the latest build goes live on `menuvisionai.live`.

### Deliverable
A short report per section: ✅ already good / 🔧 fixed / ⚠️ needs your action (e.g. Paddle verification, DNS). Then publish.

Want me to proceed with all 9 steps, or skip any?
