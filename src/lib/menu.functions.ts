import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";


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
  spiceLevel: z.number(),
  dietary: z.array(z.string()),
  priceText: z.string().nullable(),
  translations: TranslationsSchema.nullable(),
});

const MenuSchema = z.object({
  sourceLanguage: z.string(),
  restaurantName: z.string().nullable(),
  dishes: z.array(DishSchema),
});

export type Dish = z.infer<typeof DishSchema>;
export type MenuResult = z.infer<typeof MenuSchema>;
export type DishTranslations = z.infer<typeof TranslationsSchema>;

type AnalyzeMenuImagesOptions = {
  imageDataUrls: string[];
  targetLanguage: string;
  multiLanguage?: boolean;
  modelId?: string;
};

const OWNER_EMAIL = "mckinneygavin74@gmail.com";

function getClaimEmail(claims: unknown): string | null {
  if (!claims || typeof claims !== "object") return null;
  const email = (claims as Record<string, unknown>).email;
  return typeof email === "string" ? email.toLowerCase() : null;
}

function isOwnerEmail(email: string | null): boolean {
  return email === OWNER_EMAIL;
}

function extractJsonObject(text: string): unknown {
  const cleaned = text
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) {
      throw new Error("We couldn't read that menu. Try a clearer, closer photo.");
    }
    try {
      return JSON.parse(cleaned.slice(start, end + 1));
    } catch {
      const repaired = cleaned
        .slice(start, end + 1)
        .replace(/,\s*([}\]])/g, "$1")
        .replace(/[\u0000-\u001F\u007F]/g, "");
      try {
        return JSON.parse(repaired);
      } catch {
        throw new Error("We couldn't read that menu. Try a clearer, closer photo.");
      }
    }
  }
}

function textOrFallback(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value.trim() : fallback;
}

function nullableText(value: unknown): string | null {
  const text = textOrFallback(value);
  if (!text || /^(null|none|n\/a|unknown)$/i.test(text)) return null;
  return text;
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => textOrFallback(item))
    .filter(Boolean)
    .slice(0, 24);
}

function normalizeTranslations(value: unknown): DishTranslations | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const normalized = Object.fromEntries(
    SUPPORTED_LANGUAGES.map((language) => {
      const item = record[language];
      const itemRecord = item && typeof item === "object" ? (item as Record<string, unknown>) : {};
      return [
        language,
        {
          name: textOrFallback(itemRecord.name),
          description: textOrFallback(itemRecord.description),
        },
      ];
    }),
  );
  return TranslationsSchema.parse(normalized);
}

function normalizeMenuResult(raw: unknown, targetLanguage: string): MenuResult {
  if (!raw || typeof raw !== "object") {
    throw new Error("We couldn't read that menu. Try a clearer, closer photo.");
  }

  const root = raw as Record<string, unknown>;
  const rawDishes = Array.isArray(root.dishes) ? root.dishes : [];
  const dishes = rawDishes.flatMap((item): Dish[] => {
    if (!item || typeof item !== "object") return [];
    const dish = item as Record<string, unknown>;
    const nameOriginal = textOrFallback(dish.nameOriginal || dish.name || dish.originalName);
    if (!nameOriginal) return [];
    const nameTranslated = textOrFallback(
      dish.nameTranslated || dish.translatedName,
      nameOriginal,
    );
    const spiceRaw = Number(dish.spiceLevel ?? 0);
    const price = nullableText(dish.priceText ?? dish.price);

    return [
      {
        nameOriginal,
        nameTranslated,
        description: textOrFallback(dish.description),
        ingredients: stringArray(dish.ingredients),
        cuisine: textOrFallback(dish.cuisine, "Restaurant"),
        spiceLevel: Math.max(0, Math.min(3, Number.isFinite(spiceRaw) ? Math.round(spiceRaw) : 0)),
        dietary: stringArray(dish.dietary),
        priceText: price,
        translations: normalizeTranslations(dish.translations),
      },
    ];
  });

  return MenuSchema.parse({
    sourceLanguage: textOrFallback(root.sourceLanguage, "Unknown"),
    restaurantName: nullableText(root.restaurantName),
    dishes,
  });
}

