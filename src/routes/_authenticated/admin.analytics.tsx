import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { SiteHeader, SiteFooter } from "@/components/site-header";
import { getAnalyticsSummary } from "@/lib/analytics.functions";
import { BarChart3, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — MenuVision AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AnalyticsPage,
});

function Card({
  label,
  value,
  hint,
}: {
  label: string;
  value: number | string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function List({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; count: number }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="mt-3 space-y-2">
        {rows.length === 0 && (
          <li className="text-xs text-muted-foreground">No data yet.</li>
        )}
        {rows.map((r) => (
          <li key={r.label} className="text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-foreground">{r.label}</span>
              <span className="tabular-nums text-muted-foreground">
                {r.count}
              </span>
            </div>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary"
                style={{ width: `${(r.count / max) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AnalyticsPage() {
  const fetchSummary = useServerFn(getAnalyticsSummary);
  const { data, isLoading, error } = useQuery({
    queryKey: ["analytics-summary"],
    queryFn: () => fetchSummary(),
    refetchOnWindowFocus: false,
  });

  const trendMax = Math.max(1, ...(data?.trend.map((t) => t.count) ?? [1]));
  const conv =
    data && data.pageViews30d > 0
      ? ((data.scansStarted30d / data.pageViews30d) * 100).toFixed(1) + "%"
      : "—";
  const publishRate =
    data && data.scansCompleted30d > 0
      ? ((data.menusPublished30d / data.scansCompleted30d) * 100).toFixed(1) + "%"
      : "—";

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:py-14">
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <BarChart3 className="h-4 w-4" /> Owner dashboard
        </div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          Analytics
        </h1>
        <p className="mt-2 text-muted-foreground">
          Real usage of MenuVision AI. Last 30 days unless noted.
        </p>

        {isLoading && (
          <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}

        {error && (
          <div className="mt-10 rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive">
            {(error as Error).message === "Forbidden"
              ? "You don't have access to this page."
              : (error as Error).message}
          </div>
        )}

        {data && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              <Card label="Page views (7d)" value={data.pageViews7d} />
              <Card label="Page views (30d)" value={data.pageViews30d} />
              <Card
                label="Scans started"
                value={data.scansStarted30d}
                hint={`${data.scansFailed30d} failed`}
              />
              <Card label="Scans completed" value={data.scansCompleted30d} />
              <Card label="Menu page views" value={data.menuViews30d} />
              <Card label="Menus published" value={data.menusPublished30d} />
              <Card label="Premium subscribers" value={data.premiumSubs30d} />
              <Card label="Sign-ins" value={data.signins30d} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Card
                label="Visit → scan conversion (30d)"
                value={conv}
                hint="Scans started ÷ page views"
              />
              <Card
                label="Scan → publish rate (30d)"
                value={publishRate}
                hint="Menus published ÷ scans completed"
              />
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-semibold">Page views — last 14 days</h3>
              <div className="mt-4 flex h-40 items-end gap-1">
                {data.trend.map((t) => (
                  <div
                    key={t.day}
                    className="flex flex-1 flex-col items-center gap-1"
                    title={`${t.day}: ${t.count}`}
                  >
                    <div
                      className="w-full rounded-t bg-primary/80"
                      style={{
                        height: `${(t.count / trendMax) * 100}%`,
                        minHeight: t.count > 0 ? 4 : 1,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground">
                      {t.day.slice(5)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <List title="Top pages" rows={data.topPaths} />
              <List title="Top referrers" rows={data.topReferrers} />
              <List title="Top countries" rows={data.topCountries} />
            </div>
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
