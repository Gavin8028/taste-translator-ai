import { createFileRoute } from "@tanstack/react-router";
import {
  BlgHttpError,
  cleanArticleHtml,
  getArticle,
  listArticles,
  type ArticleSummary,
} from "@/lib/blg.server";

const PAGE_SIZE = 50;
const MAX_CALLS = 25;
const MAX_DETAIL_CALLS = 20;
const MIN_GAP_MS = 2100;
const MAX_CHAIN = 25;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type SyncState = {
  list_offset: number;
  list_complete: boolean;
  next_allowed_at: string | null;
};

async function runSync(chain: number) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const nowIso = new Date().toISOString();

  // 0. Claim the lease before reading the cursor.
  const { data: leased } = await supabaseAdmin
    .from("blg_sync_state")
    .update({ lease_until: new Date(Date.now() + 3 * 60_000).toISOString(), last_run_at: nowIso })
    .eq("id", 1)
    .or(`lease_until.is.null,lease_until.lt.${nowIso}`)
    .select("list_offset, list_complete, next_allowed_at")
    .maybeSingle();

  if (!leased) return { skipped: "locked" as const };

  const state = leased as SyncState;
  let listOffset = state.list_offset ?? 0;
  let listComplete = false;
  let nextAllowedAt = state.next_allowed_at ? new Date(state.next_allowed_at).getTime() : 0;

  let calls = 0;
  let detailCalls = 0;
  let synced = 0;
  let remaining = 0;
  let hitRateLimit = false;
  let progressed = false;

  const waitForSlot = async () => {
    const delay = nextAllowedAt - Date.now();
    if (delay > 0) await sleep(delay);
  };

  const markCall = async () => {
    nextAllowedAt = Date.now() + MIN_GAP_MS;
    await supabaseAdmin
      .from("blg_sync_state")
      .update({
        next_allowed_at: new Date(nextAllowedAt).toISOString(),
        lease_until: new Date(Date.now() + 3 * 60_000).toISOString(),
      })
      .eq("id", 1);
  };

  const handleRateLimit = async (err: BlgHttpError) => {
    hitRateLimit = true;
    const seconds = err.retryAfterSeconds && err.retryAfterSeconds > 0 ? err.retryAfterSeconds : 60;
    nextAllowedAt = Date.now() + seconds * 1000;
    await supabaseAdmin
      .from("blg_sync_state")
      .update({ next_allowed_at: new Date(nextAllowedAt).toISOString() })
      .eq("id", 1);
  };

  try {
    scan: while (calls < MAX_CALLS && detailCalls < MAX_DETAIL_CALLS && !hitRateLimit) {
      let page: ArticleSummary[];
      try {
        await waitForSlot();
        page = await listArticles(PAGE_SIZE, listOffset);
        calls++;
        await markCall();
      } catch (err) {
        if (err instanceof BlgHttpError && err.status === 429) {
          await handleRateLimit(err);
          break scan;
        }
        throw err;
      }

      if (page.length === 0) {
        listComplete = true;
        listOffset = 0;
        break scan;
      }

      const ids = page.map((a) => a.id);
      const { data: existingRows } = await supabaseAdmin
        .from("blg_articles")
        .select("id, slug, article_updated_at")
        .in("id", ids);
      const existing = new Map(
        (existingRows ?? []).map((r) => [
          Number(r.id),
          { slug: r.slug as string, updatedAt: r.article_updated_at as string | null },
        ]),
      );

      const todo = page.filter((a) => {
        const prior = existing.get(a.id);
        if (!prior) return true;
        if (!a.updated_at) return false;
        if (!prior.updatedAt) return true;
        return new Date(a.updated_at).getTime() > new Date(prior.updatedAt).getTime();
      });

      let leftovers = 0;

      for (const summary of todo) {
        if (calls >= MAX_CALLS || detailCalls >= MAX_DETAIL_CALLS) {
          leftovers = todo.length - (todo.indexOf(summary));
          break;
        }

        try {
          await waitForSlot();
          const detail = await getArticle(summary.id);
          calls++;
          detailCalls++;
          await markCall();

          const slug = (detail.slug ?? summary.slug ?? String(summary.id)).trim();
          const prior = existing.get(summary.id);
          const previousSlugs: string[] = [];
          if (prior && prior.slug && prior.slug !== slug) {
            const { data: priorRow } = await supabaseAdmin
              .from("blg_articles")
              .select("previous_slugs")
              .eq("id", summary.id)
              .maybeSingle();
            const old = (priorRow?.previous_slugs as string[] | null) ?? [];
            previousSlugs.push(...new Set([...old, prior.slug]));
          }

          const row: Record<string, unknown> = {
            id: summary.id,
            slug,
            title: detail.title ?? summary.title ?? "Untitled",
            meta_description: detail.meta_description ?? summary.meta_description ?? null,
            hero_image_url: detail.hero_image_url ?? summary.hero_image_url ?? null,
            language_code: detail.languageCode ?? summary.languageCode ?? null,
            content_html: cleanArticleHtml(detail.content_html),
            json_ld: detail.jsonLd ?? null,
            faq_json_ld: detail.faqJsonLd ?? null,
            article_created_at: detail.created_at ?? summary.created_at ?? null,
            article_updated_at: detail.updated_at ?? summary.updated_at ?? detail.created_at ?? null,
            synced_at: new Date().toISOString(),
          };
          if (previousSlugs.length) row.previous_slugs = previousSlugs;

          const { error: upsertError } = await supabaseAdmin
            .from("blg_articles")
            .upsert(row as never, { onConflict: "id" });
          if (upsertError) {
            console.error("blg-sync upsert failed", summary.id, upsertError.message);
          } else {
            synced++;
            progressed = true;
          }
        } catch (err) {
          if (err instanceof BlgHttpError && err.status === 429) {
            await handleRateLimit(err);
            leftovers = todo.length - todo.indexOf(summary);
            break;
          }
          if (err instanceof BlgHttpError && err.status === 404) {
            // Permanently gone: never request this id again in this scan.
            calls++;
            detailCalls++;
            await markCall();
            continue;
          }
          throw err;
        }
      }

      if (leftovers > 0) {
        // Leave the cursor on this page so the next run finishes it.
        remaining += leftovers;
        break scan;
      }

      if (page.length < PAGE_SIZE) {
        listComplete = true;
        listOffset = 0;
        break scan;
      }

      listOffset += PAGE_SIZE;
      progressed = true;
    }

    await supabaseAdmin
      .from("blg_sync_state")
      .update({ list_offset: listOffset, list_complete: listComplete })
      .eq("id", 1);

    return {
      synced,
      remaining,
      listComplete,
      done: listComplete && remaining === 0,
      hitRateLimit,
      chain,
      progressed,
      nextAllowedAt: new Date(nextAllowedAt).toISOString(),
    };
  } finally {
    await supabaseAdmin.from("blg_sync_state").update({ lease_until: null }).eq("id", 1);
  }
}

