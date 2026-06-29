import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhook, EventName, type PaddleEnv } from "@/lib/paddle.server";
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

    // scan pack purchase — figure out which pack from line items
    const items = data?.items ?? [];
    for (const item of items) {
      const priceExt = item?.price?.importMeta?.externalId as string | undefined;
      if (priceExt && priceExt in SCAN_PACK_AMOUNTS && userId) {
        await grantScanPack(userId, priceExt as ScanPackId, transactionId);
      }
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
