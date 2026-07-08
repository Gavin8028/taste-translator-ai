## Goal

Give MenuVision AI a proper, discoverable support/contact surface before launch. Paddle (merchant of record) and general trust signals expect a dedicated page — not just a `mailto:` in the footer.

## What to build

### 1. New route: `/contact`

A single-page contact route styled to match the existing marketing pages (SiteHeader / SiteFooter shell, same typography, rounded cards).

Sections, top to bottom:

- **Hero**: "Get in touch" heading + one-line reassurance ("We reply to every message, usually within 1 business day").
- **Primary contact card**: big `support@menuvisionai.live` button (mailto), with a copy-to-clipboard affordance like the existing "Copy" button in `restaurants.new.tsx`.
- **What to email us about** grouped list:
  - Diners: refunds, scan credits, account issues → link to `/refunds`
  - Restaurants: menu edits, publishing help, taking a page down
  - Privacy / data requests → link to `/privacy`
  - Press / partnerships
- **Response times** card: "Support 1 business day · Refunds 1–3 business days · Data requests within 30 days"
- **Business details** card (Paddle compliance / trust): product name, merchant of record note ("Payments are processed by Paddle.com Inc., our merchant of record"), support email again, link to Terms + Privacy + Refunds.
- **FAQ shortcut**: "Most questions are answered in our [FAQ](/faq)."

Head metadata: unique title, description, canonical, og:title/description, og:url — matching the pattern in `pricing.tsx` / `about.tsx`.

### 2. Surface it everywhere

- Add "Contact" to `SiteFooter` in `src/components/site-header.tsx` (currently only Terms / Privacy / Refunds live there).
- Keep the existing `mailto:` link in the header, but also add a `/contact` link so users clicking "Contact" go to a real page instead of triggering their mail client.
- Add `/contact` to `src/routes/sitemap[.]xml.ts` (`changefreq: monthly`, `priority: 0.5`).

### 3. Update Terms / Privacy / Refunds cross-links

The three legal pages already show `support@menuvisionai.live`. Add a small "See our Contact page" link next to each so users have a non-email path too.

## Out of scope (deliberately)

- No contact form (a form needs spam protection + a server endpoint; a well-designed `/contact` page with a mailto is stronger and lower-risk for launch — we can add a form later if support volume warrants it).
- No live chat.
- No changes to Paddle configuration itself — you'll still want to confirm the support email is set on the Paddle merchant profile.

## Files touched

- `src/routes/contact.tsx` — new
- `src/components/site-header.tsx` — add footer link
- `src/routes/sitemap[.]xml.ts` — add `/contact` entry
- `src/routes/privacy.tsx`, `src/routes/terms.tsx`, `src/routes/refunds.tsx` — small "Contact page" cross-link
