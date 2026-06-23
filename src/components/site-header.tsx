import { Link } from "@tanstack/react-router";
import { ThemeToggle } from "./theme-toggle";
import { Utensils } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Utensils className="h-4 w-4" />
          </span>
          <span>MenuVision</span>
          <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-accent-foreground">
            AI
          </span>
        </Link>
        <nav className="flex items-center gap-1 text-sm text-muted-foreground">
          <Link
            to="/scan"
            className="rounded-md px-3 py-1.5 hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            Scan
          </Link>
          <Link
            to="/history"
            className="rounded-md px-3 py-1.5 hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            History
          </Link>
          <Link
            to="/restaurants"
            className="rounded-md px-3 py-1.5 hover:text-foreground"
            activeProps={{ className: "text-foreground" }}
          >
            For restaurants
          </Link>
          <Link
            to="/pricing"
            className="hidden rounded-md px-3 py-1.5 hover:text-foreground sm:inline"
            activeProps={{ className: "text-foreground" }}
          >
            Pricing
          </Link>
          <Link
            to="/about"
            className="hidden rounded-md px-3 py-1.5 hover:text-foreground sm:inline"
            activeProps={{ className: "text-foreground" }}
          >
            About
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>© {new Date().getFullYear()} MenuVision AI</p>
        <div className="flex flex-wrap justify-center gap-5">
          <Link to="/about" className="hover:text-foreground">
            About
          </Link>
          <Link to="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link to="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link to="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link to="/refunds" className="hover:text-foreground">
            Refunds
          </Link>
        </div>
      </div>
    </footer>
  );
}
