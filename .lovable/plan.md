# Tighten the free tier: 1 anonymous scan per network per 30 days

## Goal
Protect margin as traffic scales. Each network (IP) gets **one free anonymous scan every 30 days**. After that, the visitor must sign in (which grants their one lifetime free scan) or pay.

## Funnel after this change
1. Brand-new visitor at a restaurant → 1 free scan, no sign-in.
2. Same network tries a second scan within 30 days → paywall: "Sign in for 1 more free scan, or upgrade."
3. Signed in → 1 lifetime free scan (unchanged), then Premium ($4.79/mo) or a scan pack.

Net: ~2 free scans per person before they pay. Cheapest model (Gemini 2.5 Flash Lite) is used for both free tiers, so the loss on those 2 scans is negligible.

## Changes

### 1. Backend rate-limit rule
Replace the current per-IP-per-day counter with a **30-day rolling window per IP**:

- Rewrite `consume_anonymous_scan(_ip inet)`:
  - Look up the most recent row for this IP.
  - If the last scan was within 30 days, return `'limit'`.
  - Otherwise upsert a row with `last_scan_at = now()` and return `'anon'`.
- Rewrite `refund_anonymous_scan(_ip inet)`:
  - If the row's `last_scan_at` is within the last hour (i.e. we just wrote it and the AI failed), clear/rewind it so the visitor can retry.
- Schema tweak on `anonymous_scans`: drop `(ip, day, count)` PK, use `ip` as PK with a `last_scan_at timestamptz` column. Simpler and matches the new rule.

### 2. Frontend copy
Update the anonymous paywall card copy from "You've used today's free scans" to **"You've used your free scan"** with the two CTAs already in place (Sign in for 1 more free · See pricing).

### 3. No changes to
- Signed-in credit ledger (still 1 lifetime free + paid packs + Premium).
- Owner-email bypass.
- Image caps / model choice for anon (still 3 photos max, Flash Lite).
- Auth flow, checkout, RLS on other tables.

## Notes on abuse & scale
- IP-based limits are the standard tradeoff: mobile carriers and coffee-shop Wi-Fi share IPs, so a handful of legitimate users on the same network may hit the paywall sooner than they "should." The 30-day window makes that rare in practice.
- If abuse becomes visible (VPN rotation, etc.), the next step is a signed device cookie + IP combo — not needed today.
- Free-tier cost per scan on Gemini Flash Lite is well under a cent, so even edge-case abuse is bounded.

## Technical detail
Migration:
```sql
DROP TABLE public.anonymous_scans;
CREATE TABLE public.anonymous_scans (
  ip inet PRIMARY KEY,
  last_scan_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.anonymous_scans TO service_role;
ALTER TABLE public.anonymous_scans ENABLE ROW LEVEL SECURITY;
```
Then replace the two RPCs with the 30-day-window logic and re-apply the REVOKE/GRANT so only `service_role` can execute them.
