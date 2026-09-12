/**
 * The stored schema was generated against the customer's other site, so every
 * URL pointing at this article is wrong. Repoint them at the live post URL.
 */
export function repointJsonLd(node: unknown, liveUrl: string): unknown {
  if (Array.isArray(node)) return node.map((n) => repointJsonLd(n, liveUrl));
  if (!node || typeof node !== "object") return node;

  const obj = { ...(node as Record<string, unknown>) };
  const type = typeof obj["@type"] === "string" ? (obj["@type"] as string) : "";

  if (/Article|BlogPosting|NewsArticle/i.test(type)) {
    if ("url" in obj) obj["url"] = liveUrl;
    if ("mainEntityOfPage" in obj) {
      const mep = obj["mainEntityOfPage"];
      obj["mainEntityOfPage"] =
        mep && typeof mep === "object"
          ? { ...(mep as Record<string, unknown>), "@id": liveUrl }
          : liveUrl;
    }
  }

  if (type === "BreadcrumbList" && Array.isArray(obj["itemListElement"])) {
    const items = [...(obj["itemListElement"] as unknown[])];
    const lastIndex = items.length - 1;
    if (lastIndex >= 0 && items[lastIndex] && typeof items[lastIndex] === "object") {
      const last = { ...(items[lastIndex] as Record<string, unknown>) };
      const item = last["item"];
      last["item"] =
        item && typeof item === "object"
          ? { ...(item as Record<string, unknown>), "@id": liveUrl }
          : liveUrl;
      items[lastIndex] = last;
    }
    obj["itemListElement"] = items;
    return obj;
  }

  for (const key of Object.keys(obj)) {
    // author/publisher identify the brand, not this page.
    if (key === "author" || key === "publisher") continue;
    const value = obj[key];
    if (value && typeof value === "object") obj[key] = repointJsonLd(value, liveUrl);
  }

  return obj;
}
