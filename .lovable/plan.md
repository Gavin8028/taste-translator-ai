## Goal
Stop you from paying for strangers' AI scans. Every scan is either paid for, capped, or covered by a subscription.

## Changes

### 1. Free scan cap (anti-abuse)
- **Signed-out users:** 1 free scan, ever (tracked in localStorage + IP-based rate limit on server).
- **Signed-in free users:** 3 free scans total (tracked in new `user_scan_credits` table).
- After the cap: hard paywall screen → "Subscribe ($4.79/mo) or buy a scan pack".
- Owner account (your email, allowlisted in `admin_emails`) = unlimited, no charge tracking.

### 2. Scan packs (new revenue stream)
- New Paddle one-time products:
  - 10 scans — $2.99
  - 50 scans — $9.99
  - 200 scans — $29.99
- New `user_scan_credits` table: `user_id`, `remaining`, `lifetime_purchased`.
- Webhook credits the user on purchase.
- Every scan decrements `remaining` (skipped for Premium subscribers and admins).

### 3. Server-side enforcement (critical)
- Move `analyzeMenu` behind `requireSupabaseAuth` + a `canScan(userId)` check that runs BEFORE the AI call.
- Order: check admin → check active Premium subscription → check `remaining > 0` → else throw `PAYMENT_REQUIRED`.
- Signed-out scan path: separate server fn with strict IP rate limit (1/day) using a `anon_scan_log` table keyed by hashed IP.

### 4. Cost controls on the AI call itself
- Drop `multiLanguage: true` for free-tier scans (translate only to target language, ~60% cheaper per call).
- Cap image count at 3 for free tier, 8 for paid.
- Switch free-tier model to `google/gemini-2.5-flash-lite` (cheapest); keep `gemini-3-flash-preview` for paid.

### 5. UI updates
- `/scan` page: show remaining credits badge at top ("2 free scans left" / "47 scan credits" / "Premium ∞").
- New `/pricing` section: scan packs alongside subscription.
- Paywall modal when out of credits with both options (subscribe vs buy pack).
- `pricing-plans.ts`: add scan pack entries.

### 6. Owner exemption
- Confirm your email is in `admin_emails` so you can scan freely while testing.

## Technical notes
- New migration: `user_scan_credits`, `anon_scan_log` tables with proper RLS + GRANTs.
- New server fn: `getMyScanCredits`, `consumeScanCredit`.
- Webhook handler in `payments/webhook.ts`: handle `scan_pack_10/50/200` price IDs → insert credits.
- `scan.tsx`: pre-flight credit check before showing upload UI; show paywall if 0.
- Paddle product creation via `payments--batch_create_product` for the 3 packs.

## Result
- You never lose money on a free user (cap = 1–3 scans, AI cost ≈ $0.05 each, max ~$0.15 loss per signup).
- Every scan beyond the cap is pre-paid by the user.
- Premium subscribers stay unlimited (their $4.79/mo covers heavy usage).
- You as owner = unlimited free.

Want me to build all of this?
