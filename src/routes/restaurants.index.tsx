import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Camera, Share2, Globe, Sparkles } from "lucide-react";

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
              <a href="#how-it-works">See how it works</a>
            </Button>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-5xl px-5 py-16 scroll-mt-20">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            {
              icon: Camera,
              title: "Snap once",
              body: "Take a photo of your menu. We extract every dish in seconds.",
            },
            {
              icon: Globe,
              title: "Translate everything",
              body: "Pick your guests' language. Names, descriptions, ingredients — all of it.",
            },
            {
              icon: Share2,
              title: "Share one link",
              body: "Print a QR code, add it to your website, or send it in a DM. The link never expires.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {f.body}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          Free during preview — no card required.
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
