export type PricingPlan = {
  id: "diner_free" | "diner_premium_monthly" | "restaurant_publish";
  name: string;
  price: string;
  cadence: string;
  features: string[];
  badge?: string;
  featured?: boolean;
};

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "diner_free",
    name: "For diners",
    price: "Free",
    cadence: "always",
    features: [
      "Menu scans included",
      "Translation to 50+ languages",
      "Search, and dish photos",
      "Menu history saved on this device",
    ],
  },
  {
    id: "diner_premium_monthly",
    name: "Diner Premium",
    price: "$4.79",
    cadence: "per month",
    badge: "Premium",
    featured: true,
    features: [
      "Unlimited menu scans",
      "Unlimited translations",
      "Search, and dish photos",
      "Premium unlock saved on this device",
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

export const HOME_PRICING_PLANS = PRICING_PLANS.map((plan) => ({
  ...plan,
  name:
    plan.id === "diner_free"
      ? "Free"
      : plan.id === "restaurant_publish"
        ? "Restaurants"
        : plan.name,
  cadence: plan.id === "diner_free" ? "forever" : plan.cadence,
  features:
    plan.id === "diner_free"
      ? ["Menu scans included", "50+ languages", "Dish photos"]
      : plan.id === "diner_premium_monthly"
        ? ["Unlimited scans", "Unlimited translations", "Saved premium unlock"]
        : ["Permanent menu page", "Printable QR code", "Edit anytime"],
}));