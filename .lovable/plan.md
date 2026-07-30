## Goal

Make Diner Premium harder to refuse by adding an **annual plan at $34.99/year** next to the $4.79/month plan, framed as "Save 39% — 2 months free". Annual raises lifetime value, removes 12 chances to churn, and makes the monthly price feel small by comparison.

### Why $34.99

- Monthly for 12 months = $57.48
- Annual = $34.99 → **saves $22.49 (39%)**
- Effective $2.92/mo, which reads much cheaper than $4.79
- Above the $10 threshold, so the payment fee drops from a flat 10% to the standard rate — net revenue per annual subscriber is roughly $32.75

## What gets built

**1. New annual price in the payments catalog**

Add a `diner_premium_yearly` price ($34.99/yr, recurring yearly, quantity fixed at 1) to the existing `diner_premium` product. The monthly price and all scan packs stay untouched. It syncs to live on the next publish.

**2. Fix the premium access check (required)**

The database function that decides who is Premium currently only matches the monthly price ID. An annual subscriber would pay and still be treated as free. A migration widens it to accept either premium price ID.

**3. Pricing page: monthly/annual toggle**

- A "Monthly / Annual — Save 39%" switch above the plan grid.
- The Premium card price swaps between "$4.79 /month" and "$34.99 /year", with a struck-through "$57.48" anchor and a "$2.92/mo billed annually" subline when annual is selected.
- Annual is the default selection (highest-value option shown first).
- The checkout button passes the selected price ID; sign-in requirement, user ID attachment, and success URL behavior are unchanged.

**4. Home pricing teaser**

The Premium card on the home page shows "from $2.92/mo" with a "Save 39% yearly" badge, linking through to the pricing page with the annual toggle preselected.

**5. Small honesty guardrails**

- "Cancel anytime" already listed; annual card adds "Billed once a year".
- Feature lists stay identical between monthly and annual — only the price and cadence change.

## Technical details

- Catalog: `create_price` with id `diner_premium_yearly`, product `diner_premium`, amount 3499 USD, `recurring_interval: year`, quantity min/max 1. Never reuse or mutate the `diner_premium_monthly` ID.
- Migration: `CREATE OR REPLACE FUNCTION public.has_active_premium` changing `price_id = 'diner_premium_monthly'` to `price_id IN ('diner_premium_monthly','diner_premium_yearly')`, keeping `SECURITY DEFINER`, `STABLE`, `SET search_path = public`, and the existing execute grants.
- `src/lib/pricing-plans.ts`: add `diner_premium_yearly` to the `PricingPlan` id union and a plan entry; export a helper for the monthly-equivalent and savings strings so the home page and pricing page don't diverge.
- `src/routes/pricing.tsx`: local `billing` state ('annual' default), toggle UI, and `handlePremium` using the selected price ID.
- `src/routes/index.tsx`: teaser copy update only.
- No webhook change needed — the handler stores whatever `price_id` the subscription carries, so annual rows land correctly once the access function accepts them.

## Verification

- Test-mode checkout on the annual price in the preview, confirm the subscription row is written with `price_id = 'diner_premium_yearly'` and premium features unlock.
- Confirm the monthly path still works unchanged.
- Publish is required for the annual price to exist for real customers.
