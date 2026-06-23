import { createServerFn } from "@tanstack/react-start";
import { generateObject } from "ai";
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

export const analyzeMenu = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    return z
      .object({
        // Accept either a single image (legacy) or an array of pages.
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
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const images = data.imageDataUrls && data.imageDataUrls.length
      ? data.imageDataUrls
      : [data.imageDataUrl!];

    const multiLangBlock = data.multiLanguage
      ? `\n- translations: an object with keys "English", "Spanish", "French", "Japanese", "Chinese" — each holding { "name": <dish name in that language>, "description": <1-2 sentence description in that language> }. Translate naturally; don't leave any language blank.`
      : "";

    const pagesNote =
      images.length > 1
        ? `\n\nThe user has provided ${images.length} photos. They are pages or sections of the SAME menu. Combine every dish across all photos into one list. De-duplicate dishes that clearly appear on multiple pages (same name and ingredients) — keep one entry. Preserve the order pages were given.`
        : "";

    const prompt = `You are MenuVision, an expert at reading restaurant menus from photos.

Analyze the menu image${images.length > 1 ? "s" : ""}. For EVERY dish you can see (skip headers, drink lists if not real dishes, and footers):
- nameOriginal: dish name exactly as printed
- nameTranslated: dish name in ${data.targetLanguage}
- description: 1-2 sentence appetizing description in ${data.targetLanguage} explaining what the dish is
- ingredients: array of the main visible/likely ingredients (in ${data.targetLanguage})
- cuisine: short cuisine label, e.g. "Italian", "Thai", "Mexican"
- spiceLevel: integer 0 (none), 1 (mild), 2 (medium), 3 (hot)
- dietary: subset of ["vegetarian","vegan","gluten-free","contains-dairy","contains-nuts","seafood","pork","beef"] that clearly apply
- priceText: the price exactly as printed if visible, otherwise null${multiLangBlock}

Also return sourceLanguage (the detected language of the menu) and restaurantName if visible.

Be thorough. Real restaurant menus often have 10-40 items. Do not invent dishes that are not visible.${pagesNote}`;

    try {
      const { object } = await generateObject({
        model: gateway("google/gemini-3-flash-preview"),
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
      const msg = err instanceof Error ? err.message : String(err);
      if (/402|payment required|insufficient.*credit|quota/i.test(msg)) {
        throw new Error(
          "MenuVision is temporarily over its daily AI usage limit. Please try again later — this isn't a charge to you.",
        );
      }
      if (/429|rate limit/i.test(msg)) {
        throw new Error("Too many scans right now. Please try again in a minute.");
      }
      throw err;
    }
  });
