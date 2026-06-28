import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Clock, ImageUp, Trash2, Cloud, LogIn } from "lucide-react";
import {
  listRecentScans,
  deleteScan as deleteLocal,
  type RecentScan,
} from "@/lib/scan-store";
import { listMyScans, deleteMyScan } from "@/lib/scan-sync.functions";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Menu history — MenuVision AI" },
      {
        name: "description",
        content:
          "Your saved menu scans, organized in one place.",
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

type Item = RecentScan & { remote?: boolean };

function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    const local = listRecentScans().map((s): Item => ({ ...s, remote: false }));
    if (!user) {
      setItems(local);
      setLoading(false);
      return;
    }
    try {
      const remote = await listMyScans();
      const remoteItems: Item[] = remote.map((r) => ({
        id: r.client_id ?? r.id,
        restaurantName: r.title,
        dishCount: r.dish_count,
        sourceLanguage: r.source_language ?? "",
        createdAt: new Date(r.created_at).getTime(),
        remote: true,
      }));
      const seen = new Set<string>();
      const merged = [...remoteItems, ...local].filter((it) => {
        if (seen.has(it.id)) return false;
        seen.add(it.id);
        return true;
      });
      merged.sort((a, b) => b.createdAt - a.createdAt);
      setItems(merged);
    } catch {
      setItems(local);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (authLoading) return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user]);

  async function onDelete(item: Item) {
    deleteLocal(item.id);
    if (user && item.remote) {
      try {
        await deleteMyScan({ data: { clientId: item.id } });
      } catch {
        // ignore
      }
    }
    void refresh();
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

        {!user && !authLoading && (
          <div className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm">
            <p className="text-muted-foreground">
              Sign in to sync your menus across devices.
            </p>
            <Button asChild size="sm" className="rounded-full">
              <Link to="/auth">
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            </Button>
          </div>
        )}

        {user && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Cloud className="h-3.5 w-3.5" />
            Synced to your account
          </p>
        )}

        {loading ? (
          <p className="mt-10 text-sm text-muted-foreground">Loading…</p>
        ) : items.length === 0 ? (
          <div className="mt-10 rounded-3xl border border-dashed border-border bg-card p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ImageUp className="h-6 w-6" />
            </div>
            <h2 className="mt-5 text-xl font-semibold tracking-tight">
              No menus here yet
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Scan your first menu — translations, photos, and ingredients show up
              here automatically.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Button asChild className="h-11 rounded-full">
                <Link to="/scan">Scan your first menu</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-full">
                <Link to="/demo">See a live example</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm text-muted-foreground">
              {items.length} saved menu{items.length === 1 ? "" : "s"}.
            </p>
            <ul className="mt-8 space-y-2">
              {items.map((s) => (
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
                          {s.dishCount} dishes
                          {s.sourceLanguage ? ` · ${s.sourceLanguage}` : ""} ·{" "}
                          {formatRelative(s.createdAt)}
                          {s.remote ? " · Synced" : ""}
                        </p>
                      </div>
                    </Link>
                    <button
                      onClick={() => onDelete(s)}
                      aria-label="Delete scan"
                      className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
