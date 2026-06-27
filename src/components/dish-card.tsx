import { useEffect, useRef, useState } from "react";
import { Flame, Leaf } from "lucide-react";
import type { Dish } from "@/lib/menu.functions";
import { fetchDishImages } from "@/lib/fetch-dish-image";

export function DishCard({
  dish,
  onClick,
  allowAi = false,
  presetImages,
}: {
  dish: Dish;
  onClick: () => void;
  allowAi?: boolean;
  presetImages?: string[];
}) {
  const [srcs, setSrcs] = useState<string[]>(presetImages ?? []);
  const [isFinal, setIsFinal] = useState(!!presetImages?.length);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(!!presetImages?.length);

  useEffect(() => {
    if (presetImages?.length) return;
    if (!ref.current || started.current) return;
    const node = ref.current;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            obs.disconnect();

            const ac = new AbortController();
            fetchDishImages(
              dish.nameOriginal,
              dish.cuisine,
              (list, final) => {
                setSrcs(list);
                if (final) setIsFinal(true);
              },
              ac.signal,
              allowAi,
            ).catch((err) => console.warn("dish image failed:", err));
          }
        }
      },
      { rootMargin: "200px" },
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [dish.nameOriginal, dish.cuisine, allowAi, presetImages]);

  return (
    <div
      ref={ref}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-within:ring-2 focus-within:ring-ring"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
        {srcs.length > 0 ? (
          <div className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth">
            {srcs.map((s, i) => (
              <button
                key={s + i}
                type="button"
                onClick={onClick}
                className="relative h-full w-full flex-none snap-center"
                aria-label={`${dish.nameTranslated} photo ${i + 1}`}
              >
                <img
                  src={s}
                  alt={dish.nameTranslated}
                  className={`h-full w-full object-cover transition-[filter,transform] duration-500 group-hover:scale-[1.02] ${
                    isFinal ? "blur-0" : "blur-2xl"
                  }`}
                />
              </button>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={onClick}
            className="flex h-full w-full items-center justify-center"
            aria-label={dish.nameTranslated}
          >
            <div className="h-8 w-8 animate-pulse rounded-full bg-border" />
          </button>
        )}
        {srcs.length > 1 && (
          <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-background/70 px-2 py-1 backdrop-blur">
            {srcs.map((_, i) => (
              <span key={i} className="h-1 w-1 rounded-full bg-foreground/50" />
            ))}
          </div>
        )}
        {dish.priceText && (
          <span className="pointer-events-none absolute right-2 top-2 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium backdrop-blur">
            {dish.priceText}
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={onClick}
        className="flex flex-1 flex-col p-4 text-left focus:outline-none"
      >
        <h3 className="text-base font-semibold leading-tight">{dish.nameTranslated}</h3>
        {dish.nameOriginal !== dish.nameTranslated && (
          <p className="mt-0.5 text-xs italic text-muted-foreground">
            {dish.nameOriginal}
          </p>
        )}
        <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
          {dish.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
          {dish.cuisine && (
            <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">
              {dish.cuisine}
            </span>
          )}
          {dish.spiceLevel > 0 && (
            <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2 py-0.5 text-primary">
              {Array.from({ length: dish.spiceLevel }).map((_, i) => (
                <Flame key={i} className="h-3 w-3" />
              ))}
            </span>
          )}
          {dish.dietary.includes("vegetarian") && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
              <Leaf className="h-3 w-3" />
              Veg
            </span>
          )}
          {dish.dietary.includes("vegan") && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-emerald-700 dark:text-emerald-300">
              Vegan
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
