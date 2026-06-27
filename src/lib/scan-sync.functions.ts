import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const SaveScanInput = z.object({
  clientId: z.string().min(1).max(40),
  title: z.string().max(200).nullable().optional(),
  sourceLanguage: z.string().max(40).nullable().optional(),
  targetLanguage: z.string().max(40).nullable().optional(),
  dishCount: z.number().int().nonnegative().default(0),
  payload: z.unknown(),
});

export const saveScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => SaveScanInput.parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("scans")
      .upsert(
        {
          user_id: context.userId,
          client_id: data.clientId,
          title: data.title ?? null,
          source_language: data.sourceLanguage ?? null,
          target_language: data.targetLanguage ?? null,
          dish_count: data.dishCount,
          payload: data.payload as never,
        },
        { onConflict: "user_id,client_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listMyScans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("scans")
      .select("id, client_id, title, source_language, target_language, dish_count, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const loadMyScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ clientId: z.string().min(1).max(40) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("scans")
      .select("payload")
      .eq("user_id", context.userId)
      .eq("client_id", data.clientId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row?.payload ?? null;
  });

export const deleteMyScan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) =>
    z.object({ clientId: z.string().min(1).max(40) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase
      .from("scans")
      .delete()
      .eq("user_id", context.userId)
      .eq("client_id", data.clientId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
