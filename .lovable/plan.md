# Final Polish Before Launch

You're 95% there. Core flows (scan, restaurant menus, payments, auth, history, analytics, SEO, sharing) are all live. Here are the last touches that separate "working" from "ready to share with real users."

## 1. Pre-launch verification (no new features, just check)

- Run a fresh **security scan** and clear any criticals.
- Run a fresh **SEO scan** and fix anything new it flags.
- **Paddle**: confirm the seller name shows as "MenuVision AI" on a real test checkout, webhook signature verification works end-to-end, and a $39 menu actually unlocks after payment.
- **Google sign-in**: test full round-trip on the live domain (`menuvisionai.live`), including the `redirect=` param after login.
- **Mobile pass**: walk the scan → results → share flow on a real phone in both portrait and one-handed use.

## 2. Empty states & edge cases

- `/history` when signed-in but zero scans → friendly empty card with a "Scan your first menu" CTA.
- `/restaurants/mine` when signed-in with no menus → same treatment.
- `/m/$slug` when the menu was deleted → 404 with a link back home (instead of a blank screen).
- Network-offline state on `/scan` → inline banner, disable Analyze button.

## 3. Trust & polish on the homepage

- Add a small **"As seen / Works with"** strip or **logo wall of demo restaurants** below the hero (even 3–4 stylized cards is enough).
- Add **one real testimonial-style quote** or a short numeric proof point ("50+ languages · ~12s per menu").
- Make sure the homepage `og:image` is a real branded preview, not a generic one.

## 4. Onboarding nudges

- After a diner's **first successful scan**, show a one-time toast: "Sign in to save this scan forever" (skippable, never blocks).
- After a restaurant owner **publishes** their first menu, show a success screen with: QR download, share link, and "Add another page" CTA.

## 5. Legal & contact

- Add a real **support email** (e.g. `support@menuvisionai.live`) to `/privacy`, `/terms`, `/refunds`, and the footer. Paddle requires a reachable contact for disputes.
- Confirm Privacy/Terms/Refund pages all use the same seller name consistently.

## 6. Performance quick wins

- Lazy-load the dish image carousel images below the fold on `/m/$slug` and `/scan/$id`.
- Add `loading="lazy"` and explicit width/height to all `<img>` tags to stop layout shift.
- Preconnect to Google Images / Paddle in `__root.tsx` head.

## 7. Nice-to-haves (skip if you want to launch now)

- lop;"Report an issue" link on results pages.
- Email receipt copy customization in Paddle.
- A `/changelog` page (1 line per shipped change) — cheap trust signal.

---

### My recommendation

Do **#1, #2, #5** before publishing publicly — those are launch blockers. **#3 and #4** can ship the same week as small follow-ups. **#6 and #7** are post-launch.

Want me to start with the launch-blocker set (verify + empty states + contact email)?