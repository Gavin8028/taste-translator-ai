import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyzeMenu } from "./menu.functions";

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function randomToken(len = 24): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const SUPPORTED_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Portuguese",
  "Japanese",
  "Chinese",
  "Korean",
];

export const createRestaurantMenu = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        name: z.string().min(1).max(120),
        slug: z
          .string()
          .min(2)
          .max(60)
          .regex(/^[a-z0-9-]+$/i)
          .optional(),
        imageDataUrl: z.string().min(20),
        targetLanguage: z.string().min(2).max(40).default("English"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const targetLanguage = SUPPORTED_LANGUAGES.includes(data.targetLanguage)
      ? data.targetLanguage
      : "English";

    // Analyze the menu (vision + structured output)
    const result = await analyzeMenu({
      data: { imageDataUrl: data.imageDataUrl, targetLanguage },
    });

    if (!result.dishes?.length) {
      throw new Error(
        "We couldn't find any dishes in that photo. Try a clearer shot of the menu.",
      );
    }

    // Pick a unique slug
    const baseSlug = slugify(data.slug || data.name) || "menu";
    let slug = baseSlug;
    for (let i = 0; i < 6; i++) {
      const { data: existing } = await supabaseAdmin
        .from("restaurant_menus")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!existing) break;
      slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const editToken = randomToken();

    const { data: menu, error } = await supabaseAdmin
      .from("restaurant_menus")
      .insert({
        slug,
        name: data.name,
        target_language: targetLanguage,
        source_language: result.sourceLanguage ?? null,
        edit_token: editToken,
      })
      .select("id, slug")
      .single();

    if (error || !menu) {
      throw new Error(error?.message || "Could not save menu.");
    }

    const dishRows = result.dishes.map((d, i) => ({
      menu_id: menu.id,
      position: i,
      name_original: d.nameOriginal,
      name_translated: d.nameTranslated,
      description: d.description,
      ingredients: d.ingredients,
      cuisine: d.cuisine,
      spice_level: d.spiceLevel,
      dietary: d.dietary,
      price_text: d.priceText ?? null,
    }));

    const { error: dishError } = await supabaseAdmin
      .from("menu_dishes")
      .insert(dishRows);

    if (dishError) {
      throw new Error(dishError.message);
    }

    return { slug: menu.slug, editToken, dishCount: dishRows.length };
  });

export const getRestaurantMenu = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(60) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: menu, error } = await supabaseAdmin
      .from("restaurant_menus")
      .select("id, slug, name, target_language, source_language, created_at")
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!menu) return null;

    const { data: dishes, error: dishError } = await supabaseAdmin
      .from("menu_dishes")
      .select(
        "name_original, name_translated, description, ingredients, cuisine, spice_level, dietary, price_text, position",
      )
      .eq("menu_id", menu.id)
      .order("position", { ascending: true });

    if (dishError) throw new Error(dishError.message);

    return {
      slug: menu.slug,
      name: menu.name,
      targetLanguage: menu.target_language,
      sourceLanguage: menu.source_language,
      createdAt: menu.created_at,
      dishes: (dishes ?? []).map((d) => ({
        nameOriginal: d.name_original,
        nameTranslated: d.name_translated,
        description: d.description,
        ingredients: d.ingredients ?? [],
        cuisine: d.cuisine,
        spiceLevel: d.spice_level,
        dietary: d.dietary ?? [],
        priceText: d.price_text,
      })),
    };
  });
