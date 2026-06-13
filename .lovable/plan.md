## Add back the Diner Premium tier ($4.79/mo)

The pricing page currently shows only two cards (Free for diners, $39 one-time for restaurants), but the page's meta description still references a "$4.79/month Premium" plan. The third tier was never wired up as a card. This plan adds it back.

### Pricing layout

Switch the grid from 2 columns to 3 on desktop. New middle tier:

- **Name:** Diner Premium
- **Price:** $4.79 / month
- **Marked:** "Best value" badge moves here (it's the upsell); restaurants card keeps its own styling but loses the badge
- **Features:**
  - Unlimited menu scans
  - Faster, higher-quality dish photos (real photos + AI fallback)
  - Save favorite dishes and menus
  - Translation to 50+ languages
- **CTA:** "Go Premium" → opens Paddle checkout

Free tier copy is trimmed so the upgrade reason is clear (e.g. remove "AI-generated pictures for every dish" from Free, since that's the Premium hook).

### Payments wiring

- Create a Paddle product `diner_premium` with price `diner_premium_monthly` at $4.79 USD recurring monthly (single-purchase quantity 1/1).
- Add a `useDinerPremium` check that reads from the existing `subscriptions` table filtered by `price_id = 'diner_premium_monthly'` and active status (env-filtered, per the existing subscription pattern).
- The "Go Premium" button uses the existing `usePaddleCheckout` hook with `priceId: 'diner_premium_monthly'` and `customData: { userId }`.

### Gating real photos + AI for premium diners

Today `fetchDishImage(..., allowAi)` is `true` only on `/m/<slug>` (paid published menus). Extend it: on `/scan/<id>` routes, pass `allowAi = isDinerPremium`. So:

- Free diners on `/scan/...` → cache → real photo → placeholder (unchanged)
- Premium diners on `/scan/...` → cache → real photo → AI fallback
- Published menus → unchanged (always premium)

### Files touched

- `src/routes/pricing.tsx` — third tier card, 3-col grid, updated copy, checkout CTA
- `src/hooks/use-diner-premium.ts` (new) — subscription check
- `src/routes/scan.$id.tsx` (or equivalent) — pass `allowAi={isDinerPremium}` to `DishCard` / `DishDetailSheet`
- Paddle catalog — `diner_premium` product + `diner_premium_monthly` price via the create tools

### Out of scope

- No changes to the restaurant $39 flow
- No annual plan, no free trial — can add later if you want
- No paywall modal on the scan page itself yet (just a soft "Upgrade" link near the placeholder); say the word and I'll add a proper upsell sheet