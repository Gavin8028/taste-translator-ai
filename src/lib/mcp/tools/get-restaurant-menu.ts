import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "get_restaurant_menu",
  title: "Get a restaurant menu",
  description:
    "Fetch one of the signed-in user's restaurant menus by slug, together with all of its dishes.",
  inputSchema: { slug: z.string().min(1).describe("The menu slug, e.g. the /m/<slug> path segment.") },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ slug }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const { data: menu, error } = await supabase
      .from("restaurant_menus")
      .select("id, slug, name, source_language, target_language, paid, created_at, updated_at")
      .eq("owner_id", ctx.getUserId())
      .eq("slug", slug)
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!menu) return errorResult("No menu with that slug is owned by this account.");

    const { data: dishes, error: dishError } = await supabase
      .from("menu_dishes")
      .select("*")
      .eq("menu_id", menu.id);
    if (dishError) return errorResult(dishError.message);

    return textResult({ menu, dishes: dishes ?? [] });
  },
});
