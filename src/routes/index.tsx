import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Camera } from "lucide-react";

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

      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-5">
        {/* Vibrant ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(40rem 40rem at 50% 40%, color-mix(in oklch, var(--primary) 35%, transparent), transparent 70%), radial-gradient(30rem 30rem at 80% 90%, color-mix(in oklch, var(--accent) 60%, transparent), transparent 70%), radial-gradient(30rem 30rem at 10% 80%, color-mix(in oklch, var(--primary) 25%, transparent), transparent 70%)",
          }}
        />

        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Tap to scan a menu
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            See every dish before you order.
          </p>

          {/* Big Shazam-style button */}
          <Link
            to="/scan"
            aria-label="Scan a menu"
            className="group relative mt-12 flex h-56 w-56 items-center justify-center rounded-full text-primary-foreground shadow-2xl transition-transform active:scale-95 sm:h-64 sm:w-64"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, color-mix(in oklch, var(--primary) 80%, white), var(--primary))",
              boxShadow:
                "0 25px 60px -15px color-mix(in oklch, var(--primary) 60%, transparent)",
            }}
          >
            {/* Pulse rings */}
            <span
              aria-hidden
              className="absolute inset-0 -z-10 animate-ping rounded-full opacity-40"
              style={{ backgroundColor: "var(--primary)" }}
            />
            <span
              aria-hidden
              className="absolute -inset-4 -z-10 rounded-full opacity-20 blur-2xl"
              style={{ backgroundColor: "var(--primary)" }}
            />
            <Camera className="h-20 w-20" strokeWidth={1.5} />
          </Link>

          <Link
            to="/pricing"
            className="mt-10 text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            See pricing
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
