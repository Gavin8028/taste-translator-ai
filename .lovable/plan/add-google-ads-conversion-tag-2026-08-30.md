# Add Google Ads conversion tag

## Goal
Wire the live site to load the Google Ads base tag (gtag.js) using the user's Conversion ID `AW-18415768362`, and add a reusable helper so future conversion events (e.g., purchase) can be fired from the checkout flow.

## What we'll do
1. **Env var**: Add `VITE_GOOGLE_ADS_CONVERSION_ID` support so the same code works in preview and production without hardcoding the ID.
2. **Head tag**: Inject the Google Ads base snippet (`gtag.js?id=AW-18415768362`) into `<head>` via `__root.tsx` route `scripts`, loaded asynchronously.
3. **Type-safe helper**: Create `src/lib/google-ads.ts` with:
   - `trackConversion(eventName, value?)` that calls `gtag('event', 'conversion', {...})` safely only after the script has loaded.
   - `pageViewConversion()` helper for landing-page conversions.
4. **Hook it up**: Call the helper from the premium checkout success page so a purchase is reported to Google Ads.

## Out of scope
- Google Tag Manager container (user asked for Google Ads tag only).
- Multiple conversion labels (can be added later when a specific conversion action is created in Google Ads).

## Files touched
- `src/routes/__root.tsx` — add gtag script to `head().scripts`.
- `src/lib/google-ads.ts` — new helper.
- `src/routes/checkout.premium-success.tsx` — fire purchase conversion.
- `.env` / `.env.production` — add `VITE_GOOGLE_ADS_CONVERSION_ID`.
