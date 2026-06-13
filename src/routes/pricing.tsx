import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { useDinerPremium } from "@/lib/premium-store";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — MenuVision AI" },
      {
        name: "description",
        content:
          "MenuVision AI is free to try. Go Premium for $4.79/month for unlimited scans, translations, filters, and rich dish photos.",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  const { openCheckout, loading } = usePaddleCheckout();
  const isPremium = useDinerPremium();

  const handleGoPremium = () => {
    openCheckout({
      priceId: "diner_premium_monthly",
      successUrl: `${window.location.origin}/checkout/premium-success`,
    });
  };

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
            Start free. Upgrade when you find yourself scanning every menu you see.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Free diner tier */}
          <TierCard
            name="For diners"
            price="Free"
            cadence="always"
            features={[
              "Scan any menu with your phone",
              "See the dishes and prices",
              "Keep your last few scans on this device",
            ]}
            cta={
              <Button asChild className="h-11 w-full rounded-full" variant="outline">
                <Link to="/scan">Scan a menu</Link>
              </Button>
            }
          />

          {/* Premium diner tier */}
          <TierCard
            name="Diner Premium"
            price="$4.79"
            cadence="/month"
            badge="Best value"
            featured
            features={[
              "Everything in Free",
              "Unlimited menu scans",
              "Translation to 50+ languages",
              "Search, filter, and dietary info",
              "Real photos + AI-generated dish images",
            ]}
            cta={
              isPremium ? (
                <Button asChild className="h-11 w-full rounded-full">
                  <Link to="/scan">Scan a menu</Link>
                </Button>
              ) : (
                <Button
                  onClick={handleGoPremium}
                  disabled={loading}
                  className="h-11 w-full rounded-full"
                >
                  {loading ? "Loading…" : "Go Premium"}
                </Button>
              )
            }
            footnote={isPremium ? "You're already Premium on this device." : undefined}
          />

          {/* Restaurants tier */}
          <TierCard
            name="For restaurants"
            price="$39"
            cadence="one-time"
            features={[
              "Permanent public menu page",
              "Printable QR code for tables",
              "Translation to 50+ languages",
              "Edit or replace your menu anytime",
            ]}
            cta={
              <Button asChild className="h-11 w-full rounded-full" variant="outline">
                <Link to="/restaurants/new">Create your menu page</Link>
              </Button>
            }
          />
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
