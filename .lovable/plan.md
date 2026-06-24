The orange "test mode" banner is rendered by `PaymentTestModeBanner` in `src/routes/__root.tsx`. To hide it while keeping test payments enabled:

1. Modify `src/components/PaymentTestModeBanner.tsx` to always return `null` (or remove the `<PaymentTestModeBanner />` usage from `src/routes/__root.tsx`).

Either approach hides the banner without affecting the Paddle sandbox environment or test payment flow.
