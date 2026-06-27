import { Camera, Globe, Eye, Upload, Sparkles, Share2, ArrowRight, type LucideIcon } from "lucide-react";

type Variant = "diner" | "restaurant";

const STEPS: Record<Variant, { icon: LucideIcon; title: string; body: string }[]> = {
  diner: [
    { icon: Camera, title: "Snap", body: "Take a photo of any menu." },
    { icon: Globe, title: "Translate", body: "We translate every dish into your language." },
    { icon: Eye, title: "See dishes", body: "Real photos, ingredients, and dietary tags." },
  ],
  restaurant: [
    { icon: Upload, title: "Upload menu", body: "Snap or upload your printed menu." },
    { icon: Sparkles, title: "We process it", body: "AI translates and illustrates every dish." },
    { icon: Share2, title: "Share QR", body: "Print one QR code. Guests scan and read." },
  ],
};

export function HowItWorks({
  variant = "diner",
  title = "How it works",
}: {
  variant?: Variant;
  title?: string;
}) {
  const steps = STEPS[variant];
  return (
    <section className="border-t border-border/60 bg-surface">
      <div className="mx-auto max-w-5xl px-5 py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <div className="mt-10 flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-1 items-center gap-4 md:flex-col md:text-center">
              <div className="flex flex-col items-center md:items-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <s.icon className="h-6 w-6" />
                </span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-primary">
                  Step {i + 1}
                </span>
              </div>
              <div className="flex-1 md:mt-2">
                <h3 className="text-base font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="hidden h-5 w-5 shrink-0 text-muted-foreground/60 md:block" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
