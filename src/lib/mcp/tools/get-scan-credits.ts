import { defineTool } from "@lovable.dev/mcp-js";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "get_scan_credits",
  title: "Get my scan credits",
  description: "Show the signed-in user's remaining free and paid MenuVision scan credits.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const { data, error } = await supabaseForUser(ctx)
      .from("user_scan_credits")
      .select("free_remaining, paid_remaining, lifetime_used, lifetime_paid_purchased, updated_at")
      .eq("user_id", ctx.getUserId())
      .maybeSingle();
    if (error) return errorResult(error.message);
    return textResult(
      data ?? { free_remaining: 0, paid_remaining: 0, lifetime_used: 0, lifetime_paid_purchased: 0 },
    );
  },
});
