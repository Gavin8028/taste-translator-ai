import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const TrackInput = z.object({
  name: z.string().min(1).max(60),
  path: z.string().max(500).optional().nullable(),
  sessionId: z.string().max(64).optional().nullable(),
  referrer: z.string().max(500).optional().nullable(),
  props: z.record(z.string(), z.unknown()).optional(),
});

function detectDevice(ua: string | null): string {
  if (!ua) return "unknown";
  const s = ua.toLowerCase();
  if (/ipad|tablet/.test(s)) return "tablet";
  if (/mobile|iphone|android/.test(s)) return "mobile";
  return "desktop";
}

export const trackEvent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TrackInput.parse(input))
  .handler(async ({ data }) => {
    try {
      const req = getRequest();
      const country = req.headers.get("cf-ipcountry");
      const ua = req.headers.get("user-agent");
      const device = detectDevice(ua);

      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("analytics_events").insert({
        event_name: data.name,
        path: data.path ?? null,
        session_id: data.sessionId ?? null,
        country,
        device,
        referrer: data.referrer ?? null,
        props: (data.props ?? {}) as never,
      });
    } catch (e) {
      // Never let analytics break a user flow
      console.error("trackEvent failed", e);
    }
    return { ok: true };
  });

// ---- Admin dashboard queries ----

async function assertAdmin(context: { supabase: ReturnType<typeof Object>; userId: string }) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: userRes } = await supabaseAdmin.auth.admin.getUserById(context.userId);
  const email = userRes?.user?.email?.toLowerCase() ?? null;
  if (!email) throw new Error("Forbidden");

  // Bootstrap: if no admins exist yet, the first authenticated viewer claims the role.
  const { count } = await supabaseAdmin
    .from("admin_emails")
    .select("email", { count: "exact", head: true });
  if ((count ?? 0) === 0) {
    await supabaseAdmin.from("admin_emails").insert({ email });
    return { email, admin: supabaseAdmin };
  }

  const { data: match } = await supabaseAdmin
    .from("admin_emails")
    .select("email")
    .eq("email", email)
    .maybeSingle();
  if (!match) throw new Error("Forbidden");
  return { email, admin: supabaseAdmin };
}

export const getAnalyticsSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { admin } = await assertAdmin(context as never);

    const since7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [
      pv7,
      pv30,
      scansStarted,
      scansCompleted,
      scansFailed,
      publishes,
      menuViews,
      premium,
      signins,
    ] = await Promise.all([
      admin.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "page_view").gte("created_at", since7),
      admin.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "page_view").gte("created_at", since30),
      admin.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "scan_started").gte("created_at", since30),
      admin.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "scan_completed").gte("created_at", since30),
      admin.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "scan_failed").gte("created_at", since30),
      admin.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "menu_published").gte("created_at", since30),
      admin.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "menu_viewed").gte("created_at", since30),
      admin.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "premium_subscribed").gte("created_at", since30),
      admin.from("analytics_events").select("id", { count: "exact", head: true }).eq("event_name", "signin_completed").gte("created_at", since30),
    ]);

    // Daily page-view trend (last 14 days)
    const since14 = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
    const { data: trendRows } = await admin
      .from("analytics_events")
      .select("created_at")
      .eq("event_name", "page_view")
      .gte("created_at", since14)
      .limit(10000);

    const byDay = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
      byDay.set(d, 0);
    }
    for (const r of trendRows ?? []) {
      const d = (r.created_at as string).slice(0, 10);
      if (byDay.has(d)) byDay.set(d, (byDay.get(d) ?? 0) + 1);
    }
    const trend = Array.from(byDay.entries()).map(([day, count]) => ({ day, count }));

    // Top paths, referrers, countries (30d)
    const { data: rows } = await admin
      .from("analytics_events")
      .select("path, referrer, country, event_name")
      .eq("event_name", "page_view")
      .gte("created_at", since30)
      .limit(10000);

    const tally = (key: "path" | "referrer" | "country") => {
      const m = new Map<string, number>();
      for (const r of rows ?? []) {
        const v = (r[key] as string | null) || "(direct)";
        m.set(v, (m.get(v) ?? 0) + 1);
      }
      return Array.from(m.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([label, count]) => ({ label, count }));
    };

    return {
      pageViews7d: pv7.count ?? 0,
      pageViews30d: pv30.count ?? 0,
      scansStarted30d: scansStarted.count ?? 0,
      scansCompleted30d: scansCompleted.count ?? 0,
      scansFailed30d: scansFailed.count ?? 0,
      menusPublished30d: publishes.count ?? 0,
      menuViews30d: menuViews.count ?? 0,
      premiumSubs30d: premium.count ?? 0,
      signins30d: signins.count ?? 0,
      trend,
      topPaths: tally("path"),
      topReferrers: tally("referrer"),
      topCountries: tally("country"),
    };
  });
