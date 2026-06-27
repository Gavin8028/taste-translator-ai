import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listMyMenus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("restaurant_menus")
      .select("id, slug, name, target_language, paid, created_at, edit_token")
      .eq("owner_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []).map((m) => ({
      slug: m.slug,
      name: m.name,
      targetLanguage: m.target_language,
      paid: m.paid ?? false,
      createdAt: m.created_at,
      editToken: m.edit_token,
    }));
  });

export const claimMenuOwnership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z
      .object({
        slug: z.string().min(1).max(60),
        editToken: z.string().min(8).max(64),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: menu } = await supabaseAdmin
      .from("restaurant_menus")
      .select("id, edit_token, owner_id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!menu) throw new Error("Menu not found.");
    if (menu.edit_token !== data.editToken) throw new Error("Invalid edit code.");
    if (menu.owner_id && menu.owner_id !== context.userId) {
      throw new Error("This menu is already linked to another account.");
    }
    if (menu.owner_id === context.userId) return { ok: true };
    const { error } = await supabaseAdmin
      .from("restaurant_menus")
      .update({ owner_id: context.userId })
      .eq("id", menu.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const setMenuOwnerOnCreate = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(60) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("restaurant_menus")
      .update({ owner_id: context.userId })
      .eq("slug", data.slug)
      .is("owner_id", null);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const ownerCanEdit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ slug: z.string().min(1).max(60) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: menu } = await supabaseAdmin
      .from("restaurant_menus")
      .select("name, slug, target_language, paid, owner_id, edit_token")
      .eq("slug", data.slug)
      .maybeSingle();
    if (!menu) return { ok: false as const };
    if (menu.owner_id !== context.userId) return { ok: false as const };
    return {
      ok: true as const,
      menu: {
        name: menu.name,
        slug: menu.slug,
        targetLanguage: menu.target_language,
        paid: menu.paid ?? false,
        editToken: menu.edit_token,
      },
    };
  });
