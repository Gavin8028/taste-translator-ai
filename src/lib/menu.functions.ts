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

export type ProcessingQuality = "economy" | "premium";

type AnalyzeMenuImagesOptions = {
  imageDataUrls: string[];
  targetLanguage: string;
  multiLanguage?: boolean;
  modelId?: string;
  quality?: ProcessingQuality;
};

/**
 * Tier config — economy is used for free/anon scans (cheapest OCR + translation,
 * fewer images, no multi-language, compact prompt), premium is used for paid /
 * premium / admin scans (higher-quality model, richer output, multi-language ok).
 */
export const TIER_CONFIG = {
  economy: {
    modelId: "google/gemini-2.5-flash-lite",
    maxImages: 2,
    allowMultiLanguage: false,
    compactPrompt: true,
  },
  premium: {
    modelId: "google/gemini-2.5-flash",
    maxImages: 8,
    allowMultiLanguage: true,
    compactPrompt: false,
  },
} as const;

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
  modelId,
  quality = "premium",
}: AnalyzeMenuImagesOptions): Promise<MenuResult> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("Missing LOVABLE_API_KEY");

  const tier = TIER_CONFIG[quality];
  const effectiveModel = modelId ?? tier.modelId;
  const effectiveMultiLang = multiLanguage && tier.allowMultiLanguage;
  const cappedImages = imageDataUrls.slice(0, tier.maxImages);

  const gateway = createLovableAiGatewayProvider(key);

  const multiLangBlock = effectiveMultiLang
    ? `\n      "translations": { "English": { "name": "", "description": "" }, "Spanish": { "name": "", "description": "" }, "French": { "name": "", "description": "" }, "Japanese": { "name": "", "description": "" }, "Chinese": { "name": "", "description": "" } }`
    : `\n      "translations": null`;

  const pagesNote =
    cappedImages.length > 1
      ? `\n\nThe user has provided ${cappedImages.length} photos. They are pages of the SAME menu. Combine every dish across all photos into one list. De-duplicate dishes that clearly appear on multiple pages.`
      : "";

  // Economy prompt is shorter, asks for shorter output, and skips detailed
  // ingredient/dietary reasoning to reduce token cost.
  const prompt = tier.compactPrompt
    ? `You are MenuVision. Read the menu photo${cappedImages.length > 1 ? "s" : ""} and return ONLY valid JSON. No markdown.

{
  "sourceLanguage": "language of menu text or Unknown",
  "restaurantName": "name if visible, else null",
  "dishes": [
    {
      "nameOriginal": "dish name exactly as printed",
      "nameTranslated": "dish name in ${targetLanguage}",
      "description": "1 short sentence in ${targetLanguage} (max 20 words)",
      "ingredients": ["up to 4 main ingredients in ${targetLanguage}"],
      "cuisine": "short label",
      "spiceLevel": 0,
      "dietary": [],
      "priceText": null,
      "translations": null
    }
  ]
}

spiceLevel must be 0, 1, 2, or 3. Keep output compact.${pagesNote}`
    : `You are MenuVision, an expert at reading restaurant menus from photos.

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

Analyze the menu image${cappedImages.length > 1 ? "s" : ""}. Include every dish you can clearly see. spiceLevel must be 0, 1, 2, or 3.${pagesNote}`;

  const { text } = await generateText({
    model: gateway(effectiveModel),
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...cappedImages.map((img) => ({ type: "image" as const, image: img })),
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

export class AnonLimitError extends Error {
  code = "ANON_LIMIT" as const;
  constructor() {
    super(
      "You've already used your free scan on this network. Sign in for another free scan, or upgrade for unlimited.",
    );
  }

}

type ScanTier = "admin" | "premium" | "free" | "paid" | "anon" | "none";

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

function getClientIp(req: Request | undefined): string {
  if (!req) return "0.0.0.0";
  const h = req.headers;
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return "0.0.0.0";
}

async function verifyBearer(
  token: string,
): Promise<{ userId: string; email: string | null } | null> {
  try {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_PUBLISHABLE_KEY!,
      { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
    );
    const { data, error } = await supabase.auth.getClaims(token);
    if (error || !data?.claims?.sub) return null;
    const email =
      typeof data.claims.email === "string" ? data.claims.email.toLowerCase() : null;
    return { userId: data.claims.sub as string, email };
  } catch {
    return null;
  }
}

export const analyzeMenu = createServerFn({ method: "POST" })
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
  .handler(async ({ data }): Promise<MenuResult> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const req = getRequest();

    // Optional bearer — if present and valid, treat as signed-in.
    const authHeader = req?.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice("Bearer ".length).trim()
      : "";
    const session = token ? await verifyBearer(token) : null;

    let tier: ScanTier = "none";
    let userId: string | null = null;
    const clientIp = getClientIp(req);

    if (session) {
      userId = session.userId;
      if (isOwnerEmail(session.email)) {
        tier = "admin";
      } else {
        const { data: consumeResult, error: consumeError } = await supabaseAdmin.rpc(
          "consume_scan_credit",
          { _user_id: session.userId },
        );
        if (consumeError) {
          console.error("consume_scan_credit failed", consumeError);
          throw new Error("We couldn't verify your scan access. Please try again in a moment.");
        }
        tier = (consumeResult as ScanTier) ?? "none";
      }
      if (tier === "none") throw new NoCreditsError();
    } else {
      // Anonymous path — IP-based rate limit, no user credit consumed.
      const { data: anonResult, error: anonError } = await supabaseAdmin.rpc(
        "consume_anonymous_scan",
        { _ip: clientIp },
      );

      if (anonError) {
        console.error("consume_anonymous_scan failed", anonError);
        throw new Error("We couldn't start your scan. Please try again in a moment.");
      }
      if (anonResult === "limit") throw new AnonLimitError();
      tier = "anon";
    }

    // Tiered processing: free/anon get economy pipeline (cheapest model, fewer
    // images, compact prompt, no multi-language). Paid/premium/admin get the
    // premium pipeline (higher-quality model, full features).
    const isRestricted = tier === "free" || tier === "anon";
    const quality: ProcessingQuality = isRestricted ? "economy" : "premium";
    const allImages = data.imageDataUrls && data.imageDataUrls.length
      ? data.imageDataUrls
      : [data.imageDataUrl!];
    const images = allImages.slice(0, TIER_CONFIG[quality].maxImages);
    const useMultiLang = !!data.multiLanguage;

    try {
      return await analyzeMenuImages({
        imageDataUrls: images,
        targetLanguage: data.targetLanguage,
        multiLanguage: useMultiLang,
        quality,
      });
    } catch (err) {
      // Refund on failure.
      if (tier === "anon") {
        await supabaseAdmin.rpc("refund_anonymous_scan", { _ip: clientIp }).then(
          () => undefined,
          (e) => console.error("refund_anonymous_scan failed", e),
        );
      } else if (userId) {
        await refundConsumedCredit(supabaseAdmin, userId, tier);
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

