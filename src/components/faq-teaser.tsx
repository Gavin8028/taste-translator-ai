import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function FaqTeaser({
  items,
  heading = "Quick answers",
}: {
  items: { q: string; a: string }[];
  heading?: string;
}) {
  return (
    <section className="border-t border-border/60 bg-surface">
      <div className="mx-auto max-w-3xl px-5 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {heading}
        </h2>
        <dl className="mt-8 divide-y divide-border/70 rounded-2xl border border-border/70 bg-card shadow-sm">
          {items.map((item) => (
            <div key={item.q} className="px-5 py-4">
              <dt className="text-sm font-semibold">{item.q}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 text-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/faq">See all FAQs</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
