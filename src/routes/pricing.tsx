import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { PRICING_PLANS } from "@/lib/pricing-plans";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — MenuVision AI" },
      {
        name: "description",
        content:
          "MenuVision AI includes free unlimited menu scans for diners and a one-time restaurant menu publishing option.",
      },
      { property: "og:title", content: "Pricing — MenuVision AI" },
      {
        property: "og:description",
        content:
          "Free unlimited menu scans for diners. One-time $39 to publish a translated restaurant menu page.",
      },
      { property: "og:url", content: "https://menuvisionai.live/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://menuvisionai.live/pricing" }],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { openCheckout, loading: checkoutLoading } = usePaddleCheckout();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-16">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">Pricing</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            Simple, honest pricing.
          </h1>
          <p className="mt-4 text-muted-foreground">
            Scan menus for free. Restaurants can publish a permanent QR menu page.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-3">
          {PRICING_PLANS.map((plan) => (
            <TierCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              cadence={plan.cadence}
              features={plan.features}
              badge={plan.badge}
              featured={plan.featured}
              cta={
                plan.id === "diner_premium_monthly" ? (
                  <Button
                    className="h-11 w-full rounded-full"
                    disabled={checkoutLoading}
                    onClick={() =>
                      openCheckout({
                        priceId: "diner_premium_monthly",
                        successUrl: `${window.location.origin}/checkout/premium-success`,
                      })
                    }
                  >
                    {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Get Premium
                  </Button>
                ) : plan.id === "restaurant_publish" ? (
                  <Button asChild className="h-11 w-full rounded-full" variant="outline">
                    <Link to="/restaurants/new">Create your menu page</Link>
                  </Button>
                ) : (
                  <Button asChild className="h-11 w-full rounded-full" variant="outline">
                    <Link to="/scan">Scan a menu</Link>
                  </Button>
                )
              }
            />
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function TierCard({
  name,
  price,
  cadence,
  features,
  cta,
  badge,
  featured,
  footnote,
}: {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  cta: React.ReactNode;
  badge?: string;
  featured?: boolean;
  footnote?: string;
}) {
  return (
    <div
      className={`flex flex-col rounded-3xl border p-8 shadow-sm ${
        featured
          ? "border-primary/60 bg-card ring-1 ring-primary/30"
          : "border-border bg-card"
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-xl font-semibold">{name}</h2>
        {badge && (
          <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            {badge}
          </span>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tracking-tight">{price}</span>
        <span className="text-sm text-muted-foreground">{cadence}</span>
      </div>
      <ul className="mt-6 flex-1 space-y-3 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">{cta}</div>
      {footnote && (
        <p className="mt-3 text-center text-xs text-muted-foreground">{footnote}</p>
      )}
    </div>
  );
}
