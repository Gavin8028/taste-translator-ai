import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Camera, Globe, Sparkles, Eye, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MenuVision AI — See every dish before you order" },
      {
        name: "description",
        content:
          "Snap a photo of any menu, anywhere in the world. MenuVision AI translates it, describes every dish, and shows you what it looks like — instantly.",
      },
      { property: "og:title", content: "MenuVision AI — See every dish before you order" },
      {
        property: "og:description",
        content:
          "Photograph any menu. Get instant translation, descriptions, and a picture of every dish.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-60"
          style={{
            background:
              "radial-gradient(60rem 30rem at 20% -10%, color-mix(in oklch, var(--primary) 14%, transparent), transparent), radial-gradient(40rem 20rem at 90% 10%, color-mix(in oklch, var(--primary) 8%, transparent), transparent)",
          }}
        />
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-20 sm:pt-28">
          <p className="text-sm font-medium text-primary">Travel smarter · Eat better</p>
          <h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            See every dish
            <br />
            <span className="text-primary">before you order.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Photograph any menu — anywhere in the world. MenuVision AI translates it,
            explains every dish, and shows you exactly what it looks like.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-7 text-base">
              <Link to="/scan">
                <Camera className="h-5 w-5" />
                Scan a menu
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="h-12 rounded-full px-5 text-base"
            >
              <Link to="/pricing">
                See pricing
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Free to try · No account needed · Works in 50+ languages
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-surface">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Three taps. One delicious dinner.
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Camera,
                title: "Snap the menu",
                body: "Drag a photo in, or use your phone's camera. JPG, PNG, WEBP, HEIC — anything works.",
              },
              {
                icon: Globe,
                title: "Instant translation",
                body: "We detect the language and translate every dish name and description into yours.",
              },
              {
                icon: Eye,
                title: "See it before you order",
                body: "A clear picture, ingredients, spice level, and a short description for every dish.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/70 bg-card p-7 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="border-t border-border/60">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              No more pointing and hoping.
            </h2>
            <p className="mt-5 max-w-md text-muted-foreground">
              Whether it's a handwritten taqueria menu in Mexico City or a tiny izakaya in
              Osaka, MenuVision turns any menu into something you can actually read — and
              actually see.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Works on printed menus, chalkboards, food trucks, and bars",
                "Filter by cuisine, spice level, vegetarian, and more",
                "Tap any dish for a bigger picture and full ingredient list",
              ].map((line) => (
                <li key={line} className="flex items-start gap-2">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative rounded-3xl border border-border/70 bg-card p-3 shadow-xl">
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "Tonkotsu Ramen", tag: "Japanese" },
                { name: "Pad See Ew", tag: "Thai" },
                { name: "Tacos al Pastor", tag: "Mexican" },
                { name: "Cacio e Pepe", tag: "Italian" },
              ].map((d, i) => (
                <div
                  key={d.name}
                  className="overflow-hidden rounded-2xl border border-border/70 bg-background"
                >
                  <div
                    className="aspect-[4/3] w-full"
                    style={{
                      background: `linear-gradient(135deg, color-mix(in oklch, var(--primary) ${20 + i * 10}%, var(--card)), color-mix(in oklch, var(--primary) ${5 + i * 6}%, var(--card)))`,
                    }}
                  />
                  <div className="p-3">
                    <p className="text-sm font-medium">{d.name}</p>
                    <p className="text-xs text-muted-foreground">{d.tag}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 bg-surface">
        <div className="mx-auto max-w-3xl px-5 py-20 text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Ready to never guess again?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Try it on your next menu. No sign-up required.
          </p>
          <Button asChild size="lg" className="mt-7 h-12 rounded-full px-8 text-base">
            <Link to="/scan">
              <Camera className="h-5 w-5" />
              Scan a menu
            </Link>
          </Button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
