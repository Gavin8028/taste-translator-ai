# Monetization plan — keep it simple

You don't need to learn pricing theory. I'll set up the simplest model that makes money from day one, and we can adjust later if needed.

## The model (one line)

**Restaurants pay $39 once to publish their menu page. Diners scan for free.**

That's it. No subscriptions, no tiers, no math. If a restaurant pays, their menu page goes live at `menuvision.app/m/their-name`. If they don't pay, the menu they created sits in "draft" and shows a paywall instead of the public page.

Why this and not something fancier:
- One price is easy to explain and easy to buy.
- $39 is low enough that a restaurant owner can decide on the spot (no manager approval, no procurement).
- You get paid before you owe them anything — no refund drama.
- Diners stay 100% free, so the scan-a-menu flow (your main growth engine) is untouched.

If later you see restaurants asking "can I update my menu monthly?" we add a $5/mo upgrade. Not now.

## What changes in the app

1. **New `paid` flag on each restaurant menu.** New menus start unpaid.
2. **Public page `/m/$slug`** — if unpaid, show a friendly "This menu isn't live yet" screen instead of the dishes. (Owner can still preview from their edit page.)
3. **"Publish for $39" button** on the owner's edit page and right after they create the menu.
4. **Stripe Checkout** opens, they pay, webhook flips the `paid` flag, page goes live.
5. **Pricing page** updated to reflect the real model (currently it advertises a fake $4.79/mo Premium tier — I'll replace that).
6. **Diner side stays free.** The `/scan` flow for travelers doesn't change.

## Why Stripe (not Paddle)

For a service like "publish a webpage for a restaurant," Stripe is the right fit and is built into Lovable — no Stripe account needed to start testing. Built-in Stripe handles tax calculation automatically so you don't have to think about it.

## What I need from you to proceed

Just a yes. When you approve this plan I will:
1. Turn on Lovable's built-in Stripe payments (test mode first, so no real money moves).
2. Create the $39 "Publish menu" product.
3. Wire up the paywall, checkout button, and webhook.
4. Fix the pricing page so it matches reality.

You'll be able to test the whole flow with a fake card before anything goes live. When you're ready to accept real money, you'll claim the Stripe account (takes ~5 min, standard business info) and flip it to live mode.

## Things I am explicitly NOT doing

- No subscriptions, no monthly billing, no tiers.
- No diner-side payments, ads, or paywalls.
- No "freemium with watermark" — unpaid menus are simply not public.
- No affiliate/commission logic.

Keeping it boring on purpose. We can layer on more later if and when the numbers say to.