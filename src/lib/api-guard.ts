// Shared guards for public API routes that consume paid upstream quotas.

const ALLOWED_HOST_SUFFIXES = [
  "lovable.app",
  "lovable.dev",
  "menuvisionai.live",
  "localhost",
  "127.0.0.1",
];

/**
 * Reject requests that don't originate from our own web app. This blocks
 * casual scripted abuse of unauthenticated endpoints; it is not a substitute
 * for real auth but is the best we can do for an anonymous app.
 */
export function isSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const candidate = origin ?? referer;
  if (!candidate) return false;
  try {
    const host = new URL(candidate).hostname.toLowerCase();
    return ALLOWED_HOST_SUFFIXES.some(
      (suffix) => host === suffix || host.endsWith(`.${suffix}`),
    );
  } catch {
    return false;
  }
}

const MAX_FIELD_LEN = 200;

/**
 * Validate and sanitize a free-text dish/cuisine field before it is
 * interpolated into an AI prompt or a search query.
 */
export function sanitizeShortText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_FIELD_LEN) return null;
  // Strip characters that would let a caller break out of a quoted prompt
  // context or smuggle control tokens into the upstream request.
  return trimmed.replace(/["`\\\r\n\u0000-\u001f]/g, " ").replace(/\s+/g, " ");
}
