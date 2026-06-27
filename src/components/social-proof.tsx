import { Quote } from "lucide-react";

const STATS = [
  { value: "8", label: "Cuisines in demo" },
  { value: "50+", label: "Languages" },
  { value: "∞", label: "Free scans" },
];

const QUOTES = [
  {
    quote:
      "I was in Tokyo and couldn't read a single thing. Snapped the menu and instantly knew what to order.",
    name: "Maya R.",
    role: "Traveler",
  },
  {
    quote:
      "The dietary tags actually flag gluten — I stopped guessing and started enjoying meals out again.",
    name: "Jordan T.",
    role: "Celiac diner",
  },
  {
    quote:
      "We printed one QR for every table. Tourists finally order confidently and tip better too.",
    name: "Luca M.",
    role: "Restaurant owner",
  },
];

export function SocialProof() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-5xl px-5 py-16">
        <div className="grid grid-cols-3 gap-4 rounded-2xl border border-border/70 bg-card p-6 text-center shadow-sm">
          {STATS.map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
                {s.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {QUOTES.map((q) => (
            <figure
              key={q.name}
              className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-6 shadow-sm"
            >
              <Quote className="h-5 w-5 text-primary" />
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-foreground">
                "{q.quote}"
              </blockquote>
              <figcaption className="mt-4 text-sm">
                <span className="font-semibold">{q.name}</span>
                <span className="text-muted-foreground"> · {q.role}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Illustrative early-user quotes.
        </p>
      </div>
    </section>
  );
}
