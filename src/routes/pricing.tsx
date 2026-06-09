import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — MenuVision AI" },
      {
        name: "description",
        content:
          "MenuVision AI is free to try. Go Premium for $4.79/month for unlimited scans and faster dish images.",
      },
    ],
  }),
  component: PricingPage,
});

const tiers = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    features: [
      "5 menu scans per month",
      "Translation to 50+ languages",
      "Pictures for every dish",
      "Search and filters",
    ],
    cta: "Start scanning",
    ctaTo: "/scan",
    featured: false,
  },
  {
    name: "Premium",
    price: "$4.79",
    cadence: "per month",
    features: [
      "Unlimited menu scans",
      "Priority dish image generation",
      "Higher-resolution dish photos",
      "No ads, ever",
    ],
    cta: "Coming soon",
    ctaTo: null,
    featured: true,
  },
];

function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-16">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Simple, honest pricing.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Start free. Upgrade when you find yourself scanning every menu you see.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col rounded-3xl border p-8 shadow-sm ${
                t.featured
                  ? "border-primary/60 bg-card ring-1 ring-primary/30"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <h2 className="text-xl font-semibold">{t.name}</h2>
                {t.featured && (
                  <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    Best value
                  </span>
                )}
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-4xl font-semibold tracking-tight">{t.price}</span>
                <span className="text-sm text-muted-foreground">{t.cadence}</span>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                {t.ctaTo ? (
                  <Button asChild className="h-11 w-full rounded-full">
                    <Link to={t.ctaTo}>{t.cta}</Link>
                  </Button>
                ) : (
                  <Button disabled className="h-11 w-full rounded-full">
                    {t.cta}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
