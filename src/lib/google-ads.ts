declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

const GOOGLE_ADS_ID = import.meta.env.VITE_GOOGLE_ADS_CONVERSION_ID as string | undefined;

export function isGoogleAdsEnabled(): boolean {
  return Boolean(GOOGLE_ADS_ID);
}

export function trackConversion(label?: string, value?: number, currency = "USD"): void {
  if (!GOOGLE_ADS_ID || typeof window === "undefined" || !window.gtag) return;

  const sendTo = label ? `${GOOGLE_ADS_ID}/${label}` : GOOGLE_ADS_ID;
  const params: Record<string, unknown> = { send_to: sendTo };

  if (value !== undefined && !Number.isNaN(value)) {
    params.value = value;
    params.currency = currency;
  }

  try {
    window.gtag("event", "conversion", params);
  } catch {
    // Never let ad tracking break a user flow
  }
}
