import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { useAuth } from "@/hooks/use-auth";
import {
  PRICING_PLANS,
  PREMIUM_BILLING,
  PREMIUM_ANNUAL_SAVINGS_PCT,
  type PremiumBillingCycle,
} from "@/lib/pricing-plans";


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
  const { user } = useAuth();
  const navigate = useNavigate();

  function handlePremium(priceId: string) {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/pricing" } });
      return;
    }
    openCheckout({
      priceId,
      customerEmail: user.email,
      customData: { userId: user.id },
      successUrl: `${window.location.origin}/checkout/premium-success`,
    });
  }



  function handleScanPack(priceId: string) {
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/pricing" } });
      return;
    }
    openCheckout({
      priceId,
      customerEmail: user.email,
      customData: { userId: user.id },
      successUrl: `${window.location.origin}/scan?purchase=success`,
    });
  }




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

        <div className="mx-auto mt-10 grid max-w-6xl gap-6 md:grid-cols-2 xl:grid-cols-4">
          {PRICING_PLANS.flatMap((plan) => {
            const isPremium = plan.id === "diner_premium_monthly";

            if (isPremium) {
              return (["monthly", "annual"] as const).map((cycle) => {
                const opt = PREMIUM_BILLING[cycle];
                const isAnnual = cycle === "annual";
                return (
                  <TierCard
                    key={opt.priceId}
                    name={isAnnual ? `${plan.name} — Yearly` : `${plan.name} — Monthly`}
                    price={opt.price}
                    cadence={opt.cadence}
                    anchor={isAnnual ? PREMIUM_BILLING.annual.anchor : undefined}
                    footnote={opt.note}
                    features={plan.features}
                    badge={isAnnual ? `Save ${PREMIUM_ANNUAL_SAVINGS_PCT}%` : plan.badge}
                    featured={isAnnual}
                    cta={
                      <Button
                        className="h-11 w-full rounded-full"
                        variant={isAnnual ? "default" : "outline"}
                        disabled={checkoutLoading}
                        onClick={() => handlePremium(opt.priceId)}
                      >
                        {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {user
                          ? isAnnual
                            ? "Get Premium yearly"
                            : "Get Premium monthly"
                          : "Sign in to subscribe"}
                      </Button>
                    }
                  />
                );
              });
            }

            return [
            <TierCard
              key={plan.id}
              name={plan.name}
              price={plan.price}
              cadence={plan.cadence}
              features={plan.features}
              badge={plan.badge}
              featured={plan.featured}
              cta={
                plan.id === "restaurant_publish" ? (
                  <Button asChild className="h-11 w-full rounded-full" variant="outline">
                    <Link to="/restaurants/new">Create your menu page</Link>
                  </Button>
                ) : plan.id.startsWith("scan_pack_") ? (
                  <Button
                    className="h-11 w-full rounded-full"
                    variant="outline"
                    disabled={checkoutLoading}
                    onClick={() => handleScanPack(plan.id)}
                  >
                    {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {user ? `Buy ${plan.scanCount} scans` : "Sign in to buy"}
                  </Button>
                ) : (
                  <Button asChild className="h-11 w-full rounded-full" variant="outline">
                    <Link to="/scan">Scan a menu</Link>
                  </Button>
                )
              }
            />
            ];
          })}

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
  anchor,
}: {
  name: string;
  price: string;
  cadence: string;
  features: string[];
  cta: React.ReactNode;
  badge?: string;
  featured?: boolean;
  footnote?: string;
  anchor?: string;
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
        {anchor && (
          <span className="text-lg text-muted-foreground line-through">{anchor}</span>
        )}
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
