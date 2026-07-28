import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getRestaurantMenuTool from "./tools/get-restaurant-menu";
import getScanCreditsTool from "./tools/get-scan-credits";
import getScanTool from "./tools/get-scan";
import listRestaurantMenusTool from "./tools/list-restaurant-menus";
import listScansTool from "./tools/list-scans";

// The OAuth issuer must be the direct Supabase host; the project ref is the only
// value that survives publish unchanged.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "menuvision-mcp",
  title: "MenuVision AI",
  version: "0.1.0",
  instructions:
    "Tools for MenuVision AI, a menu translation app. Use `list_scans` and `get_scan` to read the user's saved menu scans and translated dishes, `get_scan_credits` for their remaining scan credits, and `list_restaurant_menus` / `get_restaurant_menu` for restaurant menu pages they own.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    listScansTool,
    getScanTool,
    getScanCreditsTool,
    listRestaurantMenusTool,
    getRestaurantMenuTool,
  ],
});
