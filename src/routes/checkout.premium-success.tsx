import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { setDinerPremium } from "@/lib/premium-store";

export const Route = createFileRoute("/checkout/premium-success")({
  head: () => ({
    meta: [
      { title: "Welcome to Premium — MenuVision AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PremiumSuccessPage,
});

function PremiumSuccessPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const txnId =
      params.get("_ptxn") ||
      params.get("transaction_id") ||
      undefined;
    setDinerPremium(txnId);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <CheckCircle2 className="h-14 w-14 text-primary" strokeWidth={1.5} />
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">
          You're Premium.
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          Unlimited menu scans, translations, search and filters, and rich dish
          photos are all unlocked on this device.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Button asChild className="h-11 rounded-full">
            <Link to="/scan">Scan a menu</Link>
          </Button>
          <Button asChild variant="ghost" className="h-11 rounded-full">
            <Link to="/">Back to home</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
