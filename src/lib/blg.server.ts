/**
 * BabyLoveGrowth article sync helpers. Server-only: the API key must never
 * reach the browser, and api.babylovegrowth.ai must never be called from it.
 */

const API_BASE = "https://api.babylovegrowth.ai/api/integrations";
const USER_AGENT = "MenuVisionAI-Blog/1.0";
const CALL_TIMEOUT_MS = 15_000;

export type ArticleSummary = {
  id: number;
  title: string;
  slug: string | null;
  hero_image_url?: string | null;
  languageCode?: string | null;
  meta_description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ArticleDetail = ArticleSummary & {
  content_html?: string | null;
  content_markdown?: string | null;
  jsonLd?: unknown;
  faqJsonLd?: unknown;
};

export class BlgHttpError extends Error {
  constructor(
    readonly status: number,
    readonly retryAfterSeconds: number | null,
    message: string,
  ) {
    super(message);
  }
}

function apiKey(): string {
  const key = process.env["BABYLOVEGROWTH_API_KEY"];
  if (!key) throw new Error("BABYLOVEGROWTH_API_KEY is not configured");
  return key;
}

async function apiGet<T>(path: string): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), CALL_TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: {
        "X-API-Key": apiKey(),
        "Content-Type": "application/json",
        // Required: requests without a User-Agent are rejected at the edge with 403.
        "User-Agent": USER_AGENT,
      },
      signal: controller.signal,
    });

    if (!res.ok) {
      const retryAfterRaw = res.headers.get("retry-after");
      const retryAfter = retryAfterRaw ? Number(retryAfterRaw) : null;
      const body = await res.text().catch(() => "");
      throw new BlgHttpError(
        res.status,
        Number.isFinite(retryAfter) ? retryAfter : null,
        `BabyLoveGrowth ${res.status}: ${body.slice(0, 300)}`,
      );
    }

    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export function listArticles(limit: number, offset: number) {
  return apiGet<ArticleSummary[]>(`/v1/articles?limit=${limit}&offset=${offset}`);
}

export function getArticle(id: number) {
  return apiGet<ArticleDetail>(`/v1/articles/${id}`);
}

const ALLOWED_IFRAME_HOSTS = ["youtube.com", "youtube-nocookie.com", "vimeo.com"];

function hasBlockedScheme(value: string): boolean {
  const v = value.trim().replace(/[\s\u0000-\u001f]/g, "").toLowerCase();
  return v.startsWith("javascript:") || v.startsWith("data:");
}

/**
 * One-time cleanup before storage so the page renderer never has to sanitize.
 * Keeps first-party markup intact, including allowed video embeds.
 */
export function cleanArticleHtml(input: string | null | undefined): string {
  if (!input) return "";
  let html = input;

  // Remove embedded JSON-LD (we render corrected schema separately).
  html = html.replace(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>[\s\S]*?<\/script>/gi,
    "",
  );

  // Remove inline event handlers and srcdoc attributes.
  html = html.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  html = html.replace(/\s+srcdoc\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");

  // Drop javascript:/data: URLs.
  html = html.replace(
    /\s+(href|src|xlink:href)\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/gi,
    (match, _attr, _raw, dq, sq, bare) => {
      const value = dq ?? sq ?? bare ?? "";
      return hasBlockedScheme(value) ? "" : match;
    },
  );

  // Remove object/embed/base elements.
  html = html.replace(/<object\b[\s\S]*?<\/object>/gi, "");
  html = html.replace(/<embed\b[^>]*\/?>/gi, "");
  html = html.replace(/<base\b[^>]*\/?>/gi, "");

  // Keep only trusted iframes, sandboxed.
  html = html.replace(/<iframe\b([^>]*)>/gi, (match, attrs: string) => {
    const srcMatch = /src\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
    const src = srcMatch ? (srcMatch[2] ?? srcMatch[3] ?? srcMatch[4] ?? "") : "";
    let host = "";
    try {
      host = new URL(src, "https://example.com").hostname.toLowerCase();
    } catch {
      host = "";
    }
    const allowed = ALLOWED_IFRAME_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
    if (!allowed) return "<!--iframe removed-->";
    const withoutSandbox = attrs.replace(/\s+sandbox\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "");
    return `<iframe${withoutSandbox} sandbox="allow-scripts allow-same-origin allow-presentation">`;
  });
  html = html.replace(/<!--iframe removed-->[\s\S]*?<\/iframe>/gi, "");

  return html;
}
