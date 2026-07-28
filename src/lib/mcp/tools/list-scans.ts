import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "list_scans",
  title: "List my menu scans",
  description:
    "List the signed-in user's saved MenuVision menu scans, newest first, with title, languages and dish count.",
  inputSchema: {
    limit: z.number().int().min(1).max(100).optional().describe("How many scans to return (default 20)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ limit }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const { data, error } = await supabaseForUser(ctx)
      .from("scans")
      .select("id, client_id, title, source_language, target_language, dish_count, created_at")
      .eq("user_id", ctx.getUserId())
      .order("created_at", { ascending: false })
      .limit(limit ?? 20);
    if (error) return errorResult(error.message);
    return textResult(data ?? []);
  },
});
