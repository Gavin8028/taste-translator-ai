import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice — MenuVision AI" },
      {
        name: "description",
        content:
          "How Gavin McKinney (MenuVision AI) collects, uses, shares, and protects your personal data.",
      },
      { property: "og:title", content: "Privacy Notice — MenuVision AI" },
      {
        property: "og:description",
        content:
          "How MenuVision AI collects, uses, shares, and protects your personal data.",
      },
      { property: "og:url", content: "https://menuvisionai.live/privacy" },
    ],
    links: [{ rel: "canonical", href: "https://menuvisionai.live/privacy" }],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-16">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Privacy Notice
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="mt-8 space-y-8 text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Who we are</h2>
            <p>
              MenuVision AI is operated by Gavin McKinney (&ldquo;we&rdquo;,
              &ldquo;us&rdquo;, &ldquo;our&rdquo;), trading as MenuVision AI. We act as
              the data controller for the personal data described in this notice. You
              can contact us about privacy matters at{" "}
              <a
                href="mailto:support@menuvisionai.live"
                className="underline hover:text-foreground"
              >
                support@menuvisionai.live
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              2. Categories of personal data we collect
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Menu photos and scans</strong> you upload, and the AI-generated
                analysis derived from them.
              </li>
              <li>
                <strong>Restaurant menu content</strong> you create or edit (dish names,
                descriptions, prices, images).
              </li>
              <li>
                <strong>Technical data</strong> such as IP address, browser type, device
                information, and basic request logs, collected automatically when you
                use the service.
              </li>
              <li>
                <strong>Billing and contact data</strong> (name, email, billing address,
                transaction reference) when you purchase a paid plan. Card details are
                collected and processed directly by Paddle and are never stored by us.
              </li>
              <li>
                <strong>Support communications</strong> if you contact us for help.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              3. Purposes and legal bases
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Providing the service</strong> (analyzing menu photos, hosting
                menus you publish, generating dish images) — performance of a contract
                with you.
              </li>
              <li>
                <strong>Processing payments and managing subscriptions</strong> —
                performance of a contract, and compliance with our legal and tax
                obligations.
              </li>
              <li>
                <strong>Security, fraud prevention, and abuse detection</strong> —
                legitimate interests in protecting our service and users.
              </li>
              <li>
                <strong>Improving the product</strong> (aggregated usage analytics) —
                legitimate interests.
              </li>
              <li>
                <strong>Customer support</strong> — legitimate interests and, where
                applicable, performance of a contract.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              4. How we share your data
            </h2>
            <p>We share personal data only with the following categories of recipients:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong>Paddle.com Market Ltd (&ldquo;Paddle&rdquo;)</strong> — our
                Merchant of Record. Paddle processes all payments, manages
                subscriptions, handles tax compliance, issues invoices, and provides
                customer service for orders and refunds. See{" "}
                <a
                  href="https://www.paddle.com/legal/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="underline hover:text-foreground"
                >
                  Paddle&apos;s privacy notice
                </a>
                .
              </li>
              <li>
                <strong>Hosting and infrastructure providers</strong> that run our
                servers, database, and storage.
              </li>
              <li>
                <strong>AI providers</strong> that analyze menu photos and generate dish
                images on our behalf. Photos are sent for analysis only and are not
                retained on our servers afterwards.
              </li>
              <li>
                <strong>Professional advisers</strong> (legal, accounting) where
                necessary.
              </li>
              <li>
                <strong>Authorities</strong> where we are required to do so by law.
              </li>
            </ul>
            <p>We do not sell your personal data.</p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">5. Data retention</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Menu photos you upload for scanning are sent to our AI provider and are
                not retained on our servers after analysis is complete.
              </li>
              <li>
                Anonymous scan results live in your browser&apos;s session storage only
                and disappear when you close the tab.
              </li>
              <li>
                Published menus and dish images you create are retained for as long as
                the menu remains active, and are deleted on request from the menu owner.
              </li>
              <li>
                Billing and transaction records are retained by us and by Paddle for as
                long as required by applicable tax and accounting law (typically 6 to 10
                years).
              </li>
              <li>
                Server logs are retained for a short period for security and
                troubleshooting purposes, then deleted or anonymized.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">6. Your rights</h2>
            <p>
              Subject to applicable law (including the GDPR and UK GDPR where
              relevant), you have the right to: access the personal data we hold about
              you; have inaccurate data corrected; have your data deleted; restrict or
              object to processing; request portability of data you provided; and
              withdraw any consent you previously gave. You also have the right to
              lodge a complaint with your local data protection supervisory authority.
              To exercise any of these rights, contact us using the details on the
              About page. We aim to respond within one month.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              7. International transfers
            </h2>
            <p>
              Our service providers (including Paddle and our AI and hosting providers)
              may process personal data outside your country of residence, including in
              the United States. Where required, transfers are protected by appropriate
              safeguards such as the European Commission&apos;s Standard Contractual
              Clauses or equivalent mechanisms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">8. Security</h2>
            <p>
              We use appropriate technical and organisational measures to protect
              personal data, including encryption in transit, access controls, and
              least-privilege server-side access to sensitive data. No system is
              perfectly secure, but we work to keep your data safe.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">9. Cookies</h2>
            <p>
              We do not use cookies for advertising or cross-site tracking. We use only
              strictly necessary storage (such as your browser&apos;s session storage)
              to make the service work.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              10. Changes to this notice
            </h2>
            <p>
              We may update this notice from time to time. Material changes will be
              reflected by updating the &ldquo;Last updated&rdquo; date above.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
