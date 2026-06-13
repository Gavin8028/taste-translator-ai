import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useSuspenseQuery, queryOptions } from "@tanstack/react-query";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { DishCard } from "@/components/dish-card";
import { DishDetailSheet } from "@/components/dish-detail-sheet";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { getRestaurantMenu } from "@/lib/restaurant.functions";
import type { Dish } from "@/lib/menu.functions";

const menuQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["restaurant-menu", slug],
    queryFn: () => getRestaurantMenu({ data: { slug } }),
  });

export const Route = createFileRoute("/m/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(menuQueryOptions(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Menu` },
          {
            name: "description",
            content: `See every dish on the ${loaderData.name} menu, with photos and descriptions in ${loaderData.targetLanguage}.`,
          },
          { property: "og:title", content: `${loaderData.name} — Menu` },
          {
            property: "og:description",
            content: `Translated menu with pictures of every dish.`,
          },
        ]
      : [{ title: "Menu — MenuVision AI" }],
  }),
  component: MenuPage,
  notFoundComponent: () => (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Menu not found</h1>
        <p className="mt-3 text-muted-foreground">
          This menu link doesn't exist or has been removed.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link to="/">Back to home</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Couldn't load menu</h1>
        <p className="mt-3 text-muted-foreground">{error.message}</p>
      </main>
      <SiteFooter />
    </div>
  ),
});

function MenuPage() {
  const { slug } = Route.useParams();
  const { data } = useSuspenseQuery(menuQueryOptions(slug));
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [active, setActive] = useState<Dish | null>(null);

  // data is non-null here because the loader throws notFound() otherwise
  const menu = data!;

  if (!menu.paid) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-16 text-center">
          <p className="text-sm font-medium text-primary">Coming soon</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
            {menu.name}
          </h1>
          <p className="mt-4 text-muted-foreground">
            This menu isn't live yet. The owner is finishing setup — please check
            back in a bit.
          </p>
          <Button asChild className="mt-8 rounded-full">
            <Link to="/">Back to home</Link>
          </Button>
          <p className="mt-10 text-xs text-muted-foreground">
            Are you the owner?{" "}
            <Link
              to="/restaurants/$slug/edit"
              params={{ slug }}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Manage this menu
            </Link>
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const dishes: Dish[] = useMemo(
    () =>
      menu.dishes.map((d) => ({
        nameOriginal: d.nameOriginal,
        nameTranslated: d.nameTranslated,
        description: d.description,
        ingredients: d.ingredients,
        cuisine: d.cuisine,
        spiceLevel: d.spiceLevel,
        dietary: d.dietary,
        priceText: d.priceText ?? null,
      })),
    [menu],
  );

  const cuisines = useMemo(
    () => Array.from(new Set(dishes.map((d) => d.cuisine).filter(Boolean))),
    [dishes],
  );
  const diets = useMemo(
    () => Array.from(new Set(dishes.flatMap((d) => d.dietary).filter(Boolean))),
    [dishes],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return dishes.filter((d) => {
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
      return true;
    });
  }, [dishes, query, cuisine, diet]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">Menu</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            {menu.name}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {dishes.length} dishes · translated to {menu.targetLanguage}
            {menu.sourceLanguage ? ` from ${menu.sourceLanguage}` : ""}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search dishes, ingredients…"
              className="w-full rounded-full border border-border bg-card py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {(cuisines.length > 0 || diets.length > 0) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setCuisine(cuisine === c ? null : c)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  cuisine === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
            {diets.map((d) => (
              <button
                key={d}
                onClick={() => setDiet(diet === d ? null : d)}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  diet === d
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            No dishes match your filters.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((dish) => (
              <DishCard
                key={dish.nameOriginal + dish.nameTranslated}
                dish={dish}
                onClick={() => setActive(dish)}
                allowAi
              />
            ))}
          </div>
        )}

        <p className="mt-12 text-center text-xs text-muted-foreground">
          Powered by{" "}
          <Link to="/" className="font-medium text-foreground hover:underline">
            MenuVision AI
          </Link>
        </p>
      </main>

      <DishDetailSheet dish={active} onClose={() => setActive(null)} allowAi />
      <SiteFooter />
    </div>
  );
}
