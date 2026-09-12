import { createServerFn } from "@tanstack/react-start";

export type BlogCard = {
  slug: string;
  title: string;
  meta_description: string | null;
  hero_image_url: string | null;
  language_code: string | null;
  article_created_at: string | null;
};

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type BlogPost = BlogCard & {
  content_html: string | null;
  json_ld: JsonValue;
  faq_json_ld: JsonValue;
  article_updated_at: string | null;
};

export const listBlogArticles = createServerFn({ method: "GET" }).handler(
  async (): Promise<BlogCard[]> => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("blg_articles")
      .select("slug, title, meta_description, hero_image_url, language_code, article_created_at")
      .order("article_created_at", { ascending: false });

    if (error) {
      console.error("listBlogArticles failed", error.message);
      return [];
    }
    return (data ?? []) as BlogCard[];
  },
);

export const getBlogArticle = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug).slice(0, 300) }))
  .handler(
    async ({
      data,
    }): Promise<{ post: BlogPost | null; redirectTo: string | null }> => {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const columns =
        "slug, title, meta_description, hero_image_url, language_code, article_created_at, article_updated_at, content_html, json_ld, faq_json_ld";

      const { data: exact } = await supabaseAdmin
        .from("blg_articles")
        .select(columns)
        .eq("slug", data.slug)
        .maybeSingle();

      if (exact) return { post: exact as BlogPost, redirectTo: null };

      const { data: renamed } = await supabaseAdmin
        .from("blg_articles")
        .select("slug")
        .contains("previous_slugs", [data.slug])
        .maybeSingle();

      if (renamed?.slug) return { post: null, redirectTo: renamed.slug };

      return { post: null, redirectTo: null };
    },
  );
