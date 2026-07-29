## What I can and can't do here

A real live purchase needs a real credit card entered into Paddle's checkout. That checkout renders in a cross-domain iframe, so no automation tool (mine included) can type card details or click Pay. The card also has to be yours — I shouldn't and can't buy anything on your behalf.

So the test is: **you click through the purchase, I verify every automated step around it.**

## Step 1 — I pre-verify the live plumbing (no purchase needed)

Before you spend a cent, I check:

- The live Paddle catalog still contains `scan_pack_10` at $2.99 and its price resolves to a live `pri_...` ID.
- The live webhook destination points at `https://menuvisionai.live/api/public/payments/webhook?env=live` and is active.
- The published site's webhook route answers (a signature-less POST should return 400 "Webhook error", proving the route exists and verification is on — a 403 or 404 would mean it's misrouted).
- Your account's current credit row in the database, so we have a clean "before" number.

## Step 2 — You run the purchase

1. Open https://menuvisionai.live/pricing in a normal browser window (not the Lovable preview — the preview uses test mode).
2. Sign in with your account first, so `userId` is attached to the transaction.
3. Buy the **10 scans for $2.99** pack with a real card.
4. Tell me when the checkout success screen appears.

## Step 3 — I verify the result

- Query `analytics_events` for a `scan_pack_purchased` row with your user ID and transaction ID.
- Query `user_scan_credits` for your user and confirm `paid_remaining` went up by 10 and `lifetime_paid_purchased` increased.
- Read the live Paddle transaction to confirm it completed and shows $2.99.
- Pull server logs for the webhook route to confirm it fired and returned 200 (and surface any error if it didn't).

If credits didn't land, the logs plus the transaction's `custom_data` tell us exactly which link broke — most likely a missing `userId` or a missing `importMeta.externalId` on the price.

## Step 4 — Refund

Once verified, I issue a full refund on the live transaction through the Paddle adjustments API so you're not out the $2.99. Live refunds are reviewed by Paddle and typically settle in a few days.

## Note

One caveat worth naming up front: your account is admin-whitelisted, so extra credits won't change what you can actually do in the app. The database row is the proof, not the UI.
