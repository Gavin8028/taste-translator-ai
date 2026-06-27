import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { Utensils, Menu as MenuIcon, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { to: "/scan", label: "Scan a menu" },
  { to: "/demo", label: "See a demo menu" },
  { to: "/history", label: "History" },
  { to: "/restaurants", label: "For restaurants" },
  { to: "/pricing", label: "Pricing" },
  { to: "/faq", label: "FAQ" },
  { to: "/about", label: "About" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
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

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="Open menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-0">
              <SheetHeader className="flex flex-row items-center justify-between border-b border-border/60 px-5 py-4">
                <SheetTitle className="text-base font-semibold">Menu</SheetTitle>
                <SheetClose asChild>
                  <button
                    type="button"
                    aria-label="Close menu"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </SheetClose>
              </SheetHeader>
              <nav className="flex flex-col px-2 py-3">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setOpen(false)}
                    className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
                    activeProps={{ className: "bg-muted text-primary" }}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-8 text-sm text-muted-foreground">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> No app download
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> 50+ languages
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Works on any phone
          </span>
        </div>
        <div className="flex w-full flex-col items-center justify-between gap-3 border-t border-border/60 pt-4 sm:flex-row">
          <p>© {new Date().getFullYear()} MenuVision AI</p>
          <div className="flex flex-wrap justify-center gap-5">
            <Link to="/about" className="hover:text-foreground">About</Link>
            <Link to="/faq" className="hover:text-foreground">FAQ</Link>
            <Link to="/pricing" className="hover:text-foreground">Pricing</Link>
            <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground">Terms</Link>
            <Link to="/refunds" className="hover:text-foreground">Refunds</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
