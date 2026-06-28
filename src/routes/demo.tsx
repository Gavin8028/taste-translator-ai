import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { DishCard } from "@/components/dish-card";
import { DishDetailSheet } from "@/components/dish-detail-sheet";
import { Button } from "@/components/ui/button";
import { Search, Sparkles } from "lucide-react";
import type { Dish } from "@/lib/menu.functions";

const U = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

type DemoDish = Dish & { images: string[] };

const DEMO_DISHES: DemoDish[] = [
  {
    nameOriginal: "Margherita Pizza",
    nameTranslated: "Margherita Pizza",
    description:
      "Classic Neapolitan pizza with San Marzano tomato, fresh mozzarella, basil, and a drizzle of olive oil on a blistered sourdough crust.",
    ingredients: ["Tomato", "Mozzarella", "Basil", "Olive oil", "Flour"],
    cuisine: "Italian",
    spiceLevel: 0,
    dietary: ["Vegetarian"],
    priceText: "$14",
    translations: null,
    images: [
      U("photo-1574071318508-1cdbab80d002"),
      U("photo-1565299624946-b28f40a0ae38"),
      U("photo-1513104890138-7c749659a591"),
    ],
  },
  {
    nameOriginal: "Spaghetti Carbonara",
    nameTranslated: "Spaghetti Carbonara",
    description:
      "Al dente spaghetti tossed with crispy guanciale, pecorino romano, fresh egg yolk, and cracked black pepper.",
    ingredients: ["Spaghetti", "Guanciale", "Egg yolk", "Pecorino", "Black pepper"],
    cuisine: "Italian",
    spiceLevel: 0,
    dietary: [],
    priceText: "$17",
    translations: null,
    images: [
      U("photo-1612874742237-6526221588e3"),
      U("photo-1551183053-bf91a1d81141"),
      U("photo-1473093295043-cdd812d0e601"),
    ],
  },
  {
    nameOriginal: "Tonkotsu Ramen",
    nameTranslated: "Pork Bone Ramen",
    description:
      "Rich, milky pork-bone broth simmered 12 hours, wavy noodles, soft-boiled egg, chashu pork, scallions, and nori.",
    ingredients: ["Pork bone broth", "Ramen noodles", "Chashu", "Egg", "Scallion", "Nori"],
    cuisine: "Japanese",
    spiceLevel: 1,
    dietary: [],
    priceText: "$16",
    translations: null,
    images: [
      U("photo-1569718212165-3a8278d5f624"),
      U("photo-1591814468924-caf88d1232e1"),
      U("photo-1557872943-16a5ac26437e"),
    ],
  },
  {
    nameOriginal: "Pad Thai",
    nameTranslated: "Pad Thai",
    description:
      "Stir-fried rice noodles with shrimp, tofu, egg, bean sprouts, peanuts, and tamarind-lime sauce.",
    ingredients: ["Rice noodles", "Shrimp", "Tofu", "Peanut", "Tamarind", "Lime"],
    cuisine: "Thai",
    spiceLevel: 2,
    dietary: [],
    priceText: "$15",
    translations: null,
    images: [
      U("photo-1559314809-0d155014e29e"),
      U("photo-1637806930600-37fa8892069d"),
      U("photo-1626804475297-41608ea09aeb"),
    ],
  },
  {
    nameOriginal: "Tacos al Pastor",
    nameTranslated: "Al Pastor Tacos",
    description:
      "Marinated pork shaved off a vertical spit, served on warm corn tortillas with pineapple, onion, and cilantro.",
    ingredients: ["Pork", "Corn tortilla", "Pineapple", "Onion", "Cilantro"],
    cuisine: "Mexican",
    spiceLevel: 2,
    dietary: [],
    priceText: "$4 each",
    translations: null,
    images: [
      U("photo-1565299585323-38d6b0865b47"),
      U("photo-1551504734-5ee1c4a1479b"),
      U("photo-1599974579688-8dbdd335c77f"),
    ],
  },
  {
    nameOriginal: "Falafel Plate",
    nameTranslated: "Falafel Plate",
    description:
      "Crispy chickpea fritters with hummus, tabbouleh, pickled vegetables, and warm pita bread.",
    ingredients: ["Chickpeas", "Herbs", "Hummus", "Tabbouleh", "Pita"],
    cuisine: "Middle Eastern",
    spiceLevel: 1,
    dietary: ["Vegetarian", "Vegan"],
    priceText: "$13",
    translations: null,
    images: [
      U("photo-1593504049359-74330189a345"),
      U("photo-1540713434306-58505cf1b6fc"),
      U("photo-1633321702518-7feccafb94d5"),
    ],
  },
  {
    nameOriginal: "Caesar Salad",
    nameTranslated: "Caesar Salad",
    description:
      "Crisp romaine, garlicky parmesan dressing, sourdough croutons, and shaved aged parmesan.",
    ingredients: ["Romaine", "Parmesan", "Croutons", "Anchovy", "Lemon"],
    cuisine: "American",
    spiceLevel: 0,
    dietary: [],
    priceText: "$11",
    translations: null,
    images: [
      U("photo-1546793665-c74683f339c1"),
      U("photo-1550304943-4f24f54ddde9"),
      U("photo-1551248429-40975aa4de74"),
    ],
  },
  {
    nameOriginal: "Tiramisu",
    nameTranslated: "Tiramisu",
    description:
      "Espresso-soaked ladyfingers layered with mascarpone cream and dusted with cocoa.",
    ingredients: ["Ladyfingers", "Espresso", "Mascarpone", "Cocoa", "Egg"],
    cuisine: "Italian",
    spiceLevel: 0,
    dietary: ["Vegetarian"],
    priceText: "$9",
    translations: null,
    images: [
      U("photo-1571877227200-a0d98ea607e9"),
      U("photo-1606313564200-e75d5e30476c"),
      U("photo-1542124292-6c8638e74cf2"),
    ],
  },
];

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo menu — MenuVision AI" },
      {
        name: "description",
        content:
          "Browse a real example of a MenuVision menu — translated dishes, real photos, search, and filters.",
      },
      { property: "og:title", content: "Demo menu — MenuVision AI" },
      {
        property: "og:description",
        content:
          "See exactly what guests see: every dish with a photo, description, and dietary tags.",
      },
      { property: "og:url", content: "https://menuvisionai.live/demo" },
    ],
    links: [{ rel: "canonical", href: "https://menuvisionai.live/demo" }],
  }),
  component: DemoPage,
});

