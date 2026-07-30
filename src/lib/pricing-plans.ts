export type PricingPlan = {
  id:
    | "diner_free"
    | "diner_premium_monthly"
    | "diner_premium_yearly"
    | "restaurant_publish"
    | "scan_pack_10"
    | "scan_pack_50"
    | "scan_pack_200";
  name: string;
  price: string;
  cadence: string;
  features: string[];
  badge?: string;
  featured?: boolean;
  scanCount?: number;
};

/** Diner Premium billing options. Amounts must match the payments catalog. */
export const PREMIUM_BILLING = {
  monthly: {
    priceId: "diner_premium_monthly" as const,
    price: "$4.79",
    cadence: "per month",
    note: "Billed monthly. Cancel anytime.",
  },
  annual: {
    priceId: "diner_premium_yearly" as const,
    price: "$34.99",
    cadence: "per year",
    anchor: "$57.48",
    note: "Just $2.92/mo, billed once a year. Cancel anytime.",
  },
} as const;

export type PremiumBillingCycle = keyof typeof PREMIUM_BILLING;

/** 12 × $4.79 = $57.48 vs $34.99 → 39% off. */
export const PREMIUM_ANNUAL_SAVINGS_PCT = 39;
export const PREMIUM_ANNUAL_MONTHLY_EQUIVALENT = "$2.92";


export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "diner_free",
    name: "For diners",
    price: "Free",
    cadence: "1 scan on signup",
    features: [
      "1 free menu scan when you sign up",
      "Translation to 50+ languages",
      "Search and dish photos",
      "Menu history synced to your account",
    ],
  },
  {
    id: "diner_premium_monthly",
    name: "Diner Premium",
    price: "$4.79",
    cadence: "per month",
    badge: "Best value",
    featured: true,
    features: [
      "Unlimited menu scans",
      "Unlimited translations",
      "Filters, dietary info, and rich dish photos",
      "Cancel anytime",
    ],
  },
  {
    id: "scan_pack_10",
    name: "10 scan pack",
    price: "$2.99",
    cadence: "one-time",
    scanCount: 10,
    features: [
      "10 menu scans added to your account",
      "Never expire",
      "Use anytime",
    ],
  },
  {
    id: "scan_pack_50",
    name: "50 scan pack",
    price: "$9.99",
    cadence: "one-time",
    scanCount: 50,
    badge: "Save 33%",
    features: ["50 menu scans added to your account", "Never expire", "Best for travelers"],
  },
  {
    id: "scan_pack_200",
    name: "200 scan pack",
    price: "$29.99",
    cadence: "one-time",
    scanCount: 200,
    features: [
      "200 menu scans added to your account",
      "Never expire",
      "Lowest price per scan",
    ],
  },
  {
    id: "restaurant_publish",
    name: "For restaurants",
    price: "$39",
    cadence: "one-time",
    features: [
      "Permanent public menu page",
      "Printable QR code for tables",
      "Translation to 50+ languages",
      "Edit or replace your menu anytime",
    ],
  },
];

export const HOME_PRICING_PLANS = [
  {
    id: "diner_free" as const,
    name: "Free",
    price: "Free",
    cadence: "1 scan on signup",
    features: ["1 free scan", "50+ languages", "Dish photos"],
  },
  {
    id: "diner_premium_monthly" as const,
    name: "Diner Premium",
    price: `from ${PREMIUM_ANNUAL_MONTHLY_EQUIVALENT}`,
    cadence: "per month, billed yearly",
    badge: `Save ${PREMIUM_ANNUAL_SAVINGS_PCT}%`,
    featured: true,
    features: ["Unlimited scans", "Filters & dietary info", "Cancel anytime"],
  },

  {
    id: "restaurant_publish" as const,
    name: "Restaurants",
    price: "$39",
    cadence: "one-time",
    features: ["Permanent menu page", "QR code", "Edit anytime"],
  },
];

export const SCAN_PACK_IDS = [
  "scan_pack_10",
  "scan_pack_50",
  "scan_pack_200",
] as const;
export type ScanPackId = (typeof SCAN_PACK_IDS)[number];

export const SCAN_PACK_AMOUNTS: Record<ScanPackId, number> = {
  scan_pack_10: 10,
  scan_pack_50: 50,
  scan_pack_200: 200,
};
