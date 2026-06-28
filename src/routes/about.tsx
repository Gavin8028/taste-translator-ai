import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — MenuVision AI" },
      {
        name: "description",
        content:
          "MenuVision AI helps travelers and curious eaters understand any menu, anywhere in the world.",
      },
      { property: "og:title", content: "About — MenuVision AI" },
      {
        property: "og:description",
        content:
          "MenuVision AI helps travelers and curious eaters understand any menu, anywhere in the world.",
      },
      { property: "og:url", content: "https://menuvisionai.live/about" },
    ],
    links: [{ rel: "canonical", href: "https://menuvisionai.live/about" }],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-16">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">About</h1>
        <div className="prose prose-neutral mt-6 space-y-4 text-muted-foreground dark:prose-invert">
          <p>
            MenuVision AI was built for the moment you sit down at a restaurant in a
            country you've never been, look at the menu, and have absolutely no idea what
            anything is.
          </p>
          <p>
            Point your camera. We do the rest — read every line, translate it, describe
            each dish, and generate a picture so you can see what you're about to order
            before you order it.
          </p>
          <p>
            We work with printed menus, chalkboards, food trucks, bars, and anything else
            you can photograph clearly.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