export async function analyzeMenuImages({
  imageDataUrls,
  targetLanguage,
  multiLanguage = false,
  modelId = "google/gemini-3-flash-preview",
}: AnalyzeMenuImagesOptions): Promise<MenuResult> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const gateway = createLovableAiGatewayProvider(key);

  const multiLangBlock = multiLanguage
    ? `\n      "translations": { "English": { "name": "", "description": "" }, "Spanish": { "name": "", "description": "" }, "French": { "name": "", "description": "" }, "Japanese": { "name": "", "description": "" }, "Chinese": { "name": "", "description": "" } }`
    : `\n      "translations": null`;

  const pagesNote =
    imageDataUrls.length > 1
      ? `\n\nThe user has provided ${imageDataUrls.length} photos. They are pages of the SAME menu. Combine every dish across all photos into one list. De-duplicate dishes that clearly appear on multiple pages.`
      : "";

  const prompt = `You are MenuVision, an expert at reading restaurant menus from photos.

Return ONLY valid JSON. No markdown. No explanation.

JSON shape:
{
  "sourceLanguage": "language of the menu text or Unknown",
  "restaurantName": "restaurant name if visible, otherwise null",
  "dishes": [
    {
      "nameOriginal": "dish name exactly as printed",
      "nameTranslated": "dish name in ${targetLanguage}",
      "description": "1-2 sentence appetizing description in ${targetLanguage}",
      "ingredients": ["main visible or likely ingredients in ${targetLanguage}"],
      "cuisine": "short cuisine label",
      "spiceLevel": 0,
      "dietary": ["vegetarian", "vegan", "gluten-free", "contains-dairy", "contains-nuts", "seafood", "pork", "beef"],
      "priceText": null,${multiLangBlock}
    }
  ]
}

Analyze the menu image${imageDataUrls.length > 1 ? "s" : ""}. Include every dish you can clearly see. spiceLevel must be 0, 1, 2, or 3.${pagesNote}`;

  const { text } = await generateText({
    model: gateway(modelId),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...imageDataUrls.map((img) => ({ type: "image" as const, image: img })),
        ],
      },
    ],
  });

  const parsed = extractJsonObject(text);
  const normalized = normalizeMenuResult(parsed, targetLanguage);
  if (!normalized.dishes.length) {
    throw new Error(
      "We couldn't find any dishes in those photos. Try clearer, closer shots of the menu.",
    );
  }
  return normalized;
}

export class NoCreditsError extends Error {
  code = "NO_CREDITS" as const;
  constructor() {
    super(
      "You're out of free menu scans. Subscribe to Diner Premium or buy a scan pack to keep scanning.",
    );
  }
}

type ScanTier = "admin" | "premium" | "free" | "paid" | "none";

async function refundConsumedCredit(
  supabaseAdmin: Awaited<typeof import("@/integrations/supabase/client.server")>["supabaseAdmin"],
  userId: string,
  tier: ScanTier,
) {
  if (tier !== "free" && tier !== "paid") return;
  const column = tier === "free" ? "free_remaining" : "paid_remaining";
  try {
    const { data: row } = await supabaseAdmin
      .from("user_scan_credits")
      .select("free_remaining, paid_remaining, lifetime_used")
      .eq("user_id", userId)
      .maybeSingle();

    const baseUpdate = {
      lifetime_used: Math.max(0, (row?.lifetime_used ?? 1) - 1),
      updated_at: new Date().toISOString(),
    };
    const update =
      tier === "free"
        ? { ...baseUpdate, free_remaining: (row?.free_remaining ?? 0) + 1 }
        : { ...baseUpdate, paid_remaining: (row?.paid_remaining ?? 0) + 1 };

    await supabaseAdmin.from("user_scan_credits").update(update).eq("user_id", userId);
  } catch (refundError) {
    console.error("scan credit refund failed", refundError);
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
    // 1. Check + consume a credit BEFORE calling AI.
    // The owner bypass uses server-verified auth claims first, so the site owner
    // can keep scanning even if the credit helper is temporarily unavailable.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let tier: ScanTier = isOwnerEmail(getClaimEmail(context.claims)) ? "admin" : "none";
    if (tier !== "admin") {
      const { data: consumeResult, error: consumeError } = await supabaseAdmin.rpc(
        "consume_scan_credit",
        { _user_id: context.userId },
      );
      if (consumeError) {
        console.error("consume_scan_credit failed", consumeError);
        throw new Error("We couldn't verify your scan access. Please try again in a moment.");
      }
      tier = (consumeResult as ScanTier) ?? "none";
    }
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

    // Cheaper model for free tier, better one for paid/premium/admin
    const modelId = isFree
      ? "google/gemini-2.5-flash-lite"
      : "google/gemini-3-flash-preview";

    try {
      return await analyzeMenuImages({
        imageDataUrls: images,
        targetLanguage: data.targetLanguage,
        multiLanguage: useMultiLang,
        modelId,
      });
    } catch (err) {
      // If AI or parsing fails, put the user's scan credit back.
      await refundConsumedCredit(supabaseAdmin, context.userId, tier);
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
