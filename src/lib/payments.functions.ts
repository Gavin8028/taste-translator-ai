import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { gatewayFetch, type PaddleEnv } from "@/lib/paddle.server";

export const resolvePaddlePrice = createServerFn({ method: "GET" })
  .inputValidator((data: { priceId: string; environment: PaddleEnv }) => data)
  .handler(async ({ data }) => {
    const response = await gatewayFetch(
      data.environment,
      `/prices?external_id=${encodeURIComponent(data.priceId)}`,
    );
    const result = (await response.json()) as { data?: Array<{ id: string }> };
    if (!result.data?.length) throw new Error("Price not found");
    return result.data[0].id;
  });

export type LocalizedPrice = {
  /** Pre-formatted for the visitor's locale, e.g. "€4,49". */
  formatted: string;
  /** Amount in the smallest unit of `currency`. */
  amount: number;
  currency: string;
};

export type LocalizedPriceMap = Record<string, LocalizedPrice>;

function getClientIp(req: Request | undefined): string | null {
  if (!req) return null;
  const h = req.headers;
  const cf = h.get("cf-connecting-ip");
  if (cf) return cf.trim();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  const real = h.get("x-real-ip");
  if (real) return real.trim();
  return null;
}

/**
 * Ask the payment provider what these prices cost for the visitor's
 * country, so the pricing page can show local currency. Returns an empty
 * map on any failure — callers fall back to the static USD strings.
 */
export const previewLocalizedPrices = createServerFn({ method: "GET" })
  .inputValidator((data: { priceIds: string[]; environment: PaddleEnv }) => data)
  .handler(async ({ data }): Promise<LocalizedPriceMap> => {
    const priceIds = Array.from(new Set(data.priceIds)).slice(0, 12);
    if (!priceIds.length) return {};

    try {
      // Resolve human-readable IDs -> provider price IDs.
      const listRes = await gatewayFetch(data.environment, `/prices?per_page=200`);
      if (!listRes.ok) return {};
      const list = (await listRes.json()) as {
        data?: Array<{ id: string; custom_data?: unknown; import_meta?: { external_id?: string | null } }>;
      };

      const byExternal = new Map<string, string>();
      for (const price of list.data ?? []) {
        const external = price.import_meta?.external_id;
        if (external) byExternal.set(external, price.id);
      }

      const pairs = priceIds
        .map((externalId) => ({ externalId, paddleId: byExternal.get(externalId) }))
        .filter((p): p is { externalId: string; paddleId: string } => !!p.paddleId);
      if (!pairs.length) return {};

      const ip = getClientIp(getRequest());
      const body: Record<string, unknown> = {
        items: pairs.map((p) => ({ price_id: p.paddleId, quantity: 1 })),
      };
      if (ip && ip !== "0.0.0.0") body.customer_ip_address = ip;

      const previewRes = await gatewayFetch(data.environment, "/pricing-preview", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (!previewRes.ok) return {};

      const preview = (await previewRes.json()) as {
        data?: {
          currency_code?: string;
          details?: {
            line_items?: Array<{
              price?: { id?: string };
              formatted_totals?: { total?: string };
              totals?: { total?: string };
            }>;
          };
        };
      };

      const currency = preview.data?.currency_code ?? "USD";
      const paddleIdToExternal = new Map(pairs.map((p) => [p.paddleId, p.externalId]));
      const out: LocalizedPriceMap = {};

      for (const item of preview.data?.details?.line_items ?? []) {
        const paddleId = item.price?.id;
        // Use the tax-inclusive total: that's what the buyer actually pays.
        const formatted = item.formatted_totals?.total;
        if (!paddleId || !formatted) continue;
        const externalId = paddleIdToExternal.get(paddleId);
        if (!externalId) continue;
        out[externalId] = {
          formatted,
          amount: Number(item.totals?.total ?? 0),
          currency,
        };
      }

      return out;
    } catch (error) {
      console.error("previewLocalizedPrices failed", error);
      return {};
    }
  });
