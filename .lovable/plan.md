# Going international: auto language + local currency

Two changes for travelers and non-US visitors.

## 1. Auto-detect the translation language

Today the scan page always defaults to "Translate to: English" and the visitor has to change it manually.

New behavior:
- On first visit, detect the visitor's language from their browser/device setting (e.g. a phone set to Spanish → "Translate to: Español").
- If their language isn't in the list, fall back to English.
- Their choice is remembered on that device, and changing the dropdown always wins over detection.
- Language names in the dropdown are shown in their own language (Español, Français, 日本語) so they're recognizable.
- Also widen the current language list to cover the main travel languages: English, Spanish, French, German, Italian, Portuguese, Dutch, Japanese, Korean, Chinese (Simplified & Traditional), Arabic, Hindi, Russian, Turkish, Thai, Vietnamese, Polish, Indonesian.

The rest of the site copy stays in English — only the menu translation target adapts. (Full UI translation can be added later if you want it.)

## 2. Show prices in the visitor's local currency

Payments already work worldwide — Paddle sells in 200+ countries, handles local tax/VAT, and offers local payment methods. What's missing is that the pricing page always shows USD.

New behavior:
- The pricing page asks the payment provider for the visitor's localized price and shows it (for example €4,49 / ¥750 / £3.79 instead of $4.79).
- Amounts are auto-converted by Paddle, formatted correctly for the locale, and match exactly what checkout will charge.
- If the lookup fails or is slow, USD prices show as they do now — no blank cards.
- Applies to all cards: Premium monthly, Premium yearly, the three scan packs, and the $39 restaurant plan. The yearly "39% savings" badge is computed from the localized amounts so it stays truthful.
- The home page pricing teaser keeps its simple static USD copy.

## Technical notes

- Language: add a `resolveDefaultLanguage()` helper in `src/lib/` that reads `navigator.languages`, maps the primary subtag to a supported language, and falls back to English. Read it in `useEffect` (not in the `useState` initializer) to avoid hydration mismatch, persist the pick in `localStorage`, and expand the `LANGUAGES` constant in `src/routes/scan.tsx` into a shared `{ code, label, englishName }` list also used by `/m/$slug`.
- Currency: add a `previewPrices` server function in `src/lib/payments.functions.ts` that resolves each human-readable price ID to its Paddle ID via `gatewayFetch` and calls `POST /pricing-preview` with the caller's IP (`cf-connecting-ip` / `x-forwarded-for`). Return a map of price ID → `formattedTotals.subtotal`.
- `src/routes/pricing.tsx` calls it through TanStack Query (client-side, non-blocking) and renders the localized string when present, otherwise the static string from `src/lib/pricing-plans.ts`. Nothing about checkout itself changes — Paddle already localizes inside the overlay.
- No database or catalog changes; no new prices created.
