import { useEffect, useState } from "react";
import { X, Flame } from "lucide-react";
import type { Dish } from "@/lib/menu.functions";
import { fetchDishImages } from "@/lib/fetch-dish-image";

export function DishDetailSheet({
  dish,
  onClose,
  allowAi = false,
  presetImages,
}: {
  dish: Dish | null;
  onClose: () => void;
  allowAi?: boolean;
  presetImages?: string[];
}) {
  const [srcs, setSrcs] = useState<string[]>([]);
  const [isFinal, setIsFinal] = useState(false);

  useEffect(() => {
    if (!dish) return;
    if (presetImages?.length) {
      setSrcs(presetImages);
      setIsFinal(true);
      return;
    }
    setSrcs([]);
    setIsFinal(false);
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
    ).catch(() => {});
    return () => ac.abort();
  }, [dish, allowAi, presetImages]);

  useEffect(() => {
    if (!dish) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [dish, onClose]);

  if (!dish) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[92vh] w-full max-w-2xl overflow-hidden rounded-t-3xl bg-card shadow-2xl sm:rounded-3xl"
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background/85 backdrop-blur hover:bg-background"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          {srcs.length > 0 ? (
            <div className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scroll-smooth">
              {srcs.map((s, i) => (
                <img
                  key={s + i}
                  src={s}
                  alt={`${dish.nameTranslated} ${i + 1}`}
                  className={`h-full w-full flex-none snap-center object-cover transition-[filter] duration-500 ${
                    isFinal ? "blur-0" : "blur-2xl"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-10 w-10 animate-pulse rounded-full bg-border" />
            </div>
          )}
          {srcs.length > 1 && (
            <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1 rounded-full bg-background/70 px-2 py-1 backdrop-blur">
              {srcs.map((_, i) => (
                <span key={i} className="h-1.5 w-1.5 rounded-full bg-foreground/50" />
              ))}
            </div>
          )}
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-6 sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            {dish.nameTranslated}
          </h2>
          {dish.nameOriginal !== dish.nameTranslated && (
            <p className="mt-1 italic text-muted-foreground">{dish.nameOriginal}</p>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {dish.cuisine && (
              <span className="rounded-full bg-accent px-2.5 py-1 text-accent-foreground">
                {dish.cuisine}
              </span>
            )}
            {dish.spiceLevel > 0 && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                {Array.from({ length: dish.spiceLevel }).map((_, i) => (
                  <Flame key={i} className="h-3 w-3" />
                ))}
                {dish.spiceLevel === 1 ? "Mild" : dish.spiceLevel === 2 ? "Medium" : "Hot"}
              </span>
            )}
            {dish.dietary.map((d) => (
              <span
                key={d}
                className="rounded-full bg-muted px-2.5 py-1 text-muted-foreground"
              >
                {d}
              </span>
            ))}
            {dish.priceText && (
              <span className="ml-auto text-base font-medium">{dish.priceText}</span>
            )}
          </div>
          <p className="mt-5 text-base leading-relaxed">{dish.description}</p>

          {dish.ingredients.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Ingredients
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {dish.ingredients.map((ing) => (
                  <span
                    key={ing}
                    className="rounded-full border border-border bg-background px-2.5 py-1 text-xs"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
