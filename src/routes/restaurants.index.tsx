import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { TrustStrip } from "@/components/trust-strip";
import { HowItWorks } from "@/components/how-it-works";
import { FaqTeaser } from "@/components/faq-teaser";

export const Route = createFileRoute("/restaurants/")({
  head: () => ({
    meta: [
      { title: "For restaurants — MenuVision AI" },
      {
        name: "description",
        content:
          "Give every guest a picture-perfect, translated menu. Snap your menu once, share one link forever.",
      },
      { property: "og:title", content: "For restaurants — MenuVision AI" },
      {
        property: "og:description",
        content:
          "Snap your menu once. Get a permanent link with translations and dish photos.",
      },
    ],
  }),
  component: RestaurantsLanding,
});

const INCLUDED = [
  "Permanent public menu page",
  "Printable QR code for tables",
  "Translations in 50+ languages",
  "Rich dish photos from the web",
  "Edit or re-scan anytime",
  "No app required for your guests",
];

const RESTAURANT_FAQ = [
  {
    q: "How much does it cost?",
    a: "A one-time $39 fee per menu page. No subscription, no per-scan fees.",
  },
  {
    q: "Can I update the menu later?",
    a: "Yes. Use your edit link to rename, re-scan, or replace the menu — the public link stays the same.",
  },
  {
    q: "Do guests need an app?",
    a: "No. They scan the QR code and the menu opens in any phone's browser.",
  },
  {
    q: "Which languages do you translate to?",
    a: "Over 50, including Spanish, French, Japanese, Chinese, Arabic, German, and more.",
  },
];

function RestaurantsLanding() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(40rem 30rem at 20% 20%, color-mix(in oklch, var(--primary) 35%, transparent), transparent 70%), radial-gradient(35rem 30rem at 90% 80%, color-mix(in oklch, var(--accent) 50%, transparent), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-3xl px-5 py-20 text-center sm:py-28">
          <p className="text-sm font-medium text-primary">For restaurants</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-6xl">
            One menu link.
            <br />
            Every language.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Snap a photo of your menu. We translate it, write appetizing descriptions,
            and illustrate every dish. Share one link with every guest — no app, no
            sign-up.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
              <Link to="/restaurants/new">Create your menu page</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-full px-6 text-base"
            >
              <Link to="/demo">Try the live demo</Link>
            </Button>
          </div>
          <TrustStrip className="mx-auto mt-8 max-w-xl" />
        </div>
      </section>

      <HowItWorks variant="restaurant" title="From printed menu to QR code in minutes" />

      {/* What you get */}
      <section id="how-it-works" className="border-t border-border/60 scroll-mt-20">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <div className="text-center">
            <p className="text-sm font-medium text-primary">$39 one-time</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              What you get
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              One price. No subscription. Your menu, hosted forever.
            </p>
          </div>
          <ul className="mx-auto mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
            {INCLUDED.map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm"
              >
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
          <div className="mt-8 text-center">
            <Button asChild size="lg" className="h-12 rounded-full px-6 text-base">
              <Link to="/restaurants/new">Create your menu page</Link>
            </Button>
          </div>
        </div>
      </section>

      <FaqTeaser items={RESTAURANT_FAQ} heading="Restaurant owner FAQs" />

      <SiteFooter />
    </div>
  );
}

