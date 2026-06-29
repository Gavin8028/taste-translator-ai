import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ScanStatus = {
  freeRemaining: number;
  paidRemaining: number;
  isAdmin: boolean;
  isPremium: boolean;
  canScan: boolean;
};

export const getMyScanStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<ScanStatus> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const [{ data: credits }, { data: isAdminData }, { data: isPremiumData }] =
      await Promise.all([
        supabaseAdmin
          .from("user_scan_credits")
          .select("free_remaining, paid_remaining")
          .eq("user_id", context.userId)
          .maybeSingle(),
        supabaseAdmin.rpc("is_admin", { _user_id: context.userId }),
        supabaseAdmin.rpc("has_active_premium", { _user_id: context.userId }),
      ]);

    const freeRemaining = credits?.free_remaining ?? 0;
    const paidRemaining = credits?.paid_remaining ?? 0;
    const isAdmin = !!isAdminData;
    const isPremium = !!isPremiumData;
    return {
      freeRemaining,
      paidRemaining,
      isAdmin,
      isPremium,
      canScan: isAdmin || isPremium || freeRemaining > 0 || paidRemaining > 0,
    };
  });
