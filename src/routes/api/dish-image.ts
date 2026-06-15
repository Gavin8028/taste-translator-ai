import { createFileRoute } from "@tanstack/react-router";
import { isSameOriginRequest, sanitizeShortText } from "@/lib/api-guard";

export const Route = createFileRoute("/api/dish-image")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!isSameOriginRequest(request)) {
          return new Response("Forbidden", { status: 403 });
        }

        const raw = (await request.json().catch(() => null)) as {
          dish?: unknown;
          cuisine?: unknown;
        } | null;
        const dish = sanitizeShortText(raw?.dish);
        const cuisine =
          raw?.cuisine === undefined || raw?.cuisine === null || raw?.cuisine === ""
            ? ""
            : sanitizeShortText(raw?.cuisine);
        if (!dish || cuisine === null) {
          return new Response("Invalid input", { status: 400 });
        }

        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        const prompt = `Appetizing overhead food photograph of ${dish}${
          cuisine ? `, ${cuisine} cuisine` : ""
        }. Natural daylight, shallow depth of field, on a simple ceramic plate, restaurant-quality plating, no text, no logos, no menu, no people.`;

        const upstream = await fetch(
          "https://ai.gateway.lovable.dev/v1/images/generations",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${key}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "openai/gpt-image-2",
              prompt,
              quality: "low",
              size: "1024x1024",
              n: 1,
              stream: true,
              partial_images: 1,
            }),
          },
        );

        if (!upstream.ok || !upstream.body) {
          return new Response(await upstream.text(), { status: upstream.status });
        }

        return new Response(upstream.body, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
          },
        });
      },
    },
  },
});
