import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhook, gatewayFetch, EventName, type PaddleEnv } from "@/lib/paddle.server";
import { SCAN_PACK_AMOUNTS, type ScanPackId } from "@/lib/pricing-plans";

async function markMenuPaid(slug: string, transactionId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin
    .from("restaurant_menus")
    .update({
      paid: true,
      paid_at: new Date().toISOString(),
      paddle_transaction_id: transactionId,
    })
    .eq("slug", slug);
  if (error) console.error("Failed to mark menu paid:", error);
  await supabaseAdmin.from("analytics_events").insert({
    event_name: "menu_published",
    path: `/m/${slug}`,
    props: { slug, transactionId } as never,
  });
}

async function grantScanPack(
  userId: string,
  packId: ScanPackId,
  transactionId: string,
) {
  const amount = SCAN_PACK_AMOUNTS[packId];
  if (!amount) return;
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.rpc("grant_paid_credits", {
    _user_id: userId,
    _amount: amount,
  });
  if (error) console.error("grant_paid_credits failed", error);
  await supabaseAdmin.from("analytics_events").insert({
    event_name: "scan_pack_purchased",
    props: { packId, amount, transactionId, userId } as never,
  });
}

async function upsertSubscription(data: any, env: PaddleEnv, status: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const userId = data?.customData?.userId;
  if (!userId) {
    console.warn("subscription event without customData.userId");
    return;
  }
  const item = data.items?.[0];
  const priceId = item?.price?.importMeta?.externalId;
  const productId = item?.product?.importMeta?.externalId;
  if (!priceId || !productId) {
    console.warn("subscription event missing importMeta.externalId");
    return;
  }
  await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: userId,
      paddle_subscription_id: data.id,
      paddle_customer_id: data.customerId,
      product_id: productId,
      price_id: priceId,
      status,
      current_period_start: data.currentBillingPeriod?.startsAt,
      current_period_end: data.currentBillingPeriod?.endsAt,
      cancel_at_period_end: data.scheduledChange?.action === "cancel",
      environment: env,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "paddle_subscription_id" },
  );
}

function normalizePackId(raw?: string | null): ScanPackId | null {
  if (!raw) return null;
  const id = raw.endsWith("_product") ? raw.slice(0, -"_product".length) : raw;
  return id in SCAN_PACK_AMOUNTS ? (id as ScanPackId) : null;
}

/**
 * transaction.completed payloads do NOT include import_meta on the price
 * object — only details.line_items[].product.import_meta is populated (as
 * "<pack>_product"). Fall back through every known location, then to a
 * direct price lookup, so a purchase can never silently grant nothing.
 */
async function resolveScanPacks(data: any, env: PaddleEnv): Promise<ScanPackId[]> {
  const found = new Set<ScanPackId>();

  for (const item of data?.items ?? []) {
    const fromPrice = normalizePackId(item?.price?.importMeta?.externalId);
    if (fromPrice) found.add(fromPrice);
  }

  const lineItems = data?.details?.lineItems ?? data?.details?.line_items ?? [];
  for (const li of lineItems) {
    const fromProduct = normalizePackId(
      li?.product?.importMeta?.externalId ?? li?.product?.import_meta?.external_id,
    );
    if (fromProduct) found.add(fromProduct);
  }

  if (found.size > 0) return [...found];

  // Last resort: look the price up directly to read its external id.
  for (const item of data?.items ?? []) {
    const priceId = item?.price?.id;
    if (!priceId) continue;
    try {
      const res = await gatewayFetch(env, `/prices/${encodeURIComponent(priceId)}`);
      const json = (await res.json()) as {
        data?: { import_meta?: { external_id?: string } };
      };
      const resolved = normalizePackId(json?.data?.import_meta?.external_id);
      if (resolved) found.add(resolved);
    } catch (e) {
      console.error("price lookup failed", priceId, e);
    }
  }

  return [...found];
}

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);

  if (event.eventType === EventName.TransactionCompleted) {
    const data = event.data as any;
    const transactionId = data?.id;
    const slug = data?.customData?.slug;
    const userId = data?.customData?.userId;

    // restaurant publish
    if (slug && transactionId) {
      await markMenuPaid(slug, transactionId);
      return;
    }

    // scan pack purchase — figure out which pack(s) were bought
    const packs = await resolveScanPacks(data, env);
    if (!packs.length) {
      console.warn("transaction.completed matched no scan pack", transactionId);
      return;
    }
    if (!userId) {
      console.error("scan pack purchase without customData.userId", transactionId);
      return;
    }
    for (const pack of packs) {
      await grantScanPack(userId, pack, transactionId);
    }
    return;
  }


  if (
    event.eventType === EventName.SubscriptionCreated ||
    event.eventType === EventName.SubscriptionUpdated
  ) {
    await upsertSubscription(event.data as any, env, (event.data as any).status);
    return;
  }

  if (event.eventType === EventName.SubscriptionCanceled) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const data = event.data as any;
    await supabaseAdmin
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("paddle_subscription_id", data.id)
      .eq("environment", env);
    return;
  }

  console.log("Unhandled event:", event.eventType);
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const env = (url.searchParams.get("env") || "sandbox") as PaddleEnv;
        try {
          await handleWebhook(request, env);
          return Response.json({ received: true });
        } catch (e) {
          console.error("Webhook error:", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
