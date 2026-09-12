import { createFileRoute, Link, notFound, redirect } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { getBlogArticle } from "@/lib/blog.functions";
import { repointJsonLd } from "@/lib/blg.server";

const SITE = "https://menuvisionai.live";

function serialize(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export const Route = createFileRoute("/blog/$slug")({
  loader: async ({ params }) => {
    const { post, redirectTo } = await getBlogArticle({ data: { slug: params.slug } });
    if (redirectTo) throw redirect({ to: "/blog/$slug", params: { slug: redirectTo } });
    if (!post) throw notFound();

    const liveUrl = `${SITE}/blog/${post.slug}`;
    return {
      post,
      liveUrl,
      jsonLd: post.json_ld ? repointJsonLd(post.json_ld, liveUrl) : null,
      faqJsonLd: post.faq_json_ld ? repointJsonLd(post.faq_json_ld, liveUrl) : null,
    };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { post, liveUrl, jsonLd, faqJsonLd } = loaderData;
    const description = post.meta_description ?? "";

    const scripts: Array<{ type: string; children: string }> = [];
    if (jsonLd) scripts.push({ type: "application/ld+json", children: serialize(jsonLd) });
    if (faqJsonLd) scripts.push({ type: "application/ld+json", children: serialize(faqJsonLd) });

    return {
      meta: [
        { title: `${post.title} — MenuVision AI` },
        { name: "description", content: description },
        { property: "og:title", content: post.title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: liveUrl },
        ...(post.hero_image_url
          ? [
              { property: "og:image", content: post.hero_image_url },
              { name: "twitter:image", content: post.hero_image_url },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: post.title },
        { name: "twitter:description", content: description },
      ],
      links: [{ rel: "canonical", href: liveUrl }],
      scripts,
    };
  },
  component: BlogPostPage,
});

function BlogPostPage() {
  const { post } = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-12">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to blog
        </Link>

        <article
          lang={post.language_code ?? undefined}
          className="blg-prose mt-6"
          dangerouslySetInnerHTML={{ __html: post.content_html ?? "" }}
        />

        <div className="mt-12 border-t border-border/60 pt-6">
          <Link
            to="/blog"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
