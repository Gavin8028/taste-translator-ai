import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyzeMenu, SUPPORTED_LANGUAGES } from "./menu.functions";

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

function dishesToRows(menuId: string, dishes: Awaited<ReturnType<typeof analyzeMenu>>["dishes"]) {
  return dishes.map((d, i) => ({
    menu_id: menuId,
    position: i,
    name_original: d.nameOriginal,
    name_translated: d.nameTranslated,
    description: d.description,
    ingredients: d.ingredients,
    cuisine: d.cuisine,
    spice_level: d.spiceLevel,
    dietary: d.dietary,
    price_text: d.priceText ?? null,
    translations: d.translations ?? {},
  }));
}

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

    const targetLanguage = (SUPPORTED_LANGUAGES as readonly string[]).includes(
      data.targetLanguage,
    )
      ? data.targetLanguage
      : "English";

    const result = await analyzeMenu({
      data: {
        imageDataUrl: data.imageDataUrl,
        targetLanguage,
        multiLanguage: true,
      },
    });

    if (!result.dishes?.length) {
      throw new Error(
        "We couldn't find any dishes in that photo. Try a clearer shot of the menu.",
      );
    }

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

    const { error: dishError } = await supabaseAdmin
      .from("menu_dishes")
      .insert(dishesToRows(menu.id, result.dishes));

    if (dishError) {
      throw new Error(dishError.message);
    }

    return { slug: menu.slug, editToken, dishCount: result.dishes.length };
  });

export const getRestaurantMenu = createServerFn({ method: "GET" })
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(60) }).parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: menu, error } = await supabaseAdmin
      .from("restaurant_menus")
      .select("id, slug, name, target_language, source_language, created_at, paid")
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!menu) return null;

    const { data: dishes, error: dishError } = await supabaseAdmin
      .from("menu_dishes")
      .select(
        "name_original, name_translated, description, ingredients, cuisine, spice_level, dietary, price_text, position, translations, image_url",
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
      paid: menu.paid ?? false,
      dishes: (dishes ?? []).map((d) => ({
        nameOriginal: d.name_original,
        nameTranslated: d.name_translated,
        description: d.description,
        ingredients: d.ingredients ?? [],
        cuisine: d.cuisine,
        spiceLevel: d.spice_level,
        dietary: d.dietary ?? [],
        priceText: d.price_text,
        translations: (d.translations ?? null) as Record<
          string,
          { name: string; description: string }
        > | null,
        imageUrl: d.image_url ?? null,
      })),
    };
  });

export const updateRestaurantMenu = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1).max(60),
        editToken: z.string().min(8).max(64),
        name: z.string().min(1).max(120),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: menu } = await supabaseAdmin
      .from("restaurant_menus")
      .select("id, edit_token")
      .eq("slug", data.slug)
      .maybeSingle();

    if (!menu) throw new Error("Menu not found.");
    if (menu.edit_token !== data.editToken) throw new Error("Invalid edit code.");

    const { error } = await supabaseAdmin
      .from("restaurant_menus")
      .update({ name: data.name })
      .eq("id", menu.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const replaceMenuDishes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1).max(60),
        editToken: z.string().min(8).max(64),
        imageDataUrl: z.string().min(20),
        targetLanguage: z.string().min(2).max(40).default("English"),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: menu } = await supabaseAdmin
      .from("restaurant_menus")
      .select("id, edit_token")
      .eq("slug", data.slug)
      .maybeSingle();

    if (!menu) throw new Error("Menu not found.");
    if (menu.edit_token !== data.editToken) throw new Error("Invalid edit code.");

    const targetLanguage = (SUPPORTED_LANGUAGES as readonly string[]).includes(
      data.targetLanguage,
    )
      ? data.targetLanguage
      : "English";

    const result = await analyzeMenu({
      data: {
        imageDataUrl: data.imageDataUrl,
        targetLanguage,
        multiLanguage: true,
      },
    });

    if (!result.dishes?.length) {
      throw new Error(
        "We couldn't find any dishes in that photo. Try a clearer shot of the menu.",
      );
    }

    // Replace: delete existing dishes, insert new
    await supabaseAdmin.from("menu_dishes").delete().eq("menu_id", menu.id);

    const { error: dishError } = await supabaseAdmin
      .from("menu_dishes")
      .insert(dishesToRows(menu.id, result.dishes));

    if (dishError) throw new Error(dishError.message);

    await supabaseAdmin
      .from("restaurant_menus")
      .update({
        target_language: targetLanguage,
        source_language: result.sourceLanguage ?? null,
      })
      .eq("id", menu.id);

    return { ok: true, dishCount: result.dishes.length };
  });

export const deleteRestaurantMenu = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1).max(60),
        editToken: z.string().min(8).max(64),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: menu } = await supabaseAdmin
      .from("restaurant_menus")
      .select("id, edit_token")
      .eq("slug", data.slug)
      .maybeSingle();

    if (!menu) throw new Error("Menu not found.");
    if (menu.edit_token !== data.editToken) throw new Error("Invalid edit code.");

    // Dishes cascade-deleted by foreign key (if set up that way); also delete explicitly to be safe.
    await supabaseAdmin.from("menu_dishes").delete().eq("menu_id", menu.id);
    const { error } = await supabaseAdmin
      .from("restaurant_menus")
      .delete()
      .eq("id", menu.id);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const verifyEditToken = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1).max(60),
        editToken: z.string().min(8).max(64),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: menu } = await supabaseAdmin
      .from("restaurant_menus")
      .select("name, slug, edit_token, target_language, paid")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!menu) return { ok: false as const, reason: "not_found" as const };
    if (menu.edit_token !== data.editToken)
      return { ok: false as const, reason: "invalid" as const };
    return {
      ok: true as const,
      menu: {
        name: menu.name,
        slug: menu.slug,
        targetLanguage: menu.target_language,
        paid: menu.paid ?? false,
      },
    };
  });
