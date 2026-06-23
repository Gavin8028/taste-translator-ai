import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Clock, ImageUp, Trash2 } from "lucide-react";
import {
  listRecentScans,
  deleteScan,
  type RecentScan,
} from "@/lib/scan-store";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Menu history — MenuVision AI" },
      {
        name: "description",
        content:
          "Your saved menu scans, organized in one place on this device.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: HistoryPage,
});

function formatRelative(ts: number): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

function HistoryPage() {
  const [scans, setScans] = useState<RecentScan[]>([]);

  useEffect(() => {
    setScans(listRecentScans());
  }, []);

  function onDelete(id: string) {
    deleteScan(id);
    setScans(listRecentScans());
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:py-16">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Clock className="h-4 w-4" />
          Menu history
        </div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          Your scanned menus
        </h1>

        {scans.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">
              You haven't scanned any menus yet.
            </p>
            <Button asChild className="mt-5 h-11 rounded-full">
              <Link to="/scan">Scan your first menu</Link>
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              {scans.length} saved menu{scans.length === 1 ? "" : "s"} on this
              device.
            </p>
            <ul className="mt-8 space-y-2">
              {scans.map((s) => (
                <li key={s.id}>
                  <div className="group flex items-center gap-2 rounded-2xl border border-border/70 bg-card p-3 transition-colors hover:bg-accent/40">
                    <Link
                      to="/scan/$id"
                      params={{ id: s.id }}
                      className="flex flex-1 items-center gap-3 min-w-0"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ImageUp className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">
                          {s.restaurantName || "Untitled menu"}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {s.dishCount} dishes · {s.sourceLanguage} ·{" "}
                          {formatRelative(s.createdAt)}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => onDelete(s.id)}
                      aria-label="Delete scan"
                      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted-foreground">
              Scans stay on this device. Clearing your browser data will remove
              them.
            </p>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
