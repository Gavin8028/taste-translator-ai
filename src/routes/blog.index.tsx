import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { listBlogArticles } from "@/lib/blog.functions";

const TITLE = "Blog — MenuVision AI";
const DESCRIPTION =
  "Guides to eating abroad: menu translation tips, food culture, dietary needs and travel dining advice from MenuVision AI.";
const CANONICAL = "https://menuvisionai.live/blog";

export const Route = createFileRoute("/blog/")({
  loader: () => listBlogArticles(),
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: CANONICAL },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: CANONICAL }],
  }),
  component: BlogIndex,
});

function formatDate(value: string | null) {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function BlogIndex() {
  const posts = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-14">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Blog</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{DESCRIPTION}</p>

        {posts.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-border/60 bg-muted/30 px-6 py-14 text-center">
            <p className="text-lg font-medium">No articles yet</p>
            <p className="mt-2 text-sm text-muted-foreground">
              New posts appear here automatically as soon as they are published.
            </p>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                to="/blog/$slug"
                params={{ slug: post.slug }}
                lang={post.language_code ?? undefined}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card transition-shadow hover:shadow-lg"
              >
                {post.hero_image_url ? (
                  <img
                    src={post.hero_image_url}
                    alt={post.title}
                    loading="lazy"
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="h-44 w-full bg-muted" />
                )}
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <h2 className="text-lg font-semibold leading-snug group-hover:text-primary">
                    {post.title}
                  </h2>
                  {post.meta_description ? (
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {post.meta_description}
                    </p>
                  ) : null}
                  {formatDate(post.article_created_at) ? (
                    <p className="mt-auto pt-2 text-xs text-muted-foreground">
                      {formatDate(post.article_created_at)}
                    </p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