function DemoPage() {
  const [query, setQuery] = useState("");
  const [cuisine, setCuisine] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const [active, setActive] = useState<DemoDish | null>(null);

  const cuisines = useMemo(
    () => Array.from(new Set(DEMO_DISHES.map((d) => d.cuisine))),
    [],
  );
  const diets = useMemo(
    () => Array.from(new Set(DEMO_DISHES.flatMap((d) => d.dietary))),
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return DEMO_DISHES.filter((d) => {
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
  }, [query, cuisine, diet]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10">
        <div className="mx-auto max-w-2xl rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4 text-center">
          <p className="flex items-center justify-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            This is a demo menu
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            A taste of what every guest sees after a scan.
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-primary">Menu</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
            Trattoria Luna
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {DEMO_DISHES.length} dishes · translated to English
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

        {filtered.length === 0 ? (
          <p className="mt-16 text-center text-sm text-muted-foreground">
            No dishes match your filters.
          </p>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((dish) => (
              <DishCard
                key={dish.nameOriginal}
                dish={dish}
                onClick={() => setActive(dish)}
                presetImages={dish.images}
              />
            ))}
          </div>
        )}

        <div className="mt-12 flex flex-col items-center gap-3 text-center">
          <p className="text-sm text-muted-foreground">
            Ready to try it on a real menu?
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button asChild className="rounded-full">
              <Link to="/scan">Scan a menu</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/restaurants">For restaurants</Link>
            </Button>
          </div>
        </div>
      </main>

      <DishDetailSheet
        dish={active}
        onClose={() => setActive(null)}
        presetImages={active?.images}
      />
      <SiteFooter />
    </div>
  );
}
