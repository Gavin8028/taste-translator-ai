## Goal
Track real usage of MenuVision so you can see what's working: visits, scans, menu views, and paid conversions.

## Approach: Self-hosted event tracking (no external service, no cookies)

We already have Lovable Cloud (database + server functions), so instead of paying for a third-party analytics service, we'll log events to our own database. Privacy-friendly (no cookies, no PII), GDPR-safe, and fits the legal pages you already published.

## What gets tracked

**Page views (auto)**
- Every route change → path, referrer, country (from CF header), device type, anonymous session id (random, rotates daily)

**Key events (manual)**
- `scan_started` — user uploaded photos on /scan
- `scan_completed` — AI returned dishes (with dish count + duration)
- `scan_failed` — error during processing
- `menu_published` — restaurant paid the $39 fee
- `menu_viewed` — someone opened a public `/m/$slug`
- `premium_subscribed` — Diner Premium checkout completed
- `signin_completed` — Google sign-in succeeded

## Implementation

**1. Database (one migration)**
- `analytics_events` table: `id, event_name, path, session_id, country, device, props (jsonb), created_at`
- Indexes on `event_name` and `created_at` for fast aggregation
- RLS: deny all client access; only `service_role` writes (via server fn)
- No PII stored — session_id is a random per-day hash

**2. Server function** `src/lib/analytics.functions.ts`
- `trackEvent({ name, path, props })` — inserts via `supabaseAdmin`
- Pulls country from `cf-ipcountry` header, parses user-agent for device type
- Rate-limited per session_id to prevent abuse

**3. Client helper** `src/lib/analytics.ts`
- `track(name, props?)` — calls the server fn fire-and-forget
- `usePageViewTracking()` hook in `__root.tsx` — fires on every router location change
- Session id stored in `sessionStorage` (rotates per tab/day)

**4. Instrument the key flows**
- `/scan` → `scan_started`, `scan_completed`, `scan_failed`
- `/restaurants/new` payment success → `menu_published`
- `/m/$slug` loader → `menu_viewed`
- Pricing checkout success → `premium_subscribed`
- Google auth callback → `signin_completed`

**5. Owner dashboard** `/admin/analytics`
- Protected by sign-in + email check against your account
- Cards: total visits (7d/30d), scans completed, menus published, premium subs, top referrers, top countries, conversion funnel (visit → scan → publish)
- Simple charts using Recharts (already in stack)
- Server fn aggregates with SQL `count(*) group by …` — no heavy client work

## What you'll be able to answer
- "How many people scanned a menu yesterday?"
- "What % of restaurant landing-page visitors actually publish?"
- "Where is my traffic coming from?"
- "Is Diner Premium converting?"

## Out of scope (can add later if you want)
- Heatmaps / session replay
- A/B testing
- Email reports
- Integrating Google Analytics 4 (would require cookie banner)
