import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Camera, Globe, Sparkles, Eye, Check, Languages, Zap, Leaf, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HOME_PRICING_PLANS } from "@/lib/pricing-plans";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MenuVision AI — See every dish before you order" },
      {
        name: "description",
        content:
          "Snap a photo of any menu. See what every dish looks like, instantly.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Hero — Shazam-style centered button */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(45rem 35rem at 50% 30%, color-mix(in oklch, var(--primary) 45%, transparent), transparent 70%), radial-gradient(35rem 30rem at 85% 90%, color-mix(in oklch, var(--secondary) 55%, transparent), transparent 70%), radial-gradient(30rem 30rem at 10% 80%, color-mix(in oklch, var(--accent) 70%, transparent), transparent 70%)",
          }}
        />

        <div className="mx-auto flex max-w-3xl flex-col items-center px-5 pb-16 pt-16 text-center sm:pb-24 sm:pt-20">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">
            Tap to scan a menu
          </h1>
          <p className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
            See every dish before you order — in any language, anywhere.
          </p>

          <Link
            to="/scan"
            aria-label="Scan a menu"
            className="group relative mt-12 flex h-60 w-60 flex-col items-center justify-center rounded-full text-primary-foreground transition-transform active:scale-95 sm:h-72 sm:w-72"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, color-mix(in oklch, var(--accent) 70%, white), var(--primary) 55%, color-mix(in oklch, var(--secondary) 70%, var(--primary)))",
              boxShadow:
                "0 30px 70px -15px color-mix(in oklch, var(--primary) 70%, transparent), 0 0 0 8px color-mix(in oklch, var(--primary) 12%, transparent)",
            }}
          >
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full opacity-30"
              style={{ backgroundColor: "var(--primary)" }}
            />
            <span
              aria-hidden
              className="absolute -inset-6 -z-10 rounded-full opacity-30 blur-2xl"
              style={{ backgroundColor: "var(--secondary)" }}
            />
            <Camera className="relative h-16 w-16" strokeWidth={1.5} />
            <span className="relative mt-2 text-xl font-semibold tracking-tight">
              Scan Menu
            </span>
          </Link>

          <Button
            asChild
            variant="outline"
            className="mt-8 h-11 rounded-full px-6"
          >
            <Link to="/pricing">See pricing</Link>
          </Button>

          <p className="mt-4 text-xs text-muted-foreground">
            Free · No sign-up · 50+ languages
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-surface">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
            Three taps. One great meal.
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                icon: Camera,
                title: "Snap",
                body: "Take a photo of any menu — printed, handwritten, or chalkboard.",
                tint: "var(--primary)",
              },
              {
                icon: Globe,
                title: "Translate",
                body: "We detect the language and translate every dish into yours.",
                tint: "var(--primary)",
              },
              {
                icon: Eye,
                title: "See it",
                body: "A picture, ingredients, and a short description for each dish.",
                tint: "var(--primary)",
              },
            ].map((step) => (
              <div
                key={step.title}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl text-primary-foreground"
                  style={{ backgroundColor: step.tint }}
                >
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            Works on menus from anywhere in the world
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <div className="text-center">
            <p className="text-sm font-medium text-primary">Why MenuVision</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Built for travelers and curious eaters.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Languages,
                title: "50+ languages",
                body: "From Japanese kanji to Greek script — we read it all.",
              },
              {
                icon: UserX,
                title: "No sign-up",
                body: "Open the app, snap a menu, get answers. That's it.",
              },
              {
                icon: Leaf,
                title: "Dietary tags",
                body: "Vegetarian, vegan, and gluten-free flags when we can spot them.",
              },
              {
                icon: Zap,
                title: "Fast results",
                body: "Most menus are translated and illustrated in under 20 seconds.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <v.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {v.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-5xl px-5 py-16">
          <div className="text-center">
            <p className="text-sm font-medium text-primary">Pricing</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Free to start. Cheap to love.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {HOME_PRICING_PLANS.map((t) => (
              <div
                key={t.id}
                className={`flex flex-col rounded-3xl border p-7 shadow-sm ${
                  t.featured
                    ? "border-primary/60 bg-card ring-1 ring-primary/30"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold">{t.name}</h3>
                  {t.badge && (
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                      {t.badge}
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">{t.price}</span>
                  <span className="text-sm text-muted-foreground">{t.cadence}</span>
                </div>
                <ul className="mt-5 space-y-2 text-sm">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/pricing">Compare plans</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Restaurant mode callout */}
      <section className="border-t border-border/60 bg-surface">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-5 py-12 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-sm font-medium text-primary">For restaurants</p>
            <h3 className="mt-1 text-xl font-semibold tracking-tight sm:text-2xl">
              Give every guest a translated, illustrated menu.
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Snap your menu once. Share one permanent link forever.
            </p>
          </div>
          <Button asChild className="rounded-full">
            <Link to="/restaurants">Learn more</Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
