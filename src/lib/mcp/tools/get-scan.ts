import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { errorResult, supabaseForUser, textResult } from "../supabase";

export default defineTool({
  name: "get_scan",
  title: "Get a menu scan",
  description:
    "Fetch the full translated dish list for one of the signed-in user's saved menu scans, by its scan id.",
  inputSchema: {
    scan_id: z.string().min(1).describe("The scan id returned by list_scans (id or client_id)."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ scan_id }, ctx) => {
    if (!ctx.isAuthenticated()) return errorResult("Not authenticated");
    const supabase = supabaseForUser(ctx);
    const isUuid = /^[0-9a-f-]{36}$/i.test(scan_id);
    const query = supabase
      .from("scans")
      .select("id, client_id, title, source_language, target_language, dish_count, payload, created_at")
      .eq("user_id", ctx.getUserId());
    const { data, error } = await (isUuid ? query.eq("id", scan_id) : query.eq("client_id", scan_id))
      .maybeSingle();
    if (error) return errorResult(error.message);
    if (!data) return errorResult("No scan found with that id for this account.");
    return textResult(data);
  },
});