function chainNext(url: URL, chain: number, waitMs: number) {
  const target = new URL("/api/public/blg-sync", url.origin).toString();
  const task = (async () => {
    if (waitMs > 0) await sleep(Math.min(waitMs, 30_000));
    await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chain: chain + 1 }),
    }).catch(() => undefined);
  })();

  const runtime = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } })
    .EdgeRuntime;
  if (runtime?.waitUntil) runtime.waitUntil(task);
  else void task;
}

async function handle(request: Request) {
  let chain = 0;
  if (request.method === "POST") {
    const body = (await request.json().catch(() => null)) as { chain?: number } | null;
    if (typeof body?.chain === "number" && Number.isFinite(body.chain)) {
      chain = Math.max(0, Math.min(MAX_CHAIN, Math.floor(body.chain)));
    }
  }

  try {
    const result = await runSync(chain);
    if ("skipped" in result) return Response.json(result);

    const shouldChain =
      !result.hitRateLimit &&
      result.progressed &&
      chain < MAX_CHAIN &&
      (result.remaining > 0 || !result.listComplete);

    if (shouldChain) {
      chainNext(new URL(request.url), chain, new Date(result.nextAllowedAt).getTime() - Date.now());
    }

    return Response.json({ ...result, chained: shouldChain });
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    console.error("blg-sync failed", message);
    const status = error instanceof BlgHttpError ? error.status : 500;
    return Response.json({ error: message }, { status: status === 404 ? 500 : status });
  }
}

export const Route = createFileRoute("/api/public/blg-sync")({
  server: {
    handlers: {
      GET: ({ request }) => handle(request),
      POST: ({ request }) => handle(request),
    },
  },
});
