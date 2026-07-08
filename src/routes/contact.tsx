import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Check, Copy, Mail } from "lucide-react";

const SUPPORT_EMAIL = "support@menuvisionai.live";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — MenuVision AI" },
      {
        name: "description",
        content:
          "Get in touch with MenuVision AI. Support for diners and restaurants, refund questions, privacy requests, and press inquiries.",
      },
      { property: "og:title", content: "Contact — MenuVision AI" },
      {
        property: "og:description",
        content:
          "Reach the MenuVision AI team for support, refunds, privacy requests, and press.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://menuvisionai.live/contact" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Contact — MenuVision AI" },
      {
        name: "twitter:description",
        content:
          "Reach the MenuVision AI team for support, refunds, privacy requests, and press.",
      },
    ],
    links: [{ rel: "canonical", href: "https://menuvisionai.live/contact" }],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [copied, setCopied] = useState(false);

  function copyEmail() {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16">
        <p className="text-sm font-medium text-primary">Contact</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
          Get in touch.
        </h1>
        <p className="mt-4 text-muted-foreground">
          We read every message and reply personally — usually within one business day.
        </p>

        <div className="mt-10 rounded-3xl border-2 border-primary/40 bg-primary/5 p-6 sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            <Mail className="h-6 w-6" />
          </div>
          <p className="mt-4 text-sm font-medium">Email us</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {SUPPORT_EMAIL}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild className="h-11 rounded-full">
              <a href={`mailto:${SUPPORT_EMAIL}`}>Send an email</a>
            </Button>
            <Button
              variant="outline"
              onClick={copyEmail}
              className="h-11 rounded-full"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy address"}
            </Button>
          </div>
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold tracking-tight">
            What to email us about
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <TopicCard title="Diners">
              Refunds, scan credits, Premium subscription, or account issues.{" "}
              <Link to="/refunds" className="text-primary hover:underline">
                Refund policy
              </Link>
              .
            </TopicCard>
            <TopicCard title="Restaurants">
              Menu edits, publishing help, replacing your menu, or taking a page
              down.
            </TopicCard>
            <TopicCard title="Privacy & data requests">
              Access, export, or deletion of your personal data.{" "}
              <Link to="/privacy" className="text-primary hover:underline">
                Privacy policy
              </Link>
              .
            </TopicCard>
            <TopicCard title="Press & partnerships">
              Media inquiries, integrations, or partnership proposals.
            </TopicCard>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="text-lg font-semibold tracking-tight">Response times</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <span className="text-foreground">Support:</span> within 1 business day
            </li>
            <li>
              <span className="text-foreground">Refunds:</span> processed within 1–3
              business days after approval
            </li>
            <li>
              <span className="text-foreground">Privacy requests:</span> within 30 days
            </li>
          </ul>
        </section>

        <section className="mt-8 rounded-2xl border border-border bg-card p-6 text-sm">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Business details
          </h2>
          <dl className="mt-4 space-y-3 text-muted-foreground">
            <div>
              <dt className="text-foreground">Product</dt>
              <dd>MenuVision AI</dd>
            </div>
            <div>
              <dt className="text-foreground">Support</dt>
              <dd>
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-primary hover:underline"
                >
                  {SUPPORT_EMAIL}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-foreground">Payments</dt>
              <dd>
                Payments are processed by Paddle.com Inc., our merchant of record.
                Paddle handles billing, tax, and payment support on our behalf.
              </dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-4 text-xs">
            <Link to="/terms" className="text-primary hover:underline">
              Terms
            </Link>
            <Link to="/privacy" className="text-primary hover:underline">
              Privacy
            </Link>
            <Link to="/refunds" className="text-primary hover:underline">
              Refunds
            </Link>
          </div>
        </section>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          Most questions are answered in our{" "}
          <Link to="/faq" className="text-primary hover:underline">
            FAQ
          </Link>
          .
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}

function TopicCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}
