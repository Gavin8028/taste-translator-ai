import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_restaurant_menus",
  title: "List my restaurant menus",
  description:
    "List the published restaurant menu pages owned by the signed-in user, including slug, name and paid status.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const { data, error } = await supabaseForUser(ctx)
      .from("restaurant_menus")
      .select("id, slug, name, source_language, target_language, paid, paid_at, created_at, updated_at")
      .eq("owner_id", ctx.getUserId())
      .order("created_at", { ascending: false });
    if (error) return errorResult(error.message);
    return textResult(data ?? []);
  },
});
