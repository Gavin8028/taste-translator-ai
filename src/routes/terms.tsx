import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms & Conditions — MenuVision AI" },
      {
        name: "description",
        content:
          "The terms under which Gavin McKinney (MenuVision AI) provides the MenuVision AI service.",
      },
      { property: "og:title", content: "Terms & Conditions — MenuVision AI" },
      {
        property: "og:description",
        content:
          "The terms under which MenuVision AI provides its service.",
      },
      { property: "og:url", content: "https://menuvisionai.live/terms" },
    ],
    links: [{ rel: "canonical", href: "https://menuvisionai.live/terms" }],
  }),
  component: TermsPage,
});

function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-16">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Terms &amp; Conditions
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="mt-8 space-y-8 text-muted-foreground">
          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">1. Who you are contracting with</h2>
            <p>
              The MenuVision AI service (the &ldquo;Service&rdquo;) is provided by Gavin
              McKinney, trading as MenuVision AI (&ldquo;we&rdquo;, &ldquo;us&rdquo;,
              &ldquo;our&rdquo;). By using the Service you (&ldquo;you&rdquo;) enter
              into a binding agreement with us on these terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">2. Acceptance</h2>
            <p>
              By accessing or using the Service you agree to these Terms &amp;
              Conditions and to our{" "}
              <a href="/privacy" className="underline hover:text-foreground">
                Privacy Notice
              </a>
              . If you do not agree, do not use the Service. If you use the Service on
              behalf of an organisation, you confirm you have authority to bind that
              organisation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">3. The Service</h2>
            <p>
              MenuVision AI lets you scan restaurant menus, generate AI-assisted dish
              descriptions and images, and publish menus you create. Features and
              limits depend on the plan you choose.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">4. Acceptable use</h2>
            <p>You must not:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>use the Service for any unlawful, fraudulent, or harmful purpose;</li>
              <li>upload content you do not have the right to use;</li>
              <li>
                upload content that infringes intellectual property, privacy, or other
                rights of any third party;
              </li>
              <li>
                attempt to probe, scan, reverse engineer, or interfere with the
                security or integrity of the Service;</li>
              <li>
                use the Service to send spam, malware, or other malicious payloads;
              </li>
              <li>
                scrape, resell, or redistribute the Service or its output beyond what
                your plan permits.
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              5. AI features and your content
            </h2>
            <p>
              The Service uses generative AI to analyse menu photos and produce dish
              descriptions and images. You are responsible for the inputs you provide,
              for verifying the accuracy of AI outputs, and for the way you use those
              outputs. AI outputs may be inaccurate or incomplete and are not a
              substitute for professional judgement (for example, regarding allergens
              or dietary advice). You must not use the Service to generate illegal
              content, content that infringes third-party rights, hate speech, sexual
              content involving minors, or content intended to deceive or harm others.
              We may remove content, refuse outputs, or suspend accounts that misuse
              the AI features, including for repeated infringement.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              6. Intellectual property
            </h2>
            <p>
              We retain all right, title, and interest in the Service, including its
              software, models, branding, and documentation. You retain ownership of
              the content you upload. You grant us a limited, non-exclusive,
              non-transferable licence to host, process, and display your content
              solely as needed to provide the Service to you.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              7. Payment, subscriptions, and refunds
            </h2>
            <p>
              Our order process is conducted by our online reseller Paddle.com.
              Paddle.com is the Merchant of Record for all our orders. Paddle provides
              all customer service inquiries and handles returns. Payment, billing,
              tax, cancellation, and refund mechanics are governed by{" "}
              <a
                href="https://www.paddle.com/legal/checkout-buyer-terms"
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-foreground"
              >
                Paddle&apos;s Buyer Terms
              </a>
              . Our refund window and the process for requesting a refund are
              described in our{" "}
              <a href="/refunds" className="underline hover:text-foreground">
                Refund Policy
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              8. Service level and disclaimers
            </h2>
            <p>
              The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as
              available&rdquo; basis. We do not guarantee that the Service will be
              uninterrupted, timely, error-free, or that AI outputs will meet your
              requirements. To the fullest extent permitted by law we disclaim all
              implied warranties, including merchantability and fitness for a
              particular purpose.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              9. Suspension and termination
            </h2>
            <p>
              We may suspend or terminate your access to the Service if you materially
              breach these terms, fail to pay fees when due, create a security or
              fraud risk, or repeatedly or seriously violate our acceptable use
              policy. You may stop using the Service at any time. On termination, any
              rights granted to you under these terms end immediately.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              10. Limitation of liability
            </h2>
            <p>
              To the fullest extent permitted by law, our aggregate liability arising
              out of or in connection with these terms is limited to the fees you paid
              to us in the twelve months preceding the event giving rise to the
              claim. We are not liable for indirect, incidental, special,
              consequential, or punitive damages, including loss of profits, data, or
              goodwill. Nothing in these terms excludes liability that cannot be
              excluded by law (such as fraud, death, or personal injury caused by
              negligence).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">11. Indemnity</h2>
            <p>
              You agree to indemnify us against claims, losses, and expenses arising
              from your content, your use of the Service in breach of these terms, or
              your violation of applicable law or third-party rights.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              12. Changes to these terms
            </h2>
            <p>
              We may update these terms from time to time. Material changes will be
              reflected by updating the &ldquo;Last updated&rdquo; date above.
              Continued use of the Service after changes take effect constitutes
              acceptance of the updated terms.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold text-foreground">
              13. Governing law
            </h2>
            <p>
              These terms are governed by the laws of the jurisdiction in which the
              seller is established, without regard to its conflict-of-laws rules.
              Disputes will be subject to the exclusive jurisdiction of the competent
              courts of that jurisdiction, except where applicable consumer-protection
              law gives you the right to bring proceedings elsewhere.
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
