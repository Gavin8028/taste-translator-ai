import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhook, EventName, type PaddleEnv } from "@/lib/paddle.server";

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

async function handleWebhook(req: Request, env: PaddleEnv) {
  const event = await verifyWebhook(req, env);

  if (event.eventType === EventName.TransactionCompleted) {
    const data = event.data as any;
    const slug = data?.customData?.slug;
    const transactionId = data?.id;
    if (slug && transactionId) {
      await markMenuPaid(slug, transactionId);
    } else {
      console.warn("transaction.completed without slug in customData", {
        transactionId,
      });
    }
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
