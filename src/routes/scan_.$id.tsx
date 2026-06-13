import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Flame, Search, Lock, Sparkles } from "lucide-react";
import { loadScan } from "@/lib/scan-store";
import type { Dish, MenuResult } from "@/lib/menu.functions";
import { DishCard } from "@/components/dish-card";
import { DishDetailSheet } from "@/components/dish-detail-sheet";
import { useDinerPremium } from "@/lib/premium-store";

export const Route = createFileRoute("/scan_/$id")({
  head: () => ({
    meta: [
      { title: "Your menu — MenuVision AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { id } = Route.useParams();
  const isPremium = useDinerPremium();
  const [data, setData] = useState<MenuResult | null>(null);
  const [missing, setMissing] = useState(false);
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [spice, setSpice] = useState<number | null>(null);
  const [active, setActive] = useState<Dish | null>(null);

  useEffect(() => {
    const d = loadScan(id);
    if (!d) setMissing(true);
    else setData(d);
  }, [id]);

  const cuisines = useMemo(
    () =>
      data
        ? Array.from(new Set(data.dishes.map((d) => d.cuisine).filter(Boolean)))
        : [],
    [data],
  );
  const diets = useMemo(
    () =>
      data
        ? Array.from(new Set(data.dishes.flatMap((d) => d.dietary).filter(Boolean)))
        : [],
    [data],
  );

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    return data.dishes.filter((d) => {
      if (q) {
        const hay = (
          d.nameOriginal +
          " " +
          d.nameTranslated +
          " " +
          d.description +
          " " +
          d.ingredients.join(" ")
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (cuisine && d.cuisine !== cuisine) return false;
      if (diet && !d.dietary.includes(diet)) return false;
      if (spice !== null && d.spiceLevel !== spice) return false;
      return true;
    });
  }, [data, query, cuisine, diet, spice]);

  if (missing) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">
            This scan isn't on this device
          </h1>
          <p className="mt-3 max-w-md text-muted-foreground">
            We keep scans in your browser, not in the cloud. Scan the menu again to see
            it here.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link to="/scan">Scan a menu</Link>
          </Button>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-16" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <Link
              to="/scan"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              New scan
            </Link>
            <h1 className="mt-2 truncate text-3xl font-semibold tracking-tight sm:text-4xl">
              {data.restaurantName || "Your menu"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {data.dishes.length} dishes · detected language:{" "}
              <span className="text-foreground">{data.sourceLanguage}</span>
            </p>
          </div>
        </div>

        {/* Filters — premium only */}
        {isPremium ? (
          <div className="mt-7 space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes, ingredients, cuisines…"
                className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {cuisines.map((c) => (
                <Chip
                  key={c}
                  label={c}
                  active={cuisine === c}
                  onClick={() => setCuisine(cuisine === c ? null : c)}
                />
              ))}
              {diets.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  active={diet === d}
                  onClick={() => setDiet(diet === d ? null : d)}
                />
              ))}
              {[1, 2, 3].map((s) => (
                <Chip
                  key={s}
                  active={spice === s}
                  onClick={() => setSpice(spice === s ? null : s)}
                  label={
                    <span className="inline-flex items-center gap-1">
                      {Array.from({ length: s }).map((_, i) => (
                        <Flame key={i} className="h-3 w-3" />
                      ))}
                      {s === 1 ? "Mild" : s === 2 ? "Medium" : "Hot"}
                    </span>
                  }
                />
              ))}
              {(cuisine || diet || spice !== null || query) && (
                <button
                  onClick={() => {
                    setCuisine(null);
                    setDiet(null);
                    setSpice(null);
                    setQuery("");
                  }}
                  className="rounded-full px-3 py-1.5 text-xs text-muted-foreground underline-offset-2 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <Link
            to="/pricing"
            className="mt-7 flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-5 py-4 text-sm transition hover:bg-muted"
          >
            <span className="flex items-center gap-3">
              <Lock className="h-4 w-4 text-primary" />
              <span>
                <span className="font-medium text-foreground">
                  Search, filters, dietary info & dish photos
                </span>{" "}
                <span className="text-muted-foreground">— unlock with Premium</span>
              </span>
            </span>
            <Sparkles className="h-4 w-4 text-primary" />
          </Link>
        )}

        {/* Grid */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dish, i) => (
            <DishCard
              key={`${dish.nameOriginal}-${i}`}
              dish={dish}
              onClick={() => setActive(dish)}
              allowAi={isPremium}
            />
          ))}
          {filtered.length === 0 && (
            <p className="col-span-full py-12 text-center text-sm text-muted-foreground">
              No dishes match your filters.
            </p>
          )}
        </div>
      </main>

      <DishDetailSheet
        dish={active}
        onClose={() => setActive(null)}
        allowAi={isPremium}
      />

      <SiteFooter />
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-card text-foreground hover:bg-accent"
      }`}
    >
      {label}
    </button>
  );
}
