# Remove the sign-in wall from scanning

## Goal
Scanning a menu should be open to everyone — no account required. Sign-in stays only for: saving history across devices, publishing restaurant menus, and paid upgrades.

## What's happening today
`/scan` shows a "Sign in to scan a menu" card when the user is signed out, and the `analyzeMenu` server function requires an authenticated session and consumes a per-user scan credit. That's why the app forced you to sign in at the restaurant.

## Changes

### 1. Frontend — `/scan` route
- Remove the signed-out gate card. Show the normal photo picker + analyze UI to everyone.
- Keep the "Save scans across devices — sign in" nudge as a soft banner (dismissable), never a blocker.
- Skip the `getMyScanStatus` query when signed out; skip `saveScanRemote` when signed out (recent scans still save to localStorage, as they do today).
- If the server returns the "out of anonymous scans" error, show a friendly card offering to sign in for a free scan or view pricing.

### 2. Backend — `analyzeMenu` server function
- Drop `requireSupabaseAuth` from `analyzeMenu` so it accepts anonymous calls, and read the caller's Supabase session inline: if a valid bearer is present, treat as signed-in and consume a user credit (current behavior); otherwise treat as anonymous.
- Anonymous path:
  - No user credit consumption.
  - Rate-limit per IP using a new `anonymous_scans` table (columns: `ip inet`, `day date`, `count int`, PK `(ip, day)`), incremented via a `SECURITY DEFINER` RPC.
  - Cap at **3 anonymous scans per IP per day**, free-tier model, max 3 images (same limits as free signed-in tier).
  - Refund (decrement) on AI failure, matching the signed-in refund path.
- Owner-email bypass and signed-in flow unchanged.

### 3. Error surface
- Add a new `ANON_LIMIT` error string. When the frontend sees it, show: "You've used today's free scans on this network. Sign in for another free scan or upgrade for unlimited."

### 4. Copy / nudges
- Home page CTA stays "Scan a menu" (already works for everyone once the gate is gone).
- History page still requires sign-in (unchanged) — cloud sync is the whole point of that route.
- Pricing page keeps its current messaging.

## Out of scope
- No changes to restaurant publishing, admin analytics, Paddle, RLS on other tables, or the auth pages themselves.
- No changes to the signed-in credit ledger.

## Technical notes
- New migration: create `public.anonymous_scans`, GRANT to `service_role` only, RLS enabled with no policies (accessed only via the SECURITY DEFINER RPC). Add `consume_anonymous_scan(_ip inet)` and `refund_anonymous_scan(_ip inet)` RPCs.
- Read caller IP inside the handler from `x-forwarded-for` / `cf-connecting-ip` on the incoming `Request`.
- Keep `getMyScanStatus` authenticated — it's user-scoped.
- Frontend: `enabled: !!user` already guards the status query; just remove the gate card and always render the uploader.
