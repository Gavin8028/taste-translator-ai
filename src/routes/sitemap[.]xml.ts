import { createFileRoute } from "@tanstack/react-router";

const BASE_URL = "https://menuvisionai.live";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/scan", changefreq: "weekly", priority: "0.9" },
          { path: "/pricing", changefreq: "monthly", priority: "0.8" },
          { path: "/faq", changefreq: "monthly", priority: "0.8" },
          { path: "/demo", changefreq: "monthly", priority: "0.8" },
          { path: "/restaurants", changefreq: "monthly", priority: "0.8" },
          { path: "/restaurants/new", changefreq: "monthly", priority: "0.7" },
          { path: "/about", changefreq: "monthly", priority: "0.6" },
          { path: "/contact", changefreq: "monthly", priority: "0.5" },
          { path: "/privacy", changefreq: "monthly", priority: "0.4" },
          { path: "/terms", changefreq: "monthly", priority: "0.4" },
          { path: "/refunds", changefreq: "monthly", priority: "0.4" },

        ];

        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data: menus } = await supabaseAdmin
            .from("restaurant_menus")
            .select("slug, updated_at")
            .eq("paid", true)
            .order("updated_at", { ascending: false });

          if (menus) {
            for (const menu of menus) {
              entries.push({
                path: `/m/${menu.slug}`,
                changefreq: "weekly",
                priority: "0.8",
                lastmod: menu.updated_at ? new Date(menu.updated_at).toISOString().split("T")[0] : undefined,
              });
            }
          }
        } catch {
          // If the query fails, return the static entries only
        }

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
