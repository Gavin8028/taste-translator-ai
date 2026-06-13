import { createFileRoute } from "@tanstack/react-router";

type SerpImageResult = {
  original?: string;
  thumbnail?: string;
  source?: string;
  original_width?: number;
  original_height?: number;
};

const BLOCKED_HOSTS = [
  "lookaside.fbsbx.com",
  "lookaside.instagram.com",
  "instagram.com",
  "fbcdn.net",
  "x.com",
  "twitter.com",
  "pinimg.com",
];

function isUsable(url: string | undefined): url is string {
  if (!url) return false;
  if (!url.startsWith("https://")) return false;
  try {
    const host = new URL(url).hostname;
    return !BLOCKED_HOSTS.some((b) => host.endsWith(b));
  } catch {
    return false;
  }
}

export const Route = createFileRoute("/api/dish-photo")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { dish, cuisine } = (await request.json()) as {
          dish: string;
          cuisine?: string;
        };
        const key = process.env.SERPAPI_API_KEY;
        if (!key) {
          return Response.json({ url: null, error: "missing_key" });
        }

        const q = [dish, cuisine, "food dish"].filter(Boolean).join(" ");
        const params = new URLSearchParams({
          engine: "google_images",
          q,
          safe: "active",
          ijn: "0",
          api_key: key,
        });

        try {
          const res = await fetch(`https://serpapi.com/search.json?${params}`);
          if (!res.ok) {
            return Response.json({ url: null, error: `serpapi_${res.status}` });
          }
          const data = (await res.json()) as { images_results?: SerpImageResult[] };
          const candidates = data.images_results ?? [];

          for (const c of candidates.slice(0, 12)) {
            if (isUsable(c.original)) {
              return Response.json({ url: c.original, source: c.source ?? null });
            }
          }
          for (const c of candidates.slice(0, 12)) {
            if (isUsable(c.thumbnail)) {
              return Response.json({ url: c.thumbnail, source: c.source ?? null });
            }
          }
          return Response.json({ url: null });
        } catch (err) {
          return Response.json({
            url: null,
            error: err instanceof Error ? err.message : "unknown",
          });
        }
      },
    },
  },
});
