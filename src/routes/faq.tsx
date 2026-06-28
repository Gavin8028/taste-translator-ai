import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

const FAQS = [
  {
    q: "What is MenuVision AI?",
    a: "Snap a photo of any menu and instantly see what every dish looks like — translated into your language, with ingredients and dietary tags.",
  },
  {
    q: "Do I need to sign up?",
    a: "No. Open the app, tap Scan a menu, and go. No account, no email, no friction.",
  },
  {
    q: "Is it really free?",
    a: "Yes. Scanning, translating, searching, filtering, and viewing your scan history are all free, forever.",
  },
  {
    q: "How many languages do you support?",
    a: "50+ languages, including Japanese, Chinese, Korean, Arabic, Greek, Russian, and most European languages.",
  },
  {
    q: "Where do the dish photos come from?",
    a: "We search real food photos from the web first — up to 5 per dish so you can swipe through. If nothing reliable comes back and you're on a paid menu or Diner Premium, we generate one with AI.",
  },
  {
    q: "What's Diner Premium?",
    a: "$4.79/month. Adds richer AI-generated dish photos when no real photo is found, plus a few extra perks. Everything else stays free.",
  },
  {
    q: "I own a restaurant — how does that work?",
    a: "You snap your menu once, pay a one-time $39 fee, and get a permanent link plus a QR code for your tables. Guests scan, see every dish in their language, with photos.",
  },
  {
    q: "Can I edit my restaurant menu later?",
    a: "Yes. You get an owner edit token in your browser. You can rename, re-scan, or delete your menu anytime from /restaurants/your-slug/edit.",
  },
  {
    q: "Who handles payments?",
    a: "Payments are processed by Paddle as the Merchant of Record. Charges appear on your statement as MenuVision AI.",
  },
  {
    q: "What's your refund policy?",
    a: "30-day money-back guarantee on the $39 restaurant fee and on Diner Premium. See the Refunds page for full details.",
  },
];

const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.a,
    },
  })),
};

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQ — MenuVision AI" },
      {
        name: "description",
        content:
          "Answers to common questions about MenuVision AI — scanning menus, translations, photos, pricing, and the restaurant plan.",
      },
      { property: "og:title", content: "FAQ — MenuVision AI" },
      {
        property: "og:description",
        content:
          "Quick answers about MenuVision AI: scanning, languages, photos, and pricing.",
      },
      { property: "og:url", content: "https://menuvisionai.live/faq" },
    ],
    links: [{ rel: "canonical", href: "https://menuvisionai.live/faq" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify(FAQ_SCHEMA),
      },
    ],
  }),
  component: FaqPage,
});

function FaqPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-12">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">FAQ</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Quick answers
          </h1>
          <p className="mt-3 text-muted-foreground">
            Everything you might wonder before your next meal.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-10">
          {FAQS.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Still have a question? Try a real scan.
          </p>
          <Button asChild className="rounded-full">
            <Link to="/scan">Scan a menu</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
