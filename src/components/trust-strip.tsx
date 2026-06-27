import { Smartphone, Languages, Zap, UserX } from "lucide-react";

const ITEMS = [
  { icon: UserX, label: "No app download" },
  { icon: Languages, label: "50+ languages" },
  { icon: Zap, label: "Results in ~10s" },
  { icon: Smartphone, label: "Works on any phone" },
];

export function TrustStrip({ className = "" }: { className?: string }) {
  return (
    <ul
      className={`grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:justify-center sm:gap-3 ${className}`}
    >
      {ITEMS.map((it) => (
        <li
          key={it.label}
          className="inline-flex items-center justify-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground/80 backdrop-blur"
        >
          <it.icon className="h-3.5 w-3.5 text-primary" />
          {it.label}
        </li>
      ))}
    </ul>
  );
}
