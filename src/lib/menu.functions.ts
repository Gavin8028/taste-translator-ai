import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

const DishSchema = z.object({
  nameOriginal: z.string(),
  nameTranslated: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  cuisine: z.string(),
  spiceLevel: z.number().min(0).max(3),
  dietary: z.array(z.string()),
  priceText: z.string().optional().nullable(),
});

const MenuSchema = z.object({
  sourceLanguage: z.string(),
  restaurantName: z.string().optional().nullable(),
  dishes: z.array(DishSchema),
});

export type Dish = z.infer<typeof DishSchema>;
export type MenuResult = z.infer<typeof MenuSchema>;

export const analyzeMenu = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => {
    return z
      .object({
        imageDataUrl: z.string().min(20),
        targetLanguage: z.string().min(2).max(40).default("English"),
      })
      .parse(input);
  })
  .handler(async ({ data }): Promise<MenuResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `You are MenuVision, an expert at reading restaurant menus from photos.

Analyze the menu image. For EVERY dish you can see (skip headers, drink lists if not real dishes, and footers):
- nameOriginal: dish name exactly as printed
- nameTranslated: dish name in ${data.targetLanguage}
- description: 1-2 sentence appetizing description in ${data.targetLanguage} explaining what the dish is
- ingredients: array of the main visible/likely ingredients (in ${data.targetLanguage})
- cuisine: short cuisine label, e.g. "Italian", "Thai", "Mexican"
- spiceLevel: integer 0 (none), 1 (mild), 2 (medium), 3 (hot)
- dietary: subset of ["vegetarian","vegan","gluten-free","contains-dairy","contains-nuts","seafood","pork","beef"] that clearly apply
- priceText: the price exactly as printed if visible, otherwise null

Also return sourceLanguage (the detected language of the menu) and restaurantName if visible.

Be thorough. Real restaurant menus often have 10-40 items. Do not invent dishes that are not visible.`;

    const { experimental_output } = await generateText({
      model: gateway.chatModel("google/gemini-3-flash-preview"),
      experimental_output: Output.object({ schema: MenuSchema }),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image", image: data.imageDataUrl },
          ],
        },
      ],
    });

    return experimental_output;
  });
