import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader, SiteFooter } from "@/components/site-header";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — MenuVision AI" },
      {
        name: "description",
        content: "How MenuVision AI handles your menu photos and data.",
      },
    ],
  }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-16">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">Privacy</h1>
        <div className="mt-6 space-y-4 text-muted-foreground">
          <p>
            Your menu photos are sent to our AI provider to be analyzed and are not
            retained on our servers after analysis is complete.
          </p>
          <p>
            Your scan results live in your browser's session storage only. They are not
            associated with any account and they disappear when you close the tab.
          </p>
          <p>
            We do not use cookies for tracking. We do not sell data. We do not share
            your photos with third parties beyond what's needed to analyze them.
          </p>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
