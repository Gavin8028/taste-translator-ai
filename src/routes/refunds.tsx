import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/refunds")({
  head: () => ({
    meta: [
      { title: "Refund Policy — MenuVision AI" },
      {
        name: "description",
        content:
          "MenuVision AI offers a 30-day money-back guarantee. Refunds are processed by Paddle.",
      },
    ],
  }),
  component: RefundsPage,
});

function RefundsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-16">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Refund Policy
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="mt-8 space-y-6 text-muted-foreground">
          <p>
            MenuVision AI, operated by Gavin McKinney, offers a{" "}
            <strong className="text-foreground">30-day money-back guarantee</strong> on
            paid plans. If you are not satisfied with your purchase, you can request a
            full refund within 30 days of the original order date.
          </p>

          <h2 className="text-xl font-semibold text-foreground">How to request a refund</h2>
          <p>
            Our order process is conducted by our online reseller Paddle.com.
            Paddle.com is the Merchant of Record for all our orders and handles
            refunds on our behalf. To request a refund, visit{" "}
            <a
              href="https://paddle.net"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground"
            >
              paddle.net
            </a>{" "}
            and use the order details from your purchase receipt, or contact us using
            the details on our{" "}
            <a href="/about" className="underline hover:text-foreground">About</a>{" "}
            page and we will pass the request to Paddle.
          </p>

          <h2 className="text-xl font-semibold text-foreground">After the 30 days</h2>
          <p>
            Refunds requested after the 30-day window are handled in line with{" "}
            <a
              href="https://www.paddle.com/legal/refund-policy"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-foreground"
            >
              Paddle&apos;s Refund Policy
            </a>{" "}
            and applicable consumer-protection law. You can still cancel a
            subscription at any time to stop future billing; cancellation takes effect
            at the end of the current billing period.
          </p>

          <h2 className="text-xl font-semibold text-foreground">Questions</h2>
          <p>
            If you have questions about a charge, a refund, or your subscription,
            contact us using the details on the About page and we will help you.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
