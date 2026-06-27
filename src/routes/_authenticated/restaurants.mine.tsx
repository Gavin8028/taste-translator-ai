import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { listMyMenus } from "@/lib/restaurant-owner.functions";
import { ExternalLink, Loader2, Pencil, Plus, Store } from "lucide-react";

export const Route = createFileRoute("/_authenticated/restaurants/mine")({
  head: () => ({
    meta: [
      { title: "My restaurant menus — MenuVision AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MyMenusPage,
});

function MyMenusPage() {
  const fetchMine = useServerFn(listMyMenus);
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-menus"],
    queryFn: () => fetchMine(),
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:py-16">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Store className="h-4 w-4" />
          Your menus
        </div>
        <div className="mt-2 flex items-end justify-between gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            My restaurant menus
          </h1>
          <Button asChild className="rounded-full">
            <Link to="/restaurants/new">
              <Plus className="h-4 w-4" />
              New menu
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="mt-12 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="mt-8 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
            {error instanceof Error ? error.message : "Could not load your menus."}
          </p>
        ) : !data?.length ? (
          <div className="mt-10 rounded-3xl border border-border bg-card p-10 text-center">
            <p className="text-muted-foreground">You haven't created any menus yet.</p>
            <Button asChild className="mt-5 rounded-full">
              <Link to="/restaurants/new">Create your first menu</Link>
            </Button>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {data.map((m) => (
              <li
                key={m.slug}
                className="rounded-2xl border border-border/70 bg-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{m.name}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      /m/{m.slug} · {m.targetLanguage} ·{" "}
                      {m.paid ? (
                        <span className="text-emerald-600 dark:text-emerald-400">
                          Published
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400">
                          Draft
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button asChild variant="outline" size="sm" className="rounded-full">
                      <Link to="/m/$slug" params={{ slug: m.slug }}>
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="rounded-full">
                      <Link to="/restaurants/$slug/edit" params={{ slug: m.slug }}>
                        <Pencil className="h-3.5 w-3.5" />
                        Manage
                      </Link>
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
