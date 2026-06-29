import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const SUPPORTED_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "Japanese",
  "Chinese",
] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const TranslationsSchema = z.object({
  English: z.object({ name: z.string(), description: z.string() }),
  Spanish: z.object({ name: z.string(), description: z.string() }),
  French: z.object({ name: z.string(), description: z.string() }),
  Japanese: z.object({ name: z.string(), description: z.string() }),
  Chinese: z.object({ name: z.string(), description: z.string() }),
});

const DishSchema = z.object({
  nameOriginal: z.string(),
  nameTranslated: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  cuisine: z.string(),
  spiceLevel: z.number().min(0).max(3),
  dietary: z.array(z.string()),
  priceText: z.string().optional().nullable(),
  translations: TranslationsSchema.optional().nullable(),
});

const MenuSchema = z.object({
  sourceLanguage: z.string(),
  restaurantName: z.string().optional().nullable(),
  dishes: z.array(DishSchema),
});

export type Dish = z.infer<typeof DishSchema>;
export type MenuResult = z.infer<typeof MenuSchema>;
export type DishTranslations = z.infer<typeof TranslationsSchema>;

export class NoCreditsError extends Error {
  code = "NO_CREDITS" as const;
  constructor() {
    super(
      "You're out of free menu scans. Subscribe to Diner Premium or buy a scan pack to keep scanning.",
    );
  }
}

export const analyzeMenu = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => {
    return z
      .object({
        imageDataUrl: z.string().min(20).optional(),
        imageDataUrls: z.array(z.string().min(20)).min(1).max(8).optional(),
        targetLanguage: z.string().min(2).max(40).default("English"),
        multiLanguage: z.boolean().optional().default(false),
      })
      .refine((v) => v.imageDataUrl || (v.imageDataUrls && v.imageDataUrls.length > 0), {
        message: "At least one image is required",
      })
      .parse(input);
  })
  .handler(async ({ data, context }): Promise<MenuResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    // 1. Check + consume a credit BEFORE calling AI
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: consumeResult, error: consumeError } = await supabaseAdmin.rpc(
      "consume_scan_credit",
      { _user_id: context.userId },
    );
    if (consumeError) {
      console.error("consume_scan_credit failed", consumeError);
      throw new Error("Could not check your scan credits. Try again.");
    }
    const tier = consumeResult as string;
    if (tier === "none") {
      throw new NoCreditsError();
    }
    const isFree = tier === "free";

    // 2. Cost controls for free tier
    const allImages = data.imageDataUrls && data.imageDataUrls.length
      ? data.imageDataUrls
      : [data.imageDataUrl!];
    const maxImages = isFree ? 3 : 8;
    const images = allImages.slice(0, maxImages);
    const useMultiLang = !isFree && data.multiLanguage;

    const gateway = createLovableAiGatewayProvider(key);

    const multiLangBlock = useMultiLang
      ? `\n- translations: an object with keys "English", "Spanish", "French", "Japanese", "Chinese" — each holding { "name": <dish name in that language>, "description": <1-2 sentence description in that language> }.`
      : "";

    const pagesNote =
      images.length > 1
        ? `\n\nThe user has provided ${images.length} photos. They are pages of the SAME menu. Combine every dish across all photos into one list. De-duplicate dishes that clearly appear on multiple pages.`
        : "";

    const prompt = `You are MenuVision, an expert at reading restaurant menus from photos.

Analyze the menu image${images.length > 1 ? "s" : ""}. For EVERY dish you can see:
- nameOriginal: dish name exactly as printed
- nameTranslated: dish name in ${data.targetLanguage}
- description: 1-2 sentence appetizing description in ${data.targetLanguage}
- ingredients: array of main visible/likely ingredients (in ${data.targetLanguage})
- cuisine: short cuisine label
- spiceLevel: integer 0 (none), 1 (mild), 2 (medium), 3 (hot)
- dietary: subset of ["vegetarian","vegan","gluten-free","contains-dairy","contains-nuts","seafood","pork","beef"]
- priceText: the price exactly as printed if visible, otherwise null${multiLangBlock}

Also return sourceLanguage and restaurantName if visible. Be thorough.${pagesNote}`;

    // Cheaper model for free tier, better one for paid/premium/admin
    const modelId = isFree
      ? "google/gemini-2.5-flash-lite"
      : "google/gemini-3-flash-preview";

    try {
      const { object } = await generateObject({
        model: gateway(modelId),
        schema: MenuSchema,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              ...images.map((img) => ({ type: "image" as const, image: img })),
            ],
          },
        ],
      });
      return object;
    } catch (err) {
      // Refund the consumed credit on failure (paid credits only — free is cheap to lose).
      if (tier === "paid") {
        try {
          const { data: row } = await supabaseAdmin
            .from("user_scan_credits")
            .select("paid_remaining")
            .eq("user_id", context.userId)
            .maybeSingle();
          const current = row?.paid_remaining ?? 0;
          await supabaseAdmin
            .from("user_scan_credits")
            .update({ paid_remaining: current + 1 })
            .eq("user_id", context.userId);
        } catch {
          // ignore refund failure
        }
      }
      const msg = err instanceof Error ? err.message : String(err);
      if (/402|payment required|insufficient.*credit|quota/i.test(msg)) {
        throw new Error(
          "MenuVision is temporarily over its daily AI usage limit. Please try again later.",
        );
      }
      if (/429|rate limit/i.test(msg)) {
        throw new Error("Too many scans right now. Please try again in a minute.");
      }
      throw err;
    }
  });
