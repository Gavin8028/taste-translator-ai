# Phase C: Trust & Social Proof

Goal: make MenuVision feel credible at first glance so diners scan with confidence and restaurants trust it enough to pay $39.

## 1. Homepage trust strip
Add a slim badge row directly under the Scan Menu / See Pricing buttons:
- "No app download"
- "50+ languages"
- "Results in ~10 seconds"
- "Works on any phone"

Small icons + label, single row on desktop, 2x2 on mobile. Uses existing periwinkle accent — no new colors.

## 2. "How it works" — 3 step visual
New section on the homepage between the trust strip and "Why MenuVision":

```text
[ 1. Snap ]  →  [ 2. Translate ]  →  [ 3. See dishes ]
  camera icon     globe icon          plate icon
```

Each step: icon, one-line title, one-line description. Same 3-step pattern reused on `/restaurants` (Upload menu → We process → Share QR) so both audiences see the flow immediately.

## 3. Social proof section
Homepage section with 3 testimonial cards (placeholder names + roles, clearly styled as illustrative early-user quotes, not fabricated reviews):
- A traveler diner
- A dietary-restricted diner
- A restaurant owner

Plus a stat band above the testimonials:
- "8 cuisines supported in demo"
- "50+ languages"
- "Unlimited free scans"

No fake review counts or fake star ratings — only true facts.

## 4. Restaurants landing upgrades (`/restaurants`)
- Add the same 3-step visual, tuned for owners.
- Add a "What you get for $39" checklist card (permanent menu page, QR code, 50+ language translations, rich dish photos, edit anytime).
- Add a small "Try the live demo" button linking to `/demo` so owners can preview the diner experience before paying.

## 5. FAQ surfacing
- Add a compact 4-question FAQ teaser at the bottom of the homepage with a "See all FAQs" link to `/faq`.
- Add the same teaser to `/restaurants` with owner-focused questions.

## 6. Footer polish
- Add the trust badges (no app, 50+ languages) as a small inline row in the footer.
- Keep existing Privacy / Terms / Refunds links.

## Technical notes
- All new sections live in `src/routes/index.tsx`, `src/routes/restaurants.index.tsx`, and a new shared component `src/components/trust-strip.tsx` and `src/components/how-it-works.tsx` (variant prop: `"diner" | "restaurant"`).
- Icons from `lucide-react` (already installed).
- Reuse existing semantic tokens in `src/styles.css` — no new colors, no new fonts.
- No backend, schema, or auth changes. Purely presentation.
- All claims kept factual (no fake review counts, no fabricated certifications).

After approval, I'll implement and verify with a quick screenshot pass on mobile + desktop.
